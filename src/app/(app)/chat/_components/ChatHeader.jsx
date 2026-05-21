"use client";

import Image from "next/image";
import { MoreVertical, Download, Trash2, Shield } from "lucide-react";
import { useLanguage } from "@/lib/i18n/useLanguage";

const logoAccent = {
  none: "bg-[#74AA9C] ring-black/5",
  rain: "bg-[#355A8A] ring-white/20",
  forest: "bg-[#2F6A4F] ring-white/20",
  fireplace: "bg-[#8A4F36] ring-white/20",
  ocean: "bg-[#2C6F7B] ring-white/20",
  space: "bg-[#4C4F8A] ring-white/20",
  lofi: "bg-[#6A4F8A] ring-white/20",
};

function ChatHeaderMenu({
  menuOpen,
  setMenuOpen,
  menuRef,
  exportMyData,
  clearChatHistory,
  hasAmbientBg,
  t,
  buttonClassName,
  iconClassName,
}) {
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className={buttonClassName}
        aria-label="Menu"
      >
        <MoreVertical className={iconClassName} />
      </button>

      {menuOpen && (
        <div
          className={`absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${
            hasAmbientBg
              ? "border border-white/15 bg-black/85 backdrop-blur-xl"
              : "border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
          }`}
        >
          <button
            onClick={() => {
              setMenuOpen(false);
              exportMyData?.();
            }}
            className={`w-full px-4 py-3 flex items-center gap-2 text-sm ${
              hasAmbientBg ? "text-white hover:bg-white/10" : "text-slate-900 hover:bg-black/[0.04]"
            }`}
          >
            <Download className="h-4 w-4" />
            {t("exportData")}
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              clearChatHistory?.();
            }}
            className={`w-full px-4 py-3 flex items-center gap-2 text-sm ${
              hasAmbientBg ? "text-rose-300 hover:bg-rose-500/20" : "text-rose-600 hover:bg-rose-50"
            }`}
          >
            <Trash2 className="h-4 w-4" />
            {t("clearHistory")}
          </button>

          <div className={`h-px ${hasAmbientBg ? "bg-white/15" : "bg-black/10"}`} />

          <a
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className={`block px-4 py-3 text-sm ${
              hasAmbientBg ? "text-white hover:bg-white/10" : "text-slate-900 hover:bg-black/[0.04]"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t("privacySettings")}
            </span>
          </a>
        </div>
      )}
    </div>
  );
}

export default function ChatHeader({
  menuOpen,
  setMenuOpen,
  menuRef,
  exportMyData,
  clearChatHistory,
  hasAmbientBg = false,
  ambientBg = "none",
  hidden = false,
}) {
  const { t } = useLanguage("chat");
  const logoClass = logoAccent[ambientBg] || logoAccent.none;

  const menuButtonClass = `h-10 w-10 rounded-full grid place-items-center transition backdrop-blur-xl ${
    hasAmbientBg
      ? "bg-black/45 border border-white/15 hover:bg-black/55"
      : "bg-white/90 border border-black/10 hover:bg-white"
  }`;
  const menuIconClass = hasAmbientBg ? "text-white/90" : "text-slate-700";

  if (hidden) {
    return (
      <div className="fixed top-3 right-4 z-20 pointer-events-auto">
        <ChatHeaderMenu
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          menuRef={menuRef}
          exportMyData={exportMyData}
          clearChatHistory={clearChatHistory}
          hasAmbientBg={hasAmbientBg}
          t={t}
          buttonClassName={menuButtonClass}
          iconClassName={menuIconClass}
        />
      </div>
    );
  }

  return (
    <div
      className={`sticky z-20 top-[var(--app-nav-offset)] transition-[top,background-color,border-color] duration-300 ease-out backdrop-blur-xl ${
        hasAmbientBg
          ? "border-b border-white/15 bg-black/40"
          : "border-b border-black/10 bg-white/75"
      }`}
    >
      <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`h-11 w-11 rounded-full grid place-items-center shadow-sm ring-1 ${logoClass}`}
          >
            <Image
              src="/white-logo.svg"
              alt="MindfulAI"
              width={26}
              height={26}
            />
          </div>

          <div className="min-w-0">
            <h1
              className={`text-[15px] font-semibold leading-tight truncate ${
                hasAmbientBg ? "text-white" : "text-slate-900"
              }`}
            >
              MindfulAI Assistant
            </h1>
            <p className={`text-xs truncate ${hasAmbientBg ? "text-white/65" : "text-slate-500"}`}>
              {t("subtitle")}
            </p>
          </div>
        </div>

        <ChatHeaderMenu
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          menuRef={menuRef}
          exportMyData={exportMyData}
          clearChatHistory={clearChatHistory}
          hasAmbientBg={hasAmbientBg}
          t={t}
          buttonClassName={`h-10 w-10 rounded-full grid place-items-center transition ${
            hasAmbientBg ? "hover:bg-white/10" : "hover:bg-black/[0.05]"
          }`}
          iconClassName={`h-5 w-5 ${menuIconClass}`}
        />
      </div>

    </div>
  );
}
