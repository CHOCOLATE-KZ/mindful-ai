"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useAppSettings } from "@/components/AppShell";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ChevronDown, User, Sun, Moon, Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, settings, updateSettings } = useAppSettings();
  const isDark = settings?.theme === "dark";

  function toggleTheme() {
    updateSettings?.({ theme: isDark ? "light" : "dark" });
  }
  const lang = settings?.language || "ru";
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
  
  const toolsRef = useRef(null);
  const profileRef = useRef(null);

  const guestLinks = useMemo(
    () => [
      { href: "/", label: t("home") },
      { href: "/about", label: t("about") },
      { href: "/psychology", label: t("psychology") },
      { href: "/courses", label: "Курсы" },
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
      { href: "/courses", label: "Курсы" },
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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
    <header className="sticky top-0 z-[100] border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[rgb(33_33_46)] shadow-sm dark:shadow-[0_1px_0_rgb(255_255_255_/_0.06)] backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
        >
          <Image
            src="/mindfullailogo.svg"
            alt="MindfulAI logo"
            width={28}
            height={28}
            priority
          />
          <span>MindfulAI</span>
        </Link>

        <ul className="hidden md:flex items-center gap-5 text-sm font-medium">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href} className="relative group">
                <Link
                  href={l.href}
                  className={`px-3 py-2 rounded-md transition-all duration-300 ${
                    active
                      ? "text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] w-0 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full ${
                      active ? "w-full" : ""
                    }`}
                  ></span>
                </Link>
              </li>
            );
          })}
          
          {/* Tools Dropdown - только для залогиненных пользователей */}
          {user && (
            <li ref={toolsRef} className="relative">
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-all duration-300 ${
                  toolsLinks.some(l => pathname === l.href)
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100"
                }`}
              >
                {t("tools")}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {toolsOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[rgb(42_42_58)] rounded-xl shadow-xl dark:shadow-[0_20px_60px_rgb(0_0_0_/_0.6)] border border-gray-200 dark:border-white/[0.08] py-2">
                  {toolsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setToolsOpen(false)}
                      className={`block px-4 py-2 text-sm transition-colors ${
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

        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 dark:border-white/[0.12] text-gray-600 dark:text-slate-300 hover:border-[#74AA9C] hover:text-[#74AA9C] dark:hover:border-[#74AA9C] dark:hover:text-[#74AA9C] transition-all duration-200"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 dark:border-white/[0.12] text-gray-600 dark:text-slate-300 hover:border-[#74AA9C] hover:text-[#74AA9C] dark:hover:border-[#74AA9C] dark:hover:text-[#74AA9C] transition-all duration-200"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link
                href="/auth/sign-in?next=/chat"
                className="px-4 py-2 rounded-full border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-transform duration-200 transform hover:scale-105"
              >
                {t("signin")}
              </Link>
              <Link
                href="/auth/sign-up"
                className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-transform duration-200 transform hover:scale-105"
              >
                {t("signup")}
              </Link>
            </>
          ) : (
            /* Profile Dropdown */
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 dark:border-white/[0.12] text-gray-700 dark:text-slate-300 hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              >
                <img
                  src={userAvatarUrl || "/user.png"}
                  alt="User avatar"
                  className="h-5 w-5 rounded-full object-cover ring-1 ring-gray-300 dark:ring-white/20"
                />
                {userName && (
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {userName}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-[rgb(42_42_58)] rounded-xl shadow-xl dark:shadow-[0_20px_60px_rgb(0_0_0_/_0.6)] border border-gray-200 dark:border-white/[0.08] py-2">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">
                      {userName || t("user")}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/profile");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {t("profile")}
                  </button>
                  <button
                    onClick={requestSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-white/[0.06] mt-1"
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

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[rgb(33_33_46)] px-4 py-3">
          <div className="space-y-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                      : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}

            {user && (
              <>
                <div className="my-2 h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent" />
                {toolsLinks.map((l) => {
                  const active = pathname === l.href;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
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

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/[0.08]">
            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/sign-in?next=/chat"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-3 py-2 rounded-full border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                >
                  {t("signin")}
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-3 py-2 rounded-full bg-blue-600 text-white font-semibold"
                >
                  {t("signup")}
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    router.push("/profile");
                  }}
                  className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                >
                  {t("profile")}
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    requestSignOut();
                  }}
                  className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {t("signout")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
    </header>
  );
}
