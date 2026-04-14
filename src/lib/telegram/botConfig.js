// src/lib/telegram/botConfig.js
// Инициализация и конфигурация Telegram бота

import { Telegraf } from 'telegraf';

let botInstance = null;

/**
 * Получить экземпляр бота
 * ВАЖНО: Вызывает это только в webhook route или polling, не при импорте модуля!
 */
export function getBot() {
  if (!botInstance) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      throw new Error(
        'TELEGRAM_BOT_TOKEN не установлен в .env.local\n' +
        'Пожалуйста добавьте: TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather'
      );
    }
    
    botInstance = new Telegraf(token);
    
    // Middleware для логирования
    botInstance.use(async (ctx, next) => {
      const text = ctx.message?.text || ctx.update.callback_query?.data || 'unknown';
      const from = ctx.from?.username || ctx.from?.id || 'unknown';
      console.log(`[Telegram] ${from} - ${text}`);
      await next();
    });

    // Обработка ошибок
    botInstance.catch((err, ctx) => {
      console.error('[Telegram Error]', err);
      ctx.reply(' Произошла ошибка. Попробуйте позже.')
        .catch((e) => console.error('Error sending error message:', e));
    });
  }

  return botInstance;
}

export default getBot;
