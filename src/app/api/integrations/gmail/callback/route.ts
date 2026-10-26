import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/supabase/admin';
import { handleOAuthCallback, verifyOAuthState } from '@/services/delivery/providers/gmailProvider';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  const baseUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const redirectDestination = `${baseUrl}/profile#integrations-section`;

  if (errorParam) {
    console.warn('Google OAuth denied or error:', errorParam);
    return NextResponse.redirect(`${redirectDestination}?error=${encodeURIComponent(errorParam)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${redirectDestination}?error=missing_code_or_state`);
  }

  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.redirect(`${redirectDestination}?error=unauthenticated`);
    }

    // Verify state matches user and hasn't expired
    const isStateValid = verifyOAuthState(state, userId);
    if (!isStateValid) {
      return NextResponse.redirect(`${redirectDestination}?error=invalid_or_expired_state`);
    }

    await handleOAuthCallback(code, userId);

    return NextResponse.redirect(`${redirectDestination}?status=gmail_connected`);
  } catch (err: any) {
    console.error('Error in Gmail OAuth callback:', err);
    return NextResponse.redirect(`${redirectDestination}?error=${encodeURIComponent(err.message || 'oauth_exchange_failed')}`);
  }
}
