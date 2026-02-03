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



import { supabaseServer } from "@/lib/supabase/server";

const SYSTEM_PROMPT =
  "Ты эмпатичный психологический ассистент. Отвечай коротко, тепло, без клише. " +
  "Давай простые практические шаги (дыхание, сон, движение, дневник). " +
  "Избегай диагнозов и директив. Если нужен специалист — мягко предложи обратиться.";

const DEFAULT_OLLAMA_MODEL = "phi3:mini";

function getOllamaConfig() {
  const base =
    process.env.OLLAMA_BASE_URL ||
    process.env.OLLAMA_URL ||
    "http://127.0.0.1:11434";
  const model = (process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL).trim() || DEFAULT_OLLAMA_MODEL;
  return { base, model };
}

function getLmStudioConfig() {
  const base = (process.env.LMSTUDIO_BASE_URL || "http://127.0.0.1:1234").trim();
  const model = (process.env.LMSTUDIO_MODEL || "").trim();
  return { base, model };
}

function useLmStudio() {
  return Boolean(process.env.LMSTUDIO_BASE_URL || process.env.LMSTUDIO_MODEL);
}

async function buildUserContext(supabase, userId) {
  const [{ data: profile }, { data: settings }, { data: lastNote }] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", userId).maybeSingle(),
    supabase.from("user_settings").select("language, data_sharing_ai").eq("user_id", userId).maybeSingle(),
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

  return parts.length ? parts.join(". ") : "";
}

async function callLmStudio(messages) {
  const { base, model } = getLmStudioConfig();
  if (!model) {
    return { error: "LMSTUDIO_MODEL is not set" };
  }

  const resp = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
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

  let reply = json?.choices?.[0]?.message?.content || "";
  
  // Очистка от странных тегов и форматирования LM Studio
  reply = reply
    .replace(/<\|channel\|>.*?<\/\|channel\|>/gs, "")
    .replace(/<\|constrain\|>.*?<\/\|constrain\|>/gs, "")
    .replace(/<\|message\|>/g, "")
    .replace(/<\|.*?\|>/g, "")
    .replace(/commentary\s+to=\w+\s*/gi, "")
    .replace(/^[\s\n\r]*/m, "")
    .trim();
  
  // Если в ответе JSON, извлечем значение "response"
  if (reply.startsWith("{")) {
    try {
      const jsonReply = JSON.parse(reply);
      if (jsonReply.response) {
        reply = jsonReply.response.toString();
      }
    } catch {
      // Это не JSON, оставляем как есть
    }
  }
  
  return { reply: reply.trim() };
}

async function callOllama(prompt) {
  const { base, model } = getOllamaConfig();
  const resp = await fetch(`${base}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        repeat_penalty: 1.1,
        num_predict: 256,
      },
    }),
  });

  const raw = await resp.text();
  if (!resp.ok) {
    return { error: `Ollama error (${resp.status}): ${raw}` };
  }

  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    return { error: `Ollama returned non-JSON: ${raw}` };
  }

  const reply = (json?.response || "").trim();
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
  });

  if (insUserErr) {
    return Response.json({ error: insUserErr.message }, { status: 500 });
  }

  let reply = "";
  try {
    if (useLmStudio()) {
      const lm = await callLmStudio(messages);
      if (lm.error) {
        return Response.json({ error: lm.error }, { status: 502 });
      }
      reply = lm.reply || "";
    } else {
      const historyText = (history || [])
        .map((m) => (m.role === "user" ? `Пользователь: ${m.content}` : `Ассистент: ${m.content}`))
        .join("\n");
      const prompt =
        `${SYSTEM_PROMPT}\n\n` +
        (context ? `Контекст о пользователе: ${context}\n\n` : "") +
        `История:\n${historyText}\n\nПользователь: ${message}\nАссистент:`;

      const ollama = await callOllama(prompt);
      if (ollama.error) {
        return Response.json({ error: ollama.error }, { status: 502 });
      }
      reply = ollama.reply || "";
    }
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
  });

  if (insAiErr) {
    return Response.json({ error: insAiErr.message }, { status: 500 });
  }

  return Response.json({ reply });
}
