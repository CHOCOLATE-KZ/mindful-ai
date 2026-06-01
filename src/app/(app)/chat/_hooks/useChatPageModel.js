"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { buildPleasantRussianUtterance, pickBestSpeechVoice, waitForSpeechVoices } from "@/lib/utils/speechVoice";
import { useOutsideClick } from "./useOutsideClick";
import { useVoiceInput } from "./useVoiceInput";
import { useChatNotes } from "./useChatNotes";
import { useChatHistory } from "./useChatHistory";
import { useChatScroll } from "./useChatScroll";
import { useChatSend } from "./useChatSend";
import { useTestsStatus } from "@/app/(app)/exercises/_hooks/useTestsStatus";

export function useChatPageModel() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [input, setInput] = useState("");
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [sessionModeEnabled, setSessionModeEnabled] = useState(false);
    const toggleSessionMode = useCallback(() => {
      setSessionModeEnabled((prev) => !prev);
    }, []);
  const [voiceModeState, setVoiceModeState] = useState("idle");
  const [voiceModeHeard, setVoiceModeHeard] = useState("");
  const [voiceModeReply, setVoiceModeReply] = useState("");
  const [voiceModeError, setVoiceModeError] = useState("");
  const [userAvatarUrl, setUserAvatarUrl] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const speakingRef = useRef(false);
  const sendingVoiceRef = useRef(false);
  const startingVoiceRef = useRef(false);
  const lastSpokenAssistantRef = useRef("");

  const {
    atTop,
    atBottom,
    scrolledDown,
    scrollRef,
    setScrollContainerRef,
    scrollToTop,
    scrollToBottom,
    toggleScrollEdge,
  } = useChatScroll();

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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) {
        setCurrentUserId("");
        return;
      }

      setCurrentUserId(user.id);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;
      setUserAvatarUrl(profileData?.avatar_url || "");
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const {
    savedNotes,
    notesLoading,
    notesError,
    savingNote,
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

  const {
    pendingRecommendations: statusPendingRecs,
    refresh: refreshTestsStatus,
    gate: testsGate,
  } = useTestsStatus();

  const [testRecommendations, setTestRecommendations] = useState({
    generated: null,
    catalog: null,
  });

  useEffect(() => {
    if (statusPendingRecs?.generated || statusPendingRecs?.catalog) {
      setTestRecommendations(statusPendingRecs);
    }
  }, [statusPendingRecs]);

  const { loading, send: sendMessage, continueAfterCrisis, declineCrisisTopic } = useChatSend({
    setMessages,
    onBeforeSend: () => setInput(""),
    onChatMeta: (meta) => {
      if (meta?.testRecommendations) {
        setTestRecommendations(meta.testRecommendations);
        refreshTestsStatus();
      } else if (meta?.testRecommendation) {
        const rec = meta.testRecommendation;
        setTestRecommendations((prev) => ({
          generated: rec.approach === "generated" ? rec : prev.generated,
          catalog: rec.approach === "catalog" ? rec : prev.catalog,
        }));
        refreshTestsStatus();
      }
      if (meta?.testsGate?.justUnlocked) {
        refreshTestsStatus();
      }
    },
  });

  const skipTestRecommendation = useCallback(async (id) => {
    await fetch("/api/ai/recommend-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ skipId: id }),
    });
    setTestRecommendations((prev) => ({
      generated: prev.generated?.id === id ? null : prev.generated,
      catalog: prev.catalog?.id === id ? null : prev.catalog,
    }));
    refreshTestsStatus();
  }, [refreshTestsStatus]);

  const dismissTestRecommendation = useCallback(() => {
    setTestRecommendations({ generated: null, catalog: null });
  }, []);

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

  const exportMyData = useCallback(async (format = "json") => {
    try {
      const res = await fetch("/api/profile/export", { method: "GET", credentials: "include" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(`Не удалось экспортировать данные: ${errData.error || res.status}`);
        return;
      }

      const rawData = await res.json();
      const normalizedData = {
        ...rawData,
        notes: rawData?.data?.notes || rawData?.notes || [],
        tests: rawData?.data?.tests || rawData?.tests || [],
        messages: rawData?.data?.aiMessages || rawData?.messages || [],
        exportedAt: rawData?.exportedAt || rawData?.exported_at || new Date().toISOString(),
      };
      setMenuOpen(false);

      if (format === "pdf") {
        // PDF via print window (same as profile page)
        const notes = normalizedData.notes || [];
        const messages = normalizedData.messages || [];
        const tests = normalizedData.tests || [];
        const profile = normalizedData.profile || {};
        const exportedAt = new Date(normalizedData.exportedAt).toLocaleString("ru-RU");

        const avgMood = notes.filter(n => n.mood).length
          ? (notes.filter(n => n.mood).reduce((s, n) => s + n.mood, 0) / notes.filter(n => n.mood).length).toFixed(1)
          : "—";
        const avgSleep = notes.filter(n => n.sleep).length
          ? (notes.filter(n => n.sleep).reduce((s, n) => s + n.sleep, 0) / notes.filter(n => n.sleep).length).toFixed(1)
          : "—";

        const moodColor = (m) => !m ? "#94a3b8" : m >= 7 ? "#10b981" : m >= 4 ? "#f59e0b" : "#ef4444";

        const notesRows = notes.slice(-30).map(n => `
          <tr>
            <td>${n.date || ""}</td>
            <td style="color:${moodColor(n.mood)};font-weight:600">${n.mood ?? "—"}</td>
            <td>${n.sleep ?? "—"}ч</td>
            <td style="color:#64748b;font-size:11px">${(n.comment || "").slice(0, 60)}</td>
          </tr>`).join("");

        const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"/>
<title>MindfulAI — Экспорт данных</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter',sans-serif;color:#1e293b;background:#fff;line-height:1.6}
  .page{max-width:800px;margin:0 auto;padding:40px 40px 60px}
  .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:24px;border-bottom:2px solid #e2e8f0;margin-bottom:32px}
  .logo{font-size:22px;font-weight:700;color:#0f172a}.logo span{color:#74AA9C}
  .meta{font-size:12px;color:#94a3b8;text-align:right}
  .section{margin-bottom:36px}
  .section-title{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#74AA9C;margin-bottom:14px;padding-bottom:6px;border-bottom:1px solid #e2e8f0}
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .stat-card{background:#f8fafc;border-radius:12px;padding:16px;text-align:center}
  .stat-value{font-size:26px;font-weight:700;color:#0f172a}.stat-label{font-size:11px;color:#94a3b8;margin-top:2px}
  table{width:100%;border-collapse:collapse;font-size:12px}thead tr{background:#f1f5f9}
  th{padding:8px 10px;text-align:left;font-weight:600;color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
  td{padding:7px 10px;border-bottom:1px solid #f1f5f9;color:#334155}tr:last-child td{border-bottom:none}
  .chat-list{display:flex;flex-direction:column;gap:8px}
  .chat-msg{padding:10px 14px;border-radius:10px;font-size:12px;line-height:1.5}
  .chat-msg.user{background:#eff6ff;border-left:3px solid #3b82f6}
  .chat-msg.assistant{background:#f0fdf4;border-left:3px solid #74AA9C}
  .chat-role{font-size:10px;font-weight:600;color:#94a3b8;text-transform:uppercase;margin-bottom:2px}
  .chat-date{font-size:10px;color:#cbd5e1;float:right}
  .footer{margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center}
  @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}.section{page-break-inside:avoid}}
</style></head><body><div class="page">
  <div class="header"><div class="logo">Mindful<span>AI</span></div><div class="meta">Экспорт данных<br/>${exportedAt}</div></div>
  <div class="section"><div class="section-title">Профиль</div>
    <table><tbody>
      <tr><td style="width:160px;color:#94a3b8">Имя</td><td>${profile.name || "—"}</td></tr>
    </tbody></table>
  </div>
  <div class="section"><div class="section-title">Статистика</div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">${notes.length}</div><div class="stat-label">Записей</div></div>
      <div class="stat-card"><div class="stat-value">${avgMood}</div><div class="stat-label">Ср. настроение</div></div>
      <div class="stat-card"><div class="stat-value">${avgSleep}</div><div class="stat-label">Ср. сон (ч)</div></div>
      <div class="stat-card"><div class="stat-value">${messages.length}</div><div class="stat-label">Сообщений ИИ</div></div>
    </div>
  </div>
  ${notes.length > 0 ? `<div class="section"><div class="section-title">Дневник (последние 30)</div>
    <table><thead><tr><th>Дата</th><th>Настроение</th><th>Сон</th><th>Комментарий</th></tr></thead>
    <tbody>${notesRows}</tbody></table></div>` : ""}
  ${tests.length > 0 ? `<div class="section"><div class="section-title">Результаты тестов</div>
    <table><thead><tr><th>Дата</th><th>Тест</th><th>Результат</th></tr></thead>
    <tbody>${tests.map(t => `
      <tr>
        <td>${t.created_at ? new Date(t.created_at).toLocaleDateString("ru-RU") : "—"}</td>
        <td>${t.test_key || "—"}</td>
        <td>${t.result?.score ?? t.result?.level ?? "—"}</td>
      </tr>`).join("")}</tbody></table></div>` : ""}
  ${messages.length > 0 ? `<div class="section"><div class="section-title">История чата (последние 20)</div>
    <div class="chat-list">${messages.slice(-20).map(m => `
      <div class="chat-msg ${m.role}">
        <span class="chat-role">${m.role === "user" ? "Вы" : "MindfulAI"}</span>
        <span class="chat-date">${new Date(m.created_at).toLocaleDateString("ru-RU")}</span>
        <div>${(m.content || "").slice(0, 300)}${(m.content || "").length > 300 ? "…" : ""}</div>
      </div>`).join("")}</div></div>` : ""}
  <div class="footer">MindfulAI • ${exportedAt} • Данные принадлежат только вам</div>
</div><script>window.onload=()=>window.print();</script></body></html>`;

        const win = window.open("", "_blank");
        if (!win) { alert("Разрешите всплывающие окна в браузере для PDF-экспорта"); return; }
        win.document.write(html);
        win.document.close();
      } else {
        // JSON download
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mindfulai-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert(`Не удалось экспортировать данные: ${err?.message || "неизвестная ошибка"}`);
    }
  }, []);

  const send = useCallback((e) => sendMessage(e, input), [sendMessage, input]);

  const applyNoteToInput = useCallback((title) => {
    setInput(`Хочу обсудить: ${title}`);
  }, []);

  return {
    messages,
    currentUserId,
    userAvatarUrl,
    input,
    loading,
    atBottom,
    savedNotes,
    notesLoading,
    notesError,
    savingNote,
    scrollRef,
    setScrollContainerRef,
    menuOpen,
    setMenuOpen,
    menuRef,
    voice,
    voiceModeEnabled,
    sessionModeEnabled,
    voiceModeState,
    voiceModeHeard,
    voiceModeReply,
    voiceModeError,
    toggleVoiceConversation,
    toggleSessionMode,
    stopVoiceConversation,
    exportMyData,
    clearChatHistory,
    applyNoteToInput,
    saveChatNote,
    setInput,
    send,
    continueAfterCrisis,
    declineCrisisTopic,
    scrollToTop,
    scrollToBottom,
    toggleScrollEdge,
    atTop,
    scrolledDown,
    testRecommendations,
    skipTestRecommendation,
    dismissTestRecommendation,
    testsGate,
  };
}
