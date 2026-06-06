import { IAuthProvider, AuthUser, AuthCredentials, SignupCredentials } from '@/core/ports';
import { createClient } from '@/lib/supabase/client';

export class HybridAuthAdapter implements IAuthProvider {
  private supabase = createClient();
  private authStateListener: ((user: AuthUser | null) => void) | null = null;
  private currentSupabaseUser: AuthUser | null = null;
  private currentAuth0User: AuthUser | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.fetchAuth0User();
    }
  }

  private mapSupabaseUser(user: any): AuthUser | null {
    if (!user) return null;
    return {
      uid: user.id,
      email: user.email || null,
      displayName: user.user_metadata?.display_name || null,
      photoURL: user.user_metadata?.avatar_url || null,
      emailVerified: !!user.email_confirmed_at,
    };
  }

  private mapAuth0User(auth0User: any): AuthUser | null {
    if (!auth0User) return null;
    return {
      uid: auth0User.sub,
      email: auth0User.email || null,
      displayName: auth0User.name || auth0User.nickname || null,
      photoURL: auth0User.picture || null,
      emailVerified: auth0User.email_verified || false,
    };
  }

  private async fetchAuth0User() {
    try {
      const response = await fetch('/auth/profile');
      if (response.ok) {
        const data = await response.json();
        this.currentAuth0User = this.mapAuth0User(data);
        this.notifyListener();
      }
    } catch (error) {
      console.error('Failed to fetch Auth0 user', error);
    }
  }

  private notifyListener() {
    if (this.authStateListener) {
      // Prioritize Supabase user over Auth0 user if both exist
      this.authStateListener(this.currentSupabaseUser || this.currentAuth0User);
    }
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListener = callback;
    
    // Initial notify
    this.notifyListener();

    // Listen to Supabase
    this.supabase.auth.getUser().then(({ data: { user } }) => {
      this.currentSupabaseUser = this.mapSupabaseUser(user);
      this.notifyListener();
    });

    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      (_event, session) => {
        this.currentSupabaseUser = this.mapSupabaseUser(session?.user);
        this.notifyListener();
      }
    );

    return () => {
      this.authStateListener = null;
      subscription.unsubscribe();
    };
  }

  getCurrentUser(): AuthUser | null {
    return this.currentSupabaseUser || this.currentAuth0User;
  }

  async signInWithEmail(credentials: AuthCredentials): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw new Error(error.message);
    const authUser = this.mapSupabaseUser(data.user);
    if (!authUser) throw new Error('User data missing after login');
    return authUser;
  }

  async signUpWithEmail(credentials: SignupCredentials): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          display_name: credentials.displayName,
        },
      },
    });

    if (error) throw new Error(error.message);
    const authUser = this.mapSupabaseUser(data.user);
    if (!authUser) throw new Error('User data missing after signup');
    return authUser;
  }

  async signInWithGoogle(): Promise<AuthUser> {
    // Delegate to Auth0
    window.location.href = `/auth/login?returnTo=${encodeURIComponent(window.location.origin + '/dashboard')}`;
    return new Promise(() => {});
  }

  async signOut(): Promise<void> {
    // Sign out from Supabase
    await this.supabase.auth.signOut();
    this.currentSupabaseUser = null;
    
    // Sign out from Auth0 (redirects)
    try {
      await fetch('/auth/logout', { redirect: 'manual' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    
    this.currentAuth0User = null;
    this.notifyListener();
    window.location.href = '/login';
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  }

  async updateProfile(data: { displayName?: string; photoURL?: string }): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      data: {
        ...(data.displayName && { display_name: data.displayName }),
        ...(data.photoURL && { avatar_url: data.photoURL }),
      },
    });
    if (error) throw new Error(error.message);
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
  }
}
