// Список ключевых психологических понятий для поиска в тексте
const PSYCH_KEYWORDS = [
  "тревог", "стресс", "страх", "паник", "депресс", "выгоран", "апати",
  "самооценк", "уверенност", "неуверенност", "самокритик",
  "границ", "отношени", "конфликт", "общени", "одиноч",
  "мотивац", "прокрастинац", "перфекцион", "контрол",
  "эмоци", "чувств", "злост", "обид", "вин", "стыд",
  "сон", "усталост", "истощени", "энерги",
  "цел", "смысл", "идентичност", "самопознани",
  "травм", "потер", "горе", "принят",
  "дыхани", "релаксац", "медитац", "осознанност",
];

// Паттерны для извлечения коротких концептуальных фраз
const PHRASE_PATTERNS = [
  // "**Жирный текст**" — из markdown-форматирования
  /\*\*([^*]{3,35})\*\*/g,
  // "- Пункт" из списков
  /^[-•]\s*([А-ЯA-Z][а-яa-z\s]{3,30})/mg,
  // "1. Пункт" из нумерованных списков
  /^\d+\.\s*([А-ЯA-Z][а-яa-z\s]{3,30})/mg,
];

export function extractAnchors(text) {
  if (!text || text.length < 20) return [];

  const found = new Set();

  // 1. Ищем выделенные фразы (markdown bold, пункты списков)
  for (const pattern of PHRASE_PATTERNS) {
    let match;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((match = re.exec(text)) !== null) {
      const phrase = match[1].trim().replace(/[.,;:!?]+$/, "");
      if (phrase.length >= 4 && phrase.length <= 40 && phrase.split(/\s+/).length <= 4) {
        found.add(phrase);
      }
      if (found.size >= 4) break;
    }
    if (found.size >= 4) break;
  }

  // 2. Если нашли недостаточно — ищем предложения с психологическими ключевыми словами
  if (found.size < 2) {
    const sentences = text
      .replace(/\*\*/g, "")
      .replace(/\s+/g, " ")
      .split(/[.!?]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      const keyword = PSYCH_KEYWORDS.find((kw) => lower.includes(kw));
      if (!keyword) continue;

      // Извлекаем 2-3 слова вокруг ключевого слова
      const words = sentence.split(/\s+/);
      const keyIdx = words.findIndex((w) => w.toLowerCase().includes(keyword));
      if (keyIdx === -1) continue;

      const start = Math.max(0, keyIdx - 1);
      const end = Math.min(words.length, keyIdx + 2);
      const phrase = words.slice(start, end).join(" ").replace(/[.,;:!?«»"']+/g, "").trim();

      if (phrase.length >= 4 && phrase.length <= 40) {
        found.add(phrase);
      }

      if (found.size >= 3) break;
    }
  }

  // 3. Крайний fallback — первые 3 слова из первого подходящего предложения
  if (found.size === 0) {
    const first = text.replace(/\*\*/g, "").split(/[.!?]/)[0]?.trim() || "";
    const words = first.split(/\s+/).slice(0, 3).join(" ").replace(/[.,;:!?«»"']+/g, "");
    if (words.length >= 4) found.add(words);
  }

  return [...found].slice(0, 4);
}
