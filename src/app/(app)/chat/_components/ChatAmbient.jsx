"use client";



import { useState, useEffect, useRef } from "react";

import {

  VolumeX,

  Volume2,

  Music,

  X,

  PanelLeft,

  PanelLeftClose,

  Waves,

  ImageIcon,

  PanelTop,

  CircleUserRound,

  Keyboard,

} from "lucide-react";



const BACKGROUNDS = [

  { id: "none",      label: "Нет",     emoji: "⬜", videoId: null },

  { id: "rain",      label: "Дождь",   emoji: "🌧️", videoId: "q76bMs-NwRk" },

  { id: "forest",    label: "Лес",     emoji: "🌲", videoId: "xNN7iTA57jM" },

  { id: "fireplace", label: "Камин",   emoji: "🔥", videoId: "L_LUpnjgPso" },

  { id: "ocean",     label: "Океан",   emoji: "🌊", videoId: "bn9F19Hi1Lk" },

  { id: "lofi",      label: "Lo-Fi",   emoji: "🎵", videoId: "TSA6GD9MioM" },

  { id: "space",     label: "Космос",  emoji: "🌌", videoId: "gCWaRhNUvfc" },

];



const SOUNDS = [

  { id: "none",      label: "Выкл",    emoji: "🔇", videoId: null },

  { id: "rain",      label: "Дождь",   emoji: "🌧️", videoId: "q76bMs-NwRk" },

  { id: "forest",    label: "Лес",     emoji: "🌲", videoId: "xNN7iTA57jM" },

  { id: "fireplace", label: "Камин",   emoji: "🔥", videoId: "L_LUpnjgPso" },

  { id: "ocean",     label: "Океан",   emoji: "🌊", videoId: "bn9F19Hi1Lk" },

  { id: "lofi",      label: "Lo-Fi",   emoji: "🎵", videoId: "TSA6GD9MioM" },

  { id: "space",     label: "Космос",  emoji: "🌌", videoId: "gCWaRhNUvfc" },

];



const ATMOSPHERES = [

  { id: "none", label: "Выкл", emoji: "🔇", bgId: "none", soundId: "none" },

  { id: "rain", label: "Дождь", emoji: "🌧️", bgId: "rain", soundId: "rain" },

  { id: "forest", label: "Лес", emoji: "🌲", bgId: "forest", soundId: "forest" },

  { id: "fireplace", label: "Камин", emoji: "🔥", bgId: "fireplace", soundId: "fireplace" },

  { id: "ocean", label: "Океан", emoji: "🌊", bgId: "ocean", soundId: "ocean" },

  { id: "space", label: "Космос", emoji: "🌌", bgId: "space", soundId: "space" },

  { id: "lofi", label: "Lo-Fi", emoji: "🎵", bgId: "lofi", soundId: "lofi" },

];



const ATMOSPHERE_STYLE = {

  none: {

    preview: "from-slate-200 to-slate-100",

    ring: "ring-[#74AA9C]",

    active: "bg-[#74AA9C] shadow-[0_8px_24px_rgba(116,170,156,0.35)]",

  },

  rain: {

    preview: "from-[#4a6fa5] via-[#3d5a80] to-[#2c3e5c]",

    ring: "ring-[#355A8A]",

    active: "bg-[#355A8A] shadow-[0_8px_24px_rgba(53,90,138,0.4)]",

  },

  forest: {

    preview: "from-[#3d8a5c] via-[#2F6A4F] to-[#1e4d38]",

    ring: "ring-[#2F6A4F]",

    active: "bg-[#2F6A4F] shadow-[0_8px_24px_rgba(47,106,79,0.4)]",

  },

  fireplace: {

    preview: "from-[#c97a4a] via-[#8A4F36] to-[#5c3020]",

    ring: "ring-[#8A4F36]",

    active: "bg-[#8A4F36] shadow-[0_8px_24px_rgba(138,79,54,0.4)]",

  },

  ocean: {

    preview: "from-[#3a9cad] via-[#2C6F7B] to-[#1a4a55]",

    ring: "ring-[#2C6F7B]",

    active: "bg-[#2C6F7B] shadow-[0_8px_24px_rgba(44,111,123,0.4)]",

  },

  space: {

    preview: "from-[#6b5ce7] via-[#4C4F8A] to-[#1a1035]",

    ring: "ring-[#4C4F8A]",

    active: "bg-[#4C4F8A] shadow-[0_8px_24px_rgba(76,79,138,0.45)]",

  },

  lofi: {

    preview: "from-[#9b6bb8] via-[#6A4F8A] to-[#4a3268]",

    ring: "ring-[#6A4F8A]",

    active: "bg-[#6A4F8A] shadow-[0_8px_24px_rgba(106,79,138,0.4)]",

  },

};



export default function ChatAmbient({
  selectedBg,
  setSelectedBg,
  sidebarOpen,
  setSidebarOpen,
  hideChatHeader = false,
  setHideChatHeader,
  hideChatAvatars = false,
  setHideChatAvatars,
  minimalComposer = false,
  setMinimalComposer,
}) {

  const [ambientOpen, setAmbientOpen] = useState(false);

  const [selectedSound, setSelectedSound] = useState("none");

  const [muted, setMuted] = useState(false);

  const lastBgRef = useRef("rain");

  const [volume, setVolume] = useState(40);

  const audioRef = useRef(null);

  const persistReadyRef = useRef(false);



  useEffect(() => {

    const savedSound = localStorage.getItem("chatAmbientSound");

    if (savedSound) setSelectedSound(savedSound);

    const savedVol = localStorage.getItem("chatAmbientVolume");

    if (savedVol) setVolume(Number(savedVol));

    persistReadyRef.current = true;

  }, []);



  useEffect(() => {

    if (!persistReadyRef.current) return;

    localStorage.setItem("chatAmbientBg", selectedBg);

  }, [selectedBg]);

  useEffect(() => {

    if (!persistReadyRef.current) return;

    localStorage.setItem("chatAmbientSound", selectedSound);

  }, [selectedSound]);



  useEffect(() => {

    if (!persistReadyRef.current) return;

    localStorage.setItem("chatAmbientVolume", String(volume));

  }, [volume]);



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



  useEffect(() => {

    if (!ambientOpen) return;

    const onKey = (e) => {

      if (e.key === "Escape") setAmbientOpen(false);

    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);

  }, [ambientOpen]);



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

      {bgSrc && (

        <div className="fixed inset-0 z-[1] overflow-hidden pointer-events-none">

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



      <button

        onClick={() => setSidebarOpen((v) => !v)}

        className={`fixed top-1/2 -translate-y-1/2 z-[120] h-8 w-5 rounded-r-lg bg-white/80 backdrop-blur border border-l-0 border-black/10 shadow flex items-center justify-center text-slate-500 hover:bg-white transition-all duration-300 ease-out ${sidebarOpen ? "left-16" : "left-0"}`}

        title={sidebarOpen ? "Скрыть навигацию" : "Показать навигацию"}

      >

        {sidebarOpen

          ? <PanelLeftClose className="h-3 w-3" />

          : <PanelLeft className="h-3 w-3" />}

      </button>



      <div className="fixed bottom-20 right-4 z-[110] flex flex-col items-end gap-2">

        <div className="relative">

          <button

            onClick={() => setAmbientOpen((v) => !v)}

            className={`h-10 w-10 rounded-full backdrop-blur shadow-md border grid place-items-center transition hover:scale-105 active:scale-95 ${

              selectedSound !== "none" || selectedBg !== "none"

                ? `${activeAccent} text-white`

                : "bg-white/90 border-black/10 text-slate-600"

            }`}

            title="Звук и фон"

          >

            <Music className="h-4 w-4" />

          </button>



          {ambientOpen && (

            <div

              className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"

              role="dialog"

              aria-modal="true"

              aria-labelledby="ambient-modal-title"

            >

              <button

                type="button"

                className="absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity"

                aria-label="Закрыть настройки атмосферы"

                onClick={() => setAmbientOpen(false)}

              />



              <div className="relative w-full sm:max-w-lg max-h-[min(92dvh,640px)] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl ring-1 ring-black/10 animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">

                <div className="relative shrink-0 overflow-hidden border-b border-black/[0.06]">

                  <div

                    className="absolute inset-0 opacity-90"

                    style={{

                      background:

                        "linear-gradient(135deg, rgba(116,170,156,0.18) 0%, rgba(232,244,241,0.5) 45%, transparent 100%)",

                    }}

                  />

                  <div className="relative flex items-start gap-3 px-5 pt-5 pb-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#74AA9C] text-white shadow-[0_10px_28px_rgba(116,170,156,0.35)]">

                      <Waves className="h-5 w-5" />

                    </div>

                    <div className="min-w-0 flex-1 pr-8">

                      <h2

                        id="ambient-modal-title"

                        className="text-base font-semibold text-slate-900"

                      >

                        Атмосфера

                      </h2>

                      <p className="mt-0.5 text-sm text-slate-500 leading-snug">

                        Фон и звук для спокойного разговора

                      </p>

                    </div>

                    <button

                      type="button"

                      onClick={() => setAmbientOpen(false)}

                      className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-black/[0.06] hover:text-slate-600"

                      aria-label="Закрыть"

                    >

                      <X className="h-4 w-4" />

                    </button>

                  </div>

                </div>



                <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-5">

                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-black/[0.06]">

                    <div className="flex items-center gap-3 min-w-0">

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#74AA9C] shadow-sm ring-1 ring-black/[0.06]">

                        <ImageIcon className="h-4 w-4" />

                      </span>

                      <div>

                        <p className="text-sm font-medium text-slate-800">

                          Видеофон

                        </p>

                        <p className="text-xs text-slate-500">

                          {bgEnabled ? "Показывается на экране чата" : "Только звук, без картинки"}

                        </p>

                      </div>

                    </div>

                    <button

                      type="button"

                      role="switch"

                      aria-checked={bgEnabled}

                      onClick={handleToggleBackground}

                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${

                        bgEnabled ? "bg-[#74AA9C]" : "bg-slate-300"

                      }`}

                    >

                      <span

                        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${

                          bgEnabled ? "translate-x-5" : "translate-x-0"

                        }`}

                      />

                    </button>

                  </div>



                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-black/[0.06]">

                    <div className="flex items-center gap-3 min-w-0">

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#74AA9C] shadow-sm ring-1 ring-black/[0.06]">

                        <PanelTop className="h-4 w-4" />

                      </span>

                      <div>

                        <p className="text-sm font-medium text-slate-800">

                          Скрыть шапку чата

                        </p>

                        <p className="text-xs text-slate-500">

                          {hideChatHeader

                            ? "Больше места для фона; меню — кнопка ⋮ справа сверху"

                            : "Показывается заголовок MindfulAI Assistant"}

                        </p>

                      </div>

                    </div>

                    <button

                      type="button"

                      role="switch"

                      aria-checked={hideChatHeader}

                      onClick={() => setHideChatHeader?.((v) => !v)}

                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${

                        hideChatHeader ? "bg-[#74AA9C]" : "bg-slate-300"

                      }`}

                    >

                      <span

                        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${

                          hideChatHeader ? "translate-x-5" : "translate-x-0"

                        }`}

                      />

                    </button>

                  </div>



                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-black/[0.06]">

                    <div className="flex items-center gap-3 min-w-0">

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#74AA9C] shadow-sm ring-1 ring-black/[0.06]">

                        <CircleUserRound className="h-4 w-4" />

                      </span>

                      <div>

                        <p className="text-sm font-medium text-slate-800">

                          Скрыть аватарки

                        </p>

                        <p className="text-xs text-slate-500">

                          {hideChatAvatars

                            ? "Только текст сообщений — видеофон не нужен"

                            : "Показываются аватары MindfulAI и ваш профиль"}

                        </p>

                      </div>

                    </div>

                    <button

                      type="button"

                      role="switch"

                      aria-checked={hideChatAvatars}

                      onClick={() => setHideChatAvatars?.((v) => !v)}

                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${

                        hideChatAvatars ? "bg-[#74AA9C]" : "bg-slate-300"

                      }`}

                    >

                      <span

                        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${

                          hideChatAvatars ? "translate-x-5" : "translate-x-0"

                        }`}

                      />

                    </button>

                  </div>



                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-black/[0.06]">

                    <div className="flex items-center gap-3 min-w-0">

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#74AA9C] shadow-sm ring-1 ring-black/[0.06]">

                        <Keyboard className="h-4 w-4" />

                      </span>

                      <div>

                        <p className="text-sm font-medium text-slate-800">

                          Только текст

                        </p>

                        <p className="text-xs text-slate-500">

                          {minimalComposer

                            ? "Скрыты режим сеанса, голос и микрофон — компактное поле"

                            : "Показаны все кнопки под полем ввода"}

                        </p>

                      </div>

                    </div>

                    <button

                      type="button"

                      role="switch"

                      aria-checked={minimalComposer}

                      onClick={() => setMinimalComposer?.((v) => !v)}

                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${

                        minimalComposer ? "bg-[#74AA9C]" : "bg-slate-300"

                      }`}

                    >

                      <span

                        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${

                          minimalComposer ? "translate-x-5" : "translate-x-0"

                        }`}

                      />

                    </button>

                  </div>



                  <div>

                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">

                      Пресеты

                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">

                      {ATMOSPHERES.map((a) => {

                        const isActive = selectedAtmosphere?.id === a.id;

                        const style = ATMOSPHERE_STYLE[a.id] || ATMOSPHERE_STYLE.none;

                        return (

                          <button

                            key={a.id}

                            type="button"

                            onClick={() => {

                              setSelectedBg(a.bgId);

                              setSelectedSound(a.soundId);

                              if (a.soundId !== "none") setMuted(false);

                            }}

                            className={`group relative flex flex-col items-center gap-1.5 rounded-2xl p-2 transition-all duration-200 ${

                              isActive

                                ? `text-white ring-2 ring-offset-2 ring-offset-white ${style.ring} ${style.active}`

                                : "bg-slate-50 text-slate-700 ring-1 ring-black/[0.06] hover:ring-[#74AA9C]/40 hover:shadow-md"

                            }`}

                          >

                            <span

                              className={`flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-br text-xl shadow-inner ${

                                isActive ? "bg-white/20 ring-1 ring-white/25" : style.preview

                              }`}

                            >

                              {a.emoji}

                            </span>

                            <span className={`text-[11px] font-medium leading-tight ${isActive ? "text-white" : ""}`}>

                              {a.label}

                            </span>

                            {a.soundId !== "none" && (

                              <span

                                className={`absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${

                                  isActive ? "bg-white/25 text-white" : "bg-[#74AA9C]/15 text-[#5d9088]"

                                }`}

                                title="Со звуком"

                              >

                                ♪

                              </span>

                            )}

                          </button>

                        );

                      })}

                    </div>

                  </div>



                  {selectedSound !== "none" && (

                    <div className="rounded-2xl bg-gradient-to-br from-[#e8f4f1]/80 to-white px-4 py-3.5 ring-1 ring-[#74AA9C]/20">

                      <div className="mb-2.5 flex items-center justify-between">

                        <span className="text-xs font-semibold uppercase tracking-wider text-[#5d9088]">

                          Громкость

                        </span>

                        <span className="tabular-nums text-sm font-medium text-slate-600">

                          {muted ? 0 : volume}%

                        </span>

                      </div>

                      <div className="flex items-center gap-3">

                        <button

                          type="button"

                          onClick={() => setMuted((v) => !v)}

                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${

                            muted

                              ? "bg-slate-200/80 text-slate-500"

                              : "bg-[#74AA9C] text-white shadow-[0_6px_16px_rgba(116,170,156,0.35)]"

                          }`}

                          aria-label={muted ? "Включить звук" : "Выключить звук"}

                        >

                          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}

                        </button>

                        <input

                          type="range"

                          min={0}

                          max={100}

                          value={muted ? 0 : volume}

                          onChange={(e) => {

                            setVolume(Number(e.target.value));

                            setMuted(false);

                          }}

                          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200/90 accent-[#74AA9C] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#74AA9C] [&::-webkit-slider-thumb]:shadow-md"

                          aria-label="Громкость атмосферы"

                        />

                      </div>

                    </div>

                  )}



                  {!selectedAtmosphere && (

                    <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-800 ring-1 ring-amber-200/80">

                      <span className="shrink-0" aria-hidden>ℹ️</span>

                      <span>Выбран отдельный микс фона и звука — выберите пресет для синхронизации.</span>

                    </p>

                  )}

                </div>



                <div className="shrink-0 border-t border-black/[0.06] px-5 py-3.5 sm:py-4">

                  <button

                    type="button"

                    onClick={() => setAmbientOpen(false)}

                    className="w-full rounded-xl bg-[#74AA9C] py-2.5 text-sm font-medium text-white transition hover:bg-[#5d9088] active:scale-[0.99] shadow-[0_8px_20px_rgba(116,170,156,0.3)]"

                  >

                    Готово

                  </button>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

    </>

  );

}


