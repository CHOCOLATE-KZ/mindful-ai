"use client";

import { Mic, Send } from "lucide-react";

export default function ChatComposer({ input, setInput, onSend, loading, voice }) {
  const { listening, isSecure, toggleVoice, mounted, browserSupportsSpeechRecognition } = voice;

  const micDisabled = !mounted || !browserSupportsSpeechRecognition || !isSecure;
  const micTitle = !mounted
    ? "Voice input"
    : !browserSupportsSpeechRecognition
      ? "Голосовой ввод не поддерживается в этом браузере"
      : !isSecure
        ? "Голос работает только на HTTPS или localhost"
        : "Voice input";

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10 bg-white/85 backdrop-blur-xl">
        <form onSubmit={onSend} className="mx-auto max-w-4xl px-4 py-4">
          {/* панель */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/10 px-4 py-3">
            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Напишите, что чувствуете…"
                className="w-full min-h-[48px] max-h-36 resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-[15px] leading-6 outline-none
                           focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
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
                className="h-12 w-12 rounded-full grid place-items-center bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-40 flex-shrink-0"
                title="Send"
                aria-label="Send"
              >
                <Send className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between px-1">
              <p className="text-[11px] text-slate-500">
                <strong>Это поддерживающее пространство.</strong> Можно отвечать коротко или подробно.
              </p>
              {loading && <span className="text-[11px] text-slate-500">Отправка…</span>}
            </div>
          </div>

          {/* предупреждение вынесем внутрь формы, чтобы не “прыгало” */}
          {mounted && !isSecure && (
            <p className="mt-2 text-xs text-amber-700">
              🎤 Голосовой ввод работает только на <b>HTTPS</b> (или localhost).
            </p>
          )}
        </form>
      </div>
    </>
  );
}
