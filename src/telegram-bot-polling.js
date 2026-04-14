// src/telegram-bot-polling.js
// Запуск Telegram бота в режиме polling для локального тестирования
// Используйте: node src/telegram-bot-polling.mjs

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

console.log(' Telegram бот запущен в режиме polling...');
console.log(' Откройте Telegram и отправьте /start в бота: @' + (process.env.TELEGRAM_BOT_USERNAME || 'IITUpsychologyAIbot'));
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
