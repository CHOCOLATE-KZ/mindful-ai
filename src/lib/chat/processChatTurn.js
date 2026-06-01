/**
 * Единый pipeline чата для веба и Telegram: история, память, кризис, LLM, резюме.
 */

import { buildUserContext } from "./buildUserContext.js";
import {
  prepareConversationMemory,
  persistConversationSummary,
  clearStoredConversationSummary,
} from "./conversationMemory.js";
import {
  loadCrisisTopicMode,
  saveCrisisTopicMode,
  clearCrisisTopicMode,
  normalizeCrisisTopicMode,
  isDeclineCrisisTopicMessage,
  isAffirmContinueCrisisTopicMessage,
} from "./crisisSession.js";
import { generateSafePsychReply } from "./unifiedResponder.js";
import { tryUnlockTests } from "../tests/testGate.js";
import { ensurePendingRecommendations, maybeAutoRecommendTest } from "../tests/recommendTest.js";

export const CRISIS_DECLINE_PIVOT_REPLY =
  "Хорошо, я понял. Давай поговорим о том, что для тебя сейчас важнее — о чём хочешь поговорить?";

export const CRISIS_TELEGRAM_PROMPT =
  "Похоже, тебе сейчас очень тяжело. Эти чувства реальны, и ты не одинок.\n\n" +
  "Если есть риск причинить себе вред — обратись в экстренные службы (112) или на линию доверия (150, 8-800-2000-122).\n\n" +
  "Хочешь продолжить разговор об этой теме? Нажми кнопку ниже.";

const TELEGRAM_PLATFORM_HINT =
  "Платформа: Telegram. Markdown поддерживается (*жирный*, _курсив_, `код`), но НЕ используй таблицы и ## заголовки — они не рендерятся. Не упоминай ссылки на сайт.";

const ENABLE_PSYCHOLOGY_RAG =
  (process.env.ENABLE_PSYCHOLOGY_RAG || "true").trim().toLowerCase() !== "false";
const RAG_LIMIT = Number(process.env.RAG_LIMIT || 3);
const RAG_MIN_QUERY_LENGTH = Number(process.env.RAG_MIN_QUERY_LENGTH || 8);

function readEnvInt(name, fallback) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const parsed = Math.round(Number(raw));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 */
export async function loadChatHistory(supabase, userId) {
  const historyLimit = readEnvInt("CHAT_DB_HISTORY_LIMIT", 80);
  const { data, error } = await supabase
    .from("ai_messages")
    .select("role, content")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(historyLimit);

  if (error) {
    return { history: [], error };
  }
  return { history: data || [], error: null };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 */
export async function clearUserChat(supabase, userId) {
  const { error } = await supabase.from("ai_messages").delete().eq("user_id", userId);
  await clearStoredConversationSummary(supabase, userId);
  await clearCrisisTopicMode(supabase, userId);
  return { error };
}

async function buildTurnUserContext(supabase, userId, source) {
  const base = await buildUserContext(supabase, userId);
  if (source === "telegram") {
    return [base, TELEGRAM_PLATFORM_HINT].filter(Boolean).join(" ");
  }
  return base || "";
}

/**
 * @param {{
 *   supabase: import('@supabase/supabase-js').SupabaseClient,
 *   userId: string,
 *   message: string,
 *   source?: 'web' | 'telegram',
 *   crisisTopicChoice?: 'continue' | 'decline' | null,
 *   continueAfterCrisis?: boolean,
 *   skipUserInsert?: boolean,
 *   crisisTopicMode?: string | null,
 * }} params
 */
export async function processChatTurn({
  supabase,
  userId,
  message,
  source = "web",
  crisisTopicChoice = null,
  continueAfterCrisis: continueAfterCrisisIn = false,
  skipUserInsert = false,
  crisisTopicMode: clientCrisisMode = null,
}) {
  const text = String(message || "").trim();
  let continueAfterCrisis =
    continueAfterCrisisIn === true || crisisTopicChoice === "continue";
  const skipInsert = skipUserInsert === true || Boolean(crisisTopicChoice);

  let { mode: crisisTopicMode } = await loadCrisisTopicMode(supabase, userId);
  const normalizedClient = normalizeCrisisTopicMode(clientCrisisMode);
  if (normalizedClient) crisisTopicMode = normalizedClient;

  if (crisisTopicChoice === "decline") {
    await saveCrisisTopicMode(supabase, userId, "declined");
    const { error: insErr } = await supabase.from("ai_messages").insert({
      user_id: userId,
      role: "assistant",
      content: CRISIS_DECLINE_PIVOT_REPLY,
      source,
    });
    if (insErr) {
      return { error: insErr.message };
    }
    return {
      reply: CRISIS_DECLINE_PIVOT_REPLY,
      crisisTopicMode: "declined",
    };
  }

  if (crisisTopicChoice === "continue") {
    await saveCrisisTopicMode(supabase, userId, "continuing");
    crisisTopicMode = "continuing";
    continueAfterCrisis = true;
  }

  if (!text && crisisTopicChoice !== "decline") {
    return { error: "Empty message" };
  }

  const { history, error: histErr } = await loadChatHistory(supabase, userId);
  if (histErr) {
    return { error: histErr.message };
  }

  const memory = await prepareConversationMemory({
    supabase,
    userId,
    history,
  });

  const userContext = await buildTurnUserContext(supabase, userId, source);

  if (text && isDeclineCrisisTopicMessage(text)) {
    await saveCrisisTopicMode(supabase, userId, "declined");
    crisisTopicMode = "declined";
  } else if (text && isAffirmContinueCrisisTopicMessage(text)) {
    await saveCrisisTopicMode(supabase, userId, "continuing");
    crisisTopicMode = "continuing";
    continueAfterCrisis = true;
  }

  if (text && !skipInsert && !continueAfterCrisis) {
    const { error: insUserErr } = await supabase.from("ai_messages").insert({
      user_id: userId,
      role: "user",
      content: text,
      source,
    });
    if (insUserErr) {
      return { error: insUserErr.message };
    }
  }

  const safeResult = await generateSafePsychReply({
    message: text,
    history: memory.recentHistory,
    conversationSummary: memory.conversationSummary,
    bridgeContext: memory.bridgeContext,
    userContext,
    enableRag: ENABLE_PSYCHOLOGY_RAG && !continueAfterCrisis,
    ragLimit: RAG_LIMIT,
    ragMinQueryLength: RAG_MIN_QUERY_LENGTH,
    continueAfterCrisis,
    crisisTopicMode,
  });

  if (safeResult.error) {
    return { error: safeResult.error };
  }

  if (safeResult.crisis) {
    return {
      crisis: true,
      crisisReopen: safeResult.crisisReopen === true,
      crisisTopicMode: crisisTopicMode || undefined,
      memory: memory.meta,
    };
  }

  if (safeResult.crisisTopicDeclined) {
    await saveCrisisTopicMode(supabase, userId, "declined");
    crisisTopicMode = "declined";
  }

  const reply = (safeResult.reply || "").trim() || "...";
  const mode = safeResult.mode || "CHAT";

  const persistSummaryPromise =
    memory.shouldPersist && memory.conversationSummary
      ? persistConversationSummary(
          supabase,
          userId,
          memory.conversationSummary,
          memory.summarizedMessageCount
        )
      : Promise.resolve(true);

  const [dbResult] = await Promise.all([
    supabase.from("ai_messages").insert({
      user_id: userId,
      role: "assistant",
      content: reply,
      source,
    }),
    persistSummaryPromise,
  ]);

  if (dbResult.error) {
    return { error: dbResult.error.message };
  }

  const gate = await tryUnlockTests(supabase, userId);
  let testRecommendations = { generated: null, catalog: null };
  let testsJustUnlocked = gate.justUnlocked === true;

  if (gate.unlocked && text) {
    if (testsJustUnlocked) {
      const first = await ensurePendingRecommendations(supabase, userId);
      if (first?.recommendations) testRecommendations = first.recommendations;
    } else {
      const recResult = await maybeAutoRecommendTest(supabase, userId);
      if (recResult?.recommendations) testRecommendations = recResult.recommendations;
    }
  }

  return {
    reply,
    mode,
    crisisTopicMode: crisisTopicMode || undefined,
    memory: memory.meta,
    summaryChars: memory.conversationSummary?.length || 0,
    recentHistoryCount: memory.recentHistory?.length || 0,
    psychologyContextChars: safeResult.psychologyContextChars || 0,
    testsGate: {
      unlocked: gate.unlocked,
      justUnlocked: testsJustUnlocked,
      remaining: gate.remaining,
      messageCount: gate.messageCount,
      required: gate.required,
    },
    testRecommendations,
    testRecommendation:
      testRecommendations.generated || testRecommendations.catalog || null,
  };
}
