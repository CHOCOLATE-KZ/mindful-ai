"use client";

import { useState, useEffect, useRef } from "react";
import { VolumeX, Volume2, Music, X, PanelLeft, PanelLeftClose } from "lucide-react";

const BACKGROUNDS = [
  { id: "none",      label: "Нет",     emoji: "⬜", videoId: null },
  { id: "rain",      label: "Дождь",   emoji: "🌧️", videoId: "q76bMs-NwRk" },
  { id: "forest",    label: "Лес",     emoji: "🌲", videoId: "xNN7iTA57jM" },
  { id: "fireplace", label: "Камин",   emoji: "🔥", videoId: "L_LUpnjgPso" },
  { id: "ocean",     label: "Океан",   emoji: "🌊", videoId: "bn9F19Hi1Lk" },
  { id: "lofi",      label: "Lo-Fi",   emoji: "🎵", videoId: "jfKfPfyJRdk" },
  // Space uses a built-in visual background to avoid YouTube "video unavailable" issues.
  { id: "space",     label: "Космос",  emoji: "🌌", videoId: null },
];

const SOUNDS = [
  { id: "none",      label: "Выкл",    emoji: "🔇", videoId: null },
  { id: "rain",      label: "Дождь",   emoji: "🌧️", videoId: "q76bMs-NwRk" },
  { id: "forest",    label: "Лес",     emoji: "🌲", videoId: "xNN7iTA57jM" },
  { id: "fireplace", label: "Камин",   emoji: "🔥", videoId: "L_LUpnjgPso" },
  { id: "ocean",     label: "Океан",   emoji: "🌊", videoId: "bn9F19Hi1Lk" },
  { id: "lofi",      label: "Lo-Fi",   emoji: "🎵", videoId: "jfKfPfyJRdk" },
];

const ATMOSPHERES = [
  { id: "none", label: "Выкл", emoji: "🔇", bgId: "none", soundId: "none" },
  { id: "rain", label: "Дождь", emoji: "🌧️", bgId: "rain", soundId: "rain" },
  { id: "forest", label: "Лес", emoji: "🌲", bgId: "forest", soundId: "forest" },
  { id: "fireplace", label: "Камин", emoji: "🔥", bgId: "fireplace", soundId: "fireplace" },
  { id: "ocean", label: "Океан", emoji: "🌊", bgId: "ocean", soundId: "ocean" },
  { id: "space", label: "Космос", emoji: "🌌", bgId: "space", soundId: "none" },
  { id: "lofi", label: "Lo-Fi", emoji: "🎵", bgId: "lofi", soundId: "lofi" },
];

export default function ChatAmbient({ selectedBg, setSelectedBg, sidebarOpen, setSidebarOpen }) {
  const [ambientOpen, setAmbientOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState(() => {
    if (typeof window === "undefined") return "none";
    return localStorage.getItem("chatAmbientSound") || "none";
  });
  const [muted, setMuted] = useState(false);
  const lastBgRef = useRef("rain");
  const [volume, setVolume] = useState(() => {
    if (typeof window === "undefined") return 40;
    const savedVol = localStorage.getItem("chatAmbientVolume");
    return savedVol ? Number(savedVol) : 40;
  });
  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedBg = localStorage.getItem("chatAmbientBg");
    if (savedBg) {
      queueMicrotask(() => setSelectedBg(savedBg));
    }
  }, [setSelectedBg]);

  useEffect(() => { localStorage.setItem("chatAmbientBg", selectedBg); }, [selectedBg]);
  useEffect(() => { localStorage.setItem("chatAmbientSound", selectedSound); }, [selectedSound]);
  useEffect(() => { localStorage.setItem("chatAmbientVolume", String(volume)); }, [volume]);

  // Update audio iframe volume via postMessage
  useEffect(() => {
    if (!audioRef.current) return;
    const vol = muted ? 0 : volume;
    audioRef.current.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: "setVolume", args: [vol] }),
      "*"
    );
  }, [volume, muted]);

  const bgVideo = BACKGROUNDS.find((b) => b.id === selectedBg);
  const soundItem = SOUNDS.find((s) => s.id === selectedSound);
  const selectedAtmosphere = ATMOSPHERES.find((a) => a.bgId === selectedBg && a.soundId === selectedSound);
  const isSpaceBg = selectedBg === "space";
  const bgEnabled = selectedBg !== "none";
  const accentByAtmosphere = {
    none: "bg-[#74AA9C] border-[#74AA9C]",
    rain: "bg-[#355A8A] border-[#355A8A]",
    forest: "bg-[#2F6A4F] border-[#2F6A4F]",
    fireplace: "bg-[#8A4F36] border-[#8A4F36]",
    ocean: "bg-[#2C6F7B] border-[#2C6F7B]",
    space: "bg-[#4C4F8A] border-[#4C4F8A]",
    lofi: "bg-[#6A4F8A] border-[#6A4F8A]",
  };
  const activeAccent = accentByAtmosphere[selectedAtmosphere?.id || (selectedBg !== "none" ? selectedBg : "none")] || accentByAtmosphere.none;

  useEffect(() => {
    if (selectedBg !== "none") {
      lastBgRef.current = selectedBg;
    }
  }, [selectedBg]);

  const handleToggleBackground = () => {
    if (bgEnabled) {
      setSelectedBg("none");
      return;
    }
    setSelectedBg(lastBgRef.current || "rain");
  };

  const bgSrc = bgVideo?.videoId
    ? `https://www.youtube-nocookie.com/embed/${bgVideo.videoId}?autoplay=1&mute=1&loop=1&playlist=${bgVideo.videoId}&controls=0&disablekb=1&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&cc_load_policy=0&fs=0`
    : null;

  const soundSrc = soundItem?.videoId
    ? `https://www.youtube-nocookie.com/embed/${soundItem.videoId}?autoplay=1&mute=0&loop=1&playlist=${soundItem.videoId}&controls=0&disablekb=1&modestbranding=1&playsinline=1&rel=0&enablejsapi=1`
    : null;

  return (
    <>
      {/* ── Full-screen muted video background ── */}
      {isSpaceBg && (
        <div className="fixed inset-0 -z-[5] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,140,255,0.35),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(80,220,255,0.2),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(200,120,255,0.18),transparent_28%),linear-gradient(180deg,#05070f_0%,#0a1022_55%,#060910_100%)]" />
          <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(1.2px_1.2px_at_20px_30px,#ffffff,transparent),radial-gradient(1px_1px_at_140px_90px,#b9ccff,transparent),radial-gradient(1.4px_1.4px_at_260px_170px,#ffffff,transparent),radial-gradient(1px_1px_at_400px_40px,#d7e3ff,transparent)] [background-size:420px_240px]" />
          <div className="absolute inset-0 bg-black/55" />
        </div>
      )}

      {!isSpaceBg && bgSrc && (
        <div className="fixed inset-0 -z-[5] overflow-hidden pointer-events-none">
          <iframe
            key={bgVideo.videoId}
            src={bgSrc}
            title="ambient background"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: "177.78vh", height: "100vh", minWidth: "100vw", minHeight: "56.25vw", pointerEvents: "none" }}
            allow="autoplay; encrypted-media"
            frameBorder="0"
          />
          <div className="absolute inset-0 bg-black/72" />
        </div>
      )}

      {/* ── Hidden audio-only iframe ── */}
      {soundSrc && (
        <iframe
          ref={audioRef}
          key={soundItem.videoId}
          src={soundSrc}
          title="ambient sound"
          className="sr-only"
          allow="autoplay; encrypted-media"
          frameBorder="0"
        />
      )}

      {/* ── Sidebar toggle ── */}
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className={`fixed top-1/2 -translate-y-1/2 z-[120] h-8 w-5 rounded-r-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-l-0 border-black/10 dark:border-white/10 shadow flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 ease-out ${sidebarOpen ? "left-16" : "left-0"}`}
        title={sidebarOpen ? "Скрыть навигацию" : "Показать навигацию"}
      >
        {sidebarOpen
          ? <PanelLeftClose className="h-3 w-3" />
          : <PanelLeft className="h-3 w-3" />}
      </button>

      {/* ── Floating buttons ── */}
      <div className="fixed bottom-36 right-4 z-[110] flex flex-col items-end gap-2">
        <div className="relative">
          <button
            onClick={() => setAmbientOpen((v) => !v)}
            className={`h-10 w-10 rounded-full backdrop-blur shadow-md border grid place-items-center transition hover:scale-105 active:scale-95 ${
              selectedSound !== "none" || selectedBg !== "none"
                ? `${activeAccent} text-white`
                : "bg-white/90 dark:bg-slate-800/90 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300"
            }`}
            title="Звук и фон"
          >
            <Music className="h-4 w-4" />
          </button>

          {ambientOpen && (
            <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
              <button
                type="button"
                className="absolute inset-0 bg-black/45"
                aria-label="Закрыть настройки атмосферы"
                onClick={() => setAmbientOpen(false)}
              />

              <div className="relative w-full max-w-md rounded-2xl bg-white/95 dark:bg-[rgb(33_33_46)]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Атмосфера</span>
                  <button onClick={() => setAmbientOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mb-3">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Атмосфера</span>
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={handleToggleBackground}
                      className={`w-full rounded-xl px-3 py-2 text-xs font-medium transition border ${
                        bgEnabled
                          ? "bg-[#74AA9C]/15 border-[#74AA9C]/45 text-[#5d9088] dark:text-[#9bd4c7]"
                          : "bg-black/[0.04] dark:bg-white/[0.06] border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      Фон: {bgEnabled ? "включен" : "выключен"}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {ATMOSPHERES.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setSelectedBg(a.bgId);
                          setSelectedSound(a.soundId);
                          if (a.soundId !== "none") setMuted(false);
                        }}
                        className={`rounded-xl px-1 py-2 text-[11px] flex flex-col items-center gap-0.5 transition font-medium ${
                          selectedAtmosphere?.id === a.id
                            ? "bg-[#74AA9C] text-white shadow-sm"
                            : "bg-black/[0.04] dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-black/[0.08]"
                        }`}
                      >
                        <span className="text-lg">{a.emoji}</span>
                        <span>{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedSound !== "none" && (
                  <div className="space-y-2 border-t border-black/10 pt-2 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setMuted((v) => !v)}
                        className="shrink-0 text-slate-500 dark:text-slate-400 hover:text-[#74AA9C] transition"
                      >
                        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-[#74AA9C]" />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={muted ? 0 : volume}
                        onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
                        className="w-full h-1.5 accent-[#74AA9C] cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-400 w-6 text-right shrink-0">{muted ? 0 : volume}</span>
                    </div>
                  </div>
                )}

                {!selectedAtmosphere && (
                  <p className="mt-2 text-[11px] text-amber-500">Выбран пользовательский микс атмосферы.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
