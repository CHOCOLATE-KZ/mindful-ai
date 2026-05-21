import { supabaseServer } from "@/lib/supabase/server";
import { callUnifiedLlm, unifiedLlmConfig } from "@/lib/llm/unifiedClient";
import { generateSafePsychReply } from "@/lib/chat/unifiedResponder";
import {
  prepareConversationMemory,
  persistConversationSummary,
} from "@/lib/chat/conversationMemory";
import {
  loadCrisisTopicMode,
  saveCrisisTopicMode,
  normalizeCrisisTopicMode,
  isDeclineCrisisTopicMessage,
  isAffirmContinueCrisisTopicMessage,
} from "@/lib/chat/crisisSession";
import { buildUserContext } from "@/lib/chat/buildUserContext";

const CRISIS_DECLINE_PIVOT_REPLY =
  "Хорошо, я понял. Давай поговорим о том, что для тебя сейчас важнее — о чём хочешь поговорить?";

const LMSTUDIO_BASE_URL = unifiedLlmConfig.baseUrl;
const LMSTUDIO_MODEL = unifiedLlmConfig.model;
const LMSTUDIO_TIMEOUT_MS = unifiedLlmConfig.timeoutMs;
const LMSTUDIO_TEMPERATURE = Number(process.env.LMSTUDIO_TEMPERATURE || 0.6);
const ENABLE_PSYCHOLOGY_RAG = (process.env.ENABLE_PSYCHOLOGY_RAG || "true").trim().toLowerCase() !== "false";
const RAG_LIMIT = Number(process.env.RAG_LIMIT || 3);
const RAG_MIN_QUERY_LENGTH = Number(process.env.RAG_MIN_QUERY_LENGTH || 8);

function readEnvNumber(name, fallback) {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readEnvInt(name, fallback) {
  const parsed = Math.round(readEnvNumber(name, fallback));
  return parsed > 0 ? parsed : fallback;
}

// Жёсткий фильтр — блокируем ДО отправки в модель.
// Фокус на ДЕЙСТВИЯХ (провезти, купить, спрятать), а не на словах (я страдаю от зависимости).
const HARD_BLOCK_PATTERNS = [
  // Контрабанда / транспортировка
  /провез(ти|у|ёт|ет)|перевез(ти|у|ёт|ет)|протащ(ить|у)|smuggl|traffic/i,
  // Покупка/продажа наркотиков
  /купить\s*(наркотик|героин|кокаин|траву|дурь|дозу|гашиш|спайс|мефедрон)/i,
  /продать\s*(наркотик|героин|кокаин|траву|дурь|гашиш|спайс)/i,
  /где\s*(купить|достать|найти)\s*(наркотик|героин|кокаин|траву|дурь|дозу)/i,
  // Синтез / изготовление
  /как\s*(сделать|приготовить|синтезировать|изготовить)\s*(наркотик|взрывчат|яд|мет\b|фентанил)/i,
  // Оружие и взрывчатка
  /взрывчатк|самодельн.*бомб|бомб.*самодельн/i,
  // Убийство как инструкция
  /как\s*убить\s*(человека|кого|кого-то|людей)/i,
  // Скрытие / обман
  /как\s*(спрятать|скрыть|протащить|пронести)\s*(товар|наркотик|вещество|груз)/i,
  // English
  /how\s*to\s*(make|get|buy|smuggle|hide|sell)\s*(drugs?|heroin|cocaine|meth|fentanyl)/i,
  // Казахский
  /есілдеу|нашаны|есірткі\s*(сату|алу|тасу)/i,
];

// Терапевтический контекст — если есть эти маркеры, блок НЕ применяется.
// Пользователь говорит о своей боли/зависимости, а не планирует преступление.
const THERAPEUTIC_CONTEXT_PATTERNS = [
  /я\s*(употребл|зависим|хочу\s*бросить|не\s*могу\s*бросить|сорвался|принял|использовал)/i,
  /зависимост|зависим\s*от|наркозависим/i,
  /мне\s*плохо|мне\s*стыдно|ненавижу\s*себя|помогите\s*мне/i,
  /хочу\s*бросить|хочу\s*завязать|хочу\s*остановиться/i,
  /борюсь\s*с|страдаю\s*от|не\s*могу\s*остановиться/i,
  /addiction|i\s*(used|took|relapsed|want\s*to\s*quit|can.t\s*stop)/i,
];

function isHardBlocked(text) {
  const t = String(text || "");
  // Если есть терапевтический контекст — пропускаем к LLM
  if (THERAPEUTIC_CONTEXT_PATTERNS.some((p) => p.test(t))) return false;
  return HARD_BLOCK_PATTERNS.some((pattern) => pattern.test(t));
}

// Кризисные триггеры — слова, требующие экстренного ответа
const CRISIS_TRIGGERS = [
  "хочу умереть", "хочу убить себя", "не хочу жить", "покончить с собой",
  "суицид", "суицидальн", "убью себя", "убить себя",
  "нет смысла жить", "лучше бы меня не было", "не могу больше жить",
  "want to die", "kill myself", "end my life", "suicide",
  "өзімді өлтіргім", "өлгім келеді",
];

const POSITIVE_MARKERS = [
  "отлично",
  "все хорошо",
  "всё хорошо",
  "хорошо",
  "супер",
  "классно",
  "прекрасно",
  "замечательно",
  "нормально",
  "okay",
  "ok",
  "good",
  "great",
  "fine",
];
const NEGATIVE_MARKERS = [
  "тревог",
  "нерв",
  "стресс",
  "плохо",
  "ужасно",
  "паник",
  "устал",
  "депресс",
  "боюсь",
  "страшно",
  "не могу",
];
const NEUTRAL_HELP_MARKERS = [
  "подскажи",
  "как",
  "помоги",
  "что делать",
  "посоветуй",
  "объясни",
  "расскажи",
  "why",
  "how",
  "help",
];
const GRATITUDE_MARKERS = [
  "спасибо",
  "благодарю",
  "thanks",
  "thank you",
  "thx",
];

function normalizeForIntent(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[.,!?;:()"'`«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isPositiveCheckin(text) {
  const normalized = normalizeForIntent(text);
  if (!normalized) return false;
  return POSITIVE_MARKERS.some((m) => normalized.includes(m));
}

function hasNegativeSignal(text) {
  const normalized = normalizeForIntent(text);
  if (!normalized) return false;
  return NEGATIVE_MARKERS.some((m) => normalized.includes(m));
}

function hasPositiveSignal(text) {
  const normalized = normalizeForIntent(text);
  if (!normalized) return false;
  return POSITIVE_MARKERS.some((m) => normalized.includes(m));
}

function hasNeutralHelpSignal(text) {
  const normalized = normalizeForIntent(text);
  if (!normalized) return false;
  return NEUTRAL_HELP_MARKERS.some((m) => normalized.includes(m));
}

function isGratitudeMessage(text) {
  const normalized = normalizeForIntent(text);
  if (!normalized) return false;
  return GRATITUDE_MARKERS.some((m) => normalized.includes(m));
}

function detectAffectClass(text) {
  if (isGratitudeMessage(text)) return "positive";
  if (hasNegativeSignal(text)) return "negative";
  if (hasPositiveSignal(text)) return "positive";
  if (hasNeutralHelpSignal(text)) return "neutral";
  return "neutral";
}

function detectCrisis(text) {
  const lower = text.toLowerCase();
  return CRISIS_TRIGGERS.some((t) => lower.includes(t));
}

async function callLmStudio(messages, options = {}) {
  const maxTokens = Number(options?.maxTokens ?? 512);
  const temperature = Number(options?.temperature ?? LMSTUDIO_TEMPERATURE);

  console.log('[LM STUDIO]  Отправляю запрос...');
  console.log('[LM STUDIO] ️ Model:', LMSTUDIO_MODEL, '| temp:', temperature, '| timeoutMs:', LMSTUDIO_TIMEOUT_MS);
  console.log('[LM STUDIO]  Messages count:', messages.length);

  // Логируем только первый (system) и последний (user) messages для краткости
  if (messages.length > 0) {
    console.log('[LM STUDIO]  System prompt длина:', messages[0]?.content?.length || 0, 'символов');
    console.log('[LM STUDIO]  User message:', messages[messages.length - 1]?.content?.slice(0, 100) || '');
  }

  const result = await callUnifiedLlm(messages, {
    model: LMSTUDIO_MODEL,
    temperature,
    maxTokens,
    topP: 0.9,
    frequencyPenalty: 0.5,
    timeoutMs: LMSTUDIO_TIMEOUT_MS,
  });

  if (result.error) {
    console.error('[LM STUDIO]  Error:', String(result.error).slice(0, 200));
    return { error: result.error };
  }

  const reply = (result.reply || "").trim();
  console.log('[LM STUDIO]  Reply length:', reply.length, 'символов');
  return { reply };
}

const MODES = ["LISTENING", "ANALYSIS", "GUIDANCE"];
const MODE_LM_CONFIG = {
  LISTENING: {
    temperature: readEnvNumber("LM_MODE_LISTENING_TEMPERATURE", 0.78),
    maxTokens: readEnvInt("LM_MODE_LISTENING_MAX_TOKENS", 180),
  },
  ANALYSIS: {
    temperature: readEnvNumber("LM_MODE_ANALYSIS_TEMPERATURE", 0.5),
    maxTokens: readEnvInt("LM_MODE_ANALYSIS_MAX_TOKENS", 360),
  },
  GUIDANCE: {
    temperature: readEnvNumber("LM_MODE_GUIDANCE_TEMPERATURE", 0.3),
    maxTokens: readEnvInt("LM_MODE_GUIDANCE_MAX_TOKENS", 520),
  },
};

function getModeLmConfig(mode) {
  return MODE_LM_CONFIG[mode] || MODE_LM_CONFIG.LISTENING;
}

function normalizeMode(raw) {
  const text = String(raw || "").toUpperCase();
  if (text.includes("GUIDANCE")) return "GUIDANCE";
  if (text.includes("ANALYSIS")) return "ANALYSIS";
  if (text.includes("LISTENING")) return "LISTENING";
  return "LISTENING";
}

async function classifyMode(userMessage) {
  const messages = [
    {
      role: "system",
      content:
        "Выбери режим ответа для ИИ-психолога. Доступны только LISTENING, ANALYSIS, GUIDANCE. " +
        "Ответь строго одним словом из списка, без пояснений.",
    },
    {
      role: "user",
      content:
        "Критерии:\n" +
        "- LISTENING: человек делится чувствами, просит поддержки, но не просит план действий.\n" +
        "- ANALYSIS: человек хочет понять причины/механизм ситуации.\n" +
        "- GUIDANCE: человек просит конкретные шаги, технику, инструкцию.\n\n" +
        `Сообщение пользователя: ${userMessage}`,
    },
  ];

  const lm = await callLmStudio(messages, { temperature: 0, maxTokens: 12 });
  if (lm.error) return "LISTENING";

  const mode = normalizeMode(lm.reply);
  return MODES.includes(mode) ? mode : "LISTENING";
}

// Получение последней эмоции пользователя из глобального хранилища
function getLastUserEmotion(userId) {
  if (globalThis.userEmotions && globalThis.userEmotions[userId]) {
    return globalThis.userEmotions[userId].emotion || "neutral";
  }
  return "neutral";
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const crisisTopicChoice = body?.crisisTopicChoice || null;
  const message = (body?.message || body?.triggerMessage || "").toString().trim();

  if (!message && crisisTopicChoice !== "decline") {
    return Response.json({ error: "Empty message" }, { status: 400 });
  }

  let continueAfterCrisis =
    body?.continueAfterCrisis === true || crisisTopicChoice === "continue";
  const skipUserInsert = body?.skipUserInsert === true || Boolean(crisisTopicChoice);

  const supabase = await supabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let { mode: crisisTopicMode } = await loadCrisisTopicMode(supabase, user.id);
  const clientCrisisMode = normalizeCrisisTopicMode(body?.crisisTopicMode);
  if (clientCrisisMode) crisisTopicMode = clientCrisisMode;

  if (crisisTopicChoice === "decline") {
    await saveCrisisTopicMode(supabase, user.id, "declined");
    const { error: insErr } = await supabase.from("ai_messages").insert({
      user_id: user.id,
      role: "assistant",
      content: CRISIS_DECLINE_PIVOT_REPLY,
      source: "web",
    });
    if (insErr) {
      return Response.json({ error: insErr.message }, { status: 500 });
    }
    return Response.json({
      reply: CRISIS_DECLINE_PIVOT_REPLY,
      crisisTopicMode: "declined",
    });
  }

  if (crisisTopicChoice === "continue") {
    await saveCrisisTopicMode(supabase, user.id, "continuing");
    crisisTopicMode = "continuing";
    continueAfterCrisis = true;
  }

  // Получаем последнюю эмоцию пользователя
  const historyLimit = readEnvInt("CHAT_DB_HISTORY_LIMIT", 80);

  const { data: historyData, error: histErr } = await supabase
    .from("ai_messages")
    .select("role, content")
    .eq("user_id", user.id)
    .eq("source", "web")
    .order("created_at", { ascending: true })
    .limit(historyLimit);

  if (histErr) {
    return Response.json({ error: histErr.message }, { status: 500 });
  }

  const history = historyData || [];
  const memory = await prepareConversationMemory({
    supabase,
    userId: user.id,
    history,
  });
  const context = await buildUserContext(supabase, user.id);

  if (isDeclineCrisisTopicMessage(message)) {
    await saveCrisisTopicMode(supabase, user.id, "declined");
    crisisTopicMode = "declined";
  } else if (isAffirmContinueCrisisTopicMessage(message)) {
    await saveCrisisTopicMode(supabase, user.id, "continuing");
    crisisTopicMode = "continuing";
    continueAfterCrisis = true;
  }

  if (!skipUserInsert && !continueAfterCrisis) {
    const { error: insUserErr } = await supabase.from("ai_messages").insert({
      user_id: user.id,
      role: "user",
      content: message,
      source: "web",
    });

    if (insUserErr) {
      return Response.json({ error: insUserErr.message }, { status: 500 });
    }
  }

  const safeResult = await generateSafePsychReply({
    message,
    history: memory.recentHistory,
    conversationSummary: memory.conversationSummary,
    bridgeContext: memory.bridgeContext,
    userContext: context,
    enableRag: ENABLE_PSYCHOLOGY_RAG && !continueAfterCrisis,
    ragLimit: RAG_LIMIT,
    ragMinQueryLength: RAG_MIN_QUERY_LENGTH,
    continueAfterCrisis,
    crisisTopicMode,
  });

  if (safeResult.error) {
    return Response.json({ error: safeResult.error }, { status: 502 });
  }

  if (safeResult.crisis) {
    return Response.json({ crisis: true, crisisReopen: safeResult.crisisReopen === true }, { status: 200 });
  }

  if (safeResult.crisisTopicDeclined) {
    await saveCrisisTopicMode(supabase, user.id, "declined");
    crisisTopicMode = "declined";
  }

  let reply = (safeResult.reply || "").trim() || "...";
  const mode = safeResult.mode || "CHAT";

  console.log('[LM STUDIO]  ФИНАЛЬНЫЙ ответ:', reply);
  console.log('[LM STUDIO]  Unified safety pipeline mode:', mode);

  const persistSummaryPromise =
    memory.shouldPersist && memory.conversationSummary
      ? persistConversationSummary(
          supabase,
          user.id,
          memory.conversationSummary,
          memory.summarizedMessageCount
        )
      : Promise.resolve(true);

  const [dbResult] = await Promise.all([
    supabase.from("ai_messages").insert({
      user_id: user.id,
      role: "assistant",
      content: reply,
      source: "web",
    }),
    persistSummaryPromise,
  ]);

  if (dbResult.error) {
    return Response.json({ error: dbResult.error.message }, { status: 500 });
  }

  const debug = body?.debug === true
    ? {
        model: LMSTUDIO_MODEL,
        ragEnabled: ENABLE_PSYCHOLOGY_RAG,
        ragLimit: RAG_LIMIT,
        ragContextChars: safeResult.psychologyContextChars || 0,
        mode,
        memory: memory.meta,
        summaryChars: memory.conversationSummary?.length || 0,
        recentHistoryCount: memory.recentHistory?.length || 0,
      }
    : undefined;

  return Response.json({
    reply,
    debug,
    crisisTopicMode: crisisTopicMode || undefined,
  });
}
