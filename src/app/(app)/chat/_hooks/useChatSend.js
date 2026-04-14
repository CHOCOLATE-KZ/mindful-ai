"use client";

import { useState, useCallback } from "react";

export function useChatSend({ setMessages, onBeforeSend }) {
  const [loading, setLoading] = useState(false);

  const send = useCallback(async (e, input) => {
    e?.preventDefault?.();
    if (!input.trim() || loading) return false;

    const text = input.trim();
    onBeforeSend?.();
    setMessages((messages) => [
      ...messages,
      { role: "user", content: text, created_at: new Date().toISOString() },
    ]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Chat error");

      // Кризисный ответ — специальный тип сообщения
      if (data.crisis) {
        setMessages((messages) => [
          ...messages,
          {
            role: "assistant",
            content: "",
            crisis: true,
            created_at: new Date().toISOString(),
          },
        ]);
        return true;
      }

      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content: data.reply,
          created_at: new Date().toISOString(),
          anchors: Array.isArray(data.anchors) ? data.anchors : [],
        },
      ]);
      return true;
    } catch (err) {
      console.error(err);
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content: "Извини, что-то пошло не так. Попробуй ещё раз.",
          created_at: new Date().toISOString(),
        },
      ]);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loading, onBeforeSend, setMessages]);

  return {
    loading,
    send,
  };
}
