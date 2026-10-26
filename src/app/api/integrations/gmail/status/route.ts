import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/supabase/admin';
import { getConnectedGmailAccount } from '@/services/delivery/providers/gmailProvider';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await getConnectedGmailAccount(userId);

    return NextResponse.json({
      isConnected: Boolean(account),
      accountIdentifier: account?.account_identifier || null,
      connectedAt: account?.connected_at || null,
    });
  } catch (error: any) {
    console.error('Error fetching Gmail status:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch Gmail status' }, { status: 500 });
  }
}
