// src/telegram-bot-polling.mjs
// Запуск Telegram бота в режиме polling для локального тестирования
// ВАЖНО: Запускайте как: node -r dotenv/config src/telegram-bot-polling.mjs
// Или через: npm run telegram:poll

// Переменные окружения должны быть загружены через -r dotenv/config флаг
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения');
  console.error('Убедитесь что .env.local содержит: TELEGRAM_BOT_TOKEN=...');
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL не найден в переменных окружения');
  console.error('Убедитесь что .env.local содержит Supabase переменные');
  process.exit(1);
}

import { getBot } from './lib/telegram/botConfig.js';
import {
  handleStart,
  handleHelp,
  handleLink,
  handleNotes,
  handleToday,
  handleStats,
  handleMessage
} from './lib/telegram/handlers.js';

// Получаем бота
const bot = getBot();

// Регистрируем обработчики команд
bot.start(handleStart);
bot.help(handleHelp);
bot.command('link', handleLink);
bot.command('notes', handleNotes);
bot.command('today', handleToday);
bot.command('stats', handleStats);
bot.on('message', handleMessage);

console.log('🤖 Telegram бот запущен в режиме polling...');
console.log('📱 Откройте Telegram и отправьте /start в бота: @' + (process.env.TELEGRAM_BOT_USERNAME || 'IITUpsychologyAIbot'));
console.log('⏹️  Нажмите Ctrl+C для остановки');

// Запускаем в режиме polling
bot.launch();

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('\n⏹️  Бот остановлен');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('\n⏹️  Бот остановлен');
  bot.stop('SIGTERM');
});
