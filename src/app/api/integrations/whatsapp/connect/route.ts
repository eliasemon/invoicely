import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/supabase/admin';
import { initWhatsAppSession } from '@/services/delivery/providers/whatsappProvider';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await initWhatsAppSession(userId);

    return NextResponse.json({
      status: session.status,
      qrCode: session.qrCode,
      userId,
    });
  } catch (error: any) {
    console.error('Error connecting WhatsApp:', error);
    return NextResponse.json({ error: error.message || 'Failed to initialize WhatsApp session' }, { status: 500 });
  }
}
