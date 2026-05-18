"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Home, BookOpen, MessageSquare, LogOut, User, Languages, Newspaper, Wrench, Lightbulb, Anchor } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useAppSettings } from "@/components/AppShell";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function ChatSidebarNav({ onAnchorsClick, isOpen = true }) {
  const { user, settings, updateSettings } = useAppSettings();
  const isDark = settings?.theme === "dark";
  const lang = settings?.language || "ru";
  const t = useTranslation("nav", lang);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState("");
  const mounted = typeof window !== "undefined";
  const profileRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    let active = true;
    if (!user) {
      return () => {
        active = false;
      };
    }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (active) setUserAvatarUrl(data?.avatar_url || "");
    })();
    return () => { active = false; };
  }, [supabase, user]);

  const navItems = useMemo(() => [
    { icon: Home, href: "/", title: t("home") },
    { icon: MessageSquare, href: "/chat", title: t("chat") },
    { icon: Lightbulb, href: "/psychology", title: t("psychology") },
    { icon: BookOpen, href: "/courses", title: t("courses") },
    { icon: Newspaper, href: "/news", title: t("news") },
    { icon: Wrench, href: "/exercises", title: t("exercises") },
  ], [t]);

  function toggleTheme() {
    updateSettings?.({ theme: isDark ? "light" : "dark" });
  }

  function setLang(l) {
    updateSettings?.({ language: l });
    setLangOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <aside
      aria-hidden={!isOpen}
      className={`fixed left-0 top-0 h-screen w-16 bg-white dark:bg-[#131314] border-r border-black/10 dark:border-white/10 flex flex-col items-center py-3 z-50 gap-2 transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
      }`}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[#74AA9C] to-[#5d9088] hover:shadow-lg transition-shadow flex-shrink-0"
        title="MindfulAI"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/white-logo.svg" alt="MindfulAI" className="w-8 h-8 object-contain" />
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-shrink-0">
        {navItems.map(({ icon: Icon, href, title }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={title}
              className={`flex items-center justify-center h-9 w-9 rounded-lg transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#74AA9C] text-white shadow-lg"
                  : "text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom controls */}
      <div className="flex flex-col gap-1 items-center w-full px-2 flex-shrink-0">
        {/* Anchors button */}
        <button
          onClick={onAnchorsClick}
          title={t("anchors")}
          className="flex items-center justify-center h-9 w-9 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
        >
          <Anchor className="w-4 h-4" />
        </button>

        {/* Language dropdown */}
        <div ref={langRef} className="relative w-full">
          <button
            onClick={() => setLangOpen(!langOpen)}
            title={lang.toUpperCase()}
            className="flex items-center justify-center h-9 w-9 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 transition-all mx-auto cursor-pointer"
          >
            <Languages className="w-4 h-4" />
          </button>
          {langOpen && mounted && createPortal(
            <div className="fixed left-16 bottom-20 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden" style={{ zIndex: 9999 }}>
              {[
                { code: "ru", label: "Русский" },
                { code: "en", label: "English" },
                { code: "kz", label: "Қазақша" },
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`w-full px-3 py-2 text-sm transition-colors text-left flex items-center gap-2 cursor-pointer ${
                    lang === l.code
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium"
                      : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="uppercase text-xs font-semibold w-6 opacity-60">{l.code}</span>
                  {l.label}
                </button>
              ))}
            </div>,
            document.body
          )}
        </div>

        {/* Theme toggle */}
        <div className="flex items-center justify-center h-9 w-9">
          <input
            type="checkbox"
            checked={!isDark}
            onChange={toggleTheme}
            title={t("toggleTheme")}
            className="theme-toggle-input"
          />
        </div>

        {/* Profile / Logout */}
        {user && (
          <div ref={profileRef} className="relative w-full">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              title={t("profile")}
              className="flex items-center justify-center h-9 w-9 rounded-full overflow-hidden hover:ring-2 hover:ring-[#74AA9C] transition-all mx-auto bg-slate-900 dark:bg-slate-700 cursor-pointer"
            >
              {userAvatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={userAvatarUrl} alt="avatar" className="h-9 w-9 object-cover" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </button>

            {profileOpen && mounted && createPortal(
              <div className="fixed left-16 bottom-4 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden" style={{ zIndex: 9999 }}>
                <Link
                  href="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-3 text-sm text-slate-900 dark:text-slate-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("profile")}
                  </span>
                </Link>
                <button
                  onClick={() => { setProfileOpen(false); handleSignOut(); }}
                  className="w-full px-4 py-3 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {t("signout")}
                </button>
              </div>,
              document.body
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

