const STAT_TRIGGERS = ["статистика", "на сегодня", "давай посмотрим на", "посмотрим на твою"];
const LINE_DROP_MARKERS = [
  "дата:",
  "дата :",
  "настроение:",
  "настроение :",
  "сон:",
  "сон :",
  "эмоциональная регуляция",
  "физическая активность",
  "на сегодня:",
  "давай посмотрим на",
  "посмотрим на твою",
  "продолжай в том же духе",
];
const NEGATIVE_REPLY_FLAGS = [
  "тебе непросто",
  "ты тревож",
  "тревог",
  "тревож",
  "нервный",
  "нервн",
  "плохо",
  "тяжело",
  "страда",
  "pain",
  "anx",
];
const TECHNICAL_HEADING_WORDS = [
  "отражение",
  "механизм",
  "шаг",
  "шаги",
  "вопрос",
  "прямой ответ",
  "вывод",
  "заголовок",
];
const MODE_LIMITS = {
  LISTENING: { maxSentences: 3, maxChars: 380 },
  ANALYSIS: { maxSentences: 6, maxChars: 900 },
  GUIDANCE: { maxSentences: 8, maxChars: 1200 },
};

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

export function replyHasUnwarrantedNegativity(text) {
  const normalized = normalize(text);
  if (!normalized) return false;
  return NEGATIVE_REPLY_FLAGS.some((f) => normalized.includes(f));
}

function stripStatTriggerBlocks(reply) {
  let text = String(reply || "");
  const lower = text.toLowerCase();

  for (const trigger of STAT_TRIGGERS) {
    const idx = lower.indexOf(trigger);
    if (idx < 0) continue;

    const afterTrigger = text.slice(idx + trigger.length).trim();
    const colonIdx = afterTrigger.indexOf(":");
    if (colonIdx >= 0) {
      const afterColon = afterTrigger.slice(colonIdx + 1).trim();
      if (afterColon.length > 15 && !/^дата|настроение|сон/i.test(afterColon)) {
        text = afterColon;
        continue;
      }
    }

    const beforeTrigger = text.slice(0, idx).trim();
    if (beforeTrigger.length > 15) {
      text = beforeTrigger;
    }
  }

  return text;
}

function stripStatLines(reply) {
  const lines = String(reply || "").split("\n");
  const filtered = lines.filter((line) => {
    const lower = normalize(line);
    if (!lower) return false;
    if (LINE_DROP_MARKERS.some((m) => lower.includes(m))) return false;
    if (/\d+\s*минут/.test(lower) && /\/10/.test(lower)) return false;
    if (/^\d+\/10/.test(lower)) return false;
    return true;
  });
  return filtered.join("\n").trim();
}

function removeDuplicateQuestions(reply) {
  const text = String(reply || "").trim();
  if (!text) return text;

  const questionCount = (text.match(/\?/g) || []).length;
  if (questionCount <= 1) return text;

  // Keep everything before the second question mark.
  const firstIdx = text.indexOf("?");
  const secondIdx = text.indexOf("?", firstIdx + 1);
  return text.slice(0, secondIdx + 1).trim();
}

function splitSentences(text) {
  return String(text || "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function removeTechnicalHeadings(reply) {
  let text = String(reply || "");
  if (!text) return text;

  // Remove markdown headings like "### Отражение:" including inline occurrences.
  text = text.replace(/\s*#{2,6}\s*[А-Яа-яA-Za-z\s]+:\s*/g, " ");

  // Remove known section labels while preserving content that follows.
  const labelPattern = TECHNICAL_HEADING_WORDS.map((w) => w.replace(/\s+/g, "\\s+")).join("|");
  text = text.replace(new RegExp(`(^|\\n|\\s)(${labelPattern})\\s*:\\s*`, "giu"), "$1");

  // Remove standalone numeric heading lines like "3.".
  text = text.replace(/(^|\n)\s*\d+\.\s*(?=\n|$)/g, "$1");

  return text.replace(/\s{2,}/g, " ").trim();
}

function stripGuidanceGreeting(reply, mode = "LISTENING", isFirstMessage = true) {
  if (isFirstMessage) return String(reply || "").trim();
  if (!["ANALYSIS", "GUIDANCE"].includes(mode)) return String(reply || "").trim();

  return String(reply || "")
    .replace(/^\s*(привет|здравствуй(те)?|добрый\s+(день|вечер|утро)|hello|hi|hey)[!,.:\-\s]*/iu, "")
    .trim();
}

function trimBrokenTail(reply) {
  let text = String(reply || "").trim();
  if (!text) return text;

  // Remove trailing enumerator fragments like "3." or "2)".
  text = text.replace(/(?:\s|^)\d+[.)]\s*$/u, "").trim();

  // If text ends with an unfinished separator, cut to last complete sentence.
  if (/[,:;\-]$/.test(text) || !/[.!?]$/.test(text)) {
    const lastPunctuation = Math.max(text.lastIndexOf("."), text.lastIndexOf("!"), text.lastIndexOf("?"));
    if (lastPunctuation >= 20) {
      text = text.slice(0, lastPunctuation + 1).trim();
    }
  }

  return text;
}

function sentenceSimilarity(a, b) {
  const na = normalize(a).replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  const nb = normalize(b).replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  if (!na.length || !nb.length) return 0;

  const sa = new Set(na);
  const sb = new Set(nb);
  let intersection = 0;
  for (const token of sa) {
    if (sb.has(token)) intersection += 1;
  }
  const union = new Set([...sa, ...sb]).size;
  return union ? intersection / union : 0;
}

function dedupeSentences(reply) {
  const sentences = splitSentences(reply);
  if (sentences.length <= 1) return { text: String(reply || "").trim(), changed: false };

  const kept = [];
  for (const sentence of sentences) {
    const isDup = kept.some((prev) => {
      const p = normalize(prev);
      const s = normalize(sentence);
      if (!p || !s) return false;
      if (p === s) return true;
      if (p.includes(s) || s.includes(p)) return true;
      return sentenceSimilarity(prev, sentence) >= 0.85;
    });
    if (!isDup) kept.push(sentence);
  }

  return { text: kept.join(" ").trim(), changed: kept.length !== sentences.length };
}

function applyModeLengthLimit(reply, mode = "LISTENING") {
  const safeMode = MODE_LIMITS[mode] ? mode : "LISTENING";
  const { maxSentences, maxChars } = MODE_LIMITS[safeMode];

  let text = String(reply || "").trim();
  if (!text) return { text, changed: false };

  const sentences = splitSentences(text);
  const bySentence = sentences.slice(0, maxSentences).join(" ").trim();
  let limited = bySentence || text;

  if (limited.length > maxChars) {
    limited = limited.slice(0, maxChars);
    const lastPunctuation = Math.max(limited.lastIndexOf("."), limited.lastIndexOf("!"), limited.lastIndexOf("?"));
    if (lastPunctuation >= 40) {
      limited = limited.slice(0, lastPunctuation + 1);
    } else {
      limited = `${limited.trim()}...`;
    }
  }

  return { text: limited.trim(), changed: limited.trim() !== text };
}

export function validateAndSanitizeReply({
  reply,
  mode = "LISTENING",
  isFirstMessage = true,
  userAffectClass = "neutral",
  positiveFallback = "Рад слышать, что у тебя всё хорошо. Что хочешь сделать сегодня для себя, чтобы сохранить это состояние?",
  genericFallback = "Как дела?",
}) {
  let cleaned = String(reply || "").trim();
  const meta = {
    changed: false,
    noStatistics: true,
    oneQuestionOnly: true,
    affectMatch: true,
    noDuplication: true,
    modeLengthApplied: false,
    artifactsRemoved: false,
    greetingRemoved: false,
    smartTrimApplied: false,
  };

  const beforeArtifacts = cleaned;
  cleaned = removeTechnicalHeadings(cleaned);
  if (cleaned !== beforeArtifacts) {
    meta.changed = true;
    meta.artifactsRemoved = true;
  }

  const beforeGreeting = cleaned;
  cleaned = stripGuidanceGreeting(cleaned, mode, isFirstMessage);
  if (cleaned !== beforeGreeting) {
    meta.changed = true;
    meta.greetingRemoved = true;
  }

  const beforeStatStrip = cleaned;
  cleaned = stripStatTriggerBlocks(cleaned);
  cleaned = stripStatLines(cleaned);
  if (cleaned !== beforeStatStrip) meta.changed = true;

  if (cleaned.toLowerCase().includes("статистика")) {
    const parts = cleaned.split(/статистика[^а-яёa-z]*/i);
    const candidate = parts[parts.length - 1]?.trim();
    cleaned = candidate && candidate.length > 10 ? candidate : genericFallback;
    meta.changed = true;
  }

  const beforeQuestionLimit = cleaned;
  cleaned = removeDuplicateQuestions(cleaned);
  if (cleaned !== beforeQuestionLimit) meta.changed = true;

  const dedup = dedupeSentences(cleaned);
  cleaned = dedup.text;
  if (dedup.changed) {
    meta.changed = true;
    meta.noDuplication = false;
  }

  const modeLimited = applyModeLengthLimit(cleaned, mode);
  cleaned = modeLimited.text;
  if (modeLimited.changed) {
    meta.changed = true;
    meta.modeLengthApplied = true;
  }

  const beforeTailTrim = cleaned;
  cleaned = trimBrokenTail(cleaned);
  if (cleaned !== beforeTailTrim) {
    meta.changed = true;
    meta.smartTrimApplied = true;
  }

  if (!cleaned || cleaned.length < 15 || /дата|настроение|сон/i.test(cleaned)) {
    const paragraphs = cleaned.split(/\n\n+/).filter((p) => p.trim().length > 0);
    cleaned = paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : genericFallback;
    meta.changed = true;
  }

  if (userAffectClass === "positive" && replyHasUnwarrantedNegativity(cleaned)) {
    cleaned = positiveFallback;
    meta.changed = true;
    meta.affectMatch = false;
  }

  meta.noStatistics = !/дата:|настроение:|сон:|статистика/i.test(cleaned);
  meta.oneQuestionOnly = (cleaned.match(/\?/g) || []).length <= 1;
  meta.mode = mode;

  return { reply: cleaned.trim() || genericFallback, meta };
}
