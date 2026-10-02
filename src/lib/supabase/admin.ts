import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vwbnrhiyryutvkusdwph.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_RPC_SECRET ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

// Create a Supabase admin client with service_role support and fallback RPC secret
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseKey,
  {
    global: {
      headers: {
        'x-api-secret': process.env.SUPABASE_RPC_SECRET || 'da294d82c9e81b9a12b6071e624cbf2d0ae11993641f2f1c19581504229f35f0'
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

export async function getUserId() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
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
