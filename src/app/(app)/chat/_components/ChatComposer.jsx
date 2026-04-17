"use client";

import { Mic, Send } from "lucide-react";

export default function ChatComposer({
  input,
  setInput,
  onSend,
  loading,
  voice,
  voiceModeEnabled,
  onToggleVoiceMode,
}) {
  const {
    listening,
    isSecure,
    toggleVoice,
    mounted,
    browserSupportsSpeechRecognition,
    unsupportedReason,
  } = voice;

  const micDisabled = !mounted || !browserSupportsSpeechRecognition || !isSecure;
  const micTitle = !mounted
    ? "Voice input"
    : !browserSupportsSpeechRecognition
      ? (unsupportedReason || "Голосовой ввод не поддерживается в этом браузере")
      : !isSecure
        ? "Голос работает только на HTTPS или localhost"
        : "Voice input";

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10 dark:border-white/10 bg-white/85 dark:bg-slate-950/90 backdrop-blur-xl">
          <form onSubmit={onSend} className="mx-auto max-w-4xl px-4 py-2">
          {/* панель */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-black/10 dark:ring-white/10 px-4 py-2">
            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Напишите, что чувствуете…"
                className="w-full min-h-[40px] max-h-36 resize-none rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 px-4 py-2 text-[15px] leading-6 outline-none
                           focus:border-[#74AA9C]/60 focus:ring-4 focus:ring-[#74AA9C]/15 dark:focus:ring-[#74AA9C]/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend(e);
                  }
                }}
              />

              <button
                type="button"
                onClick={toggleVoice}
                disabled={micDisabled}
                className={[
                  "h-12 w-12 rounded-full grid place-items-center transition flex-shrink-0",
                  micDisabled
                    ? "opacity-40 cursor-not-allowed"
                    : listening
                      ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
                      : "hover:bg-black/[0.05] text-slate-700",
                ].join(" ")}
                title={micTitle}
                aria-label="Voice"
              >
                <Mic className="h-6 w-6" />
              </button>

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="h-12 w-12 rounded-full grid place-items-center bg-[#74AA9C] text-white shadow-sm hover:bg-[#5d9088] transition disabled:opacity-40 flex-shrink-0"
                title="Send"
                aria-label="Send"
              >
                <Send className="h-6 w-6" />
              </button>
            </div>

              <div className="mt-2 flex items-center justify-between px-1">
              <p className="text-[11px] text-slate-500">
                <strong>Это поддерживающее пространство.</strong> Можно отвечать коротко или подробно.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onToggleVoiceMode}
                  className={[
                    "text-[11px] rounded-full px-3 py-1 transition ring-1",
                    voiceModeEnabled
                      ? "bg-blue-50 text-blue-800 ring-blue-300"
                      : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {voiceModeEnabled ? "Голосовой режим включен" : "Режим только голосом"}
                </button>

                {loading && <span className="text-[11px] text-slate-500">Отправка…</span>}
              </div>
            </div>
          </div>

          {/* предупреждение вынесем внутрь формы, чтобы не “прыгало” */}
          {mounted && !isSecure && (
            <p className="mt-2 text-xs text-amber-700">
               Голосовой ввод работает только на <b>HTTPS</b> (или localhost).
            </p>
          )}
        </form>
      </div>
    </>
  );
}
