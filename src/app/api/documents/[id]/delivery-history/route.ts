import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/supabase/admin';
import { getDocumentDeliveryHistory } from '@/services/delivery/documentDeliveryService';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const history = await getDocumentDeliveryHistory(id);

    return NextResponse.json(history);
  } catch (error: any) {
    console.error('Error fetching document delivery history:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch delivery history' }, { status: 500 });
  }
}
