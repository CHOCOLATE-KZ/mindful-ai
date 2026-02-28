"use client";

import { useEffect, useState, useCallback } from "react";

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
        .order("created_at", { ascending: true })
        .limit(50);

      if (!active) return;

      if (!error) setMessages(data || []);
      else console.error("history error:", error);
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

    const { error } = await supabase.from("ai_messages").delete().eq("user_id", uid);
    if (error) {
      console.error(error);
      alert("Не удалось очистить чат");
      return;
    }

    setMessages([]);
    onHistoryCleared?.();
  }, [getUserId, onHistoryCleared, supabase]);

  return {
    messages,
    setMessages,
    clearChatHistory,
  };
}
