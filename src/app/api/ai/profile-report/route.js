import { supabaseServer } from "@/lib/supabase/server";
import { unifiedLlmConfig } from "@/lib/llm/unifiedClient";

const LMSTUDIO_BASE_URL = unifiedLlmConfig.baseUrl;
const LMSTUDIO_MODEL = unifiedLlmConfig.model;

function avg(list) {
  if (!list.length) return null;
  return list.reduce((a, b) => a + b, 0) / list.length;
}

function asNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function trendSlope(values) {
  const y = values.map(asNumber).filter((v) => v != null);
  if (y.length < 3) return null;
  const n = y.length;
  const xMean = (n - 1) / 2;
  const yMean = avg(y);
  if (yMean == null) return null;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i += 1) {
    const xDiff = i - xMean;
    const yDiff = y[i] - yMean;
    numerator += xDiff * yDiff;
    denominator += xDiff * xDiff;
  }
  if (denominator === 0) return null;
  return numerator / denominator;
}

function summarizeTests(testRows) {
  const grouped = new Map();
  for (const row of testRows || []) {
    const key = String(row?.test_key || "unknown");
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }

  const byTest = [];
  for (const [testKey, items] of grouped.entries()) {
    const sorted = [...items].sort(
      (a, b) => new Date(a?.created_at || 0).getTime() - new Date(b?.created_at || 0).getTime()
    );
    const scores = sorted
      .map((item) => asNumber(item?.result?.score))
      .filter((v) => v != null);
    const last = sorted[sorted.length - 1] || null;
    const firstScore = scores.length ? scores[0] : null;
    const lastScore = scores.length ? scores[scores.length - 1] : null;

    byTest.push({
      testKey,
      attempts: sorted.length,
      latestAt: last?.created_at || null,
      latestScore: asNumber(last?.result?.score),
      latestLevel: last?.result?.level || null,
      scoreDelta: firstScore != null && lastScore != null ? Number((lastScore - firstScore).toFixed(2)) : null,
      scoreTrendSlope: scores.length >= 3 ? Number(trendSlope(scores).toFixed(3)) : null,
    });
  }

  byTest.sort((a, b) => new Date(b.latestAt || 0).getTime() - new Date(a.latestAt || 0).getTime());

  return {
    totalAttempts: (testRows || []).length,
    uniqueTests: byTest.length,
    byTest,
    recent: byTest.slice(0, 5),
  };
}

function detectPsychSignals(texts) {
  const normalized = texts
    .map((t) => String(t || "").toLowerCase())
    .filter(Boolean);

  const dictionaries = {
    anxiety: ["тревог", "паник", "anx", "worry", "беспокой"],
    lowMood: ["груст", "пусто", "безнадеж", "depress", "апат"],
    stress: ["стресс", "давлен", "перегруз", "burnout", "выгоран"],
    sleep: ["не спал", "бессон", "сон", "insomnia", "ночью"],
    rumination: ["постоянно думаю", "накруч", "зацик", "ruminat", "overthink"],
    cbtDistortions: ["всегда", "никогда", "катастроф", "я виноват", "черно-бел", "ужасно"],
  };

  const counts = {};
  for (const [key, markers] of Object.entries(dictionaries)) {
    let score = 0;
    for (const text of normalized) {
      if (markers.some((m) => text.includes(m))) score += 1;
    }
    counts[key] = score;
  }
  return counts;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function confidenceLabel(payload) {
  let score = 0;
  if ((payload?.sources?.notesCount || 0) >= 14) score += 1;
  if ((payload?.sources?.chatsCount || 0) >= 20) score += 1;
  if ((payload?.sources?.testsCount || 0) >= 3) score += 1;
  if ((payload?.derived?.cbtNotesCount || 0) >= 3) score += 1;

  if (score >= 3) return "high";
  if (score >= 2) return "medium";
  return "low";
}

function testSeveritySignal(testsSummary) {
  const levels = (testsSummary?.byTest || [])
    .map((item) => String(item?.latestLevel || "").toLowerCase())
    .filter(Boolean);

  const highMarkers = [
    "high", "severe", "very high", "тяж", "высок", "крит", "жоғары", "ауыр",
  ];

  return levels.some((level) => highMarkers.some((marker) => level.includes(marker)));
}

function buildAnalysisMeta(payload) {
  const avgMood = asNumber(payload?.stats?.avgMood);
  const avgStress = asNumber(payload?.stats?.avgStress);
  const avgEnergy = asNumber(payload?.stats?.avgEnergy);
  const moodTrend = asNumber(payload?.derived?.moodTrendSlope14d);
  const sleepTrend = asNumber(payload?.derived?.sleepTrendSlope14d);
  const cbtCompletionRate = asNumber(payload?.derived?.cbtCompletionRate);
  const psychSignals = payload?.derived?.psychSignals || {};
  const signalLoad = Object.values(psychSignals).reduce((sum, v) => sum + (asNumber(v) || 0), 0);
  const hasSevereTestLevel = testSeveritySignal(payload?.testsSummary);

  let risk = 0;
  if (avgMood != null) {
    if (avgMood <= 4) risk += 25;
    else if (avgMood <= 5.5) risk += 12;
  }
  if (avgStress != null) {
    if (avgStress >= 7) risk += 20;
    else if (avgStress >= 5) risk += 10;
  }
  if (moodTrend != null) {
    if (moodTrend <= -0.2) risk += 20;
    else if (moodTrend <= -0.08) risk += 10;
  }
  if (sleepTrend != null && sleepTrend < -8) risk += 8;
  if (signalLoad >= 10) risk += 15;
  else if (signalLoad >= 5) risk += 8;
  if (hasSevereTestLevel) risk += 15;

  let resources = 0;
  if (avgEnergy != null) {
    if (avgEnergy >= 7) resources += 20;
    else if (avgEnergy >= 5) resources += 10;
  }
  if (avgMood != null && avgMood >= 6.5) resources += 15;
  if (moodTrend != null && moodTrend >= 0.08) resources += 12;
  if (sleepTrend != null && sleepTrend > 6) resources += 8;
  if (cbtCompletionRate != null) {
    if (cbtCompletionRate >= 0.7) resources += 20;
    else if (cbtCompletionRate >= 0.4) resources += 10;
  }
  if ((payload?.testsSummary?.totalAttempts || 0) >= 3) resources += 10;
  if ((payload?.sources?.notesCount || 0) >= 10) resources += 8;

  return {
    riskIndex: clamp(Math.round(risk), 0, 100),
    resourceIndex: clamp(Math.round(resources), 0, 100),
    confidence: confidenceLabel(payload),
    evidence: {
      notesCount: payload?.sources?.notesCount || 0,
      chatsCount: payload?.sources?.chatsCount || 0,
      testsCount: payload?.sources?.testsCount || 0,
      cbtNotesCount: payload?.derived?.cbtNotesCount || 0,
      cbtCompletionRate: cbtCompletionRate != null ? cbtCompletionRate : null,
      topSignals: Object.entries(psychSignals)
        .filter(([, value]) => asNumber(value) > 0)
        .sort((a, b) => (asNumber(b[1]) || 0) - (asNumber(a[1]) || 0))
        .slice(0, 3)
        .map(([name, count]) => ({ name, count })),
    },
  };
}

function toISODate(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function extractKeywords(texts, limit = 8) {
  const stop = new Set([
    "and","the","this","that","with","from","into","about","your","you","for","are","was","were","have",
    "i","me","my","we","our","us","they","them","their","to","of","in","on","a","an","it","is","be",
  ]);
  const counts = new Map();
  for (const t of texts) {
    const words = String(t || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, " ")
      .split(/\s+/)
      .filter((w) => w && w.length >= 4 && !stop.has(w));
    for (const w of words) counts.set(w, (counts.get(w) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

async function callLmStudio(messages) {
  try {
    const resp = await fetch(`${LMSTUDIO_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: LMSTUDIO_MODEL,
        messages,
        temperature: 0.6,
        max_tokens: 1024,
      }),
    });

    const raw = await resp.text();
    if (!resp.ok) return { error: `LM Studio error (${resp.status}): ${raw.slice(0, 300)}` };

    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      return { error: `LM Studio returned non-JSON: ${raw.slice(0, 200)}` };
    }

    const reply = json?.choices?.[0]?.message?.content || "";
    return { reply: reply.trim() };
  } catch (e) {
    return { error: e?.message || String(e) };
  }
}

function extractJsonCandidate(text) {
  const source = String(text || "").trim();
  if (!source) return null;

  const fencedMatch = source.match(/```json\s*([\s\S]*?)```/i) || source.match(/```\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = source.indexOf("{");
  const lastBrace = source.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return source.slice(firstBrace, lastBrace + 1);
  }

  return null;
}

function parseStructuredAiReply(text) {
  const candidate = extractJsonCandidate(text);
  if (!candidate) return null;
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function asStringArray(value, limit = 6) {
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

function normalizeStructuredAnalysis(raw, fallbackText = "") {
  if (!raw || typeof raw !== "object") return null;

  const summaryText = toSummaryText(
    raw.summaryText || raw.summary || raw.reportText || raw.text,
    fallbackText
  );

  const normalized = {
    summaryText,
    keyFindings: asStringArray(raw.keyFindings || raw.findings, 6),
    likelyDrivers: asStringArray(raw.likelyDrivers || raw.drivers, 6),
    plan24h: asStringArray(raw.plan24h || raw.dayPlan || raw.microPlan24h, 6),
    plan7d: asStringArray(raw.plan7d || raw.weekPlan, 8),
    expectedSignals: asStringArray(raw.expectedSignals || raw.successSignals, 8),
    checkInQuestions: asStringArray(raw.checkInQuestions || raw.reviewQuestions, 5),
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

function buildStructuredFallback(plainText, analysisMeta) {
  return {
    summaryText: String(plainText || "").trim(),
    keyFindings: [],
    likelyDrivers: (analysisMeta?.evidence?.topSignals || []).map(
      (signal) => `${signal.name}: ${signal.count}`
    ),
    plan24h: [],
    plan7d: [],
    expectedSignals: [],
    checkInQuestions: [],
  };
}

export async function GET(req) {
  const supabase = await supabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("ai_reports")
    .select("id, text, mode, generated_at")
    .eq("user_id", user.id)
    .order("generated_at", { ascending: false })
    .limit(10);

  if (error) {
    // Table may not exist yet — return empty gracefully
    return Response.json({ reports: [] });
  }

  return Response.json({ reports: data || [] });
}

export async function POST(req) {
  const supabase = await supabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let mode = "profile";
  let language = "ru";
  try {
    const body = await req.json();
    if (body?.mode === "weekly") mode = "weekly";
    if (body?.mode === "profile") mode = "profile";
    if (body?.language) language = body.language;
  } catch {
    // ignore invalid JSON, default to profile
  }

  const [{ data: settings }, { data: notes }, { data: messages }, { data: tests }, { data: previousReports }] = await Promise.all([
    supabase.from("user_settings").select("data_sharing_ai").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("notes")
      .select("date, created_at, note_type, mood, sleep, comment, energy, stress, nutrition, exercise, hobbies, social, abc_a, abc_b, abc_c")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(60),
    supabase
      .from("ai_messages")
      .select("role, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from("tests_log")
      .select("test_key, result, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from("ai_reports")
      .select("text, generated_at, mode")
      .eq("user_id", user.id)
      .order("generated_at", { ascending: false })
      .limit(2),
  ]);

  if (settings?.data_sharing_ai === false) {
    return Response.json({ error: "AI analysis disabled in privacy settings" }, { status: 403 });
  }

  const moodList = (notes || []).map((n) => n.mood).filter((v) => typeof v === "number");
  const sleepList = (notes || []).map((n) => n.sleep).filter((v) => typeof v === "number");
  const stressList = (notes || []).map((n) => asNumber(n.stress)).filter((v) => v != null);
  const energyList = (notes || []).map((n) => asNumber(n.energy)).filter((v) => v != null);
  const avgMood = avg(moodList);
  const avgSleep = avg(sleepList);
  const avgStress = avg(stressList);
  const avgEnergy = avg(energyList);

  const last14 = (notes || []).slice(0, 14);
  const moodByDay = {};
  for (const n of last14) {
    const day = toISODate(n.date || n.created_at || new Date());
    moodByDay[day] = moodByDay[day] || [];
    if (typeof n.mood === "number") moodByDay[day].push(n.mood);
  }
  const moodSeries = Object.entries(moodByDay)
    .map(([day, arr]) => ({
      day,
      mood: avg(arr),
    }))
    .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

  const moodTrend = trendSlope(moodSeries.map((d) => d.mood));
  const sleepTrend = trendSlope((notes || []).slice(0, 14).reverse().map((n) => asNumber(n.sleep)));

  const noteTexts = (notes || []).map((n) => n.comment).filter(Boolean);
  const chatTexts = (messages || [])
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .filter(Boolean);

  const abcNotes = (notes || []).filter(
    (n) => n.note_type === "abc" || n.abc_a || n.abc_b || n.abc_c
  );
  const cbtCompletionRate =
    abcNotes.length > 0
      ? Number(
          (
            abcNotes.filter((n) => n.abc_a && n.abc_b && n.abc_c).length / abcNotes.length
          ).toFixed(2)
        )
      : null;

  const testsSummary = summarizeTests(tests || []);
  const psychSignals = detectPsychSignals([...noteTexts, ...chatTexts]);

  const topTopics = extractKeywords([...noteTexts, ...chatTexts], 8);

  const payload = {
    userId: user.id,
    sources: {
      notesCount: (notes || []).length,
      chatsCount: (messages || []).length,
      testsCount: (tests || []).length,
    },
    stats: {
      totalNotes: (notes || []).length,
      totalMessages: (messages || []).length,
      totalTests: (tests || []).length,
      avgMood: avgMood != null ? Number(avgMood.toFixed(2)) : null,
      avgSleepMinutes: avgSleep != null ? Math.round(avgSleep) : null,
      avgStress: avgStress != null ? Number(avgStress.toFixed(2)) : null,
      avgEnergy: avgEnergy != null ? Number(avgEnergy.toFixed(2)) : null,
    },
    derived: {
      moodTrendSlope14d: moodTrend != null ? Number(moodTrend.toFixed(3)) : null,
      sleepTrendSlope14d: sleepTrend != null ? Number(sleepTrend.toFixed(3)) : null,
      cbtNotesCount: abcNotes.length,
      cbtCompletionRate,
      psychSignals,
    },
    testsSummary,
    moodSeries,
    topTopics,
    recentNotes: (notes || []).slice(0, 10).map((n) => ({
      date: n.date,
      noteType: n.note_type,
      mood: n.mood,
      sleep: n.sleep,
      energy: n.energy,
      stress: n.stress,
      text: n.comment,
      abc: n.note_type === "abc"
        ? {
            a: n.abc_a || null,
            b: n.abc_b || null,
            c: n.abc_c || null,
          }
        : null,
    })),
    recentChats: (messages || []).slice(0, 12).map((m) => ({
      role: m.role,
      text: m.content,
      created_at: m.created_at,
    })),
  };

  const analysisMeta = buildAnalysisMeta(payload);

  const langInstructions = {
    ru: "Отвечай ТОЛЬКО на русском языке. Не используй английский ни в одном слове.",
    kz: "Тек қана қазақ тілінде жауап бер. Орыс немесе ағылшын тілдерін пайдаланба.",
    en: "Reply in English only.",
  };
  const langNote = langInstructions[language] || langInstructions.ru;

  const systemPrompt =
    "You are MindfulAI — a warm, supportive AI assistant for emotional well-being. " +
    "You are NOT a licensed therapist. Never diagnose or give medical advice. " +
    "Use gentle, empathetic, non-judgmental language. " +
    langNote;

  const sectionLabels = {
    ru: {
      weekly: ["Итоги недели", "Изменения", "Сигналы", "Советы"],
      profile: ["Общее", "Тенденции", "Темы", "Что помогает", "Риски", "Следующие шаги"],
    },
    kz: {
      weekly: ["Апта қорытындысы", "Өзгерістер", "Белгілер", "Кеңестер"],
      profile: ["Жалпы", "Үрдістер", "Тақырыптар", "Не көмектеседі", "Тәуекелдер", "Келесі қадамдар"],
    },
    en: {
      weekly: ["Summary", "Changes", "Signals", "Tips"],
      profile: ["Overview", "Trends", "Topics", "What helps", "Risks", "Next steps"],
    },
  };

  const labels = (sectionLabels[language] || sectionLabels.ru);

  // Build previous report context for comparison
  const prevReports = previousReports || [];
  let previousContext = "";
  if (prevReports.length > 0) {
    const prev = prevReports[0];
    const prevDate = new Date(prev.generated_at).toLocaleDateString(
      language === "kz" ? "kk-KZ" : language === "en" ? "en-US" : "ru-RU"
    );
    previousContext =
      `\n\nPREVIOUS REPORT (${prevDate}):\n${prev.text.slice(0, 800)}\n\n` +
      `IMPORTANT: Compare current data with the previous report. Explicitly mention what improved, what got worse, what stayed the same. This comparison is a key required section.`;
  }

  // Slimmed payload for weekly mode — remove statistical noise, keep meaningful signals
  const weeklyPayload = {
    period: "last 7 days",
    keyMetrics: {
      avgMood: payload.stats.avgMood,
      avgSleepHours: payload.stats.avgSleepMinutes != null ? +(payload.stats.avgSleepMinutes / 60).toFixed(1) : null,
      avgEnergy: payload.stats.avgEnergy,
      avgStress: payload.stats.avgStress,
    },
    moodTrend: payload.derived.moodTrendSlope14d,
    sleepTrend: payload.derived.sleepTrendSlope14d,
    psychSignals: payload.derived.psychSignals,
    diaryEntries: (payload.recentNotes || []).slice(0, 10).map((n) => ({
      date: n.date,
      mood: n.mood,
      sleep: n.sleep,
      energy: n.energy,
      stress: n.stress,
      text: n.text || null,
      cbt: n.abc ? { situation: n.abc.a, thoughts: n.abc.b, reaction: n.abc.c } : null,
    })),
    topKeywords: payload.topTopics,
    chatThemes: (payload.recentChats || [])
      .filter((m) => m.role === "user")
      .slice(0, 8)
      .map((m) => m.text),
    tests: (payload.testsSummary?.byTest || []).slice(0, 3).map((t) => ({
      name: t.testKey,
      latestLevel: t.latestLevel,
      latestScore: t.latestScore,
      trend: t.scoreTrendSlope,
    })),
  };

  const weeklyPrompt =
    `Ты — MindfulAI, когнитивно-аналитический помощник. Напиши НЕДЕЛЬНЫЙ ОТЧЁТ на ${language === "ru" ? "русском" : language === "kz" ? "казахском" : "английском"} языке.

ФОРМАТ ОТВЕТА: строгий JSON без markdown-обёрток, без \`\`\`. Ключи:
- summaryText (строка с markdown: используй **жирный** для ключевых инсайтов, эмодзи для разделов)
- keyFindings (массив строк — конкретные наблюдения, ссылаясь на реальный текст дневника)
- likelyDrivers (массив строк — конкретные слова-маркеры и темы, найденные в дневнике)
- plan24h (массив строк — 2-3 конкретных действия на сегодня)
- plan7d (массив строк — 3-4 цели на неделю)
- expectedSignals (массив строк — как пользователь узнает, что стало лучше)
- checkInQuestions (массив строк — 2-3 рефлексивных вопроса к себе)

ПРАВИЛА ДЛЯ summaryText:
1. 📋 **Итоги недели** — напиши уникальный вводный абзац. Если в дневнике упомянуты конкретные люди, события или страхи — говори о них прямо (например, «на этой неделе ты несколько раз упоминал экзамены и ощущение давления»).
2. 📊 **Ключевые метрики** — только сон, настроение, энергия. Без количества сообщений и записей. Если данных нет — пропусти.
3. 🔑 **Темы недели** — вытащи 3-5 конкретных слов-маркеров прямо из текстов дневника. Объясни, что они говорят о состоянии.
4. ⚠️ **Сигналы риска** — если есть тревожные паттерны (негативные слова, низкое настроение, плохой сон), подсвети их прямо. Не сглаживай.
5. 💡 **Главный инсайт недели** — одно самое важное наблюдение жирным шрифтом.

ВАЖНО:
- Не придумывай факты, которых нет в данных.
- Не упоминай технические поля (user_id, JSON-ключи).
- Если в дневнике мало текстов — честно скажи, что анализ ограничен, и опирайся на цифры.
- Тон: тёплый, прямой, как коллега-психолог, а не статистик.
${previousContext ? `\nСРАВНЕНИЕ С ПРОШЛЫМ ОТЧЁТОМ:\n${previousContext}` : ""}

ДАННЫЕ ПОЛЬЗОВАТЕЛЯ:
${JSON.stringify(weeklyPayload, null, 2)}`;

  const profilePrompt = `
Ты — MindfulAI, экспертный психолог-аналитик с глубоким пониманием когнитивно-поведенческой терапии. 
Твоя задача: составить ПОЛНЫЙ ПСИХОЛОГИЧЕСКИЙ ПОРТРЕТ пользователя на основе его данных.

ОТВЕТЬ СТРОГО В ФОРМАТЕ JSON (без разметки \`\`\`, только чистый объект).
Ключи: summaryText, keyFindings, likelyDrivers, plan24h, plan7d, expectedSignals, checkInQuestions.

ТРЕБОВАНИЯ К СОДЕРЖАНИЮ:
1. **summaryText (Главный анализ):** 
   - Используй Markdown (жирный текст, эмодзи). 
   - Это должен быть связный текст, разделенный на логические блоки: «Общее состояние», «Динамика и тренды», «Темы и триггеры», «Риски и ресурсы».
   - **ВАЖНО:** Проведи контент-анализ. Найди в дневнике конкретные слова-маркеры (например: "ректор", "наказание", "учеба", "страх"). Не сглаживай острые углы — если есть тревожные темы, опиши их прямо.
   - Ищи связи: как события (учеба, встречи) влияют на метрики (сон, настроение).

2. **keyFindings (Наблюдения):** Список из 4-5 глубоких инсайтов. Не пиши "сон 4 часа", пиши "Дефицит сна коррелирует с ростом агрессивных мыслей в дневнике".

3. **likelyDrivers (Триггеры):** Список конкретных тем, людей или событий, которые больше всего влияют на состояние пользователя сейчас.

4. **Риски (внутри summaryText или keyFindings):** Если есть упоминания самоповреждения, агрессии или глубокой депрессии — выдели это как приоритетную зону внимания.

5. **Планы (plan24h, plan7d):** Конкретные психологические упражнения или действия, а не просто "отдохни". Например: "Техника децентрации при мыслях о ректоре".

СТИЛЬ:
- Профессиональный, эмпатичный, но аналитически точный. 
- Избегай общих фраз типа "все будет хорошо".
- ТОЛЬКО на русском языке.
${previousContext ? `\nСРАВНЕНИЕ С ПРОШЛЫМ ОТЧЁТОМ:\n${previousContext}` : ""}

ДАННЫЕ ДЛЯ АНАЛИЗА:
${JSON.stringify(payload, null, 2)}`;

  const userPrompt = mode === "weekly" ? weeklyPrompt : profilePrompt;

  const lm = await callLmStudio([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  if (lm.error) {
    return Response.json({ error: lm.error }, { status: 502 });
  }

  const structuredParsed = parseStructuredAiReply(lm.reply);
  const structuredAnalysis =
    normalizeStructuredAnalysis(structuredParsed, "") ||
    buildStructuredFallback(lm.reply || "", analysisMeta);
  const finalText = structuredAnalysis?.summaryText || lm.reply || "";

  const generatedAt = new Date().toISOString();

  // Save to history (ignore errors — table may not exist yet in Supabase)
  try {
    await supabase
      .from("ai_reports")
      .insert({ user_id: user.id, text: finalText, mode, generated_at: generatedAt });
  } catch {
    // silently ignore if table doesn't exist
  }

  return Response.json({
    text: finalText,
    mode,
    generatedAt,
    hasPreviousComparison: prevReports.length > 0,
    analysisMeta,
    structuredAnalysis,
  });
}
