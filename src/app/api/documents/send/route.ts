import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/supabase/admin';
import { sendBusinessDocument } from '@/services/delivery/documentDeliveryService';
import { SendDocumentInput } from '@/services/delivery/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.documentId || !body.documentType || !body.channel || !body.recipient || !body.message) {
      return NextResponse.json(
        { error: 'Missing required delivery parameters: documentId, documentType, channel, recipient, message' },
        { status: 400 }
      );
    }

    if (!['invoice', 'challan', 'quotation'].includes(body.documentType)) {
      return NextResponse.json(
        { error: 'Invalid documentType. Must be one of: invoice, challan, quotation' },
        { status: 400 }
      );
    }

    if (!['whatsapp', 'email'].includes(body.channel)) {
      return NextResponse.json(
        { error: 'Invalid channel. Must be one of: whatsapp, email' },
        { status: 400 }
      );
    }

    const input: SendDocumentInput = {
      documentId: body.documentId,
      documentType: body.documentType,
      channel: body.channel,
      recipient: body.recipient,
      subject: body.subject,
      message: body.message,
      quotationWithPricing: body.quotationWithPricing,
      idempotencyKey: body.idempotencyKey,
    };

    const result = await sendBusinessDocument(input);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in /api/documents/send:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while sending document' },
      { status: 500 }
    );
  }
}
