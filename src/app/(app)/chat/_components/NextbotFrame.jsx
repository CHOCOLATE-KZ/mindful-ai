"use client";
import { Sparkles } from "lucide-react";

export default function NextbotFrame({ src }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="rounded-[28px] border border-black/10 bg-white/60 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 bg-white/70">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-gray-900 font-semibold">Роза</div>
              <div className="text-sm text-gray-500">Поддерживаю, слушаю, помогаю</div>
            </div>
          </div>
          <span className="text-xs font-medium text-gray-600 rounded-full border border-black/10 bg-white/80 px-3 py-1">
            NextBot Demo
          </span>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/10 pointer-events-none" />
          <iframe
            title="NextBot Widget"
            src={src}
            className="w-full"
            style={{ height: 520, border: "none", display: "block", background: "transparent" }}
            allow="clipboard-read; clipboard-write; microphone"
          />
        </div>

        <div className="px-5 py-3 border-t border-black/5 bg-white/70 text-center">
          <p className="text-xs text-gray-500">💙 Это безопасное пространство. Делись только тем, чем готов.</p>
        </div>
      </div>
    </div>
  );
}
