import { callUnifiedLlm } from "../llm/unifiedClient.js";

const RECENT_LIMIT = Number(process.env.CHAT_RECENT_MESSAGES_LIMIT || 12);
const MIN_OLDER_FOR_SUMMARY = Number(process.env.CHAT_SUMMARY_MIN_OLDER_MESSAGES || 4);
const SUMMARY_UPDATE_BATCH = Number(process.env.CHAT_SUMMARY_UPDATE_BATCH || 4);
const SUMMARY_MAX_CHARS = Number(process.env.CHAT_SUMMARY_MAX_CHARS || 1000);
const BRIDGE_MAX_CHARS = Number(process.env.CHAT_BRIDGE_MAX_CHARS || 900);
const TRANSCRIPT_MSG_MAX_CHARS = Number(process.env.CHAT_TRANSCRIPT_MSG_MAX_CHARS || 500);

function readPositiveInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

export function getConversationMemoryConfig() {
  return {
    recentLimit: readPositiveInt(process.env.CHAT_RECENT_MESSAGES_LIMIT, RECENT_LIMIT),
    minOlderForSummary: readPositiveInt(process.env.CHAT_SUMMARY_MIN_OLDER_MESSAGES, MIN_OLDER_FOR_SUMMARY),
    summaryUpdateBatch: readPositiveInt(process.env.CHAT_SUMMARY_UPDATE_BATCH, SUMMARY_UPDATE_BATCH),
    summaryMaxChars: readPositiveInt(process.env.CHAT_SUMMARY_MAX_CHARS, SUMMARY_MAX_CHARS),
  };
}

/**
 * @param {Array<{ role: string, content: string }>} messages
 * @param {number} recentLimit
 */
export function splitHistoryForPrompt(messages, recentLimit = RECENT_LIMIT) {
  const list = (Array.isArray(messages) ? messages : []).filter(
    (m) => m?.role && String(m.content || "").trim()
  );

  if (list.length <= recentLimit) {
    return {
      recentHistory: list,
      olderMessages: [],
      totalCount: list.length,
    };
  }

  return {
    recentHistory: list.slice(-recentLimit),
    olderMessages: list.slice(0, -recentLimit),
    totalCount: list.length,
  };
}

function formatTranscript(messages) {
  return messages
    .map((m) => {
      const label = m.role === "assistant" ? "Ассистент" : "Пользователь";
      return `${label}: ${String(m.content || "").trim().slice(0, TRANSCRIPT_MSG_MAX_CHARS)}`;
    })
    .join("\n");
}

/**
 * @param {{ existingSummary?: string, messages: Array<{ role: string, content: string }> }} params
 */
export async function generateConversationSummary({ existingSummary = "", messages = [] }) {
  if (!messages.length) {
    return String(existingSummary || "").trim();
  }

  const transcript = formatTranscript(messages);
  const hasPrior = Boolean(String(existingSummary || "").trim());

  const llmMessages = [
    {
      role: "system",
      content:
        "Ты сжимаешь диалог с ИИ-психологом. Сохрани только важное: главную тему, эмоциональное состояние, факты о пользователе, ключевые события, договорённости и открытые вопросы. " +
        "Не давай советов и не добавляй новых фактов. Пиши на русском, компактно, до 12 пунктов или 2 коротких абзацев.",
    },
    {
      role: "user",
      content: hasPrior
        ? `Предыдущее резюме сессии:\n${existingSummary}\n\n---\nНовые сообщения для добавления в резюме:\n${transcript}\n\n---\nДай ОБНОВЛЁННОЕ резюме целиком.`
        : `Сообщения диалога:\n${transcript}\n\n---\nДай краткое резюме сессии.`,
    },
  ];

  const { reply, error } = await callUnifiedLlm(llmMessages, {
    temperature: 0.2,
    maxTokens: 400,
    frequencyPenalty: 0.1,
    skipContextBudget: true,
  });

  if (error || !reply) {
    return String(existingSummary || "").trim();
  }

  return String(reply).trim().slice(0, SUMMARY_MAX_CHARS);
}

function isMissingSummaryColumnError(error) {
  const msg = String(error?.message || error || "").toLowerCase();
  return (
    error?.code === "42703" ||
    msg.includes("chat_summary") ||
    msg.includes("does not exist") ||
    msg.includes("column")
  );
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 */
export async function loadStoredConversationSummary(supabase, userId) {
  const { data, error } = await supabase
    .from("user_settings")
    .select("chat_summary, chat_summary_msg_count")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingSummaryColumnError(error)) {
      return { summary: "", msgCount: 0, persist: false };
    }
    console.warn("[conversationMemory] load summary:", error.message);
    return { summary: "", msgCount: 0, persist: false };
  }

  return {
    summary: String(data?.chat_summary || "").trim(),
    msgCount: Number(data?.chat_summary_msg_count) || 0,
    persist: true,
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @param {string} summary
 * @param {number} msgCount
 */
export async function persistConversationSummary(supabase, userId, summary, msgCount) {
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      chat_summary: summary || null,
      chat_summary_msg_count: Math.max(0, Math.round(msgCount)),
    },
    { onConflict: "user_id" }
  );

  if (error && !isMissingSummaryColumnError(error)) {
    console.warn("[conversationMemory] persist summary:", error.message);
    return false;
  }

  return !error;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 */
export async function clearStoredConversationSummary(supabase, userId) {
  const { error } = await supabase
    .from("user_settings")
    .update({ chat_summary: null, chat_summary_msg_count: 0 })
    .eq("user_id", userId);

  if (error && !isMissingSummaryColumnError(error)) {
    console.warn("[conversationMemory] clear summary:", error.message);
  }
}

/**
 * Sliding window + optional persisted summary for long web chats.
 *
 * @param {{
 *   supabase: import('@supabase/supabase-js').SupabaseClient,
 *   userId: string,
 *   history: Array<{ role: string, content: string }>,
 * }} params
 */
export async function prepareConversationMemory({ supabase, userId, history }) {
  const config = getConversationMemoryConfig();
  const { recentHistory, olderMessages, totalCount } = splitHistoryForPrompt(
    history,
    config.recentLimit
  );

  if (olderMessages.length < config.minOlderForSummary) {
    return {
      recentHistory,
      conversationSummary: "",
      summarizedMessageCount: 0,
      shouldPersist: false,
      meta: {
        totalCount,
        recentCount: recentHistory.length,
        olderCount: olderMessages.length,
        summaryGenerated: false,
      },
    };
  }

  const stored = await loadStoredConversationSummary(supabase, userId);
  let summary = stored.summary;
  let coveredCount = Math.min(stored.msgCount, olderMessages.length);

  const uncoveredOlder = olderMessages.slice(coveredCount);
  const needsInitialSummary = !summary && olderMessages.length >= config.minOlderForSummary;
  const needsIncremental = uncoveredOlder.length >= config.summaryUpdateBatch;

  let summaryGenerated = false;
  let bridgeContext = "";

  if (needsInitialSummary || (summary && needsIncremental)) {
    const batch = needsInitialSummary ? olderMessages : uncoveredOlder;
    const nextSummary = await generateConversationSummary({
      existingSummary: summary,
      messages: batch,
    });

    if (nextSummary) {
      summary = nextSummary;
      coveredCount = olderMessages.length;
      summaryGenerated = true;
    }
  } else if (summary && uncoveredOlder.length > 0) {
    if (uncoveredOlder.length >= 2) {
      const folded = await generateConversationSummary({
        existingSummary: summary,
        messages: uncoveredOlder,
      });
      if (folded) {
        summary = folded;
        coveredCount = olderMessages.length;
        summaryGenerated = true;
      } else {
        bridgeContext = formatTranscript(uncoveredOlder).slice(0, BRIDGE_MAX_CHARS);
      }
    } else {
      bridgeContext = formatTranscript(uncoveredOlder).slice(0, BRIDGE_MAX_CHARS);
    }
  }

  return {
    recentHistory,
    conversationSummary: summary,
    bridgeContext,
    summarizedMessageCount: coveredCount,
    shouldPersist: stored.persist && summaryGenerated,
    meta: {
      totalCount,
      recentCount: recentHistory.length,
      olderCount: olderMessages.length,
      summaryGenerated,
      coveredCount,
      bridgeCount: uncoveredOlder.length,
    },
  };
}
