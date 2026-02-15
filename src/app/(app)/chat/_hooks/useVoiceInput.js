"use client";

import { useEffect, useMemo, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export function useVoiceInput({ lang = "ru-RU", autoStopMs = 8000 } = {}) {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const isSecure = useMemo(() => (typeof window === "undefined" ? true : window.isSecureContext), []);
  const [text, setText] = useState("");

  useEffect(() => {
    if (listening) setText(transcript); // eslint-disable-line react-hooks/set-state-in-effect
  }, [transcript, listening]);

  useEffect(() => {
    if (!listening) return;
    const t = setTimeout(() => SpeechRecognition.stopListening(), autoStopMs);
    return () => clearTimeout(t);
  }, [listening, autoStopMs]);

  async function toggle() {
    if (!browserSupportsSpeechRecognition) {
      alert("В этом браузере нет поддержки распознавания речи.");
      return;
    }
    if (!isSecure) {
      alert("Голосовой ввод работает только на HTTPS или localhost.");
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
      return;
    }

    resetTranscript();
    setText("");
    await SpeechRecognition.startListening({ continuous: false, language: lang });
  }

  return { voiceText: text, setVoiceText: setText, listening, isSecure, toggleVoice: toggle };
}