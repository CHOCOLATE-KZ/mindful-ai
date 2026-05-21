"use client";

import { useEffect, useState, useCallback } from "react";
import { writeCrisisTopicModeToStorage } from "@/lib/chat/crisisSession";

// Приветственное сообщение для новых пользователей (без истории)
const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Привет! Я MindfulAI — твой психологический помощник. Я здесь, чтобы выслушать и поддержать тебя.\n\n" +
    "Ты можешь рассказать мне о том, что тебя беспокоит, поделиться своими мыслями или просто поговорить. " +
    "Всё, что ты напишешь, останется приватным.\n\n" +
    "С чего начнём?",
  created_at: new Date().toISOString(),
  isWelcome: true,
};

export function useChatHistory({ supabase, getUserId, onHistoryCleared }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const uid = await getUserId();
      if (!uid) {
        if (active) setMessages([]);
        return;
      }

      const { data, error } = await supabase
        .from("ai_messages")
        .select("role, content, created_at")
        .eq("user_id", uid)
        .eq("source", "web")
        .order("created_at", { ascending: true })
        .limit(80);

      if (!active) return;

      if (!error) {
        const history = data || [];
        // Если истории нет — показываем онбординг
        setMessages(history.length === 0 ? [WELCOME_MESSAGE] : history);
      } else {
        console.error("history error:", error);
      }
    })();

    return () => {
      active = false;
    };
  }, [supabase, getUserId]);

  const clearChatHistory = useCallback(async () => {
    const uid = await getUserId();
    if (!uid) return;

    const ok = confirm("Очистить историю чата? Это действие нельзя отменить.");
    if (!ok) return;

    const { error } = await supabase
      .from("ai_messages")
      .delete()
      .eq("user_id", uid)
      .eq("source", "web");
    if (error) {
      console.error(error);
      alert("Не удалось очистить чат");
      return;
    }

    setMessages([WELCOME_MESSAGE]);
    writeCrisisTopicModeToStorage(null);
    try {
      await fetch("/api/chat/clear", { method: "POST", credentials: "include" });
    } catch (err) {
      console.warn("[chat] clear summary/crisis mode:", err);
    }
    onHistoryCleared?.();
  }, [getUserId, onHistoryCleared, supabase]);

  return {
    messages,
    setMessages,
    clearChatHistory,
  };
}
