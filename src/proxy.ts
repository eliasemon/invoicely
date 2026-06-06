import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession as updateSupabaseSession } from '@/lib/supabase/proxy';

const protectedRoutes = ['/dashboard', '/invoices', '/create', '/profile'];
const authRoutes = ['/login', '/signup'];

export async function proxy(request: NextRequest) {
  const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'mock';
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  let isAuthenticated = false;
  let response = NextResponse.next();

  if (provider === 'supabase') {
    // Supabase validation
    const { supabaseResponse, user } = await updateSupabaseSession(request);
    response = supabaseResponse;
    isAuthenticated = !!user;
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
