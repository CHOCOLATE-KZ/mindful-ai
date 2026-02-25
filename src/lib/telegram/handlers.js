// src/lib/telegram/handlers.js
// Обработчики команд и сообщений Telegram бота

import { linkTelegramAccount, getUserIdByTelegramId, isValidUser } from './userManager.js';
import { supabaseAdmin } from '../supabase/admin.js';
import { askAIWithHistory, buildUserContext } from '../lmStudioClient.js';
import { getBot } from './botConfig.js';

/**
 * Обработчик команды /start
 * Связывает Telegram аккаунт если передан userId в параметре
 * Поддерживает параметр "login" для входа через Telegram
 */
export async function handleStart(ctx) {
  const args = ctx.payload; // userId или "login" из deep link
  const telegramId = ctx.from.id;
  const telegramUsername = ctx.from.username || null;
  const firstName = ctx.from.first_name || '';
  const lastName = ctx.from.last_name || '';

  try {
    if (args && args.trim()) {
      // Специальный случай: вход через Telegram
      if (args === 'login') {
        // Генерируем 6-значный код
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Сохраняем код в БД (expires через 10 минут)
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
            '⏰ Код действителен 10 минут\n\n' +
            '💡 Совет: Скопируйте код нажав на него',
            { parse_mode: 'Markdown' }
          );
        } catch (dbError) {
          console.error('Error saving login token:', dbError);
          return ctx.reply(
            '❌ Произошла ошибка при генерации кода.\n\n' +
            'Попробуйте еще раз через несколько секунд.'
          );
        }
      }

      // Проверяем валидность user_id (UUID)
      if (!isValidUser(args)) {
        return ctx.reply(
          '❌ Ошибка: неверный идентификатор пользователя.\n\n' +
          'Убедитесь, что вы перешли по ссылке с сайта.'
        );
      }

      // Связываем аккаунт с username
      await linkTelegramAccount(args, telegramId, telegramUsername);

      return ctx.reply(
        '✅ Аккаунт успешно связан!\n\n' +
        'Теперь все ваши данные синхронизированы между сайтом и ботом.\n\n' +
        'Доступные команды:\n' +
        '/help - справка\n' +
        '/notes - ваши заметки\n' +
        '/stats - статистика'
      );
    } else {
      // Без параметра - просто приветствие
      return ctx.reply(
        'Привет! 👋\n\n' +
        'Я бот для управления вашим здоровьем и самочувствием.\n\n' +
        'Для полного функционала свяжите ваш аккаунт на сайте с этим ботом.\n\n' +
        '/help - справка'
      );
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
    '📖 Справка по командам:\n\n' +
    '/start - начало работы\n' +
    '/help - эта справка\n' +
    '/link - связать аккаунт\n' +
    '/notes - ваши последние заметки\n' +
    '/today - добавить заметку за сегодня\n' +
    '/stats - статистика\n\n' +
    '💬 AI-ассистент:\n' +
    'Просто напишите мне сообщение, и я помогу вам!\n' +
    'Задавайте вопросы о самочувствии, стрессе, сне - я всегда рядом.'
  );
}

/**
 * Обработчик команды /link
 * Отправляет инструкцию по связке аккаунта
 */
export async function handleLink(ctx) {
  return ctx.reply(
    '🔗 Для связики аккаунта:\n\n' +
    '1. Откройте сайт\n' +
    '2. Перейдите в профиль → Telegram\n' +
    '3. Нажмите "Связать с ботом"\n' +
    '4. Перейдите по ссылке мессенджера\n\n' +
    'Если уже прошли по ссылке с сайта, то аккаунт уже связан! ✅'
  );
}

/**
 * Обработчик команды /notes
 */
export async function handleNotes(ctx) {
  try {
    const userId = await getUserIdByTelegramId(ctx.from.id);

    if (!userId) {
      return ctx.reply(
        '⚠️ Ваш аккаунт не связан с сайтом.\n' +
        'Используйте /link для инструкций.'
      );
    }

    // Получаем последние 5 заметок
    const { data: notes, error } = await supabaseAdmin
      .from('notes')
      .select('id, comment, mood, sleep, date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!notes || notes.length === 0) {
      return ctx.reply('📝 У вас еще нет заметок.\n\nДобавьте первую заметку на сайте или здесь!');
    }

    let text = '📝 Ваши последние заметки:\n\n';
    notes.forEach((note, i) => {
      const date = new Date(note.date).toLocaleDateString('ru-RU');
      text += `${i + 1}. ${date}\n`;
      if (note.mood) text += `   Настроение: ${'😊'.repeat(Math.min(note.mood, 10))}\n`;
      if (note.sleep) text += `   Сон: ${Math.round(note.sleep / 60)}ч\n`;
      if (note.comment) text += `   "${note.comment}"\n\n`;
    });

    return ctx.reply(text);
  } catch (error) {
    console.error('Ошибка в handleNotes:', error);
    ctx.reply('❌ Ошибка при получении заметок.');
  }
}

/**
 * Отправить уведомление пользователю в Telegram (если он согласился на push)
 */
export async function sendTelegramNotification(telegramId, message) {
  try {
    // Получаем userId
    const userId = await getUserIdByTelegramId(telegramId);
    if (!userId) return;

    // Проверяем включены ли push уведомления
    const { data: settings } = await supabaseAdmin
      .from('user_settings')
      .select('push_notifications')
      .eq('user_id', userId)
      .single();

    if (!settings?.push_notifications) {
      console.log(`Push notifications disabled for user ${userId}`);
      return;
    }

    // Получаем бота и отправляем сообщение
    const bot = getBot();
    await bot.telegram.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    console.log(`📤 Notification sent to ${telegramId}`);
  } catch (error) {
    console.error('Failed to send telegram notification:', error);
  }
}

/**
 * Улучшенный обработчик команды /today - интерактивное добавление заметки
 */
export async function handleToday(ctx) {
  try {
    const userId = await getUserIdByTelegramId(ctx.from.id);

    if (!userId) {
      return ctx.reply(
        '⚠️ Ваш аккаунт не связан с сайтом.\n' +
        'Используйте /link для инструкций.'
      );
    }

    // Проверяем есть ли уже запись за сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existing } = await supabaseAdmin
      .from('notes')
      .select('id')
      .eq('user_id', userId)
      .gte('date', today.toISOString())
      .single();

    if (existing) {
      return ctx.reply(
        '✅ Вы уже добавили заметку за сегодня!\n\n' +
        'Откройте сайт для редактирования или /today снова для новой записи.'
      );
    }

    // Начинаем интерактивное добавление
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
      '  1-3: плохо 😞\n' +
      '  4-6: нейтрально 😐\n' +
      '  7-10: хорошо 😊\n\n' +
      'Отправьте число:',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Ошибка в handleToday:', error);
    ctx.reply('❌ Ошибка при добавлении заметки.');
  }
}

/**
 * Обработчик числового ввода для заметки (настроение, сон)
 */
export async function handleNoteInput(ctx) {
  const input = ctx.message.text?.trim();
  const userId = ctx.from.id;

  try {
    if (!ctx.session?.addingNote) {
      return; // Не в процессе добавления заметки
    }

    const note = ctx.session.addingNote;

    if (note.step === 'mood') {
      const mood = parseInt(input, 10);
      if (isNaN(mood) || mood < 1 || mood > 10) {
        return ctx.reply('❌ Пожалуйста, введите число от 1 до 10');
      }

      note.mood = mood;
      note.step = 'sleep';

      return ctx.reply(
        '2️⃣ Сколько часов вы спали? (например: 7.5 или 8)\n\n' +
        'Отправьте число часов:'
      );
    }

    if (note.step === 'sleep') {
      const sleep = parseFloat(input);
      if (isNaN(sleep) || sleep < 0 || sleep > 24) {
        return ctx.reply('❌ Пожалуйста, введите число часов (0-24)');
      }

      note.sleep = Math.round(sleep * 60); // Переводим в минуты
      note.step = 'comment';

      return ctx.reply(
        '3️⃣ Добавьте заметку (опционально)\n\n' +
        'Напишите что угодно или отправьте "-" для пропуска:'
      );
    }

    if (note.step === 'comment') {
      note.comment = input === '-' ? null : input;
      note.step = 'done';

      // Сохраняем заметку в БД
      const { error } = await supabaseAdmin.from('notes').insert({
        user_id: note.userId,
        date: note.date,
        mood: note.mood,
        sleep: note.sleep,
        comment: note.comment,
      });

      if (error) throw error;

      // Очищаем сессию
      delete ctx.session.addingNote;

      return ctx.reply(
        `✅ *Заметка сохранена!*\n\n` +
        `😊 Настроение: ${note.mood}/10\n` +
        `😴 Сон: ${note.sleep / 60}ч\n` +
        `${note.comment ? `📝 "${note.comment}"` : ''}\n\n` +
        'Данные синхронизированы с вашим профилем на сайте!',
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
 * Обработчик команды /stats
 */
export async function handleStats(ctx) {
  try {
    const userId = await getUserIdByTelegramId(ctx.from.id);

    if (!userId) {
      return ctx.reply(
        '⚠️ Ваш аккаунт не связан с сайтом.\n' +
        'Используйте /link для инструкций.'
      );
    }

    // Получаем статистику
    const { data: stats } = await supabaseAdmin
      .from('notes')
      .select('mood, sleep')
      .eq('user_id', userId)
      .limit(30);

    if (!stats || stats.length === 0) {
      return ctx.reply('📊 Нет данных для статистики.\n\nДобавьте несколько заметок!');
    }

    const avgMood = Math.round(
      stats.reduce((a, n) => a + (n.mood || 0), 0) / stats.length
    );
    const avgSleep = Math.round(
      stats.reduce((a, n) => a + (n.sleep || 0), 0) / stats.length / 60
    );

    let text = `📊 Ваша статистика (последние 30 заметок):\n\n`;
    text += `📈 Всего заметок: ${stats.length}\n`;
    text += `😊 Среднее настроение: ${avgMood}/10\n`;
    text += `😴 Средний сон: ${avgSleep}ч\n\n`;
    text += 'Подробней смотрите на сайте!';

    return ctx.reply(text);
  } catch (error) {
    console.error('Ошибка в handleStats:', error);
    ctx.reply('❌ Ошибка при получении статистики.');
  }
}

/**
 * Обработчик обычных сообщений с AI
 */
export async function handleMessage(ctx) {
  const message = ctx.message.text;
  const telegramId = ctx.from.id;

  try {
    // Получаем userId
    const userId = await getUserIdByTelegramId(telegramId);

    if (!userId) {
      return ctx.reply(
        '⚠️ Ваш аккаунт не связан с сайтом.\n\n' +
        'Для использования AI-ассистента свяжите аккаунт через /link'
      );
    }

    // Показываем индикатор набора текста
    await ctx.sendChatAction('typing');

    // Получаем историю диалога (последние 10 сообщений)
    const { data: history } = await supabaseAdmin
      .from('ai_messages')
      .select('role, content')
      .eq('user_id', userId)
      .eq('source', 'telegram')
      .order('created_at', { ascending: false })
      .limit(10);

    // Разворачиваем (чтобы старые были первыми)
    const messageHistory = history ? history.reverse() : [];

    // Получаем контекст пользователя
    const userContext = await buildUserContext(supabaseAdmin, userId);

    // Получаем ответ от AI
    const aiResponse = await askAIWithHistory(message, messageHistory, userContext);

    // Сохраняем сообщения пользователя и AI в БД
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

    // Отправляем ответ
    return ctx.reply(aiResponse);
  } catch (error) {
    console.error('Ошибка в handleMessage:', error);
    
    // Если LM Studio недоступен
    if (error.message && error.message.includes('LM Studio')) {
      return ctx.reply(
        '⚠️ AI-ассистент временно недоступен.\n\n' +
        'Попробуйте позже или используйте команды: /help'
      );
    }

    return ctx.reply(
      'Извините, произошла ошибка. Попробуйте позже.\n\n' +
      'Или используйте команды: /help'
    );
  }
}
