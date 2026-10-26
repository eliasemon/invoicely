import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/supabase/admin';
import { disconnectWhatsApp } from '@/services/delivery/providers/whatsappProvider';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await disconnectWhatsApp(userId);

    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Error disconnecting WhatsApp:', error);
    return NextResponse.json({ error: error.message || 'Failed to disconnect WhatsApp' }, { status: 500 });
  }
}
