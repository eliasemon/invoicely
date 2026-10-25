'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

import { headers } from 'next/headers';

async function getBaseUrl(clientOrigin?: string) {
  if (clientOrigin && (clientOrigin.startsWith('http://') || clientOrigin.startsWith('https://'))) {
    return clientOrigin.endsWith('/') ? clientOrigin.slice(0, -1) : clientOrigin;
  }

  try {
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host');
    const proto = headerList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
    if (host) {
      return `${proto}://${host}`;
    }
  } catch {
    // Fall back to environment variables if headers() is unavailable
  }

  const envUrl =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;
  if (!envUrl) {
    return 'http://localhost:3000';
  }
  let url = envUrl;
  url = url.startsWith('http') ? url : `https://${url}`;
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export async function signInWithGoogleAction(clientOrigin?: string) {
  const supabase = await createClient();
  const baseUrl = await getBaseUrl(clientOrigin);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error('Error in Google OAuth:', error.message);
    throw new Error(error.message);
  }

  return { url: data.url };
}

export async function resetPasswordAction(email: string, clientOrigin?: string) {
  const supabase = await createClient();
  const baseUrl = await getBaseUrl(clientOrigin);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
}
