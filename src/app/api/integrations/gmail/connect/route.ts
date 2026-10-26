import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/supabase/admin';
import { getAuthorizationUrl } from '@/services/delivery/providers/gmailProvider';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authUrl = getAuthorizationUrl(userId);
    return NextResponse.json({ url: authUrl });
  } catch (error: any) {
    console.error('Error generating Google OAuth URL:', error);
    return NextResponse.json({ error: error.message || 'Failed to initialize Google OAuth' }, { status: 500 });
  }
}
