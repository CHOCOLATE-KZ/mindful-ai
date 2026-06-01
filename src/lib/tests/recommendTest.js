import { callUnifiedLlm } from "../llm/unifiedClient.js";
import { supabaseAdmin } from "../supabase/admin.js";
import { CATALOG_TEST_HINTS, CATALOG_TEST_KEYS, isValidCatalogKey } from "./catalogMeta.js";
import { countUserChatMessages, getTestsGateStatus } from "./testGate.js";
import { getTestByKeyFromJSON } from "../loadTestsAndExercises.js";

function readEnvIntLocal(name, fallback) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

async function loadChatHistoryForRecommend(supabase, userId) {
  const limit = readEnvIntLocal("CHAT_DB_HISTORY_LIMIT", 80);
  const { data } = await supabase
    .from("ai_messages")
    .select("role, content")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(limit);
  return data || [];
}

function readEnvInt(name, fallback) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

/** Server-side writes bypass RLS (Telegram admin path, web API). */
function getRecommendationsWriteClient(supabase) {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return supabaseAdmin;
  }
  return supabase;
}

export function formatRecommendationRow(row) {
  if (!row) return null;
  const approach = row.approach;
  const href =
    approach === "catalog" && row.catalog_key
      ? `/exercises/${row.catalog_key}?rec=${row.id}`
      : `/exercises/r/${row.id}`;

  let title = row.generated_test?.title || "Тест";
  if (approach === "catalog" && row.catalog_key) {
    const meta = getTestByKeyFromJSON(row.catalog_key);
    title = meta?.title || row.catalog_key.replace(/_/g, " ");
  }

  return {
    id: row.id,
    status: row.status,
    approach,
    catalogKey: row.catalog_key,
    rationale: row.rationale || "",
    title,
    href,
    generatedTest: row.generated_test || null,
    createdAt: row.created_at,
  };
}

const RECOMMENDATION_SELECT =
  "id, status, approach, catalog_key, generated_test, rationale, created_at";

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @returns {Promise<{ generated: object|null, catalog: object|null }>}
 */
export async function getPendingRecommendations(supabase, userId) {
  const { data, error } = await supabase
    .from("ai_test_recommendations")
    .select(RECOMMENDATION_SELECT)
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    if (String(error.message).includes("does not exist")) {
      return { generated: null, catalog: null };
    }
    console.warn("[recommendTest] pending:", error.message);
    return { generated: null, catalog: null };
  }

  const rows = data || [];
  const generatedRow = rows.find((r) => r.approach === "generated");
  const catalogRow = rows.find((r) => r.approach === "catalog");

  return {
    generated: formatRecommendationRow(generatedRow),
    catalog: formatRecommendationRow(catalogRow),
  };
}

/** @deprecated use getPendingRecommendations */
export async function getPendingRecommendation(supabase, userId) {
  const { generated, catalog } = await getPendingRecommendations(supabase, userId);
  return generated || catalog || null;
}

async function loadRecommendationContext(supabase, userId) {
  const [history, { data: notes }, { data: completedTests }] = await Promise.all([
    loadChatHistoryForRecommend(supabase, userId),
    supabase
      .from("notes")
      .select("date, mood, sleep, comment")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(7),
    supabase
      .from("tests_log")
      .select("test_key, result, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const userLines = history
    .filter((m) => m.role === "user")
    .slice(-12)
    .map((m) => String(m.content || "").trim().slice(0, 300))
    .filter(Boolean);

  const { data: summaryRow } = await supabase
    .from("user_settings")
    .select("chat_summary")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    userLines,
    chatSummary: String(summaryRow?.chat_summary || "").trim().slice(0, 800),
    notes: notes || [],
    completedTests: completedTests || [],
  };
}

function parseRecommendationJson(raw) {
  const text = String(raw || "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normalizeGeneratedTest(payload) {
  const title = String(payload?.title || "Персональный опросник").trim().slice(0, 120);
  const description = String(payload?.description || "").trim().slice(0, 400);
  const questions = Array.isArray(payload?.questions) ? payload.questions : [];
  const normalized = questions
    .slice(0, 8)
    .map((q) => {
      const question = String(q?.question || "").trim().slice(0, 280);
      let options = Array.isArray(q?.options)
        ? q.options.map((o) => String(o).trim()).filter(Boolean)
        : [];
      if (options.length < 2) {
        options = ["Совсем нет", "Редко", "Иногда", "Часто"];
      }
      if (options.length > 5) options = options.slice(0, 5);
      return { question, options };
    })
    .filter((q) => q.question);

  if (normalized.length < 3) return null;

  return {
    key: `ai_generated_${Date.now()}`,
    title,
    description,
    time: "3–5 мин",
    questions: normalized,
    scoring: {
      method: "sum",
      ranges: [
        { min: 0, max: Math.floor(normalized.length * 1.5), level: "низкий", color: "green" },
        {
          min: Math.floor(normalized.length * 1.5) + 1,
          max: normalized.length * (normalized[0].options.length - 1),
          level: "умеренный",
          color: "yellow",
        },
      ],
    },
  };
}

function buildFallbackGeneratedTest(ctx) {
  const topic =
    ctx.userLines?.[ctx.userLines.length - 1]?.slice(0, 80) ||
    ctx.chatSummary?.slice(0, 80) ||
    "ваше самочувствие";
  return normalizeGeneratedTest({
    title: "Персональный опросник",
    description: `Короткий опрос по теме вашего диалога: ${topic}`,
    questions: [
      {
        question: "Насколько эта тема занимает ваши мысли в последние дни?",
        options: ["Почти не занимает", "Иногда", "Часто", "Постоянно"],
      },
      {
        question: "Насколько это влияет на сон, работу или отношения?",
        options: ["Не влияет", "Слабо", "Заметно", "Сильно"],
      },
      {
        question: "Насколько вы чувствуете, что можете справиться с ситуацией?",
        options: ["Уверен(а)", "Скорее да", "Скорее нет", "Совсем нет"],
      },
      {
        question: "Хотели бы вы обсудить это подробнее с ассистентом?",
        options: ["Нет", "Возможно", "Да", "Очень хочу"],
      },
    ],
  });
}

function pickCatalogKey(parsed, completedKeys) {
  const key = String(
    parsed?.catalog?.catalogKey || parsed?.catalogKey || ""
  ).trim();
  if (isValidCatalogKey(key) && !completedKeys.includes(key)) return key;
  return CATALOG_TEST_KEYS.find((k) => !completedKeys.includes(k)) || null;
}

function buildDualRecommendationsFromParsed(parsed, ctx, completedKeys) {
  const generatedPayload =
    parsed?.generated ||
    (parsed?.approach === "generated" ? parsed : null);
  let generatedTest = normalizeGeneratedTest(generatedPayload);
  if (!generatedTest) {
    generatedTest = buildFallbackGeneratedTest(ctx);
  }

  const catalogKey = pickCatalogKey(parsed, completedKeys);
  const generatedRationale = String(
    parsed?.generated?.rationale ||
      parsed?.generatedRationale ||
      (parsed?.approach === "generated" ? parsed?.rationale : null) ||
      "Персональный опросник создан на основе вашего диалога с ИИ"
  ).slice(0, 500);

  const catalogRationale = String(
    parsed?.catalog?.rationale ||
      parsed?.catalogRationale ||
      (parsed?.approach === "catalog" ? parsed?.rationale : null) ||
      "Подходящая валидированная шкала из каталога"
  ).slice(0, 500);

  return { generatedTest, catalogKey, generatedRationale, catalogRationale };
}

async function fetchDualFromLlm(ctx, completedKeys) {
  const catalogList = CATALOG_TEST_KEYS.map(
    (k) => `- ${k}: ${CATALOG_TEST_HINTS[k] || k}`
  ).join("\n");

  const llmMessages = [
    {
      role: "system",
      content:
        "Ты подбираешь психологические опросники для пользователя MindfulAI. " +
        "Ответь ТОЛЬКО валидным JSON без markdown. " +
        "ОБЯЗАТЕЛЬНО верни ОБА блока: generated (уникальный опросник 4–6 вопросов Likert) " +
        "и catalog (ключ из списка).",
    },
    {
      role: "user",
      content:
        `Каталог:\n${catalogList}\n\n` +
        `Уже пройдено: ${completedKeys.length ? completedKeys.join(", ") : "ничего"}\n\n` +
        `Резюме чата:\n${ctx.chatSummary || "—"}\n\n` +
        `Последние реплики:\n${ctx.userLines.join("\n---\n") || "—"}\n\n` +
        `JSON:\n{"catalog":{"catalogKey":"anxiety_gad7","rationale":"..."},` +
        `"generated":{"title":"...","description":"...","rationale":"...",` +
        `"questions":[{"question":"...","options":["a","b","c","d"]}]}}`,
    },
  ];

  try {
    const { reply, error } = await callUnifiedLlm(llmMessages, {
      temperature: 0.25,
      maxTokens: 1200,
      skipContextBudget: true,
    });
    if (!error && reply) {
      const parsed = parseRecommendationJson(reply);
      if (parsed) {
        return buildDualRecommendationsFromParsed(parsed, ctx, completedKeys);
      }
    }
  } catch (e) {
    console.warn("[recommendTest] LLM:", e?.message || e);
  }

  return buildDualRecommendationsFromParsed(null, ctx, completedKeys);
}

async function skipAllPendingRecommendations(supabase, userId) {
  const db = getRecommendationsWriteClient(supabase);
  await db
    .from("ai_test_recommendations")
    .update({ status: "skipped", completed_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "pending");
}

/**
 * Fill missing pending recommendations (generated + catalog).
 */
export async function ensurePendingRecommendations(supabase, userId, options = {}) {
  const gate = await getTestsGateStatus(supabase, userId);
  if (!gate.unlocked) {
    return {
      recommendations: { generated: null, catalog: null },
      gate,
      created: false,
      error: "tests_locked",
    };
  }

  const existing = await getPendingRecommendations(supabase, userId);
  if (existing.generated && existing.catalog && !options.force) {
    return { recommendations: existing, created: false, gate };
  }

  return createTestRecommendations(supabase, userId, options);
}

/**
 * Create both: personal generated test + catalog recommendation.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @param {{ force?: boolean, fillMissing?: boolean }} options
 */
export async function createTestRecommendations(supabase, userId, options = {}) {
  const gate = await getTestsGateStatus(supabase, userId);
  if (!gate.unlocked) {
    return { error: "tests_locked", gate };
  }

  const existing = await getPendingRecommendations(supabase, userId);
  const needGenerated = options.force || !existing.generated;
  const needCatalog = options.force || !existing.catalog;

  if (!needGenerated && !needCatalog) {
    return { recommendations: existing, created: false };
  }

  if (options.force) {
    await skipAllPendingRecommendations(supabase, userId);
  }

  const ctx = await loadRecommendationContext(supabase, userId);
  const completedKeys = [
    ...new Set((ctx.completedTests || []).map((t) => t.test_key).filter(Boolean)),
  ];

  const dual = await fetchDualFromLlm(ctx, completedKeys);
  const writeClient = getRecommendationsWriteClient(supabase);
  const rowsToInsert = [];

  if (needGenerated && dual.generatedTest) {
    rowsToInsert.push({
      user_id: userId,
      status: "pending",
      approach: "generated",
      catalog_key: null,
      generated_test: dual.generatedTest,
      rationale: dual.generatedRationale,
    });
  }

  if (needCatalog && dual.catalogKey) {
    rowsToInsert.push({
      user_id: userId,
      status: "pending",
      approach: "catalog",
      catalog_key: dual.catalogKey,
      generated_test: null,
      rationale: dual.catalogRationale,
    });
  }

  if (rowsToInsert.length === 0) {
    return { skipped: true, reason: "nothing_to_insert", recommendations: existing };
  }

  const { error: insErr } = await writeClient
    .from("ai_test_recommendations")
    .insert(rowsToInsert);

  if (insErr) {
    console.warn("[recommendTest] insert:", insErr.message);
    return { error: insErr.message, recommendations: existing };
  }

  const recommendations = await getPendingRecommendations(supabase, userId);
  return {
    recommendations,
    created: true,
  };
}

/** @deprecated alias */
export async function createTestRecommendation(supabase, userId, options = {}) {
  const result = await createTestRecommendations(supabase, userId, options);
  if (result.recommendations) {
    return {
      ...result,
      recommendation: result.recommendations.generated || result.recommendations.catalog || null,
    };
  }
  return result;
}

/**
 * Auto-recommend after chat if interval met.
 */
export async function maybeAutoRecommendTest(supabase, userId) {
  const gate = await getTestsGateStatus(supabase, userId);
  if (!gate.unlocked) return null;

  const pending = await getPendingRecommendations(supabase, userId);
  if (!pending.generated || !pending.catalog) {
    return ensurePendingRecommendations(supabase, userId);
  }

  const interval = readEnvInt("TESTS_AUTO_RECOMMEND_EVERY_USER_MSGS", 12);
  const messageCount = await countUserChatMessages(supabase, userId);
  if (messageCount < interval) return null;

  const { data: lastRecs } = await supabase
    .from("ai_test_recommendations")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (lastRecs?.[0]?.created_at) {
    const hoursSince =
      (Date.now() - new Date(lastRecs[0].created_at).getTime()) / (1000 * 60 * 60);
    const minHours = readEnvInt("TESTS_RECOMMEND_MIN_HOURS_BETWEEN", 24);
    if (hoursSince < minHours) return null;
  }

  if (messageCount % interval !== 0) return null;

  return createTestRecommendations(supabase, userId, { force: true });
}

export async function completeRecommendation(supabase, userId, recommendationId) {
  const writeClient = getRecommendationsWriteClient(supabase);
  const { error } = await writeClient
    .from("ai_test_recommendations")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", recommendationId)
    .eq("user_id", userId);

  if (error) return false;

  await ensurePendingRecommendations(supabase, userId);
  return true;
}

export async function skipRecommendation(supabase, userId, recommendationId) {
  const writeClient = getRecommendationsWriteClient(supabase);
  const { error } = await writeClient
    .from("ai_test_recommendations")
    .update({ status: "skipped", completed_at: new Date().toISOString() })
    .eq("id", recommendationId)
    .eq("user_id", userId);

  if (error) return false;

  await ensurePendingRecommendations(supabase, userId);
  return true;
}
