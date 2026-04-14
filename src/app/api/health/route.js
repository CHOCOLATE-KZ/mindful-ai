import { NextResponse } from 'next/server';

export async function GET() {
  const payload = {
    status: 'ok',
    service: 'mindful-ai',
    timestamp: new Date().toISOString(),
    uptimeSec: Math.floor(process.uptime()),
    checks: {
      lmStudioConfigured: Boolean(process.env.LMSTUDIO_BASE_URL),
      supabaseConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    },
  };

  return NextResponse.json(payload, { status: 200 });
}
