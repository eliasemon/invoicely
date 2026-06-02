import { IAuthProvider, AuthUser, AuthCredentials, SignupCredentials } from '@/core/ports';
import { createClient } from '@/lib/supabase/client';

export class SupabaseAuthAdapter implements IAuthProvider {
  private supabase = createClient();
  private authStateListener: ((user: AuthUser | null) => void) | null = null;
  private currentUser: AuthUser | null = null;

  private mapUser(user: any): AuthUser | null {
    if (!user) return null;
    return {
      uid: user.id,
      email: user.email || null,
      displayName: user.user_metadata?.display_name || null,
      photoURL: user.user_metadata?.avatar_url || null,
      emailVerified: !!user.email_confirmed_at,
    };
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListener = callback;
    
    // Fetch initial user — getUser() validates the JWT, unlike getSession()
    this.supabase.auth.getUser().then(({ data: { user } }) => {
      const authUser = this.mapUser(user);
      this.currentUser = authUser;
      callback(authUser);
    });

    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      (_event, session) => {
        const authUser = this.mapUser(session?.user);
        this.currentUser = authUser;
        if (this.authStateListener) {
          this.authStateListener(authUser);
        }
      }
    );

    return () => {
      this.authStateListener = null;
      subscription.unsubscribe();
    };
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  async signInWithEmail(credentials: AuthCredentials): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw new Error(error.message);
    const authUser = this.mapUser(data.user);
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
    const authUser = this.mapUser(data.user);
    if (!authUser) throw new Error('User data missing after signup');
    return authUser;
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw new Error(error.message);
    // OAuth redirects, so we won't actually return an AuthUser here
    // The state will be picked up by onAuthStateChanged after redirect
    return null as unknown as AuthUser;
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new Error(error.message);
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
}
