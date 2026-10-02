import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // IMPORTANT: Validates the JWT signature by fetching the user from the Supabase API.
    // This is required to automatically refresh expired tokens.
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return { supabaseResponse, user: null }
    }

    return { supabaseResponse, user }
  } catch (err) {
    console.warn('Error in proxy updateSession:', err)
    return { supabaseResponse, user: null }
  }
}
