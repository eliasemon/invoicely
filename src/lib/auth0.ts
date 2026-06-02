import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { createClient } from "@supabase/supabase-js";

export const auth0 = new Auth0Client({
  authorizationParameters: {
    connection: 'google-oauth2' // This will force Google login
  },
  beforeSessionSaved: async (session, req) => {
    if (session && session.user && session.user.sub) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } }
        );
        
        const secret = process.env.SUPABASE_RPC_SECRET;
        if (!secret) {
          console.error("SUPABASE_RPC_SECRET is missing. Cannot sync profile.");
          return session;
        }

        const { error } = await supabase.rpc('sync_auth0_profile', {
          p_id: session.user.sub,
          p_full_name: session.user.name || session.user.nickname || '',
          p_avatar_url: session.user.picture || '',
          p_secret: secret
        });

        if (error) {
          console.error('Failed to sync user profile via RPC in Supabase:', error);
        } else {
          console.log('Successfully synced user profile in Supabase for:', session.user.sub);
        }
      } catch (err) {
        console.error('Error in beforeSessionSaved checking/creating profile:', err);
      }
    }
    return session;
  }
});
