// src/lib/lmStudioClient.js
// Клиент для работы с LM Studio API
import { searchPsychologyKnowledge } from "./knowledge-search.js";
import { SYSTEM_PROMPT } from "../data/systemPrompt.js";

const LMSTUDIO_BASE_URL = (process.env.LMSTUDIO_BASE_URL || "http://127.0.0.1:1234").trim();
const LMSTUDIO_MODEL = (process.env.LMSTUDIO_MODEL || "gpt-oss-20b").trim();
const LMSTUDIO_TIMEOUT_MS = Number(process.env.LMSTUDIO_TIMEOUT_MS || 15000);

/**
 * Вызов LM Studio API для генерации ответа
 * @param {Array} messages - Массив сообщений в формате [{role: 'user', content: '...'}]
 * @param {Object} options - Дополнительные параметры
 * @returns {Promise<Object>} { reply, error }
 */
export async function callLmStudio(messages, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LMSTUDIO_TIMEOUT_MS);

  try {
    const resp = await fetch(`${LMSTUDIO_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: options.model || LMSTUDIO_MODEL,
        messages,
        temperature: options.temperature || 0.8,
        max_tokens: options.max_tokens || 512,
        top_p: 0.95,
        frequency_penalty: 0.3,
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
    if (error?.name === 'AbortError') {
      return { error: `LM Studio request timeout after ${LMSTUDIO_TIMEOUT_MS}ms` };
    }

    return { error: error.message };
  } finally {
    clearTimeout(timeout);
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

  // Добавляем релевантные психологические знания
  const psychologyContext = await searchPsychologyKnowledge(userMessage);
  if (psychologyContext) {
    messages.push({ 
      role: "system", 
      content: `ПРОФЕССИОНАЛЬНАЯ БАЗА ЗНАНИЙ:\n\n${psychologyContext}\n\nИспользуй эти знания для предоставления информированной и основанной на доказательствах поддержки. Применяй техники естественно, без явного их перечисления.` 
    });
  }

  if (userContext) {
    messages.push({ role: "system", content: `User Context: ${userContext}` });
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

  // Добавляем релевантные психологические знания
  const psychologyContext = await searchPsychologyKnowledge(userMessage);
  if (psychologyContext) {
    messages.push({ 
      role: "system", 
      content: `ПРОФЕССИОНАЛЬНАЯ БАЗА ЗНАНИЙ:\n\n${psychologyContext}\n\nИспользуй эти знания для предоставления информированной и основанной на доказательствах поддержки. Применяй техники естественно, без явного их перечисления.` 
    });
  }

  if (userContext) {
    messages.push({ role: "system", content: `User Context: ${userContext}` });
  }

  // Добавляем историю (последние N сообщений)
  if (history && history.length > 0) {
    const recentHistory = history.slice(-10); // последние 10
    messages.push(...recentHistory);
  }

  // Проверка для избежания дублирования контента
  if (history && history.length >= 2) {
    const lastAssistantMsg = history
      .slice()
      .reverse()
      .find(m => m.role === 'assistant')?.content || '';
    
    if (lastAssistantMsg.length > 150) {
      messages.push({
        role: 'system',
        content: `ВАЖНО: Не повторяй точно такой же контент как в предыдущем ответе. Если пользователь говорит спасибо или переходит дальше - предоставь новый взгляд или более глубокое понимание, а не повтор.`
      });
    }
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

const lmStudioClient = {
  callLmStudio,
  askAI,
  askAIWithHistory,
  buildUserContext,
};

export default lmStudioClient;
