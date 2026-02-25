// src/lib/lmStudioClient.js
// Клиент для работы с LM Studio API

const LMSTUDIO_BASE_URL = (process.env.LMSTUDIO_BASE_URL || "http://127.0.0.1:1234").trim();
const LMSTUDIO_MODEL = (process.env.LMSTUDIO_MODEL || "gpt-oss-20b").trim();

const SYSTEM_PROMPT =
  "Ты эмпатичный психологический ассистент. Отвечай коротко, тепло, без клише. " +
  "Давай простые практические шаги (дыхание, сон, движение, дневник). " +
  "Избегай диагнозов и директив. Если нужен специалист — мягко предложи обратиться.";

/**
 * Вызов LM Studio API для генерации ответа
 * @param {Array} messages - Массив сообщений в формате [{role: 'user', content: '...'}]
 * @param {Object} options - Дополнительные параметры
 * @returns {Promise<Object>} { reply, error }
 */
export async function callLmStudio(messages, options = {}) {
  try {
    const resp = await fetch(`${LMSTUDIO_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: options.model || LMSTUDIO_MODEL,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 256,
      }),
    });

    const raw = await resp.text();
    if (!resp.ok) {
      return { error: `LM Studio error (${resp.status}): ${raw}` };
    }

    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      return { error: `LM Studio returned non-JSON: ${raw}` };
    }

    const reply = (json?.choices?.[0]?.message?.content || "").trim();
    return { reply };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Генерирует ответ AI на простой текстовый вопрос
 * @param {string} userMessage - Сообщение пользователя
 * @param {string} userContext - Контекст о пользователе (опционально)
 * @returns {Promise<string>} Ответ AI
 */
export async function askAI(userMessage, userContext = '') {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  if (userContext) {
    messages.push({ role: "system", content: `Контекст о пользователе: ${userContext}` });
  }

  messages.push({ role: "user", content: userMessage });

  const { reply, error } = await callLmStudio(messages);

  if (error) {
    throw new Error(error);
  }

  return reply || "Извините, не могу ответить на этот вопрос.";
}

/**
 * Генерирует ответ AI с учетом истории диалога
 * @param {string} userMessage - Сообщение пользователя
 * @param {Array} history - История сообщений [{role, content}]
 * @param {string} userContext - Контекст о пользователе
 * @returns {Promise<string>} Ответ AI
 */
export async function askAIWithHistory(userMessage, history = [], userContext = '') {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  if (userContext) {
    messages.push({ role: "system", content: `Контекст о пользователе: ${userContext}` });
  }

  // Добавляем историю (последние N сообщений)
  if (history && history.length > 0) {
    const recentHistory = history.slice(-10); // последние 10
    messages.push(...recentHistory);
  }

  messages.push({ role: "user", content: userMessage });

  const { reply, error } = await callLmStudio(messages);

  if (error) {
    throw new Error(error);
  }

  return reply || "Извините, не могу ответить на этот вопрос.";
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
    supabase.from("user_settings").select("language, data_sharing_with_ai").eq("user_id", userId).maybeSingle(),
    supabase.from("notes").select("date, mood, sleep").eq("user_id", userId).order("date", { ascending: false }).limit(1),
  ]);

  if (settings?.data_sharing_with_ai === false) return "";

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

export default {
  callLmStudio,
  askAI,
  askAIWithHistory,
  buildUserContext,
};
