import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const DEFAULT_SUPABASE_URL = 'https://vwbnrhiyryutvkusdwph.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Ym5yaGl5cnl1dHZrdXNkd3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjI1MjMsImV4cCI6MjA5NTg5ODUyM30.znncrlHSoGZH1MMhqqTDqnaEHG5-ZmUTNfPetlNLL6I';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = rawUrl && !rawUrl.includes('your-project-ref') && rawUrl.startsWith('http')
  ? rawUrl
  : DEFAULT_SUPABASE_URL;

const rawKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseKey = rawKey && !rawKey.includes('your_supabase_') && rawKey.length > 20
  ? rawKey
  : DEFAULT_SUPABASE_ANON_KEY;

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
