import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_KEY = '@smartnews:saved_article_ids';

interface SavedContextValue {
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => Promise<void>;
}

const SavedContext = createContext<SavedContextValue>({
  savedIds: [],
  isSaved: () => false,
  toggleSave: async () => {},
});

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(SAVED_KEY).then((raw) => {
      if (raw) {
        try {
          setSavedIds(JSON.parse(raw) as string[]);
        } catch {
          setSavedIds([]);
        }
      }
    });
  }, []);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const toggleSave = useCallback(async (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <SavedContext.Provider value={{ savedIds, isSaved, toggleSave }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  return useContext(SavedContext);
}
