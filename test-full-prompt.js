// Тест с ПОЛНЫМ system prompt из приложения
import { SYSTEM_PROMPT } from "./src/data/systemPrompt.js";

const LMSTUDIO_BASE_URL = "http://127.0.0.1:1234";

async function testFullPrompt() {
  console.log("🧪 Тест с ПОЛНЫМ system prompt из приложения\n");

  try {
    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      {
        role: "system",
        content: "ПЕРЕД ОТВЕТОМ: Юзер просто РАССКАЗЫВАЕТ о проблеме - только СЛУШАЙ И СПРАШИВАЙ. БЕЗ советов, БЕЗ статистики."
      },
      {
        role: "system",
        content: "СОВЕТ! ЗАПОМНИ: Если юзер НЕ просит статистику - НЕ ВЫВОДИ её. Точка. Не выводи \"Дата:\", не выводи \"Настроение:\", не выводи \"Сон:\". Если выведешь статистику когда её не просили - это ПОЛНОСТЬЮ НЕПРАВИЛЬНО."
      },
      {
        role: "user",
        content: "Волнуюсь по поводу защиты диплома. Мне страшно что я провалю письменную часть"
      }
    ];

    console.log("📤 Отправляю запрос с ПОЛНЫМ промтом...");
    console.log("System prompt длина:", SYSTEM_PROMPT.length, "символов");
    console.log("User message:", messages[3].content);
    console.log("---\n");

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
    console.log(`⏱️  Ответ пришел за ${elapsedTime}ms (${(elapsedTime / 1000).toFixed(1)}s)\n`);

    const data = await response.json();

    if (data.error) {
      console.log("❌ Ошибка от LM Studio:");
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    const reply = data?.choices?.[0]?.message?.content || "Нет ответа";
    console.log("✅ Ответ от LM Studio (с полным промтом):");
    console.log(reply);
    console.log("\n---");
    console.log("АНАЛИЗ:");
    console.log("- Содержит 'Дата:'?", reply.includes("Дата:") ? "ДА ❌" : "НЕТ ✅");
    console.log("- Содержит 'Настроение:'?", reply.includes("Настроение:") ? "ДА ❌" : "НЕТ ✅");
    console.log("- Содержит 'статистика'?", reply.toLowerCase().includes("статистика") ? "ДА ❌" : "НЕТ ✅");
    console.log("- Длина ответа:", reply.length, "символов");
    console.log("- Количество предложений:", (reply.match(/[.!?]/g) || []).length);
    console.log("- Содержит вопрос?", reply.includes("?") ? "ДА ✅" : "НЕТ");
    
    if (reply.includes("Дата:") || reply.includes("Настроение:") || reply.includes("статистика")) {
      console.log("\n⚠️  ВЫВОД: System prompt НЕ работает эффективно на этой модели!");
      console.log("Проверьте LMSTUDIO_MODEL=meta-llama-3.1-8b-instruct в .env.local");
    } else {
      console.log("\n✅ ВЫВОД: System prompt работает!");
    }

  } catch (error) {
    console.error("❌ Ошибка при тесте:");
    console.error(error.message);
  }
}

testFullPrompt();
