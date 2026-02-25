// src/lib/telegram/handlers.js
// Обработчики команд и сообщений Telegram бота

import { linkTelegramAccount, getUserIdByTelegramId, isValidUser } from './userManager.js';
import { supabaseAdmin } from '../supabase/admin.js';
import { askAIWithHistory, buildUserContext } from '../lmStudioClient.js';
import { getBot } from './botConfig.js';

/**
 * Главное меню с кнопками
 */
export async function showMainMenu(ctx) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: '📝 Записать заметку', callback_data: 'btn_today' },
        { text: '📋 Мои заметки', callback_data: 'btn_notes' }
      ],
      [
        { text: '📊 Анализ', callback_data: 'btn_analyze' },
        { text: '📈 Статистика', callback_data: 'btn_stats' }
      ],
      [
        { text: '⏰ Напоминание', callback_data: 'btn_remind' },
        { text: '🤖 Помощь', callback_data: 'btn_help' }
      ]
    ]
  };
  
  return ctx.reply(
    '👋 Добро пожаловать в MindfulAI!\n\n' +
    'Выберите действие:',
    { reply_markup: keyboard }
  );
}

/**
 * Обработчик callback кнопок
 */
export async function handleCallbackQuery(ctx) {
  const action = ctx.callbackQuery.data;
  
  try {
    await ctx.answerCbQuery(); // Убираем "loading" индикатор на кнопке
    
    switch (action) {
      case 'btn_today':
        return handleToday(ctx);
      case 'btn_notes':
        return handleNotes(ctx);
      case 'btn_analyze':
        return handleAnalyze(ctx);
      case 'btn_stats':
        return handleStats(ctx);
      case 'btn_remind':
        return handleRemind(ctx);
      case 'btn_help':
        return handleHelp(ctx);
      default:
        return ctx.reply('❌ Неизвестная действие');
    }
  } catch (error) {
    console.error('Ошибка в handleCallbackQuery:', error);
    ctx.reply('❌ Ошибка при обработке запроса');
  }
}

/**
 * Обработчик команды /start
 */
export async function handleStart(ctx) {
  const args = ctx.payload;
  const telegramId = ctx.from.id;
  const telegramUsername = ctx.from.username || null;

  try {
    if (args && args.trim()) {
      if (args === 'login') {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        
        try {
          await supabaseAdmin.from('telegram_login_tokens').insert({
            telegram_id: telegramId,
            code: code,
            expires_at: expiresAt,
            used: false,
          });

          return ctx.reply(
            '🔐 Код для входа: `' + code + '`\n\n' +
            '1️⃣ Откройте сайт в браузере:\n' +
            `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/sign-in\n\n` +
            '2️⃣ Нажмите "Log in with Telegram"\n' +
            '3️⃣ Введите этот код\n\n' +
            '⏰ Код действителен 10 минут',
            { parse_mode: 'Markdown' }
          );
        } catch (dbError) {
          console.error('Error saving login token:', dbError);
          return ctx.reply('❌ Ошибка при генерации кода.\n\nПопробуйте еще раз.');
        }
      }

      if (!isValidUser(args)) {
        return ctx.reply('❌ Ошибка: неверный идентификатор пользователя.');
      }

      await linkTelegramAccount(args, telegramId, telegramUsername);

      return ctx.reply(
        '✅ Аккаунт успешно связан!\n\n' +
        'Теперь все ваши данные синхронизированы между сайтом и ботом.',
        { reply_markup: { remove_keyboard: true } }
      );
    } else {
      return showMainMenu(ctx);
    }
  } catch (error) {
    console.error('Ошибка в handleStart:', error);
    ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
  }
}

/**
 * Обработчик команды /help
 */
export async function handleHelp(ctx) {
  return ctx.reply(
    '📖 *Справка по командам*\n\n' +
    '🎯 *Основно*\n' +
    '/start - главное меню\n' +
    '/help - эта справка\n' +
    '/link - связать аккаунт\n\n' +
    '📝 *Дневник*\n' +
    '/today - добавить заметку за сегодня\n' +
    '/notes - ваши последние заметки\n\n' +
    '📊 *Анализ*\n' +
    '/analyze - анализ ваших данных\n' +
    '/stats - статистика\n\n' +
    '⏰ *Напоминания*\n' +
    '/remind - установить напоминание\n\n' +
    '💬 *AI-ассистент*\n' +
    'Просто напишите сообщение - я помогу! 🤖',
    { parse_mode: 'Markdown' }
  );
}

/**
 * Обработчик команды /link
 */
export async function handleLink(ctx) {
  return ctx.reply(
    '🔗 *Для связи аккаунта*\n\n' +
    '1. Откройте сайт\n' +
    '2. Перейдите в профиль → Telegram\n' +
    '3. Нажмите "Связать с ботом"\n' +
    '4. Перейдите по ссылке мессенджера\n\n' +
    'Если уже прошли по ссылке с сайта, то аккаунт уже связан! ✅',
    { parse_mode: 'Markdown' }
  );
}

/**
 * Обработчик команды /notes
 */
export async function handleNotes(ctx) {
  try {
    const userId = await getUserIdByTelegramId(ctx.from.id);

    if (!userId) {
      return ctx.reply('⚠️ Ваш аккаунт не связан с сайтом.\nИспользуйте /link для инструкций.');
    }

    const { data: notes } = await supabaseAdmin
      .from('notes')
      .select('id, comment, mood, sleep, date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);

    if (!notes || notes.length === 0) {
      return ctx.reply('📝 У вас еще нет заметок.\n\nДобавьте первую заметку через /today!');
    }

    let text = '📝 *Ваши последние заметки*:\n\n';
    notes.forEach((note, i) => {
      const date = new Date(note.date).toLocaleDateString('ru-RU');
      text += `${i + 1}. ${date}\n`;
      if (note.mood) text += `   Настроение: ${'😊'.repeat(Math.min(note.mood, 10))}\n`;
      if (note.sleep) text += `   Сон: ${Math.round(note.sleep / 60)}ч\n`;
      if (note.comment) text += `   "${note.comment}"\n\n`;
    });

    return ctx.reply(text, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Ошибка в handleNotes:', error);
    ctx.reply('❌ Ошибка при получении заметок.');
  }
}

/**
 * Обработчик команды /today - интерактивное добавление заметки
 */
export async function handleToday(ctx) {
  try {
    const userId = await getUserIdByTelegramId(ctx.from.id);

    if (!userId) {
      return ctx.reply('⚠️ Ваш аккаунт не связан с сайтом.\nИспользуйте /link для инструкций.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existing } = await supabaseAdmin
      .from('notes')
      .select('id')
      .eq('user_id', userId)
      .gte('date', today.toISOString())
      .single();

    if (existing) {
      return ctx.reply('✅ Вы уже добавили заметку за сегодня!\n\nОткройте сайт для редактирования.');
    }

    ctx.session = ctx.session || {};
    ctx.session.addingNote = {
      userId,
      telegramId: ctx.from.id,
      date: today.toISOString(),
      mood: null,
      sleep: null,
      comment: null,
      step: 'mood'
    };

    return ctx.reply(
      '📝 *Добавление заметки за сегодня*\n\n' +
      '1️⃣ Как ваше настроение? (от 1 до 10)\n' +
      '  1-3: плохо 😞 | 4-6: нейтрально 😐 | 7-10: хорошо 😊\n\n' +
      'Отправьте число:',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Ошибка в handleToday:', error);
    ctx.reply('❌ Ошибка при добавлении заметки.');
  }
}

/**
 * Обработчик ввода для заметки
 */
export async function handleNoteInput(ctx) {
  const input = ctx.message.text?.trim();

  try {
    if (!ctx.session?.addingNote) return;

    const note = ctx.session.addingNote;

    if (note.step === 'mood') {
      const mood = parseInt(input, 10);
      if (isNaN(mood) || mood < 1 || mood > 10) {
        return ctx.reply('❌ Пожалуйста, введите число от 1 до 10');
      }

      note.mood = mood;
      note.step = 'sleep';

      return ctx.reply('2️⃣ Сколько часов вы спали? (например: 7.5)\n\nОтправьте число часов:');
    }

    if (note.step === 'sleep') {
      const sleep = parseFloat(input);
      if (isNaN(sleep) || sleep < 0 || sleep > 24) {
        return ctx.reply('❌ Пожалуйста, введите число часов (0-24)');
      }

      note.sleep = Math.round(sleep * 60);
      note.step = 'comment';

      return ctx.reply('3️⃣ Добавьте заметку (опционально)\n\nНапишите что угодно или отправьте "-" для пропуска:');
    }

    if (note.step === 'comment') {
      note.comment = input === '-' ? null : input;

      const { error } = await supabaseAdmin.from('notes').insert({
        user_id: note.userId,
        date: note.date,
        mood: note.mood,
        sleep: note.sleep,
        comment: note.comment,
      });

      if (error) throw error;

      delete ctx.session.addingNote;

      return ctx.reply(
        `✅ *Заметка сохранена!*\n\n` +
        `😊 Настроение: ${note.mood}/10\n` +
        `😴 Сон: ${(note.sleep / 60).toFixed(1)}ч\n` +
        `${note.comment ? `📝 "${note.comment}"` : ''}\n\n` +
        'Данные синхронизированы с вашим профилем!',
        { parse_mode: 'Markdown' }
      );
    }
  } catch (error) {
    console.error('Ошибка в handleNoteInput:', error);
    ctx.reply('❌ Ошибка при сохранении заметки.');
    delete ctx.session?.addingNote;
  }
}

/**
 * Обработчик команды /analyze
 */
export async function handleAnalyze(ctx) {
  try {
    const userId = await getUserIdByTelegramId(ctx.from.id);

    if (!userId) {
      return ctx.reply('⚠️ Ваш аккаунт не связан с сайтом.\nИспользуйте /link для инструкций.');
    }

    await ctx.sendChatAction('typing');

    const { data: notes } = await supabaseAdmin
      .from('notes')
      .select('date, mood, sleep, comment')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);

    if (!notes || notes.length === 0) {
      return ctx.reply('📊 Нет заметок для анализа.\n\nСначала добавьте заметки через /today!');
    }

    const summaryText = notes
      .map((n) => {
        const date = new Date(n.date).toLocaleDateString('ru-RU');
        let line = `📅 ${date}`;
        if (n.mood) line += ` • Настроение: ${n.mood}/10`;
        if (n.sleep) line += ` • Сон: ${Math.round(n.sleep / 60)}ч`;
        if (n.comment) line += ` • "${n.comment}"`;
        return line;
      })
      .join('\n');

    const analysisPrompt =
      `Проанализируй эти заметки пользователя и дай краткий анализ (3-4 предложения):\n\n${summaryText}\n\n` +
      'Отметь тренды, паттерны и дай 1-2 простых рекомендации.';

    const { data: history } = await supabaseAdmin
      .from('ai_messages')
      .select('role, content')
      .eq('user_id', userId)
      .eq('source', 'telegram')
      .order('created_at', { ascending: false })
      .limit(5);

    const messageHistory = history ? history.reverse() : [];

    const aiResponse = await askAIWithHistory(analysisPrompt, messageHistory, '');

    await supabaseAdmin.from('ai_messages').insert([
      {
        user_id: userId,
        role: 'user',
        content: '/analyze - запрос анализа',
        source: 'telegram',
      },
      {
        user_id: userId,
        role: 'assistant',
        content: aiResponse,
        source: 'telegram',
      },
    ]);

    return ctx.reply(
      `📊 *AI Анализ ваших данных*\n\n${aiResponse}\n\n` +
      '_Подробный анализ доступен на сайте в разделе Аналитика_',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Ошибка в handleAnalyze:', error);
    ctx.reply('❌ Ошибка при анализе данных.');
  }
}

/**
 * Обработчик команды /stats
 */
export async function handleStats(ctx) {
  try {
    const userId = await getUserIdByTelegramId(ctx.from.id);

    if (!userId) {
      return ctx.reply('⚠️ Ваш аккаунт не связан с сайтом.\nИспользуйте /link для инструкций.');
    }

    const { data: stats } = await supabaseAdmin
      .from('notes')
      .select('mood, sleep')
      .eq('user_id', userId)
      .limit(30);

    if (!stats || stats.length === 0) {
      return ctx.reply('📊 Нет данных для статистики.\n\nДобавьте несколько заметок!');
    }

    const avgMood = Math.round(stats.reduce((a, n) => a + (n.mood || 0), 0) / stats.length);
    const avgSleep = Math.round(stats.reduce((a, n) => a + (n.sleep || 0), 0) / stats.length / 60);

    let text = `📊 *Ваша статистика (последние 30 заметок)*:\n\n`;
    text += `📈 Всего заметок: ${stats.length}\n`;
    text += `😊 Среднее настроение: ${avgMood}/10\n`;
    text += `😴 Средний сон: ${avgSleep}ч\n\n`;
    text += 'Подробней смотрите на сайте!';

    return ctx.reply(text, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Ошибка в handleStats:', error);
    ctx.reply('❌ Ошибка при получении статистики.');
  }
}

/**
 * Обработчик команды /remind
 */
export async function handleRemind(ctx) {
  try {
    const userId = await getUserIdByTelegramId(ctx.from.id);

    if (!userId) {
      return ctx.reply('⚠️ Ваш аккаунт не связан с сайтом.\nИспользуйте /link для инструкций.');
    }

    ctx.session = ctx.session || {};
    ctx.session.settingReminder = {
      userId,
      telegramId: ctx.from.id,
      step: 'time'
    };

    return ctx.reply(
      '⏰ *Установить напоминание*\n\n' +
      'В какое время вы хотите получать напоминание?\n\n' +
      'Примеры: 09:00, 20:30, 19:00\n\n' +
      'Отправьте время (HH:MM):',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Ошибка в handleRemind:', error);
    ctx.reply('❌ Ошибка при установке напоминания.');
  }
}

/**
 * Обработчик ввода напоминания
 */
export async function handleReminderInput(ctx) {
  const input = ctx.message.text?.trim();

  try {
    if (!ctx.session?.settingReminder) return;

    const reminder = ctx.session.settingReminder;

    if (reminder.step === 'time') {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(input)) {
        return ctx.reply('❌ Неверный формат. Используйте HH:MM (например 09:00)');
      }

      reminder.time = input;
      reminder.step = 'days';

      return ctx.reply(
        '📅 В какие дни получать напоминание?\n\n' +
        'Примеры: каждый день, пн-пт (будни), вс-сб\n\n' +
        'Отправьте дни:'
      );
    }

    if (reminder.step === 'days') {
      reminder.days = input;

      try {
        await supabaseAdmin.from('reminders').insert({
          user_id: reminder.userId,
          telegram_id: reminder.telegramId,
          time: reminder.time,
          days: reminder.days,
          enabled: true,
          created_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('Reminders table not yet created:', dbErr);
      }

      delete ctx.session.settingReminder;

      return ctx.reply(
        `✅ *Напоминание установлено!*\n\n` +
        `⏰ Время: ${reminder.time}\n` +
        `📅 Дни: ${reminder.days}\n\n` +
        `Вы будете получать напоминание добавлять заметку в эти дни.`,
        { parse_mode: 'Markdown' }
      );
    }
  } catch (error) {
    console.error('Ошибка в handleReminderInput:', error);
    ctx.reply('❌ Ошибка при установке напоминания.');
    delete ctx.session?.settingReminder;
  }
}

/**
 * Обработчик обычных сообщений с AI
 */
export async function handleMessage(ctx) {
  const message = ctx.message.text;
  const telegramId = ctx.from.id;

  try {
    const userId = await getUserIdByTelegramId(telegramId);

    if (!userId) {
      return ctx.reply(
        '⚠️ Ваш аккаунт не связан с сайтом.\n\nДля использования AI-ассистента свяжите аккаунт через /link'
      );
    }

    await ctx.sendChatAction('typing');

    const { data: history } = await supabaseAdmin
      .from('ai_messages')
      .select('role, content')
      .eq('user_id', userId)
      .eq('source', 'telegram')
      .order('created_at', { ascending: false })
      .limit(10);

    const messageHistory = history ? history.reverse() : [];
    const userContext = await buildUserContext(supabaseAdmin, userId);

    const aiResponse = await askAIWithHistory(message, messageHistory, userContext);

    await supabaseAdmin.from('ai_messages').insert([
      {
        user_id: userId,
        role: 'user',
        content: message,
        source: 'telegram',
      },
      {
        user_id: userId,
        role: 'assistant',
        content: aiResponse,
        source: 'telegram',
      },
    ]);

    return ctx.reply(aiResponse);
  } catch (error) {
    console.error('Ошибка в handleMessage:', error);
    
    if (error.message && error.message.includes('LM Studio')) {
      return ctx.reply('⚠️ AI-ассистент временно недоступен.\n\nПопробуйте позже или используйте команды: /help');
    }

    return ctx.reply('Извините, произошла ошибка. Попробуйте позже.\n\nИли используйте команды: /help');
  }
}

/**
 * Отправить уведомление пользователю в Telegram
 */
export async function sendTelegramNotification(telegramId, message) {
  try {
    const userId = await getUserIdByTelegramId(telegramId);
    if (!userId) return;

    const { data: settings } = await supabaseAdmin
      .from('user_settings')
      .select('push_notifications')
      .eq('user_id', userId)
      .single();

    if (!settings?.push_notifications) {
      console.log(`Push notifications disabled for user ${userId}`);
      return;
    }

    const bot = getBot();
    await bot.telegram.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    console.log(`📤 Notification sent to ${telegramId}`);
  } catch (error) {
    console.error('Failed to send telegram notification:', error);
  }
}
