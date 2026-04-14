"use client";

import { HelpCircle } from "lucide-react";

export default function AnchorTooltip({ show, position }) {
  if (!show) return null;

  return (
    <div
      className="fixed w-72 p-4 bg-white backdrop-blur-xl border border-[#74AA9C]/40 rounded-2xl shadow-2xl ring-1 ring-[#74AA9C]/20 z-[100] pointer-events-none"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-full bg-[#74AA9C] flex items-center justify-center shadow-lg shadow-[#74AA9C]/30">
          <HelpCircle className="h-4 w-4 text-white" />
        </div>
        <div className="font-bold text-sm text-slate-900">Что такое якоря?</div>
      </div>
      <p className="text-slate-700 text-xs leading-relaxed mb-3 pl-10">
        ИИ автоматически выделяет <span className="font-semibold text-[#5d9088]">ключевые темы</span> из каждого разговора — это помогает структурировать мысли и возвращаться к важным моментам.
      </p>
      <div className="pl-10 space-y-1.5">
        <div className="flex items-start gap-2 text-[11px] text-slate-600">
          <span className="text-[#74AA9C] font-bold">→</span>
          <span>Нажми на якорь, чтобы обсудить глубже</span>
        </div>
        <div className="flex items-start gap-2 text-[11px] text-slate-600">
          <span className="text-[#74AA9C] font-bold">→</span>
          <span>Сохрани <span className="font-semibold text-[#5d9088]">()</span> в заметки для быстрого доступа</span>
        </div>
      </div>
      <div className="absolute -top-2 left-24 w-4 h-4 bg-white border-l border-t border-[#74AA9C]/40 rotate-45"></div>
    </div>
  );
}
