import { getSystemPrompt } from "../../data/systemPrompt.js";
import { searchPsychologyKnowledge } from "../knowledge-search.js";
import { callUnifiedLlm } from "../llm/unifiedClient.js";
import { replyHasUnwarrantedNegativity, validateAndSanitizeReply } from "./responseValidator.js";

const LMSTUDIO_TEMPERATURE = Number(process.env.LMSTUDIO_TEMPERATURE || 0.6);
const ENABLE_PSYCHOLOGY_RAG = (process.env.ENABLE_PSYCHOLOGY_RAG || "true").trim().toLowerCase() !== "false";
const RAG_LIMIT = Number(process.env.RAG_LIMIT || 3);
const RAG_MIN_QUERY_LENGTH = Number(process.env.RAG_MIN_QUERY_LENGTH || 8);

const MODES = ["LISTENING", "ANALYSIS", "GUIDANCE"];
const MODE_LM_CONFIG = {
  LISTENING: {
    temperature: Number(process.env.LM_MODE_LISTENING_TEMPERATURE || 0.78),
    maxTokens: Number(process.env.LM_MODE_LISTENING_MAX_TOKENS || 180),
  },
  ANALYSIS: {
    temperature: Number(process.env.LM_MODE_ANALYSIS_TEMPERATURE || 0.5),
    maxTokens: Number(process.env.LM_MODE_ANALYSIS_MAX_TOKENS || 360),
  },
  GUIDANCE: {
    temperature: Number(process.env.LM_MODE_GUIDANCE_TEMPERATURE || 0.3),
    maxTokens: Number(process.env.LM_MODE_GUIDANCE_MAX_TOKENS || 520),
  },
};

const HARD_BLOCK_MESSAGE =
  "Я ИИ-психолог и не помогаю в вопросах, связанных с нарушением закона. Этот запрос вне моей компетенции.";

const CRISIS_FALLBACK_MESSAGE =
  "Мне очень жаль, что тебе так тяжело. Если есть риск причинить себе вред, пожалуйста, прямо сейчас обратись в экстренные службы (112) или к близкому человеку рядом.";

const HARD_BLOCK_PATTERNS = [
  /провез(ти|у|ет|ет)|перевез(ти|у|ет|ет)|протащ(ить|у)|smuggl|traffic/i,
  /купить\s*(наркотик|героин|кокаин|траву|дурь|дозу|гашиш|спайс|мефедрон)/i,
  /продать\s*(наркотик|героин|кокаин|траву|дурь|гашиш|спайс)/i,
  /где\s*(купить|достать|найти)\s*(наркотик|героин|кокаин|траву|дурь|дозу)/i,
  /как\s*(сделать|приготовить|синтезировать|изготовить)\s*(наркотик|взрывчат|яд|мет\b|фентанил)/i,
  /взрывчатк|самодельн.*бомб|бомб.*самодельн/i,
  /как\s*убить\s*(человека|кого|кого-то|людей)/i,
  /как\s*(спрятать|скрыть|протащить|пронести)\s*(товар|наркотик|вещество|груз)/i,
  /how\s*to\s*(make|get|buy|smuggle|hide|sell)\s*(drugs?|heroin|cocaine|meth|fentanyl)/i,
  /есілдеу|нашаны|есірткі\s*(сату|алу|тасу)/i,
];

const THERAPEUTIC_CONTEXT_PATTERNS = [
  /я\s*(употребл|зависим|хочу\s*бросить|не\s*могу\s*бросить|сорвался|принял|использовал)/i,
  /зависимост|зависим\s*от|наркозависим/i,
  /мне\s*плохо|мне\s*стыдно|ненавижу\s*себя|помогите\s*мне/i,
  /хочу\s*бросить|хочу\s*завязать|хочу\s*остановиться/i,
  /борюсь\s*с|страдаю\s*от|не\s*могу\s*остановиться/i,
  /addiction|i\s*(used|took|relapsed|want\s*to\s*quit|can.t\s*stop)/i,
];

const CRISIS_TRIGGERS = [
  "хочу умереть", "хочу убить себя", "не хочу жить", "покончить с собой",
  "суицид", "суицидальн", "убью себя", "убить себя",
  "нет смысла жить", "лучше бы меня не было", "не могу больше жить",
  "want to die", "kill myself", "end my life", "suicide",
  "озімді олтіргім", "өлгім келеді",
];

const GREETING_REGEX = /^(привет|здравствуй|здравствуйте|салам|hello|hi|hey|добрый\s*(день|вечер|утро))(?:[!.,\s]*)$/i;
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
const GRATITUDE_MARKERS = ["спасибо", "благодарю", "thanks", "thank you", "thx"];

function normalizeForIntent(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[.,!?;:()"'`«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isHardBlocked(text) {
  const t = String(text || "");
  if (THERAPEUTIC_CONTEXT_PATTERNS.some((pattern) => pattern.test(t))) return false;
  return HARD_BLOCK_PATTERNS.some((pattern) => pattern.test(t));
}

export function detectCrisis(text) {
  const lower = String(text || "").toLowerCase();
  return CRISIS_TRIGGERS.some((trigger) => lower.includes(trigger));
}

export function isGreetingOnly(text) {
  const normalized = String(text || "").trim();
  return Boolean(normalized) && GREETING_REGEX.test(normalized);
}

export function isPositiveCheckin(text) {
  const normalized = normalizeForIntent(text);
  return Boolean(normalized) && POSITIVE_MARKERS.some((marker) => normalized.includes(marker));
}

export function hasNegativeSignal(text) {
  const normalized = normalizeForIntent(text);
  return Boolean(normalized) && NEGATIVE_MARKERS.some((marker) => normalized.includes(marker));
}

export function hasPositiveSignal(text) {
  const normalized = normalizeForIntent(text);
  return Boolean(normalized) && POSITIVE_MARKERS.some((marker) => normalized.includes(marker));
}

export function hasNeutralHelpSignal(text) {
  const normalized = normalizeForIntent(text);
  return Boolean(normalized) && NEUTRAL_HELP_MARKERS.some((marker) => normalized.includes(marker));
}

export function isGratitudeMessage(text) {
  const normalized = normalizeForIntent(text);
  return Boolean(normalized) && GRATITUDE_MARKERS.some((marker) => normalized.includes(marker));
}

export function detectAffectClass(text) {
  if (isGratitudeMessage(text)) return "positive";
  if (hasNegativeSignal(text)) return "negative";
  if (hasPositiveSignal(text)) return "positive";
  if (hasNeutralHelpSignal(text)) return "neutral";
  return "neutral";
}

function normalizeMode(raw) {
  const text = String(raw || "").toUpperCase();
  if (text.includes("GUIDANCE")) return "GUIDANCE";
  if (text.includes("ANALYSIS")) return "ANALYSIS";
  if (text.includes("LISTENING")) return "LISTENING";
  return "LISTENING";
}

export function getModeLmConfig(mode) {
  return MODE_LM_CONFIG[mode] || MODE_LM_CONFIG.LISTENING;
}

export async function classifyMode(userMessage) {
  const messages = [
    {
      role: "system",
      content:
        "Выбери режим ответа для ИИ-психолога. Доступны только LISTENING, ANALYSIS, GUIDANCE. Ответь строго одним словом из списка, без пояснений.",
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

  const lm = await callUnifiedLlm(messages, { temperature: 0, maxTokens: 12 });
  if (lm.error) return "LISTENING";

  const mode = normalizeMode(lm.reply);
  return MODES.includes(mode) ? mode : "LISTENING";
}

export async function generateSafePsychReply({
  message,
  history = [],
  userContext = "",
  userEmotion = "neutral",
  enableRag = ENABLE_PSYCHOLOGY_RAG,
  ragLimit = RAG_LIMIT,
  ragMinQueryLength = RAG_MIN_QUERY_LENGTH,
}) {
  const text = String(message || "").trim();
  if (!text) {
    return { error: "Empty message" };
  }

  if (isHardBlocked(text)) {
    return {
      blocked: true,
      reply: HARD_BLOCK_MESSAGE,
      mode: "LISTENING",
      userAffectClass: "neutral",
      psychologyContextChars: 0,
    };
  }

  if (detectCrisis(text)) {
    return { crisis: true, crisisReply: CRISIS_FALLBACK_MESSAGE };
  }

  const greetingMode = isGreetingOnly(text);
  const isGratitude = isGratitudeMessage(text);
  const positiveCheckin = isPositiveCheckin(text);
  const userAffectClass = detectAffectClass(text);
  const isLightweightIntent = greetingMode || isGratitude;

  const mode = isLightweightIntent ? "LISTENING" : await classifyMode(text);
  const modeLmConfig = getModeLmConfig(mode);

  let psychologyContext = "";
  if (!isLightweightIntent && enableRag && text.length >= ragMinQueryLength) {
    psychologyContext = await searchPsychologyKnowledge(text, ragLimit);
  }

  const messages = isGratitude
    ? [
        {
          role: "system",
          content:
            "Пользователь тебя поблагодарил. Ответь вежливо, коротко и поддерживающе, не выдумывай новые проблемы.",
        },
      ]
    : [{ role: "system", content: getSystemPrompt(mode) }];

  if (greetingMode) {
    messages.push({
      role: "system",
      content:
        "Пользователь просто поздоровался. Ответь коротко и дружелюбно, без ссылок на прошлые темы, если он сам не просил продолжить контекст.",
    });
  }

  if (positiveCheckin && !hasNegativeSignal(text) && !isGratitude) {
    messages.push({
      role: "system",
      content:
        "Пользователь сообщает, что у него все хорошо или отлично. Не приписывай ему тревогу, боль, неприятные ощущения и другие негативные чувства. Ответь коротко и по-доброму: порадуйся за пользователя и задай один легкий нейтральный вопрос про его день/планы.",
    });
  }

  if (psychologyContext) {
    messages.push({
      role: "system",
      content:
        `PROFESSIONAL KNOWLEDGE BASE (retrieved chunks):\n\n${psychologyContext}\n\n` +
        "Используй только релевантные части этой базы. Если в чанках нет точного ответа, скажи об этом прямо и дай безопасную общую рекомендацию без выдумывания фактов.",
    });
  }

  if (userContext) {
    messages.push({ role: "system", content: `User Context: ${userContext}` });
  }

  messages.push({ role: "system", content: `User Emotion (detected by camera/voice): ${userEmotion || "neutral"}` });

  for (const item of history || []) {
    const role = item.role === "assistant" ? "assistant" : "user";
    messages.push({ role, content: String(item.content || "") });
  }

  if (Array.isArray(history) && history.length >= 2) {
    const lastAssistantMsg = history
      .slice()
      .reverse()
      .find((item) => item.role === "assistant")?.content || "";

    if (lastAssistantMsg.length > 150) {
      messages.push({
        role: "system",
        content:
          "ВАЖНО: Не повторяй точно такой же контент как в предыдущем ответе. Если пользователь говорит спасибо или переходит дальше - предоставь новый взгляд или более глубокое понимание, а не повтор.",
      });
    }
  }

  if (!isGratitude) {
    messages.push({
      role: "system",
      content:
        "ПЕРЕД ОТВЕТОМ: Внимательно прочитай что пишет юзер и ответь ТОЧНО на эту тему. НЕ меняй тему внезапно. Если юзер про \"диплом\" - говори про \"диплом\", если про \"плагиат\" - про \"плагиат\". Юзер просто РАССКАЗЫВАЕТ о проблеме - только СЛУШАЙ И СПРАШИВАЙ. БЕЗ советов, БЕЗ статистики.",
    });
    messages.push({
      role: "system",
      content:
        "СОВЕТ! ЗАПОМНИ: Если юзер НЕ просит статистику - НЕ ВЫВОДИ её. Точка. Не выводи \"Дата:\", не выводи \"Настроение:\", не выводи \"Сон:\". Если выведешь статистику когда её не просили - это ПОЛНОСТЬЮ НЕПРАВИЛЬНО.",
    });
  }

  messages.push({ role: "user", content: text });

  const lm = await callUnifiedLlm(messages, {
    temperature: Number(modeLmConfig.temperature ?? LMSTUDIO_TEMPERATURE),
    maxTokens: Number(modeLmConfig.maxTokens ?? 512),
    topP: 0.9,
    frequencyPenalty: 0.5,
  });

  if (lm.error) {
    return { error: lm.error };
  }

  let reply = String(lm.reply || "").trim() || "...";

  if (userAffectClass === "positive" && replyHasUnwarrantedNegativity(reply)) {
    const corrected = await callUnifiedLlm(
      [
        ...messages.slice(0, -1),
        {
          role: "system",
          content:
            "КОРРЕКЦИЯ: пользователь в позитивном состоянии. Не приписывай тревогу, боль, стресс, нервозность. Ответ: коротко, тепло, поддерживающе-позитивно, максимум 2-3 предложения, один легкий вопрос в конце.",
        },
        messages[messages.length - 1],
      ],
      {
        temperature: Math.min(Number(modeLmConfig.temperature ?? 0.6), 0.35),
        maxTokens: Math.min(Number(modeLmConfig.maxTokens ?? 512), 140),
      }
    );

    if (!corrected.error && corrected.reply && !replyHasUnwarrantedNegativity(corrected.reply)) {
      reply = corrected.reply.trim();
    } else {
      reply = "Рад слышать, что у тебя всё хорошо. Что хочешь сделать сегодня для себя, чтобы сохранить это состояние?";
    }
  }

  const validation = validateAndSanitizeReply({
    reply,
    mode,
    isFirstMessage: !Array.isArray(history) || history.length === 0,
    userAffectClass,
    positiveFallback: "Рад слышать, что у тебя всё хорошо. Что хочешь сделать сегодня для себя, чтобы сохранить это состояние?",
    genericFallback: "Как дела?",
  });

  return {
    reply: validation.reply,
    mode,
    userAffectClass,
    psychologyContextChars: psychologyContext.length,
    meta: validation.meta,
  };
}
