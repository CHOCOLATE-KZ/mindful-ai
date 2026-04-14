"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { extractAnchors } from "@/lib/utils/extractAnchors";
import { buildPleasantRussianUtterance, pickBestSpeechVoice, waitForSpeechVoices } from "@/lib/utils/speechVoice";
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
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [voiceModeState, setVoiceModeState] = useState("idle");
  const [voiceModeHeard, setVoiceModeHeard] = useState("");
  const [voiceModeReply, setVoiceModeReply] = useState("");
  const [voiceModeError, setVoiceModeError] = useState("");

  const speakingRef = useRef(false);
  const sendingVoiceRef = useRef(false);
  const startingVoiceRef = useRef(false);
  const lastSpokenAssistantRef = useRef("");

  const { atBottom, scrollRef, scrollToTop } = useChatScroll();
  const helpIconRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useOutsideClick(menuRef, () => setMenuOpen(false), menuOpen);

  const voice = useVoiceInput({ lang: "ru-RU", autoStopMs: 8000 });
  const {
    voiceText,
    listening: voiceListening,
    isSecure: voiceIsSecure,
    mounted: voiceMounted,
    browserSupportsSpeechRecognition: voiceSupported,
    unsupportedReason: voiceUnsupportedReason,
    lastVoiceError,
    startVoice,
    stopVoice,
    clearVoiceText,
  } = voice;

  useEffect(() => {
    if (voiceModeEnabled) return;
    if (voiceText) {
      queueMicrotask(() => {
        setInput(voiceText);
      });
    }
  }, [voiceText, setInput, voiceModeEnabled]);

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

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    speakingRef.current = false;
  }, []);

  const getAssistantSignature = useCallback((message) => {
    if (!message || message.role !== "assistant") return "";
    return `${message.created_at || ""}:${message.content || ""}`;
  }, []);

  const stopVoiceConversation = useCallback(() => {
    setVoiceModeEnabled(false);
    setVoiceModeState("idle");
    speakingRef.current = false;
    sendingVoiceRef.current = false;
    startingVoiceRef.current = false;
    stopVoice();
    clearVoiceText();
    stopSpeaking();
  }, [clearVoiceText, stopVoice, stopSpeaking]);

  const startVoiceConversation = useCallback(() => {
    if (!voiceMounted) return;
    if (!voiceSupported) {
      const msg = voiceUnsupportedReason || "В этом браузере нет поддержки распознавания речи.";
      setVoiceModeError(msg);
      alert(msg);
      return;
    }
    if (!voiceIsSecure) {
      setVoiceModeError("Голосовой режим работает только на HTTPS или localhost.");
      alert("Голосовой режим работает только на HTTPS или localhost.");
      return;
    }

    setVoiceModeError("");
    setVoiceModeHeard("");
    setVoiceModeReply("");

    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    lastSpokenAssistantRef.current = getAssistantSignature(lastAssistant);
    setVoiceModeEnabled(true);
    setVoiceModeState("idle");
  }, [messages, getAssistantSignature, voiceMounted, voiceSupported, voiceIsSecure, voiceUnsupportedReason]);

  const toggleVoiceConversation = useCallback(() => {
    if (voiceModeEnabled) {
      stopVoiceConversation();
      return;
    }
    startVoiceConversation();
  }, [voiceModeEnabled, stopVoiceConversation, startVoiceConversation]);

  useEffect(() => {
    if (!voiceModeEnabled) return;
    if (!voiceMounted) return;
    if (!voiceSupported) {
      setVoiceModeError("В этом браузере нет поддержки распознавания речи.");
      stopVoiceConversation();
      return;
    }
    if (!voiceIsSecure) {
      setVoiceModeError("Голосовой режим работает только на HTTPS или localhost.");
      stopVoiceConversation();
    }
  }, [voiceModeEnabled, voiceMounted, voiceSupported, voiceIsSecure, stopVoiceConversation]);

  useEffect(() => {
    if (!voiceModeEnabled) return;
    if (!voiceMounted) return;

    if (loading) {
      setVoiceModeState("thinking");
      return;
    }

    if (speakingRef.current) {
      setVoiceModeState("speaking");
      return;
    }

    if (voiceListening) {
      setVoiceModeState("listening");
      return;
    }

    const transcript = voiceText.trim();
    if (transcript && !sendingVoiceRef.current) {
      sendingVoiceRef.current = true;
      setVoiceModeHeard(transcript);
      setVoiceModeState("thinking");

      (async () => {
        clearVoiceText();
        const ok = await sendMessage(undefined, transcript);
        if (!ok) setVoiceModeError("Не удалось получить ответ. Попробуйте ещё раз.");
        sendingVoiceRef.current = false;
      })();

      return;
    }

    if (startingVoiceRef.current) return;
    startingVoiceRef.current = true;

    (async () => {
      try {
        const started = await startVoice();
        if (!started) {
          const details = lastVoiceError ? ` (${lastVoiceError})` : "";
          setVoiceModeError(`Микрофон не запущен.${details} Проверьте доступ к микрофону и перезапустите попытку.`);
          setVoiceModeState("idle");
        }
      } catch {
        setVoiceModeError("Не удалось запустить микрофон. Проверьте разрешения браузера.");
        setVoiceModeState("idle");
      } finally {
        startingVoiceRef.current = false;
      }
    })();
  }, [
    voiceModeEnabled,
    voiceModeState,
    voiceMounted,
    voiceListening,
    voiceText,
    startVoice,
    clearVoiceText,
    lastVoiceError,
    loading,
    sendMessage,
  ]);

  useEffect(() => {
    if (!voiceModeEnabled) return;
    let cancelled = false;

    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant?.content) return;

    const signature = getAssistantSignature(lastAssistant);
    if (!signature || signature === lastSpokenAssistantRef.current) return;
    lastSpokenAssistantRef.current = signature;
    setVoiceModeReply(lastAssistant.content);

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoiceModeError("Озвучка ответа не поддерживается в этом браузере.");
      return;
    }

    const text = String(lastAssistant.content).replace(/[#*_`>\[\]()]/g, " ").replace(/\s+/g, " ").trim();
    if (!text) return;

    (async () => {
      const voices = await waitForSpeechVoices();
      if (cancelled) return;

      stopVoice();
      window.speechSynthesis.cancel();

      const preferredVoice = pickBestSpeechVoice(voices, "ru-RU");
      const utterance = buildPleasantRussianUtterance(text, preferredVoice);

      utterance.onstart = () => {
        speakingRef.current = true;
        setVoiceModeState("speaking");
      };

      utterance.onend = () => {
        speakingRef.current = false;
        setVoiceModeState("idle");
      };

      utterance.onerror = () => {
        speakingRef.current = false;
        setVoiceModeState("idle");
        setVoiceModeError("Не удалось озвучить ответ.");
      };

      window.speechSynthesis.speak(utterance);
    })();

    return () => {
      cancelled = true;
    };
  }, [messages, voiceModeEnabled, getAssistantSignature, stopVoice]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      stopVoice();
    };
  }, [stopSpeaking, stopVoice]);

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
    voiceModeEnabled,
    voiceModeState,
    voiceModeHeard,
    voiceModeReply,
    voiceModeError,
    toggleVoiceConversation,
    stopVoiceConversation,
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
