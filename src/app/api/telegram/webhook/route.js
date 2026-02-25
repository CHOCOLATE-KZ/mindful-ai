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

// Webhook endpoint
export async function POST(request) {
  try {
    // Получаем бота (инициализируется при первом использовании)
    const bot = getBot();

    // Регистрируем обработчики (снеделается один раз)
    registerHandlers(bot);

    const body = await request.json();

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
      note: 'Используйте POST для отправки обновлений от Telegram'
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
