import { createClient } from '@supabase/supabase-js';
import { auth0 } from '@/lib/auth0';

// Create a Supabase client using the anon key, but passing the RPC secret via header
// This allows the RLS policy check_api_secret() to bypass RLS securely for server actions.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    global: {
      headers: {
        'x-api-secret': process.env.SUPABASE_RPC_SECRET!
      }
    }
  }
);

export async function getAuthenticatedSupabaseClient() {
  const session = await auth0.getSession();
  
  if (!session?.user?.sub) {
    throw new Error('Not authenticated');
  }

  const userId = session.user.sub;

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: {
          'x-api-secret': process.env.SUPABASE_RPC_SECRET!,
          'x-user-id': userId
        }
      }
    }
  );
}

// A better approach for Server Actions when using Auth0 with Supabase is:
// 1. Fetch user from Auth0 session
// 2. Pass userId to every query explicitly, OR
// 3. Just use the service role key and manually add `.eq('user_id', userId)` to every query.
// Since we control the server actions, this is secure.

export async function getUserId() {
  const session = await auth0.getSession();
  return session?.user?.sub;
}

export { supabaseAdmin };
