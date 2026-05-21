// src/lib/lmStudioClient.js
// Клиент для работы с LM Studio API
import { callUnifiedLlm } from "./llm/unifiedClient.js";
import { generateSafePsychReply } from "./chat/unifiedResponder.js";

/**
 * Вызов LM Studio API для генерации ответа
 * @param {Array} messages - Массив сообщений в формате [{role: 'user', content: '...'}]
 * @param {Object} options - Дополнительные параметры
 * @returns {Promise<Object>} { reply, error }
 */
export async function callLmStudio(messages, options = {}) {
  return callUnifiedLlm(messages, {
    model: options.model,
    temperature: options.temperature ?? 0.8,
    maxTokens: options.max_tokens ?? 512,
    topP: 0.95,
    frequencyPenalty: 0.3,
  });
}

/**
 * Генерирует ответ AI на простой текстовый вопрос
 * @param {string} userMessage - Сообщение пользователя
 * @param {string} userContext - Контекст о пользователе (опционально)
 * @returns {Promise<string>} Ответ AI
 */
export async function askAI(userMessage, userContext = '') {
  const result = await generateSafePsychReply({
    message: userMessage,
    history: [],
    userContext,
  });

  if (result.error) throw new Error(result.error);
  if (result.crisis) return result.crisisReply || "Похоже, тебе сейчас очень тяжело. Пожалуйста, обратись за немедленной помощью по номеру 112.";
  return result.reply || "Извините, не могу ответить на этот вопрос.";
}

/**
 * Генерирует ответ AI с учетом истории диалога
 * @param {string} userMessage - Сообщение пользователя
 * @param {Array} history - История сообщений [{role, content}]
 * @param {string} userContext - Контекст о пользователе
 * @returns {Promise<string>} Ответ AI
 */
export async function askAIWithHistory(userMessage, history = [], userContext = '') {
  const result = await generateSafePsychReply({
    message: userMessage,
    history: Array.isArray(history) ? history : [],
    userContext,
  });

  if (result.error) throw new Error(result.error);
  if (result.crisis) return result.crisisReply || "Похоже, тебе сейчас очень тяжело. Пожалуйста, обратись за немедленной помощью по номеру 112.";
  return result.reply || "Извините, не могу ответить на этот вопрос.";
}

/**
 * Строит контекст о пользователе из MSSQL
 * @param {string} userId - UUID пользователя
 * @returns {Promise<string>} Контекст
 */
import { query } from "./mssqlClient.js";

export async function buildUserContext(userId) {
  // Получаем профиль
  const profileRes = await query(
    "SELECT name FROM profiles WHERE id = @userId",
    { userId }
  );
  const profile = profileRes.recordset[0] || {};

  // Получаем настройки
  const settingsRes = await query(
    "SELECT language, data_sharing_ai FROM user_settings WHERE user_id = @userId",
    { userId }
  );
  const settings = settingsRes.recordset[0] || {};

  // Получаем последнюю заметку
  const noteRes = await query(
    "SELECT TOP 1 date, mood, sleep FROM notes WHERE user_id = @userId ORDER BY date DESC",
    { userId }
  );
  const note = noteRes.recordset[0] || {};

  if (settings.data_sharing_ai === false) return "";

  const parts = [];
  if (profile.name) parts.push(`Имя: ${profile.name}`);
  if (settings.language) parts.push(`Язык: ${settings.language}`);
  if (note.date || note.mood != null || note.sleep != null) {
    parts.push(
      `Последняя заметка: дата=${note.date || "?"}, настроение=${note.mood ?? "?"}/10, сон=${note.sleep ?? "?"} мин`
    );
  }
  return parts.length ? parts.join(". ") : "";
}

const lmStudioClient = {
  callLmStudio,
  askAI,
  askAIWithHistory,
  buildUserContext,
};

export default lmStudioClient;
