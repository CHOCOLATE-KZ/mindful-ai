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
    userEmotion: "neutral",
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
    userEmotion: "neutral",
  });

  if (result.error) throw new Error(result.error);
  if (result.crisis) return result.crisisReply || "Похоже, тебе сейчас очень тяжело. Пожалуйста, обратись за немедленной помощью по номеру 112.";
  return result.reply || "Извините, не могу ответить на этот вопрос.";
}

/**
 * Строит контекст о пользователе из данных Supabase
 * @param {Object} supabase - Клиент Supabase
 * @param {string} userId - UUID пользователя
 * @returns {Promise<string>} Контекст
 */
export async function buildUserContext(supabase, userId) {
  const [{ data: profile }, { data: settings }, { data: lastNote }] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", userId).maybeSingle(),
    supabase.from("user_settings").select("language, data_sharing_ai").eq("user_id", userId).maybeSingle(),
    supabase.from("notes").select("date, mood, sleep").eq("user_id", userId).order("date", { ascending: false }).limit(1),
  ]);

  if (settings?.data_sharing_ai === false) return "";

  const parts = [];
  if (profile?.name) parts.push(`Имя: ${profile.name}`);
  if (settings?.language) parts.push(`Язык: ${settings.language}`);

  const note = Array.isArray(lastNote) ? lastNote[0] : lastNote;
  if (note?.date || note?.mood != null || note?.sleep != null) {
    parts.push(
      `Последняя заметка: дата=${note?.date || "?"}, настроение=${note?.mood ?? "?"}/10, сон=${note?.sleep ?? "?"} мин`
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
