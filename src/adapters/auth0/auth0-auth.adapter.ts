import { AuthUser, AuthCredentials, SignupCredentials, IAuthProvider } from '@/core/ports';

export class Auth0AuthAdapter implements IAuthProvider {
  private authStateListener: ((user: AuthUser | null) => void) | null = null;
  private currentUser: AuthUser | null = null;

  constructor() {
    // We only fetch if we are in the browser
    if (typeof window !== 'undefined') {
      this.fetchUser();
    }
  }

  private async fetchUser() {
    try {
      const response = await fetch('/auth/profile');
      if (response.ok) {
        const data = await response.json();
        const user = this.mapUser(data);
        this.currentUser = user;
        this.notifyListener(user);
      } else {
        this.currentUser = null;
        this.notifyListener(null);
      }
    } catch (error) {
      console.error('Failed to fetch Auth0 user', error);
      this.currentUser = null;
      this.notifyListener(null);
    }
  }

  private mapUser(auth0User: any): AuthUser {
    return {
      uid: auth0User.sub,
      email: auth0User.email || null,
      displayName: auth0User.name || auth0User.nickname || null,
      photoURL: auth0User.picture || null,
      emailVerified: auth0User.email_verified || false,
    };
  }

  private notifyListener(user: AuthUser | null) {
    if (this.authStateListener) {
      this.authStateListener(user);
    }
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListener = callback;
    callback(this.currentUser);
    
    return () => {
      this.authStateListener = null;
    };
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  async signInWithEmail(credentials: AuthCredentials): Promise<AuthUser> {
    throw new Error('Email/password login must be handled via Universal Login in Auth0. Please use signInWithGoogle or configure universal login.');
  }

  async signUpWithEmail(credentials: SignupCredentials): Promise<AuthUser> {
    throw new Error('Signup must be handled via Universal Login in Auth0.');
  }

  async signInWithGoogle(): Promise<AuthUser> {
    window.location.href = `/auth/login?returnTo=${encodeURIComponent(window.location.origin + '/dashboard')}`;
    return new Promise(() => {});
  }

  async signOut(): Promise<void> {
    try {
      await fetch('/auth/logout', { redirect: 'manual' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    this.currentUser = null;
    this.notifyListener(null);
    window.location.href = '/login';
  }

  async resetPassword(email: string): Promise<void> {
    throw new Error('Reset password must be handled via Universal Login in Auth0.');
  }

  async updateProfile(data: { displayName?: string; photoURL?: string }): Promise<void> {
    throw new Error('Profile updates should be done via Auth0 Management API or dashboard.');
  }
}
