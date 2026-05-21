import { getSystemPrompt } from "../../data/systemPrompt.js";
import { searchPsychologyKnowledge } from "../knowledge-search.js";
import { callUnifiedLlm } from "../llm/unifiedClient.js";
import { assessCrisisIntent } from "./crisisIntent.js";
import {
  messageHasCrisisSignal,
  isDeclineCrisisTopicMessage,
  isAffirmContinueCrisisTopicMessage,
  CRISIS_TOPIC_CONTINUING_SYSTEM,
  CRISIS_TOPIC_DECLINED_SYSTEM,
} from "./crisisSession.js";
import { replyHasUnwarrantedNegativity, validateAndSanitizeReply } from "./responseValidator.js";

const LMSTUDIO_TEMPERATURE = Number(process.env.LMSTUDIO_TEMPERATURE || 0.6);
const ENABLE_PSYCHOLOGY_RAG = (process.env.ENABLE_PSYCHOLOGY_RAG || "true").trim().toLowerCase() !== "false";
const RAG_LIMIT = Number(process.env.RAG_LIMIT || 3);
const RAG_MIN_QUERY_LENGTH = Number(process.env.RAG_MIN_QUERY_LENGTH || 8);

const CHAT_LM_CONFIG = {
  temperature: Number(process.env.LMSTUDIO_TEMPERATURE || 0.65),
  maxTokens: Number(process.env.LMSTUDIO_MAX_TOKENS || 512),
};

const HARD_BLOCK_MESSAGE =
  "Я ИИ-психолог и не помогаю в вопросах, связанных с нарушением закона. Этот запрос вне моей компетенции.";

const CRISIS_FALLBACK_MESSAGE =
  "Мне очень жаль, что тебе так тяжело. Если есть риск причинить себе вред, пожалуйста, прямо сейчас обратись в экстренные службы (112) или к близкому человеку рядом.";

const CRISIS_CONTINUATION_SYSTEM =
  "Пользователь сообщил о тяжёлых или суицидальных мыслях. Он уже видел телефоны доверия (150, 8-800-2000-122) и выбрал продолжить разговор.\n" +
  "Ответь по-человечески: признай боль, напомни, что помощь рядом, задай один бережный вопрос по его словам. " +
  "Без шаблона «Похоже, в тебе сейчас много…», без длинных списков телефонов.";

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
const NEUTRAL_HELP_PATTERNS = [
  /\bподскажи\b/i,
  /\bпомоги\b/i,
  /\bпосоветуй\b/i,
  /\bобъясни\b/i,
  /\bрасскажи\b/i,
  /\bчто делать\b/i,
  /\bкак сделать\b/i,
  /\bкак быть\b/i,
  /\bкак справиться\b/i,
  /\bhow to\b/i,
  /\bhelp me\b/i,
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
  return messageHasCrisisSignal(text);
}

export function isGreetingOnly(text) {
  const normalized = String(text || "").trim();
  return Boolean(normalized) && GREETING_REGEX.test(normalized);
}

/** «Привет, как дела?» и похожий small talk — не кризис и не терапия. */
export function isCasualGreeting(text) {
  const n = normalizeForIntent(text);
  if (!n) return false;

  const smallTalk =
    /^(как дела|как ты|как сам|что нового|как настроение|как жизнь|как настроение)(?:\s|$)/.test(n) ||
    /\bкак дела\b/.test(n) ||
    /\bкак ты\b/.test(n);

  const hasHi =
    /^(привет|здравствуй|здравствуйте|салам|hello|hi|hey|добрый день|добрый вечер|добрый утро)(?:\s|$)/.test(n) ||
    /\b(привет|здравствуй|салам|hello|hi|hey)\b/.test(n);

  if (hasNegativeSignal(text) || detectCrisis(text)) return false;

  return (hasHi && smallTalk) || /^(привет\s+)?как дела/.test(n);
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
  if (!normalized) return false;
  if (isCasualGreeting(text)) return false;
  return NEUTRAL_HELP_PATTERNS.some((pattern) => pattern.test(normalized));
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

/** Пользователь уточняет, что имел в виду ассистент в прошлом сообщении. */
export function isUserClarifyingPreviousReply(text) {
  const n = normalizeForIntent(text);
  if (!n) return false;
  return (
    /\b(что именно|ты имел|имел в виду|имел ввиду|про что ты|о чем ты|о чём ты|уточни|я уточнил|или про|ты сказал|написал рассказать)\b/.test(
      n
    ) || /\b(про доту|про сны|про сон)\b/.test(n)
  );
}

/** Короткий конкретный ответ на вопрос ассистента — не просить «подробнее». */
export function isSubstantiveShortAnswer(text) {
  const t = String(text || "").trim();
  if (t.length < 8) return false;
  if (isUserClarifyingPreviousReply(text)) return false;
  return !/^(да|нет|ок|ok|ага|угу|не знаю)$/i.test(t);
}

function historyWithoutDuplicateCurrentUser(history, currentText) {
  const list = Array.isArray(history) ? [...history] : [];
  const text = String(currentText || "").trim();
  const last = list[list.length - 1];
  if (last?.role === "user" && String(last.content || "").trim() === text) {
    list.pop();
  }
  return list;
}

export async function generateSafePsychReply({
  message,
  history = [],
  conversationSummary = "",
  bridgeContext = "",
  userContext = "",
  enableRag = ENABLE_PSYCHOLOGY_RAG,
  ragLimit = RAG_LIMIT,
  ragMinQueryLength = RAG_MIN_QUERY_LENGTH,
  continueAfterCrisis = false,
  crisisTopicMode = null,
}) {
  const text = String(message || "").trim();
  if (!text) {
    return { error: "Empty message" };
  }

  if (isHardBlocked(text)) {
    return {
      blocked: true,
      reply: HARD_BLOCK_MESSAGE,
      mode: "CHAT",
      userAffectClass: "neutral",
      psychologyContextChars: 0,
    };
  }

  const crisisIntent = assessCrisisIntent(text);
  const hasCrisisInMessage = crisisIntent.shouldTrigger;
  const topicMode = crisisTopicMode === "continuing" || crisisTopicMode === "declined" ? crisisTopicMode : null;

  if (isDeclineCrisisTopicMessage(text)) {
    return {
      crisisTopicDeclined: true,
      reply:
        "Хорошо, я понял. Давай поговорим о том, что для тебя сейчас важнее — о чём хочешь поговорить?",
      mode: "CHAT",
      psychologyContextChars: 0,
    };
  }

  if (isAffirmContinueCrisisTopicMessage(text)) {
    continueAfterCrisis = true;
  }

  if (hasCrisisInMessage && topicMode === "declined") {
    return { crisis: true, crisisReply: CRISIS_FALLBACK_MESSAGE, crisisReopen: true };
  }

  if (hasCrisisInMessage && topicMode !== "continuing" && !continueAfterCrisis) {
    return { crisis: true, crisisReply: CRISIS_FALLBACK_MESSAGE };
  }

  const historyForPrompt = historyWithoutDuplicateCurrentUser(history, text);

  const hasPriorDialogue = Array.isArray(history) && history.length > 0;
  const greetingMode = isGreetingOnly(text) && !hasPriorDialogue;
  const casualGreeting = isCasualGreeting(text);
  const isGratitude = isGratitudeMessage(text);
  const positiveCheckin = isPositiveCheckin(text);
  const userAffectClass = detectAffectClass(text);
  const userClarifying = isUserClarifyingPreviousReply(text);
  const substantiveAnswer = isSubstantiveShortAnswer(text);
  const isLightweightIntent = greetingMode || isGratitude || casualGreeting;

  const mode = "CHAT";
  const modeLmConfig = CHAT_LM_CONFIG;

  let psychologyContext = "";
  if (!isLightweightIntent && enableRag && text.length >= ragMinQueryLength) {
    psychologyContext = await searchPsychologyKnowledge(text, ragLimit);
  }

  const omitCrisisInstructions = topicMode === "declined";

  const messages = isGratitude
    ? [
        {
          role: "system",
          content:
            "Пользователь тебя поблагодарил. Ответь вежливо, коротко и поддерживающе, не выдумывай новые проблемы.",
        },
      ]
    : [{ role: "system", content: getSystemPrompt({ omitCrisisInstructions }) }];

  if (greetingMode) {
    messages.push({
      role: "system",
      content:
        "Пользователь просто поздоровался. Ответь коротко и дружелюбно.",
    });
  } else if (casualGreeting) {
    messages.push({
      role: "system",
      content:
        "Пользователь поздоровался и спросил, как дела (обычный small talk). " +
        "Ответь тепло: короткое приветствие, по-человечески отзеркаль вопрос, спроси, как он/она сейчас. " +
        "Не уходи в тяжёлые темы и терапию без сигнала от пользователя. Закончи одним лёгким вопросом с «?».",
    });
  } else if (isGreetingOnly(text) && hasPriorDialogue) {
    messages.push({
      role: "system",
      content:
        "Пользователь снова поздоровался в середине диалога. Кратко ответь на приветствие и мягко предложи продолжить прежнюю тему, если она была важна.",
    });
  }

  const summaryText = String(conversationSummary || "").trim();
  if (summaryText) {
    messages.push({
      role: "system",
      content:
        `РЕЗЮМЕ ПРЕДЫДУЩЕЙ ЧАСТИ ДИАЛОГА (сжато, опирайся на это для непрерывности):\n${summaryText}`,
    });
  }

  const bridgeText = String(bridgeContext || "").trim();
  if (bridgeText) {
    messages.push({
      role: "system",
      content:
        `СООБЩЕНИЯ МЕЖДУ РЕЗЮМЕ И ТЕКУЩИМ ОКНОМ (ещё не вошли в резюме):\n${bridgeText}`,
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

  if (topicMode === "declined") {
    messages.push({ role: "system", content: CRISIS_TOPIC_DECLINED_SYSTEM });
  } else if (topicMode === "continuing") {
    messages.push({ role: "system", content: CRISIS_TOPIC_CONTINUING_SYSTEM });
  } else if (continueAfterCrisis) {
    messages.push({ role: "system", content: CRISIS_CONTINUATION_SYSTEM });
  }

  if (userContext) {
    messages.push({ role: "system", content: `User Context: ${userContext}` });
  }

  for (const item of historyForPrompt) {
    const role = item.role === "assistant" ? "assistant" : "user";
    messages.push({ role, content: String(item.content || "") });
  }

  if (Array.isArray(historyForPrompt) && historyForPrompt.length >= 2) {
    const lastAssistantMsg = historyForPrompt
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

  if (userClarifying) {
    messages.push({
      role: "system",
      content:
        "Пользователь уточняет твой предыдущий вопрос. Ответь прямо и коротко, о чём ты спрашивал " +
        "(сны, отвлечение, игра и т.д.). Признай недопонимание, если он поправил тебя. Не начинай новую тему.",
    });
  } else if (substantiveAnswer) {
    messages.push({
      role: "system",
      content:
        "Пользователь дал конкретный ответ на твой вопрос. Откликнись на его слова (поддержи идею, уточни по делу). " +
        "Не пиши «расскажи подробнее» и не игнорируй ответ.",
    });
  } else if (!isGratitude && !casualGreeting) {
    messages.push({
      role: "system",
      content:
        "Ответь точно на тему последнего сообщения пользователя. Не подменяй тему. " +
        "Не выводи статистику дневника в формате «Дата:», «Настроение:», «Сон:».",
    });
  }

  if (crisisIntent.intent === "discuss" && crisisIntent.hasKeyword) {
    messages.push({
      role: "system",
      content:
        "Пользователь спрашивает обобщённо о суициде/самоповреждении (статистика, другие люди, «что такое»), " +
        "а не о личной угрозе. Ответь по сути вопроса спокойно и бережно, без кризисного экрана и без списков телефонов. " +
        "Можно кратко упомянуть, что если ему самому сейчас тяжело — можно поговорить об этом отдельно.",
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
    isFirstMessage: !Array.isArray(historyForPrompt) || historyForPrompt.length === 0,
    userAffectClass,
    requireClosingQuestion: (continueAfterCrisis || casualGreeting) && !isGratitude,
    userMessage: text,
    isCasualGreeting: casualGreeting,
    positiveFallback: "Рад слышать, что у тебя всё хорошо. Что хочешь сделать сегодня для себя, чтобы сохранить это состояние?",
    greetingFallback:
      "Привет! Рад тебя видеть. У меня всё спокойно — расскажи, как ты сейчас, что у тебя на душе?",
    genericFallback: substantiveAnswer
      ? "Спасибо, что поделился. Расскажи, как это для тебя обычно проходит на практике?"
      : "Не совсем уловил мысль — можешь сказать своими словами, что для тебя сейчас важнее?",
  });

  return {
    reply: validation.reply,
    mode,
    userAffectClass,
    psychologyContextChars: psychologyContext.length,
    meta: validation.meta,
  };
}
