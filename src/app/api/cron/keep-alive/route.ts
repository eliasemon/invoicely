import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Vercel Cron handler to keep Supabase active and prevent automatic pausing.
 * Supabase pauses free-tier projects after 7 days of inactivity.
 * This cron job executes periodic lightweight database queries to maintain active project status.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Verify Vercel Cron Secret (if configured in environment)
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing CRON_SECRET authorization header' },
        { status: 401 }
      );
    }

    // 2. Perform lightweight database health checks / queries to register activity
    const [profilesResult, invoicesResult] = await Promise.allSettled([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('invoices').select('id', { count: 'exact', head: true }),
    ]);

    const profilesStatus =
      profilesResult.status === 'fulfilled' && !profilesResult.value.error
        ? 'healthy'
        : profilesResult.status === 'fulfilled'
        ? `error: ${profilesResult.value.error?.message}`
        : `rejected: ${profilesResult.reason}`;

    const invoicesStatus =
      invoicesResult.status === 'fulfilled' && !invoicesResult.value.error
        ? 'healthy'
        : invoicesResult.status === 'fulfilled'
        ? `error: ${invoicesResult.value.error?.message}`
        : `rejected: ${invoicesResult.reason}`;

    const durationMs = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        message: 'Supabase keep-alive pulse dispatched successfully',
        timestamp: new Date().toISOString(),
        durationMs,
        checks: {
          profiles: profilesStatus,
          invoices: invoicesStatus,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Supabase keep-alive cron failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error during keep-alive ping',
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual curl or webhook trigger
export async function POST(request: NextRequest) {
  return GET(request);
}
