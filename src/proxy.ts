import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession as updateSupabaseSession } from '@/lib/supabase/proxy';
import { auth0 } from '@/lib/auth0';

const protectedRoutes = ['/dashboard', '/invoices', '/create', '/profile'];
const authRoutes = ['/login', '/signup'];

export async function proxy(request: NextRequest) {
  const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'mock';
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  let isAuthenticated = false;
  let response = NextResponse.next();

  if (provider === 'auth0') {
    // Let Auth0 handle its routes first
    const auth0Response = await auth0.middleware(request);

    const session = await auth0.getSession(request);
    isAuthenticated = !!session?.user;

    // Use the response from Auth0 middleware
    response = auth0Response;
  } else if (provider === 'supabase') {
    // Supabase validation
    const { supabaseResponse, user } = await updateSupabaseSession(request);
    response = supabaseResponse;
    isAuthenticated = !!user;
  } else if (provider === 'hybrid') {
    // Let Auth0 handle its routes first
    const auth0Response = await auth0.middleware(request);
    const session = await auth0.getSession(request);
    const hasAuth0Session = !!session?.user;

    // Check Supabase session
    const { supabaseResponse, user: supabaseUser } = await updateSupabaseSession(request);
    const hasSupabaseSession = !!supabaseUser;

    // Authenticated if either session is valid
    isAuthenticated = hasAuth0Session || hasSupabaseSession;

    // Supabase needs to return its response to persist cookies. Auth0's middleware 
    // mostly handles Auth0 API routes. For hybrid, we return supabaseResponse to keep 
    // the Supabase token alive if they are using Supabase auth.
    // If they were using Auth0 routes (/auth/login), Auth0 middleware intercepts it anyway.
    response = supabaseResponse;
  } else {
    // Mock provider allows access
    isAuthenticated = true;
  }

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
