// // src/app/api/chat/route.js
// import { createClient } from "@/lib/supabase/server";

// const OLLAMA_URL =
//   process.env.OLLAMA_BASE_URL ||
//   process.env.OLLAMA_URL ||
//   "http://127.0.0.1:11434";

// // const MODEL = (process.env.OLLAMA_MODEL || "phi3:mini").trim();
// const MODEL = "phi3:mini";

// // защита от случайного выбора тяжёлой модели
// const SAFE_MODEL = MODEL === "phi3:mini" ? "phi3:mini" : "phi3:mini";

// console.log("OLLAMA MODEL =", MODEL);
// console.log("OLLAMA URL =", OLLAMA_URL);

// const SYSTEM_PROMPT =
//   "Ты эмпатичный психологический ассистент. Отвечай коротко, тепло, без клише. " +
//   "Давай простые практические шаги (дыхание, сон, движение, дневник). " +
//   "Избегай диагнозов и директив. Если нужен специалист — мягко предложи обратиться.";

// export async function POST(req) {
//   // 0) берём Authorization: Bearer <token>
//   const authHeader = req.headers.get("authorization") || "";
//   if (!authHeader.toLowerCase().startsWith("bearer ")) {
//     return Response.json({ error: "Auth token missing" }, { status: 401 });
//   }

//   // 1) создаём supabase клиент с этим токеном
//   const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//     {
//       global: {
//         headers: {
//           Authorization: authHeader,
//         },
//       },
//     }
//   );

//   // 2) достаём пользователя по токену
//   const { data: { user }, error: userError } = await supabase.auth.getUser();
//   if (userError) return Response.json({ error: userError.message }, { status: 401 });
//   if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

//   const userId = user.id;

//   // 3) читаем body
//   let body;
//   try {
//     body = await req.json();
//   } catch {
//     return Response.json({ error: "Invalid JSON body" }, { status: 400 });
//   }

//   const message = body?.message?.toString?.() || "";
//   if (!message.trim()) {
//     return Response.json({ error: "Empty message" }, { status: 400 });
//   }

//   // 4) история (последние 10)
//   const { data: history, error: histErr } = await supabase
//     .from("ai_messages")
//     .select("role, content")
//     .eq("user_id", userId)
//     .order("created_at", { ascending: true })
//     .limit(10);

//   if (histErr) {
//     return Response.json({ error: histErr.message }, { status: 500 });
//   }

//   // 5) промпт
//   const historyText = (history || [])
//     .map((m) => (m.role === "user" ? `Пользователь: ${m.content}` : `Ассистент: ${m.content}`))
//     .join("\n");

//   const prompt =
//     `${SYSTEM_PROMPT}\n\nИстория:\n${historyText}\n\nПользователь: ${message}\nАссистент:`;

//   // 6) сохраняем user message
//   const { error: insUserErr } = await supabase.from("ai_messages").insert({
//     user_id: userId,
//     role: "user",
//     content: message,
//   });

//   if (insUserErr) {
//     return Response.json({ error: insUserErr.message }, { status: 500 });
//   }

//   // 7) запрос к Ollama
//   let ollamaJson;
//   try {
//     const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         model: SAFE_MODEL,
//         prompt,
//         stream: false,
//         options: {
//           temperature: 0.7,
//           repeat_penalty: 1.1,
//           num_predict: 256,
//         },
//       }),
//     });

//     const raw = await resp.text();

//     if (!resp.ok) {
//       return Response.json(
//         { error: `Ollama error (${resp.status}): ${raw}` },
//         { status: 502 }
//       );
//     }

//     try {
//       ollamaJson = JSON.parse(raw);
//     } catch {
//       return Response.json({ error: `Ollama returned non-JSON: ${raw}` }, { status: 502 });
//     }
//   } catch (err) {
//     return Response.json(
//       { error: `Failed to contact Ollama: ${err?.message || String(err)}` },
//       { status: 502 }
//     );
//   }

//   const reply = (ollamaJson?.response || "").trim() || "…";

//   // 8) сохраняем assistant message
//   const { error: insAiErr } = await supabase.from("ai_messages").insert({
//     user_id: userId,
//     role: "assistant",
//     content: reply,
//   });

//   if (insAiErr) {
//     return Response.json({ error: insAiErr.message }, { status: 500 });
//   }

//   return Response.json({ reply });
// }



// src/app/api/chat/route.js
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  return Response.json({
    envModel: process.env.OLLAMA_MODEL,
    envBase: process.env.OLLAMA_BASE_URL,
    envUrlAlt: process.env.OLLAMA_URL,
  }, { status: 200 });
}
