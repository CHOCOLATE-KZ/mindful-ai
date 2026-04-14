import { supabaseServer } from "@/lib/supabase/server";

const LMSTUDIO_BASE_URL = (process.env.LMSTUDIO_BASE_URL || "http://127.0.0.1:1234").trim();
const LMSTUDIO_MODEL = (process.env.LMSTUDIO_MODEL || "gpt-oss-20b").trim();

function avg(list) {
  if (!list.length) return null;
  return list.reduce((a, b) => a + b, 0) / list.length;
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

  const [{ data: settings }, { data: notes }, { data: messages }, { data: previousReports }] = await Promise.all([
    supabase.from("user_settings").select("data_sharing_ai").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("notes")
      .select("date, mood, sleep, comment")
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
  const avgMood = avg(moodList);
  const avgSleep = avg(sleepList);

  const last14 = (notes || []).slice(0, 14);
  const moodByDay = {};
  for (const n of last14) {
    const day = toISODate(n.date || n.created_at || new Date());
    moodByDay[day] = moodByDay[day] || [];
    if (typeof n.mood === "number") moodByDay[day].push(n.mood);
  }
  const moodSeries = Object.entries(moodByDay).map(([day, arr]) => ({
    day,
    mood: avg(arr),
  }));

  const noteTexts = (notes || []).map((n) => n.comment).filter(Boolean);
  const chatTexts = (messages || [])
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .filter(Boolean);

  const topTopics = extractKeywords([...noteTexts, ...chatTexts], 8);

  const payload = {
    userId: user.id,
    stats: {
      totalNotes: (notes || []).length,
      totalMessages: (messages || []).length,
      avgMood: avgMood != null ? Number(avgMood.toFixed(2)) : null,
      avgSleepMinutes: avgSleep != null ? Math.round(avgSleep) : null,
    },
    moodSeries,
    topTopics,
    recentNotes: (notes || []).slice(0, 10).map((n) => ({
      date: n.date,
      mood: n.mood,
      sleep: n.sleep,
      text: n.comment,
    })),
    recentChats: (messages || []).slice(0, 12).map((m) => ({
      role: m.role,
      text: m.content,
      created_at: m.created_at,
    })),
  };

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

  const userPrompt =
    mode === "weekly"
      ? `Create a WEEKLY SUMMARY in ${language === "ru" ? "Russian" : language === "kz" ? "Kazakh" : "English"}. ` +
        `Structure: **${labels.weekly[0]}**, **${labels.weekly[1]}** (if any), ` +
        `**${labels.weekly[2]}** (stress/energy patterns), **${labels.weekly[3]}** (2-3 gentle suggestions). ` +
        "Keep it concise and warm. Do NOT repeat user IDs or technical field names in the output.\n\n" +
        `DATA:\n${JSON.stringify(payload, null, 2)}${previousContext}`
      : `Create a PERSONAL WELLBEING REPORT in ${language === "ru" ? "Russian" : language === "kz" ? "Kazakh" : "English"}. ` +
        `Use these sections: **${labels.profile[0]}**, **${labels.profile[1]}**, **${labels.profile[2]}**, ` +
        `**${labels.profile[3]}**, **${labels.profile[4]}**, **${labels.profile[5]}**. ` +
        "Use bullet points. Be warm and supportive. " +
        "Do NOT mention user IDs, technical field names, or raw JSON keys in the output.\n\n" +
        `DATA:\n${JSON.stringify(payload, null, 2)}${previousContext}`;

  const lm = await callLmStudio([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  if (lm.error) {
    return Response.json({ error: lm.error }, { status: 502 });
  }

  const generatedAt = new Date().toISOString();

  // Save to history (ignore errors — table may not exist yet in Supabase)
  try {
    await supabase
      .from("ai_reports")
      .insert({ user_id: user.id, text: lm.reply || "", mode, generated_at: generatedAt });
  } catch {
    // silently ignore if table doesn't exist
  }

  return Response.json({
    text: lm.reply || "",
    mode,
    generatedAt,
    hasPreviousComparison: prevReports.length > 0,
  });
}
