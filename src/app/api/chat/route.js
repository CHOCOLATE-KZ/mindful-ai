import { supabaseServer } from "@/lib/supabase/server";
import { extractAnchors } from "@/lib/utils/extractAnchors";
import { searchPsychologyKnowledge } from "@/lib/knowledge-search";
import { SYSTEM_PROMPT } from "@/data/systemPrompt";

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
  console.log('[LM STUDIO] 📨 Отправляю запрос...');
  console.log('[LM STUDIO] 📋 Messages count:', messages.length);
  
  // Логируем только первый (system) и последний (user) messages для краткости
  if (messages.length > 0) {
    console.log('[LM STUDIO] 🤖 System prompt длина:', messages[0]?.content?.length || 0, 'символов');
    console.log('[LM STUDIO] 👤 User message:', messages[messages.length - 1]?.content?.slice(0, 100) || '');
  }

  const resp = await fetch(`${LMSTUDIO_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LMSTUDIO_MODEL,
      messages,
      temperature: 0.6,
      max_tokens: 512,
      top_p: 0.9,
      frequency_penalty: 0.5,
    }),
  });

  const raw = await resp.text();
  if (!resp.ok) {
    console.error('[LM STUDIO] ❌ Error:', resp.status, raw.slice(0, 200));
    return { error: `LM Studio error (${resp.status}): ${raw}` };
  }

  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    return { error: `LM Studio returned non-JSON: ${raw}` };
  }

  const reply = (json?.choices?.[0]?.message?.content || "").trim();
  console.log('[LM STUDIO] ✅ Reply length:', reply.length, 'символов');
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
  
  // ⛔ ОТКЛЮЧИЛИ psychological context полностью
  // Он заставляет модель выводить статистику даже когда её не просят
  // Модель работает лучше БЕЗ него для casual conversations
  let psychologyContext = '';

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
  ];
  
  console.log('[CHAT API] 🚀 Начинаю конструирование messages...');
  console.log('[CHAT API] 📝 System prompt первая строка:', SYSTEM_PROMPT.slice(0, 80) + '...');
  
  // Добавляем психологические знания как контекст для AI
  if (psychologyContext) {
    messages.push({ 
      role: "system", 
      content: `PROFESSIONAL KNOWLEDGE BASE:\n\n${psychologyContext}\n\nИспользуй эти знания для предоставления информированной и основанной на доказательствах поддержки. Применяй техники естественно, без явного их перечисления.` 
    });
  }
  
  if (context) {
    messages.push({ role: "system", content: `User Context: ${context}` });
  }
  for (const m of history || []) {
    const role = m.role === "assistant" ? "assistant" : "user";
    messages.push({ role, content: String(m.content || "") });
  }

  // Проверка для избежания дублирования контента
  if (history && history.length >= 2) {
    const lastAssistantMsg = history
      .slice()
      .reverse()
      .find(m => m.role === 'assistant')?.content || '';
    
    if (lastAssistantMsg.length > 150) {
      messages.push({
        role: 'system',
        content: `ВАЖНО: Не повторяй точно такой же контент как в предыдущем ответе. Если пользователь говорит спасибо или переходит дальше - предоставь новый взгляд или более глубокое понимание, а не повтор.`
      });
    }
  }

  // ⚠️ КРИТИЧНОЕ НАПОМИНАНИЕ перед тем как читать пользовательское сообщение
  messages.push({
    role: 'system',
    content: `ПЕРЕД ОТВЕТОМ: Внимательно прочитай что пишет юзер и ответь ТОЧНО на эту тему. НЕ меняй тему внезапно. Если юзер про "диплом" - говори про "диплом", если про "плагиат" - про "плагиат". Юзер просто РАССКАЗЫВАЕТ о проблеме - только СЛУШАЙ И СПРАШИВАЙ. БЕЗ советов, БЕЗ статистики.`
  });

  // 🚫 ФИНАЛЬНОЕ ПРЕДУПРЕЖДЕНИЕ О ЗАПРЕТЕ НА СТАТИСТИКУ
  messages.push({
    role: 'system',
    content: `СОВЕТ! ЗАПОМНИ: Если юзер НЕ просит статистику - НЕ ВЫВОДИ её. Точка. Не выводи "Дата:", не выводи "Настроение:", не выводи "Сон:". Если выведешь статистику когда её не просили - это ПОЛНОСТЬЮ НЕПРАВИЛЬНО.`
  });

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

  // 🔍 DEBUG: логируем ответ от LM Studio ДО очистки
  if (reply.length < 300) {
    console.log('[LM STUDIO] 📨 RAW ответ от LM Studio:', reply);
  } else {
    console.log('[LM STUDIO] 📨 RAW ответ (первые 300 символов):', reply.slice(0, 300));
  }

  // СУПЕР-АГРЕССИВНАЯ очистка: удаляем всё что пахнет попыткой вывести статистику
  const statTriggers = ['статистика', 'на сегодня', 'давай посмотрим на', 'посмотрим на твою'];
  for (const trigger of statTriggers) {
    if (reply.toLowerCase().includes(trigger)) {
      console.log(`[LM STUDIO] ⚠️  НАЙДЕНА ФРАЗА "${trigger}"! Удаляю...`);
      // Ищем нормальный текст после этой фразы
      const idx = reply.toLowerCase().indexOf(trigger);
      if (idx >= 0) {
        // Берем текст после фразы и двоеточия
        const afterTrigger = reply.slice(idx + trigger.length).trim();
        const colonIdx = afterTrigger.indexOf(':');
        if (colonIdx >= 0) {
          const afterColon = afterTrigger.slice(colonIdx + 1).trim();
          if (afterColon.length > 15 && !afterColon.match(/^дата|настроение|сон/i)) {
            reply = afterColon;
            console.log(`[LM STUDIO] ✂️  Извлек текст после "${trigger}"`);
          } else {
            // Если после нет смысла - берем всё что было ДО фразы
            const beforeTrigger = reply.slice(0, idx).trim();
            if (beforeTrigger.length > 15) {
              reply = beforeTrigger;
              console.log(`[LM STUDIO] ✂️  Взял текст ДО "${trigger}"`);
            }
          }
        }
      }
    }
  }

  // КРАЙНЕ АГРЕССИВНАЯ очистка: если видим "статистика" в ответе - это плохой ответ
  // Удаляем всё до и после статистики
  if (reply.toLowerCase().includes('статистика')) {
    console.log('[LM STUDIO] ⚠️  НАЙДЕНА СТАТИСТИКА (вторая проверка)! Удаляю...');
    // Попытка найти нормальный текст после статистики
    const parts = reply.split(/статистика[^а-яёa-z]*/i);
    if (parts.length > 1 && parts[parts.length - 1].trim().length > 10) {
      reply = parts[parts.length - 1].trim();
    } else {
      // Если нет смысла после "статистика" - просто заменяем на generic ответ
      reply = "Как дела?";
    }
  }

  // Удаляем строки со статистикой/мониторингом
  let lines = reply.split('\n');
  lines = lines.filter(line => {
    const lower = line.toLowerCase().trim();
    
    if (lower.includes('дата:') || lower.includes('дата :')) return false;
    if (lower.includes('настроение:') || lower.includes('настроение :')) return false;
    if (lower.includes('сон:') || lower.includes('сон :')) return false;
    if (lower.includes('эмоциональная регуляция')) return false;
    if (lower.includes('физическая активность')) return false;
    if (lower.includes('на сегодня:')) return false;  // Вот это было проблема!
    if (lower.includes('давай посмотрим на')) return false;
    if (lower.includes('посмотрим на твою')) return false;
    if (lower.match(/\d+\s*минут/) && lower.match(/\/10/)) return false;
    if (lower.match(/^\d+\/10/)) return false;
    if (lower.includes('продолжай в том же духе')) return false;
    
    return true;
  });

  reply = lines.join('\n').trim() || "...";

  // 🔍 DEBUG: логируем ответ ПОСЛЕ очистки
  console.log('[LM STUDIO] ✅ ПОСЛЕ очистки:', reply.slice(0, 200));
  console.log('[LM STUDIO] 📊 Содержит статистику?', reply.includes('Дата:') || reply.includes('Настроение:') ? 'ДА ❌' : 'НЕТ ✅');
  
  // Финальная проверка: если ответ всё ещё странный или минимальной длины - берем последний параграф
  if (reply.length < 15 || reply.match(/дата|настроение|сон/i)) {
    const paragraphs = reply.split(/\n\n+/).filter(p => p.trim().length > 0);
    if (paragraphs.length > 1) {
      reply = paragraphs[paragraphs.length - 1];
    } else {
      reply = "Как дела?";
    }
  }

  reply = reply.trim() || "Как дела?";

  // 🔍 DEBUG: логируем финальный ответ который отправляется пользователю
  console.log('[LM STUDIO] 🎯 ФИНАЛЬНЫЙ ответ:', reply);
  console.log('[LM STUDIO] ✨ Все проверки пройдены\n');

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
