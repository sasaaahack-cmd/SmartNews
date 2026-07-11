import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Public-safe Firebase config (frontend-only values)
const firebaseConfig = {
  apiKey: 'AIzaSyBJ6Zw2pgismaiKfc3lFp_hJTNpqHmYjm0',
  authDomain: 'gen-lang-client-0598563022.firebaseapp.com',
  projectId: 'gen-lang-client-0598563022',
  storageBucket: 'gen-lang-client-0598563022.firebasestorage.app',
  messagingSenderId: '130789287830',
  appId: '1:130789287830:web:74db034ba5b42549645fb7',
};

// Guard against re-initialization (critical for serverless / fast-refresh)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

const existingApps = getApps();
if (existingApps.length === 0) {
  app = initializeApp(firebaseConfig);
  // Use React Native persistence for native, default for web
  if (Platform.OS !== 'web') {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } else {
    auth = getAuth(app);
  }
} else {
  app = existingApps[0];
  auth = getAuth(app);
}

db = getFirestore(app);

export { app, auth, db };
