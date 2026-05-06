import { supabaseServer } from "@/lib/supabase/server";
import { extractAnchors } from "@/lib/utils/extractAnchors";
import { searchPsychologyKnowledge } from "@/lib/knowledge-search";
import { getSystemPrompt } from "@/data/systemPrompt";
import { replyHasUnwarrantedNegativity, validateAndSanitizeReply } from "@/lib/chat/responseValidator";

const LMSTUDIO_BASE_URL = (process.env.LMSTUDIO_BASE_URL || "http://127.0.0.1:1234").trim();
const LMSTUDIO_MODEL = (process.env.LMSTUDIO_MODEL || "gpt-oss-20b").trim();
const LMSTUDIO_TIMEOUT_MS = Number(process.env.LMSTUDIO_TIMEOUT_MS || 15000);
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

function isGreetingOnly(text) {
  const normalized = String(text || "").trim();
  if (!normalized) return false;
  return GREETING_REGEX.test(normalized);
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

async function buildUserContext(supabase, userId) {
  const personalizationEnabled = await (async () => {
    const { data } = await supabase
      .from("user_settings")
      .select("ai_personalization, data_sharing_ai, language")
      .eq("user_id", userId)
      .maybeSingle();
    return data;
  })();

  const settings = personalizationEnabled;

  if (settings?.data_sharing_ai === false) return "";

  const [{ data: profile }, { data: recentNotes }] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", userId).maybeSingle(),
    supabase
      .from("notes")
      .select("date, mood, sleep, content")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(settings?.ai_personalization ? 7 : 1),
  ]);

  const parts = [];
  if (profile?.name) parts.push(`Имя пользователя: ${profile.name}`);
  if (settings?.language) parts.push(`Язык интерфейса: ${settings.language}`);

  const notes = Array.isArray(recentNotes) ? recentNotes : recentNotes ? [recentNotes] : [];

  if (!settings?.ai_personalization) {
    // Базовый режим — только последняя запись
    const note = notes[0];
    if (note) {
      parts.push(
        `Последняя запись: дата=${note.date || "?"}, настроение=${note.mood ?? "?"}/10, сон=${note.sleep ?? "?"} ч`
      );
    }
  } else {
    // Расширенный режим персонализации — полная аналитика за 7 дней
    if (notes.length > 0) {
      // Последняя запись
      const latest = notes[0];
      parts.push(
        `Последняя запись (${latest.date || "?"}): настроение ${latest.mood ?? "?"}/10, сон ${latest.sleep ?? "?"} ч`
      );

      // Тренд настроения
      const moodValues = notes.map((n) => n.mood).filter((v) => typeof v === "number");
      if (moodValues.length >= 2) {
        const avg = (moodValues.reduce((a, b) => a + b, 0) / moodValues.length).toFixed(1);
        const first = moodValues[moodValues.length - 1];
        const last = moodValues[0];
        const trend = last > first ? "улучшается" : last < first ? "снижается" : "стабильное";
        parts.push(
          `Тренд настроения за ${moodValues.length} дн.: среднее ${avg}/10, динамика — ${trend} (было ${first}, стало ${last})`
        );
      }

      // Тренд сна
      const sleepValues = notes.map((n) => n.sleep).filter((v) => typeof v === "number");
      if (sleepValues.length >= 2) {
        const avgSleep = (sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length).toFixed(1);
        const sleepTrend =
          sleepValues[0] > sleepValues[sleepValues.length - 1]
            ? "улучшается"
            : sleepValues[0] < sleepValues[sleepValues.length - 1]
            ? "снижается"
            : "стабильный";
        parts.push(`Сон за ${sleepValues.length} дн.: среднее ${avgSleep} ч, тренд — ${sleepTrend}`);
      }

      // Дни с низким настроением
      const lowMoodDays = moodValues.filter((v) => v <= 4).length;
      if (lowMoodDays > 0) {
        parts.push(`За период ${lowMoodDays} из ${moodValues.length} дней настроение было ≤4/10 — это важный сигнал`);
      }

      // Последние заметки-тексты (если есть) для контекста
      const textNotes = notes
        .filter((n) => n.content && String(n.content).trim().length > 10)
        .slice(0, 2)
        .map((n) => `"${String(n.content).slice(0, 120).trim()}"`)
        .join("; ");
      if (textNotes) {
        parts.push(`Последние записи пользователя: ${textNotes}`);
      }
    }

    parts.push(
      `Инструкция: используй этот контекст, чтобы отвечать более персонально — учитывай тренды, упоминай конкретные цифры только если это уместно и помогает диалогу. Не выводи статистику спонтанно.`
    );
  }

  return parts.length ? parts.join(". ") : "";
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LMSTUDIO_TIMEOUT_MS);

  try {
    const resp = await fetch(`${LMSTUDIO_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: LMSTUDIO_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: 0.9,
        frequency_penalty: 0.5,
      }),
    });

    const raw = await resp.text();
    if (!resp.ok) {
      console.error('[LM STUDIO]  Error:', resp.status, raw.slice(0, 200));
      return { error: `LM Studio error (${resp.status}): ${raw}` };
    }

    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      return { error: `LM Studio returned non-JSON: ${raw}` };
    }

    const reply = (json?.choices?.[0]?.message?.content || "").trim();
    console.log('[LM STUDIO]  Reply length:', reply.length, 'символов');
    return { reply };
  } catch (error) {
    if (error?.name === 'AbortError') {
      return { error: `LM Studio request timeout after ${LMSTUDIO_TIMEOUT_MS}ms` };
    }

    return { error: error?.message || String(error) };
  } finally {
    clearTimeout(timeout);
  }
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

function normalizeAnchorList(rawAnchors) {
  if (!Array.isArray(rawAnchors)) return [];

  const cleaned = rawAnchors
    .map((a) => String(a || "").replace(/^[-*\d.)\s]+/, "").trim())
    // Убираем кавычки по краям и лишние знаки
    .map((a) => a.replace(/^["'«»]+|["'«».,;:!?]+$/g, "").trim())
    .filter((a) => a.length >= 3 && a.length <= 40)
    // Фильтруем якоря, похожие на обрезки предложений (много слов)
    .filter((a) => a.split(/\s+/).length <= 4)
    .map((a) => (a.length > 40 ? a.slice(0, 40).trim() : a));

  // Deduplicate while preserving order
  return [...new Set(cleaned)].slice(0, 4);
}

function parseAnchorsFromText(raw) {
  const text = String(raw || "").trim();
  if (!text) return [];

  // Handle fenced JSON like: ```json\n{ "anchors": [...] }\n```
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    const fencedPayload = fencedMatch[1].trim();
    try {
      const parsedFenced = JSON.parse(fencedPayload);
      const anchorsFromFenced = normalizeAnchorList(parsedFenced?.anchors ?? parsedFenced);
      if (anchorsFromFenced.length) return anchorsFromFenced;
    } catch {
      // Continue with other strategies.
    }
  }

  // Try strict JSON first
  try {
    const parsed = JSON.parse(text);
    return normalizeAnchorList(parsed?.anchors ?? parsed);
  } catch {
    // ignore and try fallback parsing
  }

  // Fallback: parse newline/bullet list
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== "```" && !/^```\w*$/i.test(l))
    .filter(Boolean);

  return normalizeAnchorList(lines);
}

async function generateAnchorsWithAI(replyText) {
  if (!replyText || replyText.length < 20) return [];

  const anchorMessages = [
    {
      role: "system",
      content:
        "Ты извлекаешь ключевые психологические темы из текста. " +
        "Верни ТОЛЬКО JSON: { \"anchors\": [\"...\", \"...\"] } — массив из 3 элементов. " +
        "Каждый якорь: СУЩЕСТВИТЕЛЬНОЕ + ПРИЛАГАТЕЛЬНОЕ или два существительных. " +
        "Максимум 3 слова на якорь. Никаких цитат предложений. " +
        "Примеры хороших якорей: \"Страх неудачи\", \"Личные границы\", \"Учебный стресс\", " +
        "\"Поиск идентичности\", \"Тревога ожидания\", \"Техника дыхания\". " +
        "Язык якорей должен совпадать с языком текста.",
    },
    {
      role: "user",
      content:
        "Текст ответа психолога:\n\n" + replyText +
        "\n\nВерни только JSON с ключевыми психологическими концепциями из этого текста.",
    },
  ];

  const lm = await callLmStudio(anchorMessages, { temperature: 0.2, maxTokens: 80 });
  if (lm.error) return [];

  return parseAnchorsFromText(lm.reply);
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

  const message = (body?.message || "").toString().trim();
  if (!message) {
    return Response.json({ error: "Empty message" }, { status: 400 });
  }

  // Жёсткий блок — криминал/наркотики блокируются ДО LLM, без эмпатии
  if (isHardBlocked(message)) {
    console.log('[CHAT API] 🚫 Hard-blocked message');
    return Response.json(
      { reply: "Я ИИ-психолог и не помогаю в вопросах, связанных с нарушением закона. Этот запрос вне моей компетенции." },
      { status: 200 }
    );
  }

  const greetingMode = isGreetingOnly(message);
  const isGratitude = isGratitudeMessage(message);
  const positiveCheckin = isPositiveCheckin(message);
  const shouldShortPositiveReply = positiveCheckin && !hasNegativeSignal(message);
  const userAffectClass = detectAffectClass(message);

  console.log('[CHAT API] intent flags:', {
    greetingMode,
    isGratitude,
    positiveCheckin,
    hasNegativeSignal: hasNegativeSignal(message),
    userAffectClass,
    shouldShortPositiveReply,
    message: message.slice(0, 80),
  });

  // Кризисный детектор — проверяем ДО обращения к LLM
  if (detectCrisis(message)) {
    console.log('[CHAT API] ⚠️  Обнаружен кризисный сигнал в сообщении');
    return Response.json({ crisis: true }, { status: 200 });
  }

  const supabase = await supabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (shouldShortPositiveReply) {
    const quickReply = "Рад слышать, что у тебя всё хорошо. Что хочешь сделать сегодня для себя, чтобы сохранить это состояние?";

    const [insertUser, insertAssistant] = await Promise.all([
      supabase.from("ai_messages").insert({
        user_id: user.id,
        role: "user",
        content: message,
        source: "web",
      }),
      supabase.from("ai_messages").insert({
        user_id: user.id,
        role: "assistant",
        content: quickReply,
        source: "web",
      }),
    ]);

    if (insertUser.error) {
      return Response.json({ error: insertUser.error.message }, { status: 500 });
    }
    if (insertAssistant.error) {
      return Response.json({ error: insertAssistant.error.message }, { status: 500 });
    }

    return Response.json({
      reply: quickReply,
      anchors: extractAnchors(quickReply),
      debug: body?.debug === true ? { shortcut: "positive-checkin" } : undefined,
    });
  }

  // Получаем последнюю эмоцию пользователя
  const userEmotion = getLastUserEmotion(user.id);
  console.log('[CHAT API]  Эмоция пользователя:', userEmotion);

  const isLightweightIntent = greetingMode || isGratitude;

  let history = [];
  if (!isLightweightIntent) {
    const { data, error: histErr } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(25);

    if (histErr) {
      return Response.json({ error: histErr.message }, { status: 500 });
    }
    history = data || [];
  }

  const context = isLightweightIntent ? "" : await buildUserContext(supabase, user.id);

  const mode = isLightweightIntent ? "LISTENING" : await classifyMode(message);
  const modeLmConfig = getModeLmConfig(mode);

  let psychologyContext = '';
  if (!isLightweightIntent && ENABLE_PSYCHOLOGY_RAG && message.length >= RAG_MIN_QUERY_LENGTH) {
    psychologyContext = await searchPsychologyKnowledge(message, RAG_LIMIT);
  }

  console.log(
    '[CHAT API]  RAG settings:',
    JSON.stringify({
      enabled: ENABLE_PSYCHOLOGY_RAG,
      minQueryLength: RAG_MIN_QUERY_LENGTH,
      limit: RAG_LIMIT,
      contextChars: psychologyContext.length,
    })
  );

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

  if (positiveCheckin && !isGratitude) {
    messages.push({
      role: "system",
      content:
        "Пользователь сообщает, что у него все хорошо или отлично. Не приписывай ему тревогу, боль, неприятные ощущения и другие негативные чувства. " +
        "Ответь коротко и по-доброму: порадуйся за пользователя и задай один легкий нейтральный вопрос про его день/планы.",
    });
  }
  
  console.log('[CHAT API]  Начинаю конструирование messages...');
  console.log('[CHAT API]  Mode:', mode);
  console.log('[CHAT API]  Mode config:', modeLmConfig);
  console.log('[CHAT API]  System prompt первая строка:', String(messages[0]?.content || '').slice(0, 80) + '...');
  
  // Добавляем психологические знания как контекст для AI
  if (psychologyContext) {
    messages.push({
      role: "system",
      content:
        `PROFESSIONAL KNOWLEDGE BASE (retrieved chunks):\n\n${psychologyContext}\n\n` +
        `Используй только релевантные части этой базы. Если в чанках нет точного ответа, скажи об этом прямо и дай безопасную общую рекомендацию без выдумывания фактов.`
    });
  }
  if (context) {
    messages.push({ role: "system", content: `User Context: ${context}` });
  }
  // ВСТАВЛЯЕМ ЭМОЦИЮ ПОЛЬЗОВАТЕЛЯ В КОНТЕКСТ ДЛЯ LLM
  messages.push({
    role: "system",
    content: `User Emotion (detected by camera/voice): ${userEmotion}`
  });
  for (const m of history || []) {
    const role = m.role === "assistant" ? "assistant" : "user";
    messages.push({ role, content: String(m.content || "") });
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

  //  КРИТИЧНОЕ НАПОМИНАНИЕ перед тем как читать пользовательское сообщение
  if (!isGratitude) {
    messages.push({
      role: 'system',
      content: `ПЕРЕД ОТВЕТОМ: Внимательно прочитай что пишет юзер и ответь ТОЧНО на эту тему. НЕ меняй тему внезапно. Если юзер про "диплом" - говори про "диплом", если про "плагиат" - про "плагиат". Юзер просто РАССКАЗЫВАЕТ о проблеме - только СЛУШАЙ И СПРАШИВАЙ. БЕЗ советов, БЕЗ статистики.`
    });
  }

  //  ФИНАЛЬНОЕ ПРЕДУПРЕЖДЕНИЕ О ЗАПРЕТЕ НА СТАТИСТИКУ
  if (!isGratitude) {
    messages.push({
      role: 'system',
      content: `СОВЕТ! ЗАПОМНИ: Если юзер НЕ просит статистику - НЕ ВЫВОДИ её. Точка. Не выводи "Дата:", не выводи "Настроение:", не выводи "Сон:". Если выведешь статистику когда её не просили - это ПОЛНОСТЬЮ НЕПРАВИЛЬНО.`
    });
  }

  messages.push({ role: "user", content: message });

  const { error: insUserErr } = await supabase.from("ai_messages").insert({
    user_id: user.id,
    role: "user",
    content: message,
    source: "web",
  });

  if (insUserErr) {
    return Response.json({ error: insUserErr.message }, { status: 500 });
  }

  let reply = "";
  try {
    const lm = await callLmStudio(messages, modeLmConfig);
    if (lm.error) {
      return Response.json({ error: lm.error }, { status: 502 });
    }
    reply = lm.reply || "";
  } catch (err) {
    return Response.json(
      { error: `Failed to contact LLM: ${err?.message || String(err)}` },
      { status: 502 }
    );
  }

  reply = reply.trim() || "...";

  // Universal consistency guard: avoid projecting anxiety/negativity onto positive check-ins.
  if (userAffectClass === "positive" && replyHasUnwarrantedNegativity(reply)) {
    console.log('[CHAT API]  Affect mismatch detected. Running one corrective regeneration...');

    const correctedMessages = [
      ...messages.slice(0, -1),
      {
        role: "system",
        content:
          "КОРРЕКЦИЯ: пользователь в позитивном состоянии. Не приписывай тревогу, боль, стресс, нервозность. " +
          "Ответ: коротко, тепло, поддерживающе-позитивно, максимум 2-3 предложения, один легкий вопрос в конце.",
      },
      messages[messages.length - 1],
    ];

    const corrected = await callLmStudio(correctedMessages, {
      temperature: Math.min(modeLmConfig.temperature, 0.35),
      maxTokens: Math.min(modeLmConfig.maxTokens, 140),
    });
    if (!corrected.error && corrected.reply && !replyHasUnwarrantedNegativity(corrected.reply)) {
      reply = corrected.reply.trim();
      console.log('[CHAT API]  Corrective regeneration accepted.');
    } else {
      reply = "Рад слышать, что у тебя всё хорошо. Что хочешь сделать сегодня для себя, чтобы сохранить это состояние?";
      console.log('[CHAT API]  Corrective regeneration failed. Using safe positive fallback.');
    }
  }

  //  DEBUG: логируем ответ от LM Studio ДО очистки
  if (reply.length < 300) {
    console.log('[LM STUDIO]  RAW ответ от LM Studio:', reply);
  } else {
    console.log('[LM STUDIO]  RAW ответ (первые 300 символов):', reply.slice(0, 300));
  }

  const validation = validateAndSanitizeReply({
    reply,
    mode,
    isFirstMessage: history.length === 0,
    userAffectClass,
    positiveFallback: "Рад слышать, что у тебя всё хорошо. Что хочешь сделать сегодня для себя, чтобы сохранить это состояние?",
    genericFallback: "Как дела?",
  });
  reply = validation.reply;

  console.log('[LM STUDIO]  ПОСЛЕ валидации:', reply.slice(0, 200));
  console.log('[LM STUDIO]  Validator rules:', validation.meta);

  //  DEBUG: логируем финальный ответ который отправляется пользователю
  console.log('[LM STUDIO]  ФИНАЛЬНЫЙ ответ:', reply);
  console.log('[LM STUDIO]  Все проверки пройдены\n');

  // Запускаем сохранение в БД и генерацию якорей параллельно
  const anchorPromise = greetingMode
    ? Promise.resolve({ anchors: [], source: "disabled:greeting" })
    : generateAnchorsWithAI(reply)
        .then((ai) =>
          ai.length > 0
            ? { anchors: ai, source: "ai" }
            : { anchors: extractAnchors(reply), source: "heuristic" }
        )
        .catch(() => ({ anchors: extractAnchors(reply), source: "heuristic" }));

  const [dbResult, { anchors, source: anchorSource }] = await Promise.all([
    supabase.from("ai_messages").insert({
      user_id: user.id,
      role: "assistant",
      content: reply,
      source: "web",
    }),
    anchorPromise,
  ]);

  if (dbResult.error) {
    return Response.json({ error: dbResult.error.message }, { status: 500 });
  }

  const debug = body?.debug === true
    ? {
        model: LMSTUDIO_MODEL,
        ragEnabled: ENABLE_PSYCHOLOGY_RAG,
        ragLimit: RAG_LIMIT,
        ragContextChars: psychologyContext.length,
        anchorSource,
        mode,
      }
    : undefined;

  return Response.json({ reply, anchors, debug });
}
