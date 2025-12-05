import { createClient } from "@/lib/supabase/server";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL || "mistral"; // можно "phi3", "llama3", "gemma2:2b"

const SYSTEM_PROMPT =
  "Ты эмпатичный психологический ассистент. Отвечай коротко, тепло, без клише. " +
  "Давай простые практические шаги (дыхание, сон, движение, дневник). " +
  "Избегай диагнозов и директив. Если нужен специалист — мягко предложи обратиться.";

export async function POST(req) {
  const supabase = createClient();

  // 1) проверяем сессию
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // 2) берём сообщение пользователя
  const { message } = await req.json();
  if (!message || !message.trim()) {
    return Response.json({ error: "Empty message" }, { status: 400 });
  }

  // 3) подгружаем недавний контекст (последние 10)
  const { data: history } = await supabase
    .from("ai_messages")
    .select("role, content")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(10);

  // 4) собираем промпт
  const historyText = (history || [])
    .map((m) => (m.role === "user" ? `Пользователь: ${m.content}` : `Ассистент: ${m.content}`))
    .join("\n");

  const prompt =
    `${SYSTEM_PROMPT}\n\nИстория:\n${historyText}\n\nПользователь: ${message}\nАссистент:`;

  // 5) сохраняем реплику пользователя
  await supabase.from("ai_messages").insert({
    user_id: userId,
    role: "user",
    content: message,
  });

  // 6) генерим ответ через Ollama
  const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // streaming=false (получаем сразу весь ответ)
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        repeat_penalty: 1.1,
        num_predict: 256,
      },
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    return Response.json({ error: `Ollama error: ${t}` }, { status: 500 });
  }

  const data = await resp.json();
  const reply = data?.response?.trim() || "…";

  // 7) сохраняем ответ ассистента
  await supabase.from("ai_messages").insert({
    user_id: userId,
    role: "assistant",
    content: reply,
  });

  return Response.json({ reply });
}
