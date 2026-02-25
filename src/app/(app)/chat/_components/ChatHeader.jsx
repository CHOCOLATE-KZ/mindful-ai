"use client";

import Image from "next/image";
import { MoreVertical, Download, Trash2, Shield } from "lucide-react";

export default function ChatHeader({ menuOpen, setMenuOpen, menuRef, exportMyData, clearChatHistory }) {
  return (
    <div className="sticky z-20
        top-[var(--app-nav-offset)]
        transition-[top] duration-300 ease-out
        border-b border-black/10 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-11 w-11 rounded-full bg-blue-600 grid place-items-center shadow-sm ring-1 ring-black/5">
            <Image
              src="/gradient-logo.png"
              alt="MindfulAI"
              width={26}
              height={26}
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-slate-900 leading-tight truncate">
              MindfulAI Assistant
            </h1>
            <p className="text-xs text-slate-500 truncate">Спокойно • Приватно • С поддержкой</p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="h-10 w-10 rounded-full grid place-items-center hover:bg-black/[0.05] transition"
            aria-label="Menu"
          >
            <MoreVertical className="h-5 w-5 text-slate-700" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  exportMyData?.();
                }}
                className="w-full px-4 py-3 flex items-center gap-2 text-sm hover:bg-black/[0.04] text-slate-900"
              >
                <Download className="h-4 w-4" />
                Export my data
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  clearChatHistory?.();
                }}
                className="w-full px-4 py-3 flex items-center gap-2 text-sm hover:bg-rose-50 text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
                Clear chat history
              </button>

              <div className="h-px bg-black/10" />

              <a
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm hover:bg-black/[0.04] text-slate-900"
              >
                <span className="inline-flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy & Settings
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
