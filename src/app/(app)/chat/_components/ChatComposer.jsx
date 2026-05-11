"use client";

import { HelpCircle, Mic, Send } from "lucide-react";
import { useState } from "react";
import {
  getSessionModeConfirmationRequired,
  setSessionModeConfirmationRequired,
} from "@/lib/sessionModeConsent";
import { useLanguage } from "@/lib/i18n/useLanguage";

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
}) {
  const { t } = useLanguage("chat");
  const {
    listening,
    isSecure,
    toggleVoice,
    mounted,
    browserSupportsSpeechRecognition,
    unsupportedReason,
  } = voice;

  const micDisabled = !mounted || !browserSupportsSpeechRecognition || !isSecure;
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
      <div className="fixed bottom-0 left-16 right-0 z-50 bg-white/85 dark:bg-[#131314]/90 backdrop-blur-xl">
          <form onSubmit={onSend} className="mx-auto max-w-4xl px-4 py-2">
          {/* панель */}
            <div className="rounded-2xl bg-white dark:bg-[#1c1c1d] shadow-sm ring-1 ring-black/10 dark:ring-white/10 px-4 pt-3 pb-2">
            {/* textarea без своей рамки — выглядит как часть контейнера */}
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
              placeholder={t("inputPlaceholder")}
                className="w-full min-h-[40px] max-h-36 resize-none bg-transparent dark:text-slate-100 dark:placeholder-slate-400 text-[15px] leading-6 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend(e);
                  }
                }}
              />

            {/* нижняя панель: кнопки слева и кнопка отправки справа */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSessionModeClick}
                  className={[
                    "text-[13px] rounded-full px-4 py-1.5 transition ring-1 cursor-pointer",
                    sessionModeEnabled
                      ? "bg-blue-50 text-blue-800 ring-blue-300"
                      : "bg-transparent text-slate-500 dark:text-slate-300 ring-slate-200 hover:bg-slate-50 dark:ring-slate-600 dark:hover:bg-slate-700",
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
                      : "bg-transparent text-slate-500 dark:text-slate-300 ring-slate-200 hover:bg-slate-50 dark:ring-slate-600 dark:hover:bg-slate-700",
                  ].join(" ")}
                >
                  {voiceModeEnabled ? t("voiceModeOn") : t("voiceMode")}
                </button>

                {loading && <span className="text-[11px] text-slate-500">{t("sending")}</span>}
              </div>

              {/* кнопка: микрофон или отправить */}
              {input.trim() ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-11 rounded-full grid place-items-center bg-[#74AA9C] text-white hover:bg-[#5d9088] transition disabled:opacity-40 flex-shrink-0 "
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
                        : "text-slate-500 hover:bg-black/[0.05] dark:hover:bg-white/10",
                  ].join(" ")}
                  title={micTitle}
                  aria-label="Voice"
                >
                  <Mic className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* предупреждение вынесем внутрь формы, чтобы не “прыгало” */}
          {mounted && !isSecure && (
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

          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl ring-1 ring-black/10 dark:ring-white/10">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t("sessionMode")}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-6">
              {t("sessionModeDesc1")}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-6">
              {t("sessionModeDesc2")}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer select-none">
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
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  aria-label="Подсказка про настройку"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>

                {showRememberHint && (
                  <div className="absolute left-1/2 top-full z-10 mt-2 w-64 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-xl dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200">
                    {t("rememberHint")}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSessionModeModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
