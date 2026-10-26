import { NextRequest } from 'next/server';
import { getUserId } from '@/lib/supabase/admin';
import { subscribeToSession, initWhatsAppSession } from '@/services/delivery/providers/whatsappProvider';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Ensure session exists or boots
  initWhatsAppSession(userId).catch(() => {});

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: any) => {
        try {
          const payload = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (e) {
          console.warn('Error enqueuing SSE chunk:', e);
        }
      };

      // Subscribe to real-time events for this user
      const unsubscribe = subscribeToSession(userId, sendEvent);

      // Keepalive heartbeat every 15s to prevent timeouts
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
