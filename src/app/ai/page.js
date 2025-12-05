"use client";
import { useState } from "react";
import { askOllama } from "@/lib/ollamaClient";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  async function handleSend() {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages((m) => [...m, userMessage]);
    setInput("");

    const reply = await askOllama(input);
    setMessages((m) => [...m, userMessage, { sender: "ai", text: reply }]);
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.sender === "user"
                ? "text-right text-blue-600"
                : "text-left text-gray-800"
            }
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Напиши, что чувствуешь..."
          className="flex-1 border rounded-lg p-2"
        />
        <button
          onClick={handleSend}
          className="bg-gradient-to-r from-violet-500 to-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Отправить
        </button>
      </div>
    </main>
  );
}
