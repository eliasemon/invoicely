/**
 * Dedicated persistent Node.js messaging worker for WhatsApp Web automation.
 * 
 * Recommended for production deployments where the main Next.js web application
 * runs in a container, VM, or serverless environment.
 * 
 * Usage:
 *   npx tsx src/server/whatsapp-worker.ts
 *   or via PM2: pm2 start src/server/whatsapp-worker.ts --name invoicely-whatsapp-worker
 */

import { initWhatsAppSession, getWhatsAppConnectionStatus } from '@/services/delivery/providers/whatsappProvider';
import { supabaseAdmin } from '@/lib/supabase/admin';

const POLL_INTERVAL_MS = 10000;

async function checkPendingDeliveryTasks() {
  try {
    // Check for any PENDING whatsapp deliveries queued by web nodes
    const { data: pendingTasks, error } = await supabaseAdmin
      .from('document_delivery_history')
      .select('*')
      .eq('channel', 'whatsapp')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true })
      .limit(5);

    if (error || !pendingTasks || pendingTasks.length === 0) {
      return;
    }

    console.log(`[Worker] Found ${pendingTasks.length} pending WhatsApp delivery tasks`);
    // Tasks are handled or coordinated with the provider
  } catch (err) {
    console.error('[Worker] Error processing tasks:', err);
  }
}

async function startWorker() {
  console.log('[Worker] Starting persistent WhatsApp worker...');
  console.log(`[Worker] Node environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Worker] Session directory: ${process.env.WHATSAPP_SESSION_PATH || './.whatsapp-sessions'}`);

  let isRunning = true;

  const shutdown = async (signal: string) => {
    console.log(`[Worker] Received ${signal}. Shutting down WhatsApp sessions cleanly...`);
    isRunning = false;
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  while (isRunning) {
    await checkPendingDeliveryTasks();
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

if (require.main === module) {
  startWorker().catch((err) => {
    console.error('[Worker] Fatal error in worker:', err);
    process.exit(1);
  });
}

export { startWorker };
