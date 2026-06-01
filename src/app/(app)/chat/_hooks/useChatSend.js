"use client";

import { useState, useCallback } from "react";
import {
  readCrisisTopicModeFromStorage,
  writeCrisisTopicModeToStorage,
} from "@/lib/chat/crisisSession";

function applyCrisisTopicModeFromResponse(data) {
  if (data?.crisisTopicMode) {
    writeCrisisTopicModeToStorage(data.crisisTopicMode);
  }
}

function removeCrisisBubbles(messages) {
  return messages.filter((m) => !m.crisis);
}

export function useChatSend({ setMessages, onBeforeSend, onChatMeta }) {
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
        body: JSON.stringify({
          message: text,
          crisisTopicMode: readCrisisTopicModeFromStorage(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Chat error");

      applyCrisisTopicModeFromResponse(data);
      onChatMeta?.({
        testRecommendations:
          data.testRecommendations || {
            generated: null,
            catalog: null,
          },
        testRecommendation: data.testRecommendation || null,
        testsGate: data.testsGate || null,
      });

      if (data.crisis) {
        writeCrisisTopicModeToStorage(null);
        setMessages((messages) => [
          ...messages,
          {
            role: "assistant",
            content: "",
            crisis: true,
            triggerMessage: text,
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
  }, [loading, onBeforeSend, onChatMeta, setMessages]);

  const continueAfterCrisis = useCallback(
    async (triggerMessage) => {
      const text = String(triggerMessage || "").trim();
      if (!text || loading) return false;

      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            message: text,
            crisisTopicChoice: "continue",
            continueAfterCrisis: true,
            skipUserInsert: true,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Chat error");

        applyCrisisTopicModeFromResponse(data);
        onChatMeta?.({
          testRecommendations:
            data.testRecommendations || {
              generated: null,
              catalog: null,
            },
          testRecommendation: data.testRecommendation || null,
          testsGate: data.testsGate || null,
        });

        if (data.crisis) {
          return false;
        }

        setMessages((messages) => [
          ...removeCrisisBubbles(messages),
          {
            role: "assistant",
            content: data.reply,
            created_at: new Date().toISOString(),
          },
        ]);
        return true;
      } catch (err) {
        console.error(err);
        setMessages((messages) => [
          ...removeCrisisBubbles(messages),
          {
            role: "assistant",
            content:
              "Извини, не удалось продолжить диалог. Попробуй ещё раз или позвони на линию доверия.",
            created_at: new Date().toISOString(),
          },
        ]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loading, onChatMeta, setMessages]
  );

  const declineCrisisTopic = useCallback(
    async (triggerMessage) => {
      const text = String(triggerMessage || "").trim();
      if (loading) return false;

      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            crisisTopicChoice: "decline",
            triggerMessage: text,
            skipUserInsert: true,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Chat error");

        applyCrisisTopicModeFromResponse(data);
        onChatMeta?.({
          testRecommendations:
            data.testRecommendations || {
              generated: null,
              catalog: null,
            },
          testRecommendation: data.testRecommendation || null,
          testsGate: data.testsGate || null,
        });

        setMessages((messages) => [
          ...removeCrisisBubbles(messages),
          {
            role: "assistant",
            content: data.reply,
            created_at: new Date().toISOString(),
          },
        ]);
        return true;
      } catch (err) {
        console.error(err);
        setMessages((messages) => [
          ...removeCrisisBubbles(messages),
          {
            role: "assistant",
            content: "Извини, не удалось переключить тему. Попробуй написать, о чём хочешь поговорить.",
            created_at: new Date().toISOString(),
          },
        ]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loading, onChatMeta, setMessages]
  );

  return {
    loading,
    send,
    continueAfterCrisis,
    declineCrisisTopic,
  };
}
