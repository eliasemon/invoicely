import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/supabase/admin';
import { getWhatsAppConnectionStatus } from '@/services/delivery/providers/whatsappProvider';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await getWhatsAppConnectionStatus(userId);

    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Error getting WhatsApp status:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch WhatsApp status' }, { status: 500 });
  }
}
