// src/lib/telegram/userManager.js
// Управление пользователями Telegram в Supabase

import { supabaseAdmin } from '../supabase/admin.js';

/**
 * Связывает Telegram аккаунт с учетной записью на сайте
 * @param {string} userId - UUID пользователя из auth.users
 * @param {number} telegramId - ID пользователя в Telegram
 * @param {string} telegramUsername - Username пользователя в Telegram (без @)
 * @returns {Promise<Object>} Обновленный профиль
 */
export async function linkTelegramAccount(userId, telegramId, telegramUsername = null) {
  const updateData = { telegram_id: telegramId };
  
  if (telegramUsername) {
    updateData.telegram_username = telegramUsername;
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
    .select('id, telegram_id, telegram_username, name')
    .single();

  if (error) {
    console.error('Ошибка при связке Telegram:', error);
    throw error;
  }

  return data;
}

/**
 * Получает профиль пользователя по telegram_id
 * @param {number} telegramId - ID пользователя в Telegram
 * @returns {Promise<Object|null>} Профиль пользователя или null
 */
export async function getUserByTelegramId(telegramId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, telegram_id, telegram_username, created_at')
    .eq('telegram_id', telegramId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found
    console.error('Ошибка при получении пользователя:', error);
  }

  return data || null;
}

/**
 * Получает user_id по telegram_id
 * @param {number} telegramId - ID пользователя в Telegram
 * @returns {Promise<string|null>} UUID пользователя или null
 */
export async function getUserIdByTelegramId(telegramId) {
  const user = await getUserByTelegramId(telegramId);
  return user?.id || null;
}

/**
 * Генерирует глубокую ссылку для связи аккаунтов
 * @param {string} userId - UUID пользователя
 * @param {string} botUsername - Имя бота в Telegram (без @)
 * @returns {string} Глубокая ссылка для Telegram
 */
export function generateDeepLink(userId, botUsername) {
  return `https://t.me/${botUsername}?start=${userId}`;
}

/**
 * Проверяет валидность user_id
 * @param {string} userId - UUID для проверки
 * @returns {Promise<boolean>}
 */
export async function isValidUser(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  return !error && !!data;
}
