"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useAppSettings } from "@/components/AppShell";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ChevronDown, User } from "lucide-react";

export default function Navbar() {
  const { user, settings } = useAppSettings();
  const lang = settings?.language || "ru";
  const t = useTranslation("nav", lang);

  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith("/admin");

  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [userName, setUserName] = useState(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const toolsRef = useRef(null);
  const profileRef = useRef(null);

  const guestLinks = useMemo(
    () => [
      { href: "/", label: t("home") },
      { href: "/about", label: t("about") },
      { href: "/psychology", label: t("psychology") },
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
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;
      if (!error && data?.name) setUserName(data.name);
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
    <header className="sticky top-0 z-[100] border-b border-gray-200 bg-white shadow-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-800 hover:text-blue-600 transition-colors duration-300"
        >
          <Image
            src="/gradient-logo.png"
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
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] w-0 bg-blue-600 transition-all duration-300 group-hover:w-full ${
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
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {t("tools")}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {toolsOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  {toolsLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setToolsOpen(false)}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        pathname === link.href
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
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
          {!user ? (
            <>
              <Link
                href="/auth/sign-in?next=/chat"
                className="px-4 py-2 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-transform duration-200 transform hover:scale-105"
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
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 hover:border-blue-600 transition-all duration-200"
              >
                <User className="w-4 h-4" />
                {userName && (
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {userName}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {userName || t("user")}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/profile");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {t("profile")}
                  </button>
                  <button
                    onClick={requestSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                  >
                    {t("signout")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-gray-200 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">
              {t("confirmLogout")}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {t("confirmLogoutText")}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t("stay")}
              </button>
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  signOut();
                }}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
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
