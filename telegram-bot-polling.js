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
      handleClearChat,
      handleMessage,
      handleNoteInput,
      handleReminderInput,
      handleCrisisCallback,
    } = await import('./src/lib/telegram/handlers.js');
    const { createClient } = await import('@supabase/supabase-js');

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
    bot.command('clear', handleClearChat);

    bot.on('callback_query', handleCrisisCallback);
    
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

    // ───── Планировщик напоминаний ─────
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('⏰ Планировщик напоминаний запущен (проверка каждую минуту)');

    setInterval(async () => {
      try {
        const now = new Date();
        // Используем локальное время сервера (на котором запущен бот)
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;
        const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon … 6=Sat

        const { data: reminders } = await supabaseAdmin
          .from('reminders')
          .select('id, user_id, telegram_id, time, days')
          .eq('time', currentTime)
          .eq('enabled', true);

        if (!reminders?.length) return;

        for (const reminder of reminders) {
          // Проверяем день недели
          const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          if (reminder.days === 'Будни (Пн-Пт)' && !isWeekday) continue;
          if (reminder.days === 'Выходные (Сб-Вс)' && !isWeekend) continue;

          // Не отправляем если заметка на сегодня уже есть
          const todayStart = new Date();
          todayStart.setUTCHours(0, 0, 0, 0);
          const { data: todayNote } = await supabaseAdmin
            .from('notes')
            .select('id')
            .eq('user_id', reminder.user_id)
            .gte('date', todayStart.toISOString())
            .limit(1)
            .single();

          if (todayNote) {
            console.log(`[Reminder] ${reminder.telegram_id} уже записал заметку сегодня, пропуск`);
            continue;
          }

          await bot.telegram.sendMessage(
            reminder.telegram_id,
            `⏰ *Напоминание MindfulAI*\n\nПривет! Не забудьте записать сегодняшний день в дневник 📓\n\nКак настроение? Нажмите /today чтобы добавить запись.`,
            { parse_mode: 'Markdown' }
          );
          console.log(`[Reminder] ✅ Отправлено → ${reminder.telegram_id} в ${currentTime}`);
        }
      } catch (err) {
        console.error('[Reminder] Ошибка планировщика:', err.message);
      }
    }, 60 * 1000);
  } catch (error) {
    console.error('❌ Ошибка при запуске бота:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
