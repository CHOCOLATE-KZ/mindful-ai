// Простой прямой тест LM Studio
const LMSTUDIO_BASE_URL = "http://127.0.0.1:1234";

async function testLMStudio() {
  console.log("🧪 Тестирую LM Studio напрямую...\n");

  try {
    const messages = [
      {
        role: "system",
        content: "Ты AI помощник. Ответь коротко: максимум 1-2 предложения. БЕЗ статистики."
      },
      {
        role: "user",
        content: "Мне плохо"
      }
    ];

    console.log("📤 Отправляю запрос...");
    console.log("System prompt:", messages[0].content.slice(0, 100) + "...");
    console.log("User message:", messages[1].content);
    console.log("---");

    const startTime = Date.now();
    const response = await fetch(`${LMSTUDIO_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "meta-llama-3.1-8b-instruct",
        messages,
        temperature: 0.6,
        max_tokens: 512,
        top_p: 0.9,
        frequency_penalty: 0.5,
      }),
    });

    const elapsedTime = Date.now() - startTime;
    console.log(`⏱️  Ответ пришел за ${elapsedTime}ms\n`);

    const data = await response.json();

    if (data.error) {
      console.log("❌ Ошибка от LM Studio:");
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    const reply = data?.choices?.[0]?.message?.content || "Нет ответа";
    console.log("✅ Полный ответ от LM Studio:");
    console.log(reply);
    console.log("\n---");
    console.log("Анализ:");
    console.log("- Содержит 'Дата:'?", reply.includes("Дата:") ? "ДА ❌" : "НЕТ ✅");
    console.log("- Содержит 'Настроение:'?", reply.includes("Настроение:") ? "ДА ❌" : "НЕТ ✅");
    console.log("- Содержит 'статистика'?", reply.toLowerCase().includes("статистика") ? "ДА ❌" : "НЕТ ✅");
    console.log("- Длина ответа:", reply.length, "символов");
    console.log("- Количество предложений:", (reply.match(/[.!?]/g) || []).length);

  } catch (error) {
    console.error("❌ Ошибка при тесте:");
    console.error(error.message);
  }
}

testLMStudio();
