import { supabaseServer } from "@/lib/supabase/server";

const SYSTEM_PROMPT =
  "Ты эмпатичный психологический ассистент. Отвечай коротко, тепло, без клише. " +
  "Давай простые практические шаги (дыхание, сон, движение, дневник). " +
  "Избегай диагнозов и директив. Если нужен специалист — мягко предложи обратиться.";

const LMSTUDIO_BASE_URL = (process.env.LMSTUDIO_BASE_URL || "http://127.0.0.1:1234").trim();
const LMSTUDIO_MODEL = (process.env.LMSTUDIO_MODEL || "gpt-oss-20b").trim();

async function buildUserContext(supabase, userId) {
  const [{ data: profile }, { data: settings }, { data: lastNote }] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", userId).maybeSingle(),
    supabase.from("user_settings").select("language, data_sharing_ai, ai_personalization").eq("user_id", userId).maybeSingle(),
    supabase.from("notes").select("date, mood, sleep").eq("user_id", userId).order("date", { ascending: false }).limit(1),
  ]);

  if (settings?.data_sharing_ai === false) return "";

  const parts = [];
  if (profile?.name) parts.push(`Имя: ${profile.name}`);
  if (settings?.language) parts.push(`Язык: ${settings.language}`);

  const note = Array.isArray(lastNote) ? lastNote[0] : lastNote;
  if (note?.date || note?.mood != null || note?.sleep != null) {
    parts.push(
      `Последняя заметка: дата=${note?.date || "?"}, настроение=${note?.mood ?? "?"}/10, сон=${note?.sleep ?? "?"} мин`
    );
  }

  // Если включена персонализация ИИ, добавляем дополнительный контекст
  if (settings?.ai_personalization && settings?.data_sharing_ai !== false) {
    parts.push(`Персонализация: ИИ учитывает ваши привычки и паттерны для более релевантных рекомендаций`);
  }

  return parts.length ? parts.join(". ") : "";
}

async function callLmStudio(messages) {
  const resp = await fetch(`${LMSTUDIO_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LMSTUDIO_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 256,
    }),
  });

  const raw = await resp.text();
  if (!resp.ok) {
    return { error: `LM Studio error (${resp.status}): ${raw}` };
  }

  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    return { error: `LM Studio returned non-JSON: ${raw}` };
  }

  const reply = (json?.choices?.[0]?.message?.content || "").trim();
  return { reply };
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

  const supabase = await supabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // История сообщений (последние 10)
  const { data: history, error: histErr } = await supabase
    .from("ai_messages")
    .select("role, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(10);

  if (histErr) {
    return Response.json({ error: histErr.message }, { status: 500 });
  }

  const context = await buildUserContext(supabase, user.id);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
  ];
  if (context) {
    messages.push({ role: "system", content: `Контекст о пользователе: ${context}` });
  }
  for (const m of history || []) {
    const role = m.role === "assistant" ? "assistant" : "user";
    messages.push({ role, content: String(m.content || "") });
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
    const lm = await callLmStudio(messages);
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

  const { error: insAiErr } = await supabase.from("ai_messages").insert({
    user_id: user.id,
    role: "assistant",
    content: reply,
    source: "web",
  });

  if (insAiErr) {
    return Response.json({ error: insAiErr.message }, { status: 500 });
  }

  return Response.json({ reply });
}
