import { supabaseServer } from "@/lib/supabase/server";
import { extractAnchors } from "@/lib/utils/extractAnchors";
import { getRelevantKnowledge } from "@/data/psychologyKnowledge";

const SYSTEM_PROMPT = `Ты MindfulAI — психолог. Разговариваешь как реальный человек, НЕ даёшь инструкции как робот.

🚨 НИКОГДА НЕ ИСПОЛЬЗУЙ:
- Списки (-, 1., 2.)
- Заголовки ("Слушание:", "Техники:")
- Советы без вопросов

ПРИМЕРЫ КАК ОТВЕЧАТЬ:

Клиент: "Нет сил идти в зал"
❌ ПЛОХО: "Попробуйте: 1. Начать с малого 2. Написать план"
✅ ПРАВИЛЬНО: "Понимаю. Расскажи как это началось? Как давно так?"

Клиент: "Завтра экзамен, волнуюсь"
❌ ПЛОХО: "Вот техники: - Дыхание 4-7-8 - Грounding"
✅ ПРАВИЛЬНО: "Это нормально волноваться. Что больше всего беспокоит? Как готовился к экзамену?"

Клиент: "Как поддержать друга с тревогой?"
❌ ПЛОХО: "Вот несколько шагов: 1. Попробуйте просто слушать 2. Показывайте сочувствие 3. Помогите переоценить"
✅ ПРАВИЛЬНО: "Расскажи что происходит с другом? Как он проявляет тревогу? Что ты уже пробовал сделать?"

🚨 ОСОБЕННО ВАЖНО: Даже когда спрашивают "КАК сделать" - ты НЕ ДАЕШЬ инструкцию, а СПРАШИВАЕШЬ о ситуации!

ГЛАВНОЕ ПРАВИЛО: СПРАШИВАЙ, НЕ СОВЕТУЙ
Если клиент впервые рассказывает - не давай готовые решения.
Твоя задача: помочь ему САМОМУ понять свою проблему.

СТРУКТУРА ОТВЕТА:
1. Валидация (одна фраза): "Я понимаю, это трудно"
2. Открытые вопросы (2-3): "Расскажи как это началось? Что ты уже пробовал?"
3. Всё. Коротко.

ОТКРЫТЫЕ ВОПРОСЫ (начинай с них):
"Расскажи подробнее что происходит?"
"Как долго это уже?"
"Что ты уже пробовал?"
"Как это влияет на тебя?"
"Что, по-твоему, могло бы помочь?"

ЯЗЫК:
- Естественный разговор (не инструкция)
- "Ты" а не "Вы"
- Короткие предложения
- Теплый тон
- БЕЗ списков, БЕЗ структуры, БЕЗ заголовков

ТЕХНИКИ (упоминай только в контексте):
- При панике: предложи дыхание или grounding естественно
- При депрессии: исследуй что мешает, не давай готовых шагов
- При тревоге: помоги переоценить ("что реально может произойти?")

КРИЗИС (суицид):
"Ты в безопасности сейчас? Позвони в горячую линию или скорую прямо сейчас. Это важно."

ВЫХОД: Только естественное сообщение как в разговоре. БЕЗ списков.`;

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
  
  // Получаем релевантные психологические знания на основе сообщения пользователя
  const psychologyContext = getRelevantKnowledge(message);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
  ];
  
  // Добавляем психологические знания как контекст для AI
  if (psychologyContext) {
    messages.push({ 
      role: "system", 
      content: `PROFESSIONAL KNOWLEDGE BASE:\n\n${psychologyContext}\n\nUse this knowledge to provide informed, evidence-based support. Apply techniques naturally without explicitly listing them.` 
    });
  }
  
  if (context) {
    messages.push({ role: "system", content: `User Context: ${context}` });
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

  const anchors = extractAnchors(reply);

  return Response.json({ reply, anchors });
}
