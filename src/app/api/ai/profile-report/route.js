import { supabaseServer } from "@/lib/supabase/server";

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

function useLmStudio() {
  return Boolean(process.env.LMSTUDIO_BASE_URL || process.env.LMSTUDIO_MODEL);
}

function getLmStudioConfig() {
  const base = (process.env.LMSTUDIO_BASE_URL || "http://127.0.0.1:1234").trim();
  const model = (process.env.LMSTUDIO_MODEL || "").trim();
  return { base, model };
}

async function callLmStudio(messages) {
  const { base, model } = getLmStudioConfig();
  if (!model) return { error: "LMSTUDIO_MODEL is not set" };

  const resp = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.6,
      max_tokens: 500,
    }),
  });

  const raw = await resp.text();
  if (!resp.ok) return { error: `LM Studio error (${resp.status}): ${raw}` };

  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    return { error: `LM Studio returned non-JSON: ${raw}` };
  }

  const reply = json?.choices?.[0]?.message?.content || "";
  return { reply: reply.trim() };
}

export async function POST(req) {
  const supabase = await supabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let mode = "profile";
  try {
    const body = await req.json();
    if (body?.mode === "weekly") mode = "weekly";
    if (body?.mode === "profile") mode = "profile";
  } catch {
    // ignore invalid JSON, default to profile
  }

  const [{ data: settings }, { data: notes }, { data: messages }] = await Promise.all([
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

  if (!useLmStudio()) {
    return Response.json({ error: "LM Studio is not configured" }, { status: 503 });
  }

  const systemPrompt =
    "You are MindfulAI, a supportive assistant for emotional well-being. " +
    "You are not a licensed therapist. Do not diagnose or provide medical advice. " +
    "Use gentle, non-judgmental language.";

  const userPrompt =
    mode === "weekly"
      ? "Create a WEEKLY SUMMARY based on the data below. " +
        "Use this structure: Summary, Changes vs previous week (if any), " +
        "Signals (stress/energy), and 2-3 gentle suggestions. Keep it short.\n\n" +
        `DATA:\n${JSON.stringify(payload, null, 2)}`
      : "Create a PERSONAL REPORT based on the data below. " +
        "Use this structure: Summary, Trends, Topics, What helps, Risks, Next steps. " +
        "Use short paragraphs and bullet points where helpful.\n\n" +
        `DATA:\n${JSON.stringify(payload, null, 2)}`;

  const lm = await callLmStudio([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  if (lm.error) {
    return Response.json({ error: lm.error }, { status: 502 });
  }

  return Response.json({
    text: lm.reply || "",
    mode,
    generatedAt: new Date().toISOString(),
  });
}
