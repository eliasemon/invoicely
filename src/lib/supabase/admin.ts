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

import { createClient as createServerClient } from '@/lib/supabase/server';

export async function getUserId() {
  // Try Supabase first
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return user.id;

  // Fallback to Auth0
  const session = await auth0.getSession();
  return session?.user?.sub;
}

export async function getAuthenticatedSupabaseClient() {
  const userId = await getUserId();
  
  if (!userId) {
    throw new Error('Not authenticated');
  }

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

export { supabaseAdmin };
