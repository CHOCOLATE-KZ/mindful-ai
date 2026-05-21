/**
 * Определение смысла сообщения относительно кризисных триггер-слов.
 * Кризисный экран — только при личной угрозе/переживании, не при общих вопросах.
 */

/** Явная личная угроза — всегда кризис. */
const PERSONAL_CRISIS_PHRASES = [
  "хочу умереть",
  "хочу убить себя",
  "хочу совершить суицид",
  "хочу совершить самоубийство",
  "совершить суицид",
  "совершу суицид",
  "не хочу жить",
  "покончить с собой",
  "покончу с собой",
  "убью себя",
  "убить себя",
  "нет смысла жить",
  "лучше бы меня не было",
  "не могу больше жить",
  "думаю о суициде",
  "думаю о самоубийстве",
  "мысли о суициде",
  "мысли о самоубийстве",
  "собираюсь покончить",
  "сделаю с собой",
  "ненавижу жизнь",
  "want to die",
  "kill myself",
  "end my life",
  "thinking about suicide",
  "озімді олтіргім",
  "өлгім келеді",
  "өзіме зиян",
];

const TOPIC_CRISIS_WORDS = [
  "суицид",
  "суицидальн",
  "самоубий",
  "самоповреж",
  "suicide",
  "self harm",
  "self-harm",
];

const FIRST_PERSON_MARKERS = [
  "я",
  "мне",
  "меня",
  "мной",
  "мною",
  "мой",
  "моя",
  "мое",
  "мои",
  "у меня",
  "себя",
  "собой",
  "с собой",
];

export function normalizeCrisisText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[.,!?;:()"'`«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Границы слов для кириллицы (\\b в JS не работает с «я», «люди» и т.д.). */
function hasCyrillicWord(normalized, word) {
  const escaped = word
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, "\\s+");
  return new RegExp(`(?:^|[\\s])${escaped}(?:[\\s]|$)`).test(normalized);
}

function hasPersonalCrisisPhrase(normalized) {
  return PERSONAL_CRISIS_PHRASES.some((phrase) => normalized.includes(phrase));
}

function hasTopicCrisisWord(normalized) {
  return TOPIC_CRISIS_WORDS.some((word) => normalized.includes(word));
}

function hasFirstPerson(normalized) {
  return FIRST_PERSON_MARKERS.some((marker) => hasCyrillicWord(normalized, marker));
}

function looksLikeGeneralDiscussion(normalized) {
  if (!hasTopicCrisisWord(normalized)) return false;

  if (hasFirstPerson(normalized)) {
    return false;
  }

  const impersonalMarkers = [
    "много",
    "сколько",
    "статистик",
    "распростран",
    "часто ли",
    "а много",
    "люди",
    "людей",
    "человек",
    "людям",
    "они",
    "другие",
    "в мире",
    "в обществе",
    "что такое",
    "как часто",
    "исследован",
    "статья",
    "данные",
  ];

  if (impersonalMarkers.some((m) => normalized.includes(m))) {
    return true;
  }

  if (/\b(страдают|страдает|умирают|умирает)\b/.test(normalized)) {
    return true;
  }

  if (/(?:^|\s)совершают(?:\s|$)|(?:^|\s)совершает(?:\s|$)/.test(normalized)) {
    return true;
  }

  if (normalized.includes("?")) {
    return true;
  }

  return false;
}

/**
 * @param {string} text
 */
export function assessCrisisIntent(text) {
  const normalized = normalizeCrisisText(text);
  if (!normalized) {
    return { shouldTrigger: false, intent: "none", reason: "empty", hasKeyword: false };
  }

  const hasKeyword =
    hasPersonalCrisisPhrase(normalized) || hasTopicCrisisWord(normalized);

  if (!hasKeyword) {
    return { shouldTrigger: false, intent: "none", reason: "no_keyword", hasKeyword: false };
  }

  if (hasPersonalCrisisPhrase(normalized)) {
    return {
      shouldTrigger: true,
      intent: "personal",
      reason: "personal_phrase",
      hasKeyword: true,
    };
  }

  if (looksLikeGeneralDiscussion(normalized)) {
    return {
      shouldTrigger: false,
      intent: "discuss",
      reason: "general_discussion",
      hasKeyword: true,
    };
  }

  if (hasFirstPerson(normalized) && hasTopicCrisisWord(normalized)) {
    return {
      shouldTrigger: true,
      intent: "personal",
      reason: "first_person_topic",
      hasKeyword: true,
    };
  }

  if (hasTopicCrisisWord(normalized) && !hasFirstPerson(normalized)) {
    return {
      shouldTrigger: false,
      intent: "discuss",
      reason: "topic_without_first_person",
      hasKeyword: true,
    };
  }

  return {
    shouldTrigger: false,
    intent: "discuss",
    reason: "default_non_personal",
    hasKeyword: true,
  };
}

export function messageHasCrisisSignal(text) {
  return assessCrisisIntent(text).shouldTrigger;
}

export function messageContainsCrisisKeyword(text) {
  const normalized = normalizeCrisisText(text);
  return hasPersonalCrisisPhrase(normalized) || hasTopicCrisisWord(normalized);
}
