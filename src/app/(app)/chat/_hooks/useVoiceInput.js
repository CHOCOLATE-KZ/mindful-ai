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
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result?.[0]?.transcript || "")
        .join(" ")
        .trim();

      if (text) setVoiceText(text);
    };

    recognition.onend = () => {
      setListening(false);
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = 0;
      }
    };

    recognition.onerror = (event) => {
      setListening(false);
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