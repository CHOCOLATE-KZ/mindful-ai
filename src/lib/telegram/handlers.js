// src/lib/telegram/handlers.js
// Обработчики команд и сообщений Telegram бота

import { linkTelegramAccount, getUserIdByTelegramId, isValidUser } from './userManager.js';
import { supabaseAdmin } from '../supabase/admin.js';
import { askAI } from '../lmStudioClient.js';
import {
  processChatTurn,
  clearUserChat,
  CRISIS_TELEGRAM_PROMPT,
} from '../chat/processChatTurn.js';
import { getBot } from './botConfig.js';

const CRISIS_INLINE_KEYBOARD = {
  inline_keyboard: [
    [{ text: 'Продолжить разговор', callback_data: 'crisis_continue' }],
    [{ text: 'Другая тема', callback_data: 'crisis_decline' }],
  ],
};

/**
 * Главное меню с Reply Keyboard кнопками
 */
export async function showMainMenu(ctx) {
  const keyboard = {
    keyboard: [
      [{ text: ' Записать заметку' }, { text: ' Мои заметки' }],
      [{ text: ' Анализ' }, { text: ' Статистика' }],
      [{ text: 'Напоминание' }, { text: ' Помощь' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  };
  
  return ctx.reply(
    ' Добро пожаловать в MindfulAI!\n\n' +
    'Выберите действие:',
    { reply_markup: keyboard }
  );
}

/**
 * Кризисные inline-кнопки (продолжить / другая тема)
 */
export async function handleCrisisCallback(ctx) {
  const data = ctx.callbackQuery?.data;
  if (data !== 'crisis_continue' && data !== 'crisis_decline') {
    return handleCallbackQuery(ctx);
  }

  try {
    await ctx.answerCbQuery();

    const userId = await getUserIdByTelegramId(ctx.from.id);
    if (!userId) {
      return ctx.reply(' Ваш аккаунт не связан с сайтом.\nИспользуйте /link для инструкций.');
    }

    const triggerMessage = String(ctx.session?.pendingCrisis?.triggerMessage || "").trim();
    if (!triggerMessage && data === 'crisis_continue') {
      return ctx.reply(' Не удалось восстановить сообщение. Напишите снова, о чём хочешь поговорить.');
    }

    await ctx.sendChatAction('typing');

    const result = await processChatTurn({
      supabase: supabaseAdmin,
      userId,
      message: triggerMessage || 'продолжить',
      source: 'telegram',
      crisisTopicChoice: data === 'crisis_continue' ? 'continue' : 'decline',
      continueAfterCrisis: data === 'crisis_continue',
      skipUserInsert: true,
    });

    if (ctx.session) {
      delete ctx.session.pendingCrisis;
    }

    if (result.error) {
      return ctx.reply(' Извините, произошла ошибка. Попробуйте написать сообщение снова.');
    }

    if (result.crisis) {
      ctx.session = ctx.session || {};
      ctx.session.pendingCrisis = { triggerMessage };
      return ctx.reply(CRISIS_TELEGRAM_PROMPT, {
        parse_mode: 'Markdown',
        reply_markup: CRISIS_INLINE_KEYBOARD,
      });
    }

    return ctx.reply(result.reply || '...', { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Ошибка в handleCrisisCallback:', error);
    return ctx.reply(' Извините, произошла ошибка. Попробуйте позже.');
  }
}

/**
 * Обработчик прочих callback-кнопок
 */
export async function handleCallbackQuery(ctx) {
  try {
    await ctx.answerCbQuery();
    return ctx.reply(' Используйте меню кнопок ниже');
  } catch (error) {
    console.error('Ошибка в handleCallbackQuery:', error);
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
            ' Код для входа: `' + code + '`\n\n' +
            '1️⃣ Откройте сайт в браузере:\n' +
            `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/sign-in\n\n` +
            '2️⃣ Нажмите "Log in with Telegram"\n' +
            '3️⃣ Введите этот код\n\n' +
            '⏰ Код действителен 10 минут',
            { parse_mode: 'Markdown' }
          );
        } catch (dbError) {
          console.error('Error saving login token:', dbError);
          return ctx.reply(' Ошибка при генерации кода.\n\nПопробуйте еще раз.');
        }
      }

      if (!await isValidUser(args)) {
        return ctx.reply(' Ошибка: неверный идентификатор пользователя.');
      }

      await linkTelegramAccount(args, telegramId, telegramUsername);

      return ctx.reply(
        ' Аккаунт успешно связан!\n\n' +
        'Теперь все ваши данные синхронизированы между сайтом и ботом.',
        { reply_markup: { remove_keyboard: true } }
      );
    } else {
      return showMainMenu(ctx);
    }
  } catch (error) {
    console.error('Ошибка в handleStart:', error);
    ctx.reply(' Произошла ошибка. Попробуйте позже.');
  }
}

/**
 * Обработчик команды /help
 */
export async function handleHelp(ctx) {
  return ctx.reply(
    ' *Справка по командам*\n\n' +
    ' *Основно*\n' +
    '/start - главное меню\n' +
    '/help - эта справка\n' +
    '/link - связать аккаунт\n\n' +
    ' *Дневник*\n' +
    '/today - добавить заметку за сегодня\n' +
    '/notes - ваши последние заметки\n\n' +
    ' *Анализ*\n' +
    '/analyze - анализ ваших данных\n' +
    '/stats - статистика\n\n' +
    '⏰ *Напоминания*\n' +
    '/remind - установить напоминание\n\n' +
    ' *AI-ассистент*\n' +
    'Просто напишите сообщение — я помогу!\n\n' +
    ' /clear — очистить историю чата и резюме сессии',
    { parse_mode: 'Markdown' }
  );
}

/**
 * Очистка истории чата (общая с сайтом) и резюме сессии
 */
export async function handleClearChat(ctx) {
  try {
    const userId = await getUserIdByTelegramId(ctx.from.id);
    if (!userId) {
      return ctx.reply(' Ваш аккаунт не связан с сайтом.\nИспользуйте /link для инструкций.');
    }

    const { error } = await clearUserChat(supabaseAdmin, userId);
    if (error) {
      console.error('handleClearChat:', error);
      return ctx.reply(' Не удалось очистить чат. Попробуйте позже.');
    }

    if (ctx.session) {
      delete ctx.session.pendingCrisis;
    }

    return ctx.reply(
      ' История чата и резюме сессии очищены.\n\n' +
        'Диалог на сайте и в Telegram теперь общий — всё сброшено. Можешь начать заново.',
      { reply_markup: { remove_keyboard: false } }
    );
  } catch (error) {
    console.error('Ошибка в handleClearChat:', error);
    return ctx.reply(' Ошибка при очистке чата.');
  }
}

/**
 * Обработчик команды /link
 */
export async function handleLink(ctx) {
  return ctx.reply(
    ' *Для связи аккаунта*\n\n' +
    '1. Откройте сайт\n' +
    '2. Перейдите в профиль → Telegram\n' +
    '3. Нажмите "Связать с ботом"\n' +
    '4. Перейдите по ссылке мессенджера\n\n' +
    'Если уже прошли по ссылке с сайта, то аккаунт уже связан! ',
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
      return ctx.reply(' Ваш аккаунт не связан с сайтом.\nИспользуйте /link для инструкций.');
    }

    const { data: notes } = await supabaseAdmin
      .from('notes')
      .select('id, comment, mood, sleep, date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);

    if (!notes || notes.length === 0) {
      return ctx.reply(' У вас еще нет заметок.\n\nДобавьте первую заметку через /today!');
    }

    let text = ' *Ваши последние заметки*:\n\n';
    notes.forEach((note, i) => {
      const date = new Date(note.date).toLocaleDateString('ru-RU');
      text += `${i + 1}. ${date}\n`;
      if (note.mood) text += `   Настроение: ${''.repeat(Math.min(note.mood, 10))}\n`;
      if (note.sleep) text += `   Сон: ${Math.round(note.sleep / 60)}ч\n`;
      if (note.comment) text += `   "${note.comment}"\n\n`;
    });

    return ctx.reply(text, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Ошибка в handleNotes:', error);
    ctx.reply(' Ошибка при получении заметок.');
  }
}

/**
 * Обработчик команды /today - интерактивное добавление заметки
 */
export async function handleToday(ctx) {
  try {
    const userId = await getUserIdByTelegramId(ctx.from.id);

    if (!userId) {
      return ctx.reply(' Ваш аккаунт не связан с сайтом.\nИспользуйте /link для инструкций.');
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
      return ctx.reply(' Вы уже добавили заметку за сегодня!\n\nОткройте сайт для редактирования.');
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

    const keyboard = {
      keyboard: [
        [{ text: '1 ' }, { text: '2' }, { text: '3' }, { text: '4' }, { text: '5' }],
        [{ text: '6' }, { text: '7' }, { text: '8' }, { text: '9' }, { text: '10 ' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    };

    return ctx.reply(
      ' *Добавление заметки за сегодня*\n\n' +
      '1️⃣ Как ваше настроение? (от 1 до 10)\n' +
      '  1-3: плохо  | 4-6: нейтрально  | 7-10: хорошо ',
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  } catch (error) {
    console.error('Ошибка в handleToday:', error);
    ctx.reply(' Ошибка при добавлении заметки.');
  }
}

/**
 * Обработчик ввода для заметки (поддерживает кнопки и текстовый ввод)
 */
export async function handleNoteInput(ctx) {
  const input = ctx.message.text?.trim();

  try {
    if (!ctx.session?.addingNote) return;

    const note = ctx.session.addingNote;

    // Поддержка текстового ввода настроения (если пользователь не нажал кнопку)
    if (note.step === 'mood') {
      // Парсим из кнопки ("1 " -> 1) или прямой ввод (8 -> 8)
      const moodMatch = input.match(/^(\d+)/);
      const mood = moodMatch ? parseInt(moodMatch[1], 10) : NaN;
      
      if (isNaN(mood) || mood < 1 || mood > 10) {
        return ctx.reply(' Пожалуйста, выберите кнопку или введите число от 1 до 10');
      }

      note.mood = mood;
      note.step = 'sleep';

      const keyboard = {
        keyboard: [
          [{ text: '4ч' }, { text: '5ч' }, { text: '6ч' }, { text: '7ч' }],
          [{ text: '8ч' }, { text: '9ч' }, { text: '10ч' }, { text: '11ч' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      };

      return ctx.reply('2️⃣ Сколько часов вы спали?', { reply_markup: keyboard });
    }

    // Поддержка текстового ввода сна (если пользователь не нажал кнопку)
    if (note.step === 'sleep') {
      // Парсим из кнопки ("7ч" -> 7) или прямой ввод (7.5 -> 7.5)
      const sleepMatch = input.match(/^(\d+(?:\.\d+)?)/);
      const sleep = sleepMatch ? parseFloat(sleepMatch[1]) : NaN;
      
      if (isNaN(sleep) || sleep < 0 || sleep > 24) {
        return ctx.reply(' Пожалуйста, выберите кнопку или введите число часов (0-24)');
      }

      note.sleep = Math.round(sleep * 60);
      note.step = 'comment';

      const keyboard = {
        keyboard: [
          [{ text: '⏭️ Пропустить' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      };

      return ctx.reply(
        '3️⃣ Добавьте заметку (опционально)\n\n' +
        'Напишите что угодно или нажмите "Пропустить":',
        { reply_markup: keyboard }
      );
    }

    // Ввод комментария (текстом) или пропуск
    if (note.step === 'comment') {
      note.comment = (input === '⏭️ Пропустить' || input === '-') ? null : input;

      const { error } = await supabaseAdmin.from('notes').insert({
        user_id: note.userId,
        date: note.date,
        mood: note.mood,
        sleep: note.sleep,
        comment: note.comment,
      });

      if (error) throw error;

      delete ctx.session.addingNote;

      await ctx.reply(
        ` *Заметка сохранена!*\n\n` +
        ` Настроение: ${note.mood}/10\n` +
        ` Сон: ${(note.sleep / 60).toFixed(1)}ч\n` +
        `${note.comment ? ` "${note.comment}"` : ''}\n\n` +
        'Данные синхронизированы с вашим профилем!',
        { parse_mode: 'Markdown', reply_markup: { remove_keyboard: true } }
      );

      return showMainMenu(ctx);
    }
  } catch (error) {
    console.error('Ошибка в handleNoteInput:', error);
    ctx.reply(' Ошибка при сохранении заметки.');
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
      return ctx.reply(' Ваш аккаунт не связан с сайтом.\nИспользуйте /link для инструкций.');
    }

    await ctx.sendChatAction('typing');

    const { data: notes } = await supabaseAdmin
      .from('notes')
      .select('date, mood, sleep, comment')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);

    if (!notes || notes.length === 0) {
      return ctx.reply(' Нет заметок для анализа.\n\nСначала добавьте заметки через /today!');
    }

    const summaryText = notes
      .map((n) => {
        const date = new Date(n.date).toLocaleDateString('ru-RU');
        let line = ` ${date}`;
        if (n.mood) line += ` • Настроение: ${n.mood}/10`;
        if (n.sleep) line += ` • Сон: ${Math.round(n.sleep / 60)}ч`;
        if (n.comment) line += ` • "${n.comment}"`;
        return line;
      })
      .join('\n');

    const analysisPrompt =
      `Пользователь просит проанализировать его дневник эмоций и сна. Вот последние 10 записей:\n\n${summaryText}\n\n` +
      'Дай краткий анализ (3-4 предложения): какие тренды видны в настроении и сне, ' +
      'есть ли паттерны или проблемы. Дай 1-2 простые практические рекомендации для улучшения.';

    // НЕ используем историю для /analyze - это специальная команда, не чат
    const aiResponse = await askAI(analysisPrompt, '');

    // Только сохраняем результат, если он валидный (не дефолтная ошибка)
    if (aiResponse && !aiResponse.includes('Извините, не могу ответить')) {
      await supabaseAdmin.from('ai_messages').insert([
        {
          user_id: userId,
          role: 'user',
          content: 'Запрос анализа дневника',
          source: 'telegram',
        },
        {
          user_id: userId,
          role: 'assistant',
          content: aiResponse,
          source: 'telegram',
        },
      ]);
    }

    return ctx.reply(
      ` *AI Анализ ваших данных*\n\n${aiResponse}\n\n` +
      '_Подробный анализ доступен на сайте в разделе Аналитика_',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Ошибка в handleAnalyze:', error);
    ctx.reply(' Ошибка при анализе данных.');
  }
}

/**
 * Обработчик команды /stats
 */
export async function handleStats(ctx) {
  try {
    const userId = await getUserIdByTelegramId(ctx.from.id);

    if (!userId) {
      return ctx.reply(' Ваш аккаунт не связан с сайтом.\nИспользуйте /link для инструкций.');
    }

    const { data: stats } = await supabaseAdmin
      .from('notes')
      .select('mood, sleep')
      .eq('user_id', userId)
      .limit(30);

    if (!stats || stats.length === 0) {
      return ctx.reply(' Нет данных для статистики.\n\nДобавьте несколько заметок!');
    }

    const avgMood = Math.round(stats.reduce((a, n) => a + (n.mood || 0), 0) / stats.length);
    const avgSleep = Math.round(stats.reduce((a, n) => a + (n.sleep || 0), 0) / stats.length / 60);

    let text = ` *Ваша статистика (последние 30 заметок)*:\n\n`;
    text += ` Всего заметок: ${stats.length}\n`;
    text += ` Среднее настроение: ${avgMood}/10\n`;
    text += ` Средний сон: ${avgSleep}ч\n\n`;
    text += 'Подробней смотрите на сайте!';

    return ctx.reply(text, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Ошибка в handleStats:', error);
    ctx.reply(' Ошибка при получении статистики.');
  }
}

/**
 * Обработчик команды /remind
 */
export async function handleRemind(ctx) {
  try {
    const userId = await getUserIdByTelegramId(ctx.from.id);

    if (!userId) {
      return ctx.reply(' Ваш аккаунт не связан с сайтом.\nИспользуйте /link для инструкций.');
    }

    ctx.session = ctx.session || {};
    ctx.session.settingReminder = {
      userId,
      telegramId: ctx.from.id,
      step: 'time'
    };

    const keyboard = {
      keyboard: [
        [{ text: '07:00' }, { text: '08:00' }, { text: '09:00' }],
        [{ text: '12:00' }, { text: '15:00' }, { text: '18:00' }],
        [{ text: '20:00' }, { text: '21:00' }, { text: '22:00' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    };

    return ctx.reply(
      '⏰ *Установить напоминание*\n\n' +
      'Выберите время для напоминания:',
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  } catch (error) {
    console.error('Ошибка в handleRemind:', error);
    ctx.reply(' Ошибка при установке напоминания.');
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
        return ctx.reply(' Неверный формат. Используйте HH:MM (например 09:00)');
      }

      reminder.time = input;
      reminder.step = 'days';

      const keyboard = {
        keyboard: [
          [{ text: ' Каждый день' }],
          [{ text: ' Будни (Пн-Пт)' }, { text: '️ Выходные (Сб-Вс)' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      };

      return ctx.reply(
        ' В какие дни получать напоминание?',
        { reply_markup: keyboard }
      );
    }

    if (reminder.step === 'days') {
      let daysText = input;
      
      // Нормализуем текст из кнопок
      if (input.includes('Каждый день')) daysText = 'Каждый день';
      else if (input.includes('Будни')) daysText = 'Будни (Пн-Пт)';
      else if (input.includes('Выходные')) daysText = 'Выходные (Сб-Вс)';
      
      reminder.days = daysText;

      // upsert — одно напоминание на пользователя, не создаём дубли
      const { error: dbErr } = await supabaseAdmin
        .from('reminders')
        .upsert(
          {
            user_id: reminder.userId,
            telegram_id: reminder.telegramId,
            time: reminder.time,
            days: reminder.days,
            enabled: true,
          },
          { onConflict: 'user_id' }
        );
      if (dbErr) console.error('Ошибка сохранения напоминания:', dbErr);

      delete ctx.session.settingReminder;

      await ctx.reply(
        ` *Напоминание установлено!*\n\n` +
        `⏰ Время: ${reminder.time}\n` +
        ` Дни: ${reminder.days}\n\n` +
        `Вы будете получать напоминание добавлять заметку в эти дни.`,
        { parse_mode: 'Markdown', reply_markup: { remove_keyboard: true } }
      );

      return showMainMenu(ctx);
    }
  } catch (error) {
    console.error('Ошибка в handleReminderInput:', error);
    ctx.reply(' Ошибка при установке напоминания.');
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
    // Проверяем если это нажатие на кнопку главного меню
    if (message === ' Записать заметку') return handleToday(ctx);
    if (message === ' Мои заметки') return handleNotes(ctx);
    if (message === ' Анализ') return handleAnalyze(ctx);
    if (message === ' Статистика') return handleStats(ctx);
    if (message === 'Напоминание') return handleRemind(ctx);
    if (message === ' Помощь') return handleHelp(ctx);

    const userId = await getUserIdByTelegramId(telegramId);

    if (!userId) {
      return ctx.reply(
        ' Ваш аккаунт не связан с сайтом.\n\nДля использования AI-ассистента свяжите аккаунт через /link'
      );
    }

    await ctx.sendChatAction('typing');

    const result = await processChatTurn({
      supabase: supabaseAdmin,
      userId,
      message,
      source: 'telegram',
    });

    if (result.error) {
      if (String(result.error).toLowerCase().includes('lm')) {
        return ctx.reply(
          ' AI-ассистент временно недоступен.\n\nПопробуйте позже или используйте команды: /help'
        );
      }
      return ctx.reply('Извините, произошла ошибка. Попробуйте позже.\n\nИли используйте команды: /help');
    }

    if (result.crisis) {
      ctx.session = ctx.session || {};
      ctx.session.pendingCrisis = { triggerMessage: message };
      return ctx.reply(CRISIS_TELEGRAM_PROMPT, {
        parse_mode: 'Markdown',
        reply_markup: CRISIS_INLINE_KEYBOARD,
      });
    }

    let replyText = result.reply || '...';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const recs = result.testRecommendations || {};
    const recParts = [];

    if (recs.generated?.href) {
      recParts.push(
        `*Персональный тест:* ${recs.generated.title}\n` +
          `${recs.generated.rationale}\n` +
          `[Пройти](${siteUrl}${recs.generated.href})`
      );
    }
    if (recs.catalog?.href) {
      recParts.push(
        `*Из каталога:* ${recs.catalog.title}\n` +
          `${recs.catalog.rationale}\n` +
          `[Пройти](${siteUrl}${recs.catalog.href})`
      );
    }

    if (recParts.length > 0) {
      replyText += `\n\n${recParts.join('\n\n')}`;
    } else if (result.testRecommendation?.href) {
      replyText +=
        `\n\n*Рекомендованный тест:* ${result.testRecommendation.title}\n` +
        `${result.testRecommendation.rationale}\n` +
        `[Пройти на сайте](${siteUrl}${result.testRecommendation.href})`;
    } else if (result.testsGate?.justUnlocked) {
      replyText += '\n\n_Диагностические тесты разблокированы — откройте раздел «Упражнения» на сайте._';
    }

    return ctx.reply(replyText, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Ошибка в handleMessage:', error);
    
    if (error.message && error.message.includes('LM Studio')) {
      return ctx.reply(' AI-ассистент временно недоступен.\n\nПопробуйте позже или используйте команды: /help');
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
      .select('push_enabled')
      .eq('user_id', userId)
      .single();

    if (!settings?.push_enabled) {
      console.log(`Push notifications disabled for user ${userId}`);
      return;
    }

    const bot = getBot();
    await bot.telegram.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    console.log(` Notification sent to ${telegramId}`);
  } catch (error) {
    console.error('Failed to send telegram notification:', error);
  }
}
