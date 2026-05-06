"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mic, Square, Volume2 } from "lucide-react";

// Цвета проекта #74AA9C

const stateLabel = {
  listening: "Слушаю...",
  thinking: "Осмысляю...",
  speaking: "Говорю...",
  idle: "MindfulAI",
};

const blobVariants = {
  idle: {
    scale: 1,
    borderRadius: "50%",
    rotate: 0,
    boxShadow: "0 0 40px 8px rgba(116,170,156,0.2), 0 0 80px 20px rgba(116,170,156,0.08)",
    transition: { duration: 1.2, ease: "easeOut" },
  },
  listening: {
    scale: [1, 1.03, 1],
    borderRadius: [
      "42% 58% 50% 50% / 45% 45% 55% 55%",
      "50% 50% 58% 42% / 55% 55% 45% 45%",
      "42% 58% 50% 50% / 45% 45% 55% 55%",
    ],
    boxShadow: "0 0 55px 10px rgba(116,170,156,0.45), 0 0 110px 25px rgba(116,170,156,0.2)",
    transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
  },
  thinking: {
    scale: [1, 0.96, 1],
    borderRadius: "50%",
    rotate: [0, 360],
    boxShadow: "0 0 45px 8px rgba(90,158,143,0.38), 0 0 90px 20px rgba(90,158,143,0.15)",
    transition: { duration: 4, repeat: Infinity, ease: "linear" },
  },
  speaking: {
    scale: [1, 1.07, 1],
    borderRadius: "50%",
    boxShadow: "0 0 65px 12px rgba(116,170,156,0.6), 0 0 120px 30px rgba(116,170,156,0.28)",
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function VoiceConversationPanel({
  state,
  liveText,
  heard,
  reply,
  error,
  onStop,
}) {
  const themeKey = ["listening", "thinking", "speaking"].includes(state) ? state : "idle";

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between bg-[#f4fdfb] px-6 py-12 overflow-hidden">
      {/* Фоновые пятна в цветах проекта */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px]"
          style={{ background: "rgba(116,170,156,0.18)" }}
        />
        <div
          className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px]"
          style={{ background: "rgba(77,143,130,0.15)" }}
        />
      </div>

      {/* Заголовок состояния */}
      <div className="z-10 w-full max-w-lg text-center mt-4">
        <AnimatePresence mode="wait">
          <motion.h2
            key={themeKey}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-medium tracking-wide"
            style={{ color: "#4d8f82" }}
          >
            {stateLabel[themeKey]}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Blob-сфера */}
      <div className="relative z-10 flex flex-col items-center gap-10">
        <motion.div
          layout
          animate={themeKey}
          variants={blobVariants}
          className="w-56 h-56 flex items-center justify-center relative"
          style={{
            background: "radial-gradient(circle at 30% 30%, #a2c7be, #74AA9C 50%, #3d8a7c)",
            filter: "blur(0.5px)",
          }}
        >
          {/* Внутреннее кольцо — глубина */}
          <div className="absolute inset-4 rounded-[40%] border border-white/20 blur-[1px]" />
          {/* Блик */}
          <div
            className="absolute top-[18%] left-[22%] w-[30%] h-[18%] rounded-full opacity-50"
            style={{ background: "rgba(255,255,255,0.75)", filter: "blur(5px)" }}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={themeKey}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.25 }}
            >
              {state === "thinking" && <Loader2 className="w-12 h-12 text-white animate-spin" />}
              {state === "speaking" && <Volume2 className="w-12 h-12 text-white" />}
              {(state === "listening" || state === "idle") && <Mic className="w-12 h-12 text-white" />}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Субтитры живого текста */}
        <div className="min-h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {liveText?.trim() ? (
              <motion.p
                key={liveText}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-base font-medium italic max-w-sm text-center"
                style={{ color: "#3d7a6d" }}
              >
                &ldquo;{liveText.trim()}&rdquo;
              </motion.p>
            ) : (
              <motion.span key="empty" className="text-sm" style={{ color: "#a0c4bf" }}>
                {state === "listening" ? "говорите…" : ""}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {reply && (
          <p className="text-sm max-w-sm text-center" style={{ color: "#5a9e8f" }}>
            {reply}
          </p>
        )}
        {error && (
          <p className="text-sm text-rose-500 max-w-sm text-center">{error}</p>
        )}
      </div>

      {/* Кнопка завершения */}
      <div className="z-10 flex flex-col items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.93 }}
          type="button"
          onClick={onStop}
          className="group flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl ring-1 transition-colors hover:bg-rose-50"
          style={{ "--tw-ring-color": "#74AA9C" }}
          aria-label="Завершить голосовой сеанс"
        >
          <Square className="h-6 w-6 group-hover:text-rose-600 transition-colors" style={{ color: "#74AA9C" }} fill="currentColor" />
        </motion.button>
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#a0c4bf" }}>
          Нажмите, чтобы завершить
        </p>
      </div>
    </div>
  );
}


