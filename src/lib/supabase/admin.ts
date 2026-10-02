import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const DEFAULT_SUPABASE_URL = 'https://vwbnrhiyryutvkusdwph.supabase.co';
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Ym5yaGl5cnl1dHZrdXNkd3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDMyMjUyMywiZXhwIjoyMDk1ODk4NTIzfQ.lEeHer9slryEFkNwr6D_3s0MiCqBbH2aTN22NoUC5_M';
const DEFAULT_RPC_SECRET = 'da294d82c9e81b9a12b6071e624cbf2d0ae11993641f2f1c19581504229f35f0';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = rawUrl && !rawUrl.includes('your-project-ref') && rawUrl.startsWith('http')
  ? rawUrl
  : DEFAULT_SUPABASE_URL;

const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey = rawServiceKey && !rawServiceKey.includes('your_supabase_') && rawServiceKey.length > 20
  ? rawServiceKey
  : DEFAULT_SUPABASE_SERVICE_ROLE_KEY;

const rpcSecret = process.env.SUPABASE_RPC_SECRET && !process.env.SUPABASE_RPC_SECRET.includes('your_supabase_')
  ? process.env.SUPABASE_RPC_SECRET
  : DEFAULT_RPC_SECRET;

// Create a Supabase admin client with service_role privileges
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseKey,
  {
    global: {
      headers: {
        'x-api-secret': rpcSecret
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// Linked user IDs for seamless multi-account sync (e.g. Google accounts of the same user)
const LINKED_USER_ACCOUNTS: Record<string, string[]> = {
  'c48f96eb-0f65-4786-ba03-f73f66fc04bf': ['c48f96eb-0f65-4786-ba03-f73f66fc04bf', '96ba94b6-a386-4471-a6c8-037dfc47001c'],
  '96ba94b6-a386-4471-a6c8-037dfc47001c': ['96ba94b6-a386-4471-a6c8-037dfc47001c', 'c48f96eb-0f65-4786-ba03-f73f66fc04bf'],
};

export function getLinkedUserIds(userId: string): string[] {
  return LINKED_USER_ACCOUNTS[userId] || [userId];
}

export async function getUserId(): Promise<string | null> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return null;
    }
    return user.id;
  } catch (err: any) {
    if (err && typeof err === 'object' && 'digest' in err && (err.digest === 'DYNAMIC_SERVER_USAGE' || String(err.digest).startsWith('NEXT_'))) {
      throw err;
    }
    console.warn('Error fetching auth user in getUserId:', err);
    return null;
  }
}

export async function getAuthenticatedSupabaseClient() {
  const userId = await getUserId();
  
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const anonKey = rawAnonKey && !rawAnonKey.includes('your_supabase_') && rawAnonKey.length > 20
    ? rawAnonKey
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Ym5yaGl5cnl1dHZrdXNkd3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjI1MjMsImV4cCI6MjA5NTg5ODUyM30.znncrlHSoGZH1MMhqqTDqnaEHG5-ZmUTNfPetlNLL6I';

  return createClient(
    supabaseUrl,
    anonKey,
    {
      global: {
        headers: {
          'x-api-secret': rpcSecret,
          'x-user-id': userId
        }
      }
    }
  );
}

export { supabaseAdmin };
