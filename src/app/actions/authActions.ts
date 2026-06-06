'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

function getBaseUrl() {
  let url = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  url = url.startsWith('http') ? url : `https://${url}`;
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export async function signInWithGoogleAction() {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback`,
    },
  });

  if (error) {
    console.error('Error in Google OAuth:', error.message);
    throw new Error(error.message);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function resetPasswordAction(email: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getBaseUrl()}/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
}
