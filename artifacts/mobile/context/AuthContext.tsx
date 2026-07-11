import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAdmin: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check admin via Firestore role field (set role:"admin" on user doc in Firebase console)
        // Also accepts legacy custom claim for backward compatibility
        // Hardcoded admin emails — always get admin access regardless of Firestore/claims
        const ADMIN_EMAILS = ['aki.sokpah.link@gmail.com'];
        try {
          const emailAdmin = Boolean(firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase()));
          const [token, snap] = await Promise.all([
            firebaseUser.getIdTokenResult(),
            getDoc(doc(db, 'users', firebaseUser.uid)),
          ]);
          const claimAdmin = Boolean(token.claims.admin);
          const firestoreAdmin = snap.exists() && snap.data()?.role === 'admin';
          setIsAdmin(emailAdmin || claimAdmin || firestoreAdmin);
        } catch {
          // Even if Firestore/token fails, still grant access by email
          const ADMIN_EMAILS_FALLBACK = ['aki.sokpah.link@gmail.com'];
          setIsAdmin(Boolean(firebaseUser.email && ADMIN_EMAILS_FALLBACK.includes(firebaseUser.email.toLowerCase())));
        }
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    // Create Firestore user doc with reader role
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName,
      role: 'reader',
      savedArticleIds: [],
      followedCategories: [],
      createdAt: serverTimestamp(),
    });
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
