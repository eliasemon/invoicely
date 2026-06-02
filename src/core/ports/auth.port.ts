import { AuthUser, AuthCredentials, SignupCredentials } from './auth.types';

export interface IAuthProvider {
  // Auth state
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
  getCurrentUser(): AuthUser | null;

  // Auth operations
  signInWithEmail(credentials: AuthCredentials): Promise<AuthUser>;
  signUpWithEmail(credentials: SignupCredentials): Promise<AuthUser>;
  signInWithGoogle(): Promise<AuthUser>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;

  // Profile
  updateProfile(data: { displayName?: string; photoURL?: string }): Promise<void>;
}
