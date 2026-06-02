import { IAuthProvider, AuthUser, AuthCredentials, SignupCredentials } from '@/core/ports';

export class MockAuthAdapter implements IAuthProvider {
  private currentUser: AuthUser | null = null;
  private authStateListener: ((user: AuthUser | null) => void) | null = null;

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListener = callback;
    // Immediately invoke with current state
    callback(this.currentUser);
    return () => {
      this.authStateListener = null;
    };
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  async signInWithEmail(credentials: AuthCredentials): Promise<AuthUser> {
    const user: AuthUser = {
      uid: 'mock-uid-123',
      email: credentials.email,
      displayName: 'Mock User',
      photoURL: null,
      emailVerified: true,
    };
    this.currentUser = user;
    if (this.authStateListener) {
      this.authStateListener(user);
    }
    return user;
  }

  async signUpWithEmail(credentials: SignupCredentials): Promise<AuthUser> {
    const user: AuthUser = {
      uid: 'mock-uid-456',
      email: credentials.email,
      displayName: credentials.displayName || 'Mock New User',
      photoURL: null,
      emailVerified: true,
    };
    this.currentUser = user;
    if (this.authStateListener) {
      this.authStateListener(user);
    }
    return user;
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const user: AuthUser = {
      uid: 'mock-uid-google-789',
      email: 'google@example.com',
      displayName: 'Mock Google User',
      photoURL: null,
      emailVerified: true,
    };
    this.currentUser = user;
    if (this.authStateListener) {
      this.authStateListener(user);
    }
    return user;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    if (this.authStateListener) {
      this.authStateListener(null);
    }
  }

  async resetPassword(email: string): Promise<void> {
    console.log(`Mock: Password reset email sent to ${email}`);
  }

  async updateProfile(data: { displayName?: string; photoURL?: string }): Promise<void> {
    if (!this.currentUser) throw new Error('No authenticated user');
    this.currentUser = { ...this.currentUser, ...data };
    if (this.authStateListener) {
      this.authStateListener(this.currentUser);
    }
  }
}
