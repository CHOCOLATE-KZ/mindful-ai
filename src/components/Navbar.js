"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useAppSettings } from "@/components/AppShell";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ChevronDown, User, Sun, Moon, Menu, X, Languages } from "lucide-react";

export default function Navbar() {
  const { user, settings, updateSettings } = useAppSettings();
  const isDark = settings?.theme === "dark";
  const lang = settings?.language || "ru";

  function toggleTheme() {
    updateSettings?.({ theme: isDark ? "light" : "dark" });
  }

  function setLang(l) {
    updateSettings?.({ language: l });
    setLangOpen(false);
  }

  const t = useTranslation("nav", lang);

  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith("/admin");

  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [userName, setUserName] = useState(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState("");
  const [toolsOpen, setToolsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  
  const toolsRef = useRef(null);
  const profileRef = useRef(null);
  const langRef = useRef(null);

  const guestLinks = useMemo(
    () => [
      { href: "/", label: t("home") },
      { href: "/about", label: t("about") },
      { href: "/faq", label: t("faq") },
      { href: "/contacts", label: t("contacts") },
      { href: "/chat", label: t("chat") },
    ],
    [t]
  );

  const userLinks = useMemo(
    () => [
      { href: "/", label: t("home") },
      { href: "/psychology", label: t("psychology") },
      { href: "/courses", label: t("courses") },
      { href: "/chat", label: t("chat") },
      { href: "/news", label: t("news") },
    ],
    [t]
  );

  const toolsLinks = useMemo(
    () => [
      { href: "/exercises", label: t("exercises") },
      { href: "/notes", label: t("notes") },
      { href: "/analytics", label: t("analytics") },
    ],
    [t]
  );

  const links = user ? userLinks : guestLinks;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        setUserName(null);
        setUserAvatarUrl("");
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;
      if (!error && data?.name) setUserName(data.name);
      if (!error) setUserAvatarUrl(data?.avatar_url || "");
    })();
    return () => (mounted = false);
  }, [supabase, user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setToolsOpen(false);
      }
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

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  function requestSignOut() {
    setConfirmOpen(true);
    setProfileOpen(false);
  }

  if (isAdminPath) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 pt-4">
        <nav className="mx-auto bg-white/80 dark:bg-[rgb(33_33_46)]/80 backdrop-blur-2xl border border-gray-200/60 dark:border-white/[0.08] rounded-2xl transition-all duration-300 ease-out max-w-5xl shadow-md shadow-black/5">
          <div className="px-3 sm:px-6 h-14 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 font-semibold text-lg text-gray-800 dark:text-slate-100 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/mindfullailogo.svg"
                alt="MindfulAI logo"
                width={32}
                height={32}
                priority
                className="rounded-lg"
              />
              <span>MindfulAI</span>
            </Link>

            {/* Desktop nav links */}
            <ul className="hidden md:flex items-center gap-0.5 text-sm font-medium flex-1 justify-center">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={`px-3 py-1.5 rounded-lg transition-all duration-200 inline-block ${
                        active
                          ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-slate-100 font-semibold"
                          : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                      }`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}

              {user && (
                <li ref={toolsRef} className="relative">
                  <button
                    onClick={() => setToolsOpen(!toolsOpen)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                      toolsLinks.some((l) => pathname === l.href)
                        ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-slate-100 font-semibold"
                        : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    {t("tools")}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`} />
                  </button>
                  {toolsOpen && (
                    <div className="absolute top-full left-0 mt-2 w-44 bg-white dark:bg-[rgb(42_42_58)] rounded-xl shadow-xl dark:shadow-[0_20px_60px_rgb(0_0_0_/_0.5)] border border-gray-200 dark:border-white/[0.08] py-1.5">
                      {toolsLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setToolsOpen(false)}
                          className={`block px-3 py-2 text-sm transition-colors ${
                            pathname === link.href
                              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium"
                              : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                          }`}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              )}
            </ul>

            {/* Right controls */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Language dropdown */}
              <div ref={langRef} className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  aria-label="Toggle language"
                  className="inline-flex items-center justify-center gap-1 w-auto h-8 px-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all duration-200 text-xs font-medium cursor-pointer"
                >
                  <Languages className="w-4 h-4" />
                  <span className="uppercase">{lang}</span>
                </button>
                {langOpen && (
                  <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-[rgb(42_42_58)] rounded-xl shadow-xl dark:shadow-[0_20px_60px_rgb(0_0_0_/_0.5)] border border-gray-200 dark:border-white/[0.08] py-1.5 z-50">
                    {[
                      { code: "ru", label: "Русский" },
                      { code: "en", label: "English" },
                      { code: "kz", label: "Қазақша" },
                    ].map((l) => (
                      <button
                        key={l.code}
                        onClick={() => setLang(l.code)}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 cursor-pointer ${
                          lang === l.code
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium"
                            : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                        }`}
                      >
                        <span className="uppercase text-xs font-semibold w-6 opacity-60">{l.code}</span>
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all duration-200 cursor-pointer"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="sr-only">Сменить тему</span>
              </button>

              {/* Mobile burger */}
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all duration-200"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              {/* Auth buttons or profile */}
              {!user ? (
                <>
                  <Link
                    href="/auth/sign-in?next=/chat"
                    className="inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-white/[0.06] h-8 px-3 text-xs"
                  >
                    {t("signin")}
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="hidden sm:inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/25 h-8 px-3 text-xs"
                  >
                    {t("signup")}
                  </Link>
                </>
              ) : (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/[0.10] text-gray-700 dark:text-slate-300 hover:border-blue-600/40 dark:hover:border-blue-400/40 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={userAvatarUrl || "/user.png"}
                      alt="User avatar"
                      className="h-6 w-6 rounded-full object-cover ring-1 ring-gray-300 dark:ring-white/20"
                    />
                    {userName && (
                      <span className="text-sm font-medium max-w-[100px] truncate hidden sm:block">
                        {userName}
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-[rgb(42_42_58)] rounded-xl shadow-xl dark:shadow-[0_20px_60px_rgb(0_0_0_/_0.5)] border border-gray-200 dark:border-white/[0.08] py-1.5">
                      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.06]">
                        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">
                          {userName || t("user")}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          router.push("/profile");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4" />
                        {t("profile")}
                      </button>
                      <button
                        onClick={requestSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-white/[0.06] mt-0.5 cursor-pointer"
                      >
                        {t("signout")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="md:hidden mt-2 mx-auto max-w-5xl bg-white/90 dark:bg-[rgb(33_33_46)]/90 backdrop-blur-2xl border border-gray-200/60 dark:border-white/[0.08] rounded-2xl shadow-lg overflow-hidden">
            <div className="px-3 py-3 space-y-0.5">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-slate-100"
                        : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}

              {user && (
                <>
                  <div className="my-1.5 h-px bg-gray-100 dark:bg-white/[0.06]" />
                  {toolsLinks.map((l) => {
                    const active = pathname === l.href;
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-slate-100"
                            : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                        }`}
                      >
                        {l.label}
                      </Link>
                    );
                  })}
                </>
              )}
            </div>

            <div className="px-3 pb-3 pt-1 border-t border-gray-100 dark:border-white/[0.06]">
              {!user ? (
                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href="/auth/sign-in?next=/chat"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center h-9 rounded-xl border border-gray-300 dark:border-white/[0.12] text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/[0.05] flex items-center justify-center transition-colors"
                  >
                    {t("signin")}
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center h-9 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center justify-center transition-colors"
                  >
                    {t("signup")}
                  </Link>
                </div>
              ) : (
                <div className="space-y-0.5 pt-2">
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/profile");
                    }}
                    className="w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/[0.05] flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {t("profile")}
                  </button>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      requestSignOut();
                    }}
                    className="w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    {t("signout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[rgb(42_42_58)] shadow-2xl dark:shadow-[0_24px_64px_rgb(0_0_5_/_0.70)] border border-gray-200 dark:border-white/[0.08] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              {t("confirmLogout")}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
              {t("confirmLogoutText")}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-white/[0.12] text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
              >
                {t("stay")}
              </button>
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  signOut();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
