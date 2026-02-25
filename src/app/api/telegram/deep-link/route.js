// src/app/api/telegram/deep-link/route.js
// API для генерации глубокой ссылки для связи аккаунтов

import { generateDeepLink } from '@/lib/telegram/userManager';
import { supabaseAdmin } from '@/lib/supabase/admin';

const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'diplomaproject_bot';

/**
 * POST /api/telegram/deep-link
 * Генерирует глубокую ссылку для связи Telegram аккаунта
 * 
 * Request:
 * { userId: string (UUID) }
 * 
 * Response:
 * { deepLink: string }
 */
export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId не передан' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Проверяем что пользователь существует
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return new Response(
        JSON.stringify({ error: 'Пользователь не найден' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Генерируем deep link
    const deepLink = generateDeepLink(userId, BOT_USERNAME);

    return new Response(
      JSON.stringify({ deepLink, botUsername: BOT_USERNAME }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Ошибка при генерации deep link:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * GET /api/telegram/deep-link?userId=xxx
 * Альтернативный способ получения deep link
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId не передан' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Проверяем что пользователь существует
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return new Response(
        JSON.stringify({ error: 'Пользователь не найден' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Генерируем deep link
    const deepLink = generateDeepLink(userId, BOT_USERNAME);

    return new Response(
      JSON.stringify({ deepLink, botUsername: BOT_USERNAME }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Ошибка при генерации deep link:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
