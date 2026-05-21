"use client";

import { HelpCircle, Mic, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getSessionModeConfirmationRequired,
  setSessionModeConfirmationRequired,
} from "@/lib/sessionModeConsent";
import { useLanguage } from "@/lib/i18n/useLanguage";

const sendAccentPalette = {
  none: "bg-[#74AA9C] hover:bg-[#5d9088] shadow-[0_8px_20px_rgba(116,170,156,0.35)]",
  rain: "bg-[#355A8A] hover:bg-[#2D4D75] shadow-[0_8px_20px_rgba(53,90,138,0.4)]",
  forest: "bg-[#2F6A4F] hover:bg-[#265740] shadow-[0_8px_20px_rgba(47,106,79,0.4)]",
  fireplace: "bg-[#8A4F36] hover:bg-[#73422D] shadow-[0_8px_20px_rgba(138,79,54,0.4)]",
  ocean: "bg-[#2C6F7B] hover:bg-[#245D67] shadow-[0_8px_20px_rgba(44,111,123,0.4)]",
  space: "bg-[#4C4F8A] hover:bg-[#404276] shadow-[0_8px_20px_rgba(76,79,138,0.4)]",
  lofi: "bg-[#6A4F8A] hover:bg-[#5A4476] shadow-[0_8px_20px_rgba(106,79,138,0.4)]",
};

export default function ChatComposer({
  input,
  setInput,
  onSend,
  loading,
  voice,
  voiceModeEnabled,
  onToggleVoiceMode,
  sessionModeEnabled,
  onToggleSessionMode,
  sidebarOpen = true,
  hasAmbientBg = false,
  ambientBg = "none",
  minimalComposer = false,
  onHeightChange,
}) {
  const sendAccentClass = sendAccentPalette[ambientBg] || sendAccentPalette.none;
  const canSend = Boolean(input.trim()) && !loading;
  const shellRef = useRef(null);
  const { t } = useLanguage("chat");
  const {
    listening,
    isSecure,
    toggleVoice,
    mounted,
    browserSupportsSpeechRecognition,
    unsupportedReason,
  } = voice;

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const el = shellRef.current;
    if (!el || !onHeightChange) return;

    const report = () => onHeightChange(el.offsetHeight);
    report();

    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHeightChange]);

  const micDisabled = !hydrated || !mounted || !browserSupportsSpeechRecognition || !isSecure;
  const [showSessionModeModal, setShowSessionModeModal] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(false);

  const [showRememberHint, setShowRememberHint] = useState(false);
  const [sessionConfirmRequired, setSessionConfirmRequired] = useState(
    () => getSessionModeConfirmationRequired()
  );

  const handleSessionModeClick = () => {
    if (sessionModeEnabled) {
      onToggleSessionMode();
      return;
    }

    if (!sessionConfirmRequired) {
      onToggleSessionMode();
      return;
    }

    setRememberChoice(false);
    setShowSessionModeModal(true);
  };

  const handleSessionModeStart = () => {
    if (rememberChoice) {
      setSessionModeConfirmationRequired(false);
      setSessionConfirmRequired(false);
    }
    setShowSessionModeModal(false);
    onToggleSessionMode();
  };

  const micTitle = !mounted
    ? t("voiceInput")
    : !browserSupportsSpeechRecognition
      ? (unsupportedReason || t("voiceUnsupported"))
      : !isSecure
        ? t("voiceHttps")
        : t("voiceInput");

  return (
    <>
      <div
        ref={shellRef}
        className={`fixed bottom-0 right-0 z-50 transition-all duration-300 ease-out ${
          sidebarOpen ? "left-16" : "left-0"
        }`}
      >
          <form
            onSubmit={onSend}
            className={`mx-auto max-w-4xl px-4 ${minimalComposer ? "py-1.5" : "py-2"}`}
          >
          {/* панель */}
            <div
              className={`shadow-sm ring-1 ${
                minimalComposer ? "rounded-xl px-2.5 py-1.5" : "rounded-2xl px-4 pt-3 pb-2"
              } ${
                hasAmbientBg
                  ? "bg-black/55 ring-white/25"
                  : "bg-gradient-to-br from-[#e8f4f1]/95 via-[#f5f5f5]/95 to-[#ffffff]/95 ring-black/10"
              }`}
            >
            {minimalComposer ? (
              <div className="flex items-center gap-2">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder=""
                  className={`flex-1 min-h-[28px] max-h-24 py-1 resize-none bg-transparent text-[14px] leading-5 outline-none ${
                    hasAmbientBg
                      ? "text-white placeholder-white/70 caret-white"
                      : "text-slate-900 placeholder:text-slate-400 caret-slate-900"
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (canSend) onSend(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className={`h-10 w-10 shrink-0 self-center rounded-full grid place-items-center text-white transition disabled:opacity-40 disabled:cursor-not-allowed ${sendAccentClass}`}
                  title="Send"
                  aria-label="Send"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("inputPlaceholder")}
                  className={`w-full min-h-[40px] max-h-36 resize-none bg-transparent text-[15px] leading-6 outline-none ${
                    hasAmbientBg
                      ? "text-white placeholder-white/70 caret-white"
                      : "text-slate-900 placeholder:text-slate-400 caret-slate-900"
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSend(e);
                    }
                  }}
                />

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSessionModeClick}
                      className={[
                        "text-[13px] rounded-full px-4 py-1.5 transition ring-1 cursor-pointer",
                        sessionModeEnabled
                          ? "bg-blue-50 text-blue-800 ring-blue-300"
                          : "bg-transparent text-slate-500 ring-slate-200 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {sessionModeEnabled ? t("sessionModeOn") : t("sessionMode")}
                    </button>

                    <button
                      type="button"
                      onClick={onToggleVoiceMode}
                      className={[
                        "text-[13px] rounded-full px-4 py-1.5 transition ring-1 cursor-pointer",
                        voiceModeEnabled
                          ? "bg-blue-50 text-blue-800 ring-blue-300"
                          : "bg-transparent text-slate-500 ring-slate-200 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {voiceModeEnabled ? t("voiceModeOn") : t("voiceMode")}
                    </button>

                    {loading && (
                      <span className={`text-[11px] ${hasAmbientBg ? "text-white/75" : "text-slate-500"}`}>
                        {t("sending")}
                      </span>
                    )}
                  </div>

                  {input.trim() ? (
                    <button
                      type="submit"
                      className={`h-11 w-11 rounded-full grid place-items-center text-white transition flex-shrink-0 ${sendAccentClass}`}
                      title="Send"
                      aria-label="Send"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={toggleVoice}
                      disabled={micDisabled}
                      className={[
                        "h-11 w-11 rounded-full grid place-items-center transition flex-shrink-0 cursor-pointer",
                        micDisabled
                          ? "opacity-40 cursor-not-allowed text-slate-400"
                          : listening
                            ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
                            : "text-slate-500 hover:bg-black/[0.05]",
                      ].join(" ")}
                      title={micTitle}
                      aria-label="Voice"
                    >
                      <Mic className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </>
            )}
            {minimalComposer && loading && (
              <p className={`mt-1.5 text-[11px] ${hasAmbientBg ? "text-white/75" : "text-slate-500"}`}>
                {t("sending")}
              </p>
            )}
          </div>

          {!minimalComposer && mounted && !isSecure && (
            <p className="mt-2 text-xs text-amber-700">
               {t("voiceHttpsWarning")} <b>HTTPS</b>
            </p>
          )}
        </form>
      </div>

      {showSessionModeModal && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Закрыть окно"
            onClick={() => setShowSessionModeModal(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/10">
            <h3 className="text-base font-semibold text-slate-900">
              {t("sessionMode")}
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-6">
              {t("sessionModeDesc1")}
            </p>
            <p className="mt-2 text-sm text-slate-600 leading-6">
              {t("sessionModeDesc2")}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberChoice}
                  onChange={(e) => setRememberChoice(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#74AA9C] focus:ring-[#74AA9C]/40"
                />
                <span>{t("rememberChoice")}</span>
              </label>

              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setShowRememberHint(true)}
                  onMouseLeave={() => setShowRememberHint(false)}
                  onFocus={() => setShowRememberHint(true)}
                  onBlur={() => setShowRememberHint(false)}
                  className="text-slate-400 hover:text-slate-600 transition"
                  aria-label="Подсказка про настройку"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>

                {showRememberHint && (
                  <div className="absolute left-1/2 top-full z-10 mt-2 w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-xl">
                    {t("rememberHint")}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSessionModeModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleSessionModeStart}
                className="rounded-lg px-4 py-2 text-sm font-medium bg-[#74AA9C] text-white hover:bg-[#5d9088] transition"
              >
                {t("sessionModeStart")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
