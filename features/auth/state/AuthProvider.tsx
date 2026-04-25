"use client";

import {
  onAuthStateChanged,
  type User,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "@/features/firebase/client";

interface AuthSessionContextValue {
  user: User | null;
  isReady: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isConfigured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(!isConfigured);

  useEffect(() => {
    if (!isConfigured) return;

    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsReady(true);
    });

    return () => unsub();
  }, [isConfigured]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      user,
      isReady,
      isConfigured,
      async signOut() {
        if (!isConfigured) return;
        await firebaseSignOut(getFirebaseAuth());
      },
      async refreshUser() {
        await user?.reload();
        setUser(getFirebaseAuth().currentUser);
      },
    }),
    [isConfigured, isReady, user]
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within AuthProvider.");
  }
  return ctx;
}
