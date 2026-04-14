"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Mic, Square, Volume2 } from "lucide-react";

function StateIcon({ state }) {
  if (state === "thinking") return <Loader2 className="h-8 w-8 animate-spin text-blue-600" />;
  if (state === "speaking") return <Volume2 className="h-8 w-8 text-blue-600" />;
  return <Mic className="h-8 w-8 text-blue-600" />;
}

function StateText({ state }) {
  if (state === "listening") return "Слушаю вас...";
  if (state === "thinking") return "Думаю над ответом...";
  if (state === "speaking") return "Говорю с вами...";
  return "Готова начать разговор";
}

export default function VoiceConversationPanel({
  state,
  liveText,
  heard,
  reply,
  error,
  onStop,
}) {
  const [voiceBurst, setVoiceBurst] = useState(false);
  const [wavePhase, setWavePhase] = useState(0);

  useEffect(() => {
    if (state !== "listening") return;
    if (!liveText?.trim()) return;

    setVoiceBurst(true);
    const t = setTimeout(() => setVoiceBurst(false), 180);
    return () => clearTimeout(t);
  }, [liveText, state]);

  useEffect(() => {
    if (state !== "listening") {
      setWavePhase(0);
      return;
    }

    const interval = setInterval(() => {
      setWavePhase((prev) => (prev + 1) % 8);
    }, 120);

    return () => clearInterval(interval);
  }, [state]);

  const intensity = useMemo(() => {
    if (state !== "listening") return 1;
    const len = (liveText || "").trim().length;
    const burst = voiceBurst ? 0.14 : 0;
    const byText = Math.min(0.3, len / 90);
    return 1 + byText + burst;
  }, [liveText, state, voiceBurst]);

  const showLiveText = state === "listening" && (liveText || "").trim().length > 0;
  const showHearingPulse = state === "listening";

  return (
    <div className="h-dvh w-full bg-blue-100 backdrop-blur-sm flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl text-center">
        <div className="relative mx-auto mb-8 h-52 w-52">
          <div
            className={`absolute inset-0 rounded-full border border-blue-300/70 ${showHearingPulse ? "animate-ping" : ""}`}
            style={{ animationDuration: "1400ms", opacity: showHearingPulse ? 1 : 0.35 }}
          />
          <div
            className={`absolute inset-2 rounded-full border border-blue-200/80 ${showHearingPulse ? "animate-ping" : ""}`}
            style={{ animationDuration: "1050ms", opacity: showHearingPulse ? 1 : 0.35 }}
          />
          <div
            className={`absolute inset-4 rounded-full bg-[radial-gradient(circle_at_35%_25%,#e0f2fe_0%,#7dd3fc_45%,#0284c7_100%)] transition-transform duration-150 ${state === "thinking" ? "animate-pulse" : ""}`}
            style={{
              transform: `scale(${voiceBurst ? Math.min(1.08, intensity) : intensity})`,
              boxShadow:
                state === "listening"
                  ? `0 0 0 ${16 + (voiceBurst ? 8 : 2)}px rgba(125,211,252,0.30), 0 0 ${78 + (voiceBurst ? 34 : 0)}px rgba(14,165,233,0.60)`
                  : "0 0 0 14px rgba(125,211,252,0.22), 0 0 70px rgba(14,165,233,0.42)",
            }}
          />
        </div>

        <div className="mx-auto w-fit rounded-full bg-white/85 px-4 py-2 ring-1 ring-blue-200 flex items-center gap-3">
          <StateIcon state={state} />
          <span className="text-sm font-medium text-slate-700">
            <StateText state={state} />
          </span>
        </div>

        {state === "listening" && (
          <div className="mx-auto mt-3 flex h-7 w-36 items-end justify-center gap-1">
            {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
              <span
                key={bar}
                className="w-1.5 rounded-full bg-blue-500/80"
                style={{
                  height: `${10 + ((bar + wavePhase) % 4) * 5 + (voiceBurst ? 7 : 0)}px`,
                  transform: `scaleY(${voiceBurst ? 1.35 : 0.95})`,
                  transition: "transform 120ms ease",
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-4 space-y-2">
          {showLiveText && (
            <p className="mx-auto max-w-2xl text-sm font-medium text-blue-800">
              Слышу: "{liveText.trim()}"
            </p>
          )}

          {heard && (
            <p className="text-sm text-slate-600">
              Вы: "{heard}"
            </p>
          )}

          {reply && (
            <p className="mx-auto max-w-2xl text-sm text-slate-700">
              Последний ответ: {reply}
            </p>
          )}

          {error && (
            <p className="text-sm text-rose-600">{error}</p>
          )}
        </div>

        <div className="mt-10 flex items-center justify-center">
          <button
            type="button"
            onClick={onStop}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            <Square className="h-4 w-4" />
            Завершить голосовой сеанс
          </button>
        </div>
      </div>
    </div>
  );
}
