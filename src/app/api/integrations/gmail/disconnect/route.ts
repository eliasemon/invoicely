import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/supabase/admin';
import { disconnectGmail } from '@/services/delivery/providers/gmailProvider';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await disconnectGmail(userId);

    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Error disconnecting Gmail:', error);
    return NextResponse.json({ error: error.message || 'Failed to disconnect Gmail' }, { status: 500 });
  }
}
