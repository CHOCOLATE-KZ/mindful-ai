const KNOWN_STRUCTURED_KEYS = new Set([
  "summaryText",
  "summary",
  "reportText",
  "text",
  "keyFindings",
  "findings",
  "likelyDrivers",
  "drivers",
  "plan24h",
  "dayPlan",
  "microPlan24h",
  "plan7d",
  "weekPlan",
  "expectedSignals",
  "successSignals",
  "checkInQuestions",
  "reviewQuestions",
]);

const PROFILE_SECTION_TITLES = {
  ru: [
    "Общее состояние",
    "Динамика и тренды",
    "Темы и триггеры",
    "Риски и ресурсы",
    "Общее",
    "Тенденции",
    "Темы",
    "Что помогает",
    "Риски",
    "Следующие шаги",
  ],
  weekly: {
    ru: [
      "Итоги недели",
      "Изменения",
      "Сигналы",
      "Советы",
      "Ключевые метрики",
      "Темы недели",
      "Сигналы риска",
      "Главный инсайт недели",
    ],
  },
};

const JSON_TAIL_MARKERS = [
  '"keyFindings"',
  "'keyFindings'",
  '{ "keyFindings"',
  "\nkeyFindings",
  '"likelyDrivers"',
  '"plan24h"',
];

export function extractJsonCandidate(text) {
  const source = String(text || "").trim();
  if (!source) return null;

  const fencedMatch =
    source.match(/```json\s*([\s\S]*?)```/i) || source.match(/```\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();

  const firstBrace = source.indexOf("{");
  const lastBrace = source.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return source.slice(firstBrace, lastBrace + 1);
  }

  return null;
}

export function parseStructuredAiReply(text) {
  const candidate = extractJsonCandidate(text);
  if (!candidate) return null;
  try {
    return JSON.parse(candidate);
  } catch {
    return parseLenientObject(text);
  }
}

/** Починка типичного битого JSON от локальных LLM (""", хвосты, дубли ключей) */
function parseLenientObject(text) {
  const source = String(text || "").trim();
  if (!source) return null;

  let candidate = extractJsonCandidate(source) || source;
  candidate = candidate.replace(/"""/g, '"').replace(/,\s*(\]|})/g, "$1");

  try {
    return JSON.parse(candidate);
  } catch {
    // noop
  }

  const summary = extractSummaryFromBrokenJson(source);
  if (!summary && !source.includes("keyFindings")) return null;

  return {
    summaryText: summary || recoverPlainNarrative(source, "profile"),
    keyFindings: extractStringArrayField(source, "keyFindings"),
    likelyDrivers: extractStringArrayField(source, "likelyDrivers"),
    plan24h: extractStringArrayField(source, "plan24h"),
    plan7d: extractStringArrayField(source, "plan7d"),
    expectedSignals: extractStringArrayField(source, "expectedSignals"),
    checkInQuestions: extractStringArrayField(source, "checkInQuestions"),
  };
}

function cutJsonTail(s) {
  let out = String(s || "");
  for (const marker of JSON_TAIL_MARKERS) {
    const idx = out.indexOf(marker);
    if (idx > 40) out = out.slice(0, idx);
  }
  return out.replace(/[\s",{}]+$/g, "").trim();
}

function extractSummaryFromBrokenJson(source) {
  const patterns = [
    /"summaryText"\s*:\s*"""\s*([\s\S]*?)(?=\s*"""\s*[,}]|\s*\{?\s*"keyFindings")/i,
    /"summaryText"\s*:\s*"""\s*([\s\S]+)/i,
    /"summaryText"\s*:\s*"([\s\S]*?)"\s*,\s*"keyFindings"/i,
    /"summaryText"\s*:\s*"([\s\S]*?)"\s*[,}]/i,
    /summaryText\s*:\s*"""\s*([\s\S]*?)(?=\s*"""|\s*"keyFindings)/i,
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1]?.trim()) return cutJsonTail(match[1].trim());
  }

  return "";
}

function dedupePlainSectionTitles(text, titles) {
  let out = String(text || "");
  for (const title of titles) {
    const headerPatterns = [
      new RegExp(`(^|\\n\\n)${escapeRegExp(title)}\\s*\\n`, "gm"),
      new RegExp(`(^|\\n\\n)##\\s+${escapeRegExp(title)}\\s*\\n`, "gm"),
    ];
    for (const re of headerPatterns) {
      const matches = [...out.matchAll(re)];
      if (matches.length <= 1) continue;
      const secondStart = matches[1].index;
      const nextTitleRe = new RegExp(
        `\\n\\n(?:##\\s+)?(?:${titles.map(escapeRegExp).join("|")})\\s*\\n`,
        "m"
      );
      const after = out.slice(secondStart + 1);
      const nextMatch = after.match(nextTitleRe);
      const removeEnd =
        nextMatch?.index != null ? secondStart + 1 + nextMatch.index : out.length;
      out = out.slice(0, secondStart).trimEnd() + out.slice(removeEnd);
      break;
    }
  }
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function filterHumanListItems(items) {
  return (items || []).filter((item) => {
    const s = String(item || "").trim();
    if (!s || s.length < 2) return false;
    if (/^[a-z_]+:\s*\d+$/i.test(s)) return false;
    if (s.startsWith("{") || s.includes('"summaryText"')) return false;
    return true;
  });
}

function extractStringArrayField(source, fieldName) {
  const re = new RegExp(`"${fieldName}"\\s*:\\s*\\[`, "i");
  const start = source.search(re);
  if (start === -1) return [];

  const open = source.indexOf("[", start);
  if (open === -1) return [];

  let depth = 0;
  let end = -1;
  for (let i = open; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end === -1) return [];

  const slice = source.slice(open, end + 1);
  try {
    const arr = JSON.parse(slice);
    if (Array.isArray(arr)) {
      return arr.map((x) => String(x || "").trim()).filter(Boolean);
    }
  } catch {
    // fallback: quoted strings inside brackets
  }

  const items = [];
  const strRe = /"((?:\\.|[^"\\])*)"/g;
  let m;
  while ((m = strRe.exec(slice)) !== null) {
    const item = m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').trim();
    if (item && !item.startsWith("{")) items.push(item);
  }
  return items.slice(0, 8);
}

function asStringArray(value, limit = 8) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, limit);
}

function toSummaryText(value, fallback = "") {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join("\n")
      .trim();
  }
  const single = String(value || "").trim();
  return single || String(fallback || "").trim();
}

export function sanitizeSummaryText(text) {
  let s = String(text || "").replace(/\r\n/g, "\n").trim();
  if (!s) return "";

  s = s.replace(/^\{\s*"?summaryText"?\s*:\s*/i, "");
  s = s.replace(/^"""\s*/, "").replace(/\s*"""$/, "");
  s = s.replace(/^"\s*/, "").replace(/\s*"$/, "");

  if (s.startsWith("{") || s.includes('"summaryText"')) {
    const parsed = parseLenientObject(s);
    if (parsed?.summaryText) {
      s = String(parsed.summaryText).trim();
    }
  }

  s = s.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, '"');
  s = s.replace(/^summaryText:\s*/i, "");

  for (const marker of JSON_TAIL_MARKERS) {
    const idx = s.indexOf(marker);
    if (idx > 60) s = s.slice(0, idx);
  }

  s = s.replace(/[\s",]+$/g, "").trim();
  s = s.replace(/\n{3,}/g, "\n\n");

  return s.trim();
}

function dedupeMarkdownSections(text) {
  const lines = String(text || "").split("\n");
  const seen = new Set();
  const out = [];
  let skipSection = false;

  for (const line of lines) {
    const header = line.match(/^##\s+(.+?)\s*$/);
    if (header) {
      const name = header[1].trim().toLowerCase();
      if (seen.has(name)) {
        skipSection = true;
        continue;
      }
      seen.add(name);
      skipSection = false;
    }
    if (!skipSection) out.push(line);
  }

  return out.join("\n").trim();
}

const LIST_SECTIONS = {
  profile: ["Темы", "Что помогает", "Риски", "Следующие шаги"],
  weekly: ["Советы", "Сигналы"],
};

function isIntroListLine(line) {
  const t = line.trim();
  if (!t) return true;
  if (/^[-*•]\s/.test(t)) return false;
  if (/[:：]\s*$/.test(t)) return true;
  if (
    /^(согласно|ключевые темы|включают|существуют|чтобы улучшить|наблюдается|вы уже|поддерживает|следующие|рекомендуем)/i.test(
      t
    ) &&
    t.length < 140
  ) {
    return true;
  }
  return false;
}

function shouldDropListItem(text) {
  return /продолжайте пользоваться системой|часто общаться с системой|задавать вопросы о своем состоянии/i.test(
    String(text || "")
  );
}

function cleanListItemLine(line) {
  let s = String(line || "").trim();
  s = s.replace(/^[•\-*]\s+/, "");
  s = s.replace(/^\d+\.\s+/, "");
  s = s.replace(/\s*\([^)]*\)\s*$/g, "").trim();
  s = s.replace(/\s*\?+\s*$/g, "").trim();
  return s;
}

function normalizeSectionLists(text, mode = "profile") {
  const listSections = mode === "weekly" ? LIST_SECTIONS.weekly : LIST_SECTIONS.profile;
  const lines = String(text || "").split("\n");
  const out = [];
  let activeListSection = false;

  for (const line of lines) {
    const header = line.match(/^##\s+(.+?)\s*$/);
    if (header) {
      activeListSection = listSections.includes(header[1].trim());
      out.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      out.push("");
      continue;
    }

    if (!activeListSection) {
      out.push(line);
      continue;
    }

    if (isIntroListLine(line)) {
      if (!/^чтобы улучшить/i.test(trimmed)) out.push(line);
      continue;
    }

    if (/^[-*•]\s/.test(trimmed)) {
      const item = cleanListItemLine(trimmed);
      if (item && !shouldDropListItem(item)) out.push(`- ${item}`);
      continue;
    }

    const item = cleanListItemLine(trimmed);
    if (item && !shouldDropListItem(item)) out.push(`- ${item}`);
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function promoteSectionHeaders(text, mode = "profile") {
  let out = sanitizeSummaryText(text);
  if (!out) return "";

  const titles =
    mode === "weekly" ? PROFILE_SECTION_TITLES.weekly.ru : PROFILE_SECTION_TITLES.ru;
  const sorted = [...titles].sort((a, b) => b.length - a.length);

  for (const title of sorted) {
    const escaped = escapeRegExp(title);
    out = out.replace(
      new RegExp(`(^|\\n)${escaped}\\s*\\n(?![#*\\-])`, "gmu"),
      `$1## ${title}\n\n`
    );
    out = out.replace(
      new RegExp(`(^|\\n)\\*\\*${escaped}\\*\\*\\s*\\n`, "gmu"),
      `$1## ${title}\n\n`
    );
    out = out.replace(new RegExp(`(^|\\n)##\\s+${escaped}\\s*\\n`, "gmu"), `$1## ${title}\n\n`);
  }

  return normalizeSectionLists(dedupeMarkdownSections(out), mode);
}

function recoverPlainNarrative(raw, mode = "profile") {
  const titles =
    mode === "weekly" ? PROFILE_SECTION_TITLES.weekly.ru : PROFILE_SECTION_TITLES.ru;
  const stripped = cutJsonTail(sanitizeSummaryText(raw));
  const deduped = dedupePlainSectionTitles(stripped, titles);
  return promoteSectionHeaders(deduped, mode);
}

export function normalizeStructuredAnalysis(raw, fallbackText = "", mode = "profile") {
  if (!raw || typeof raw !== "object") return null;

  const extraSections = [];
  for (const [key, value] of Object.entries(raw)) {
    if (KNOWN_STRUCTURED_KEYS.has(key)) continue;
    const chunk = toSummaryText(value);
    if (chunk) extraSections.push(`## ${key}\n\n${chunk}`);
  }

  let summaryText = promoteSectionHeaders(
    toSummaryText(
      raw.summaryText || raw.summary || raw.reportText || raw.text,
      fallbackText
    ),
    mode
  );

  if (extraSections.length) {
    summaryText = [summaryText, ...extraSections].filter(Boolean).join("\n\n");
  }

  const normalized = {
    summaryText,
    keyFindings: filterHumanListItems(asStringArray(raw.keyFindings || raw.findings, 6)),
    likelyDrivers: filterHumanListItems(asStringArray(raw.likelyDrivers || raw.drivers, 6)),
    plan24h: filterHumanListItems(asStringArray(raw.plan24h || raw.dayPlan || raw.microPlan24h, 6)),
    plan7d: filterHumanListItems(asStringArray(raw.plan7d || raw.weekPlan, 8)),
    expectedSignals: filterHumanListItems(
      asStringArray(raw.expectedSignals || raw.successSignals, 8)
    ),
    checkInQuestions: filterHumanListItems(
      asStringArray(raw.checkInQuestions || raw.reviewQuestions, 5)
    ),
  };

  const hasContent =
    normalized.summaryText ||
    normalized.keyFindings.length ||
    normalized.likelyDrivers.length ||
    normalized.plan24h.length ||
    normalized.plan7d.length ||
    normalized.expectedSignals.length ||
    normalized.checkInQuestions.length;

  return hasContent ? normalized : null;
}

/** Единая точка разбора ответа LLM */
export function buildStructuredFromRawReply(raw, mode = "profile", analysisMeta = null) {
  const text = String(raw || "").trim();
  if (!text) {
    return {
      summaryText: "",
      keyFindings: [],
      likelyDrivers: [],
      plan24h: [],
      plan7d: [],
      expectedSignals: [],
      checkInQuestions: [],
    };
  }

  const strict = parseStructuredAiReply(text);
  if (strict && typeof strict === "object") {
    const normalized = normalizeStructuredAnalysis(strict, "", mode);
    if (normalized) {
      if (!normalized.summaryText?.trim()) {
        normalized.summaryText = recoverPlainNarrative(text, mode);
      }
      return normalized;
    }
  }

  const lenient = parseLenientObject(text);
  if (lenient) {
    const normalized = normalizeStructuredAnalysis(lenient, "", mode);
    if (normalized) {
      if (!normalized.summaryText?.trim()) {
        normalized.summaryText = recoverPlainNarrative(text, mode);
      }
      return normalized;
    }
  }

  const summaryText = recoverPlainNarrative(text, mode);

  return {
    summaryText,
    keyFindings: filterHumanListItems(extractStringArrayField(text, "keyFindings")),
    likelyDrivers: filterHumanListItems(extractStringArrayField(text, "likelyDrivers")),
    plan24h: filterHumanListItems(extractStringArrayField(text, "plan24h")),
    plan7d: filterHumanListItems(extractStringArrayField(text, "plan7d")),
    expectedSignals: filterHumanListItems(extractStringArrayField(text, "expectedSignals")),
    checkInQuestions: filterHumanListItems(extractStringArrayField(text, "checkInQuestions")),
  };
}

export function buildStructuredFallback(plainText, analysisMeta, mode = "profile") {
  return buildStructuredFromRawReply(plainText, mode, analysisMeta);
}

export function composeDisplayMarkdown(structured, mode = "profile") {
  const raw = structured?.summaryText?.trim() || "";
  if (!raw) return "";
  return polishReportText(raw, mode);
}

/** Финальная полировка текста отчёта (заголовки ##, списки -, без вопросов в скобках) */
export function polishReportText(text, mode = "profile") {
  const raw = String(text || "").replace(/\r\n/g, "\n").trim();
  if (!raw) return "";

  if (raw.startsWith("{") || raw.includes('"summaryText"')) {
    return composeDisplayMarkdown(buildStructuredFromRawReply(raw, mode), mode);
  }

  return promoteSectionHeaders(raw, mode);
}

export function formatStoredReportText(text, mode = "profile") {
  return polishReportText(text, mode);
}
