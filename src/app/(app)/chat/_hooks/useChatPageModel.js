"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { extractAnchors } from "@/lib/utils/extractAnchors";
import { useOutsideClick } from "./useOutsideClick";
import { useVoiceInput } from "./useVoiceInput";
import { useChatNotes } from "./useChatNotes";
import { useChatHistory } from "./useChatHistory";
import { useChatScroll } from "./useChatScroll";
import { useChatSend } from "./useChatSend";

export function useChatPageModel() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [input, setInput] = useState("");
  const [showAnchorTooltip, setShowAnchorTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const { atBottom, scrollRef, scrollToTop } = useChatScroll();
  const helpIconRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useOutsideClick(menuRef, () => setMenuOpen(false), menuOpen);

  const voice = useVoiceInput({ lang: "ru-RU", autoStopMs: 8000 });

  useEffect(() => {
    if (voice.listening && voice.voiceText) {
      queueMicrotask(() => {
        setInput(voice.voiceText);
      });
    }
  }, [voice.voiceText, voice.listening, setInput]);

  const getUserId = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  }, [supabase]);

  const {
    savedNotes,
    notesLoading,
    notesError,
    savingAnchor,
    saveChatNote,
  } = useChatNotes();

  const {
    messages,
    setMessages,
    clearChatHistory,
  } = useChatHistory({
    supabase,
    getUserId,
    onHistoryCleared: () => setMenuOpen(false),
  });

  const { loading, send: sendMessage } = useChatSend({
    setMessages,
    onBeforeSend: () => setInput(""),
  });

  const latestAnchors = useMemo(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return [];
    if (Array.isArray(lastAssistant.anchors) && lastAssistant.anchors.length) return lastAssistant.anchors;
    return extractAnchors(lastAssistant.content);
  }, [messages]);

  const handleHelpIconHover = useCallback(() => {
    if (helpIconRef.current) {
      const rect = helpIconRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 8,
        left: rect.left - 100,
      });
      setShowAnchorTooltip(true);
    }
  }, []);

  const exportMyData = useCallback(async () => {
    const res = await fetch("/api/export", { method: "GET", credentials: "include" });
    if (!res.ok) {
      alert("Не удалось экспортировать данные");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindfulai-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setMenuOpen(false);
  }, []);

  const send = useCallback((e) => sendMessage(e, input), [sendMessage, input]);

  const applyAnchorToInput = useCallback((anchor) => {
    setInput(`Хочу обсудить: ${anchor}`);
  }, []);

  const hideAnchorTooltip = useCallback(() => {
    setShowAnchorTooltip(false);
  }, []);

  return {
    messages,
    input,
    loading,
    atBottom,
    savedNotes,
    notesLoading,
    notesError,
    savingAnchor,
    showAnchorTooltip,
    tooltipPosition,
    scrollRef,
    helpIconRef,
    menuOpen,
    setMenuOpen,
    menuRef,
    voice,
    latestAnchors,
    exportMyData,
    clearChatHistory,
    handleHelpIconHover,
    hideAnchorTooltip,
    applyAnchorToInput,
    saveChatNote,
    setInput,
    send,
    scrollToTop,
  };
}
