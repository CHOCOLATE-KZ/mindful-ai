#!/usr/bin/env node

/**
 * Тест: отправляем запрос с явным system prompt в LM Studio
 * и смотрим что приходит обратно
 */

const LMSTUDIO_BASE_URL = "http://127.0.0.1:1234";

async function testLmStudio() {
  console.log("🧪 Тестирую LM Studio...\n");

  const testMessage = "Мне плохо";
  const systemPrompt = `Ты MindfulAI. Ты друг. МАКСИМУМ 2-3 предложения.
🚫 НИКОГДА не пиши "Дата:", "Настроение:", "Сон:"
НИКОГДА не пиши статистику если юзер её не просит.
БЕЗ советов если юзер просто рассказывает.`;

  const messages = [
    { 
      role: "system", 
      content: systemPrompt 
    },
    { 
      role: "user", 
      content: testMessage 
    },
  ];

  console.log("📤 Отправляю запрос:");
  console.log("   - Model: meta-llama-3.1-8b-instruct");
  console.log("   - System prompt: ", systemPrompt.slice(0, 60) + "...");
  console.log("   - User message: ", testMessage);
  console.log();

  try {
    const response = await fetch(`${LMSTUDIO_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "meta-llama-3.1-8b-instruct",
        messages,
        temperature: 0.6,
        max_tokens: 256,
        top_p: 0.9,
        frequency_penalty: 0.5,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("❌ Ошибка LM Studio:", response.status);
      console.error(data);
      return;
    }

    const reply = data?.choices?.[0]?.message?.content || "";
    
    console.log("📥 Ответ от LM Studio:");
    console.log("─".repeat(60));
    console.log(reply);
    console.log("─".repeat(60));
    console.log();

    // Проверяем содержит ли ответ запрещенное
    const forbidden = ["Дата:", "Настроение:", "Сон:", "статистика"];
    const hasForbidden = forbidden.some(w => reply.toLowerCase().includes(w.toLowerCase()));
    
    if (hasForbidden) {
      console.warn("⚠️  ПРОБЛЕМА: Ответ содержит запрещенное!");
      forbidden.forEach(w => {
        if (reply.toLowerCase().includes(w.toLowerCase())) {
          console.warn(`   - Найдено: "${w}"`);
        }
      });
    } else {
      console.log("✅ Ответ чистый, без запрещенного!");
    }

    // Проверяем длину ответа
    const sentenceCount = (reply.match(/[.!?]/g) || []).length;
    console.log(`ℹ️  Длина ответа: ${reply.length} символов, ${sentenceCount} предложений`);
    
  } catch (error) {
    console.error("❌ Ошибка при подключении к LM Studio:");
    console.error(error.message);
    console.log("\n💡 Проверьте что:");
    console.log("   1. LM Studio запущен на http://127.0.0.1:1234");
    console.log("   2. Модель meta-llama-3.1-8b-instruct загружена");
  }
}

testLmStudio();
