#!/usr/bin/env node
// telegram-bot-polling.js (CommonJS версия)
// Запуск: npm run telegram:poll

console.log('✅ Загружаем переменные окружения из .env.local...');
require('dotenv').config({ path: '.env.local' });

// Проверяем переменные окружения
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не найден в .env.local');
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL не найден в .env.local');
  process.exit(1);
}

console.log('✅ Переменные окружения загружены');
console.log('🤖 Инициализируем Telegram бот...');

// Теперь можно использовать dynamic import для ES modules
(async () => {
  try {
    console.log('📥 Загружаем модули...');
    const { getBot } = await import('./src/lib/telegram/botConfig.js');
    const {
      handleStart,
      handleHelp,
      handleLink,
      handleNotes,
      handleToday,
      handleStats,
      handleAnalyze,
      handleRemind,
      handleMessage,
      handleNoteInput,
      handleReminderInput,
      handleCallbackQuery,
      showMainMenu
    } = await import('./src/lib/telegram/handlers.js');

    console.log('✅ Модули загружены успешно');

    // Получаем бота
    console.log('🤖 Создаем экземпляр бота...');
    const bot = getBot();

    // Добавляем middleware для сессии (простое хранилище в памяти)
    const sessions = new Map();
    bot.use((ctx, next) => {
      const userId = ctx.from?.id;
      if (userId) {
        if (!sessions.has(userId)) {
          sessions.set(userId, {});
        }
        ctx.session = sessions.get(userId);
      }
      return next();
    });

    // Регистрируем обработчики команд
    console.log('📝 Регистрируем команды...');
    bot.start(handleStart);
    bot.help(handleHelp);
    bot.command('link', handleLink);
    bot.command('notes', handleNotes);
    bot.command('today', handleToday);
    bot.command('stats', handleStats);
    bot.command('analyze', handleAnalyze);
    bot.command('remind', handleRemind);
    
    // Обработчик для callback кнопок (inline keyboard)
    bot.on('callback_query', handleCallbackQuery);
    
    // Обработчик для сообщений (проверяем если это ввод для заметки или напоминания)
    bot.on('message', async (ctx) => {
      if (ctx.session?.addingNote) {
        return handleNoteInput(ctx);
      }
      if (ctx.session?.settingReminder) {
        return handleReminderInput(ctx);
      }
      return handleMessage(ctx);
    });

    console.log('\n✅ ========================================');
    console.log('🤖 Telegram бот запущен в режиме polling!');
    console.log('📱 Откройте Telegram и найдите: @' + (process.env.TELEGRAM_BOT_USERNAME || 'IITUpsychologyAIbot'));
    console.log('💬 Отправьте команду: /start');
    console.log('⏹️  Нажмите Ctrl+C для остановки');
    console.log('========================================\n');

    // Запускаем в режиме polling
    await bot.launch();

    // Graceful shutdown
    process.once('SIGINT', () => {
      console.log('\n⏹️  Бот остановлен');
      bot.stop('SIGINT');
    });

    process.once('SIGTERM', () => {
      console.log('\n⏹️  Бот остановлен');
      bot.stop('SIGTERM');
    });
  } catch (error) {
    console.error('❌ Ошибка при запуске бота:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
