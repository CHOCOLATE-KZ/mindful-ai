"use client";

import { MoreVertical, Download, Trash2, Shield, Sparkles } from "lucide-react";

export default function ChatHeader({
  mode,
  setMode,
  menuOpen,
  setMenuOpen,
  menuRef,
  exportMyData,
  clearChatHistory,
}) {
  return (
    <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="text-gray-900 font-medium">MindfulAI Assistant</h1>
            <p className="text-sm text-gray-500">Always here to listen</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("native")}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              mode === "native"
                ? "bg-black text-white border-black"
                : "bg-white/70 text-gray-700 border-black/10 hover:bg-white"
            }`}
          >
            Native
          </button>
          <button
            onClick={() => setMode("nextbot")}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              mode === "nextbot"
                ? "bg-black text-white border-black"
                : "bg-white/70 text-gray-700 border-black/10 hover:bg-white"
            }`}
          >
            NextBot
          </button>

          {/* ⋮ menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Menu"
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-black/10 bg-white/90 backdrop-blur shadow-xl">
                <button
                  onClick={exportMyData}
                  className="w-full px-4 py-3 flex items-center gap-2 text-sm hover:bg-black/5"
                >
                  <Download className="h-4 w-4" />
                  Export My Data
                </button>

                <button
                  onClick={clearChatHistory}
                  className="w-full px-4 py-3 flex items-center gap-2 text-sm hover:bg-rose-50 text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear chat history
                </button>

                <div className="h-px bg-black/5" />

                <a
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm hover:bg-black/5"
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
    </div>
  );
}
