'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, AuthCredentials, SignupCredentials } from '@/core/ports';
import { getAuthAdapter } from '@/core/registry';

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (credentials: SignupCredentials) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authAdapter = getAuthAdapter();

  useEffect(() => {
    const unsubscribe = authAdapter.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authAdapter]);

  const signIn = async (credentials: AuthCredentials) => {
    setError(null);
    try {
      await authAdapter.signInWithEmail(credentials);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in';
      setError(msg);
      throw err;
    }
  };

  const signUp = async (credentials: SignupCredentials) => {
    setError(null);
    try {
      await authAdapter.signUpWithEmail(credentials);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign up';
      setError(msg);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await authAdapter.signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await authAdapter.signOut();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign out';
      setError(msg);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await authAdapter.resetPassword(email);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password';
      setError(msg);
      throw err;
    }
  };

  const value: AuthContextValue = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
