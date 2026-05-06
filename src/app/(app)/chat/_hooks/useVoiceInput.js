"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useVoiceInput({ lang = "ru-RU", autoStopMs = 8000 } = {}) {
  const [voiceText, setVoiceText] = useState("");
  const [listening, setListening] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSecure, setIsSecure] = useState(true);
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);
  const [unsupportedReason, setUnsupportedReason] = useState("");
  const [lastVoiceError, setLastVoiceError] = useState("");
  const recognitionRef = useRef(null);
  const stopTimerRef = useRef(0);

  const clearVoiceText = useCallback(() => {
    setVoiceText("");
  }, []);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    setIsSecure(window.isSecureContext);
    const hasSpeechApi = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!hasSpeechApi) {
      setBrowserSupportsSpeechRecognition(false);
      setUnsupportedReason("В этом браузере нет Web Speech API. Используйте Edge или Chrome.");
      return;
    }

    setBrowserSupportsSpeechRecognition(true);
    setUnsupportedReason("");
  }, []);

  const stopVoice = useCallback(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = 0;
    }

    const recognition = recognitionRef.current;
    if (!recognition) return;

    try {
      recognition.stop();
    } catch {
      // ignore invalid-state stop errors
    }
  }, []);

  const ensureRecognition = useCallback(() => {
    if (recognitionRef.current) return recognitionRef.current;
    if (typeof window === "undefined") return null;

    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionCtor) return null;

    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setListening(true);
    };

    // When the user stops speaking, stop recognition after a short pause
    // so the final transcript is committed and the caller can process it.
    recognition.onspeechend = () => {
      setTimeout(() => {
        try { recognition.stop(); } catch { /* ignore */ }
      }, 600);
    };

    recognition.onresult = (event) => {
      // With continuous=true, accumulate all final results + show latest interim live.
      let allFinal = "";
      let currentInterim = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result?.[0]?.transcript || "";
        if (result.isFinal) {
          allFinal += transcript + " ";
        } else {
          currentInterim = transcript;
        }
      }

      const liveDisplay = (allFinal + currentInterim).trim();
      if (liveDisplay) setVoiceText(liveDisplay);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = 0;
      }
    };

    recognition.onerror = (event) => {
      // "no-speech" is not a real error — the mic is open but the user didn't speak yet.
      // Silently reset so the caller can restart naturally.
      if (event?.error === "no-speech" || event?.error === "audio-capture") {
        setListening(false);
        recognitionRef.current = null;
        if (stopTimerRef.current) {
          clearTimeout(stopTimerRef.current);
          stopTimerRef.current = 0;
        }
        return;
      }
      setListening(false);
      recognitionRef.current = null;
      setLastVoiceError(event?.error ? `speech-error:${event.error}` : "speech-error:unknown");
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = 0;
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  }, [lang]);

  const startVoice = useCallback(async () => {
    if (!browserSupportsSpeechRecognition) {
      alert("В этом браузере нет поддержки распознавания речи.");
      return false;
    }
    if (!isSecure) {
      alert("Голосовой ввод работает только на HTTPS или localhost.");
      return false;
    }

    // Pre-check: verify the microphone actually works before starting recognition
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        setLastVoiceError("mic-permission-denied");
        return false;
      }
    }

    const recognition = ensureRecognition();
    if (!recognition) return false;

    recognition.lang = lang;
    setVoiceText("");
    setLastVoiceError("");

    try {
      recognition.start();
    } catch (error) {
      const errName = error?.name || "UnknownError";

      // Opera/Chromium often throws InvalidStateError on rapid restart.
      if (errName === "InvalidStateError") {
        try {
          recognition.stop();
        } catch {
          // ignore
        }

        await new Promise((resolve) => setTimeout(resolve, 120));

        try {
          recognition.start();
        } catch (retryError) {
          const retryName = retryError?.name || "UnknownError";
          setLastVoiceError(`start-failed:${retryName}`);
          return false;
        }
      } else {
        setLastVoiceError(`start-failed:${errName}`);
        return false;
      }
    }

    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
    }
    stopTimerRef.current = setTimeout(() => {
      stopVoice();
    }, autoStopMs);

    return true;
  }, [autoStopMs, browserSupportsSpeechRecognition, ensureRecognition, isSecure, lang, stopVoice]);

  const toggle = useCallback(async () => {
    if (!browserSupportsSpeechRecognition) {
      alert("В этом браузере нет поддержки распознавания речи.");
      return;
    }
    if (!isSecure) {
      alert("Голосовой ввод работает только на HTTPS или localhost.");
      return;
    }

    if (listening) {
      stopVoice();
      return;
    }

    await startVoice();
  }, [browserSupportsSpeechRecognition, isSecure, listening, startVoice, stopVoice]);

  useEffect(() => {
    return () => {
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
      }

      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onstart = null;
        recognition.onresult = null;
        recognition.onend = null;
        recognition.onerror = null;
        try {
          recognition.stop();
        } catch {
          // ignore cleanup stop errors
        }
      }
    };
  }, []);

  return {
    voiceText,
    clearVoiceText,
    listening,
    isSecure,
    mounted,
    browserSupportsSpeechRecognition,
    unsupportedReason,
    lastVoiceError,
    startVoice,
    stopVoice,
    toggleVoice: toggle,
  };
}