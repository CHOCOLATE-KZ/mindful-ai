// src/app/api/telegram/webhook/route.js
// Webhook для получения обновлений от Telegram

import { getBot } from '@/lib/telegram/botConfig';
import {
  handleStart,
  handleHelp,
  handleLink,
  handleNotes,
  handleToday,
  handleStats,
  handleMessage
} from '@/lib/telegram/handlers';

let handlersRegistered = false;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

/**
 * Регистрирует обработчики команд бота
 * Вызывается только один раз при первом использовании
 */
function registerHandlers(bot) {
  if (handlersRegistered) return;

  bot.start(handleStart);
  bot.help(handleHelp);
  bot.command('link', handleLink);
  bot.command('notes', handleNotes);
  bot.command('today', handleToday);
  bot.command('stats', handleStats);
  bot.on('message', handleMessage);

  handlersRegistered = true;
}

function hasValidWebhookSecret(request) {
  if (!TELEGRAM_WEBHOOK_SECRET) {
    return false;
  }

  const secretFromHeader = request.headers.get('x-telegram-bot-api-secret-token')?.trim();
  return Boolean(secretFromHeader && secretFromHeader === TELEGRAM_WEBHOOK_SECRET);
}

// Webhook endpoint
export async function POST(request) {
  try {
    if (!hasValidWebhookSecret(request)) {
      const status = TELEGRAM_WEBHOOK_SECRET ? 401 : 500;
      const message = TELEGRAM_WEBHOOK_SECRET
        ? 'Unauthorized webhook request'
        : 'Webhook secret is not configured';

      return new Response(JSON.stringify({ ok: false, error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Получаем бота (инициализируется при первом использовании)
    const bot = getBot();

    // Регистрируем обработчики (снеделается один раз)
    registerHandlers(bot);

    const body = await request.json();
    if (!body || typeof body !== 'object' || typeof body.update_id !== 'number') {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid Telegram update payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Передаем обновление боту
    await bot.handleUpdate(body);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Webhook ошибка:', error);

    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Для проверки что эндпоинт работает
export async function GET(request) {
  return new Response(
    JSON.stringify({ 
      status: 'Telegram webhook endpoint работает',
      note: 'Используйте POST для отправки обновлений от Telegram',
      security: 'Требуется заголовок x-telegram-bot-api-secret-token'
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
