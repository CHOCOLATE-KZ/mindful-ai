"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useAppSettings } from "@/components/AppShell";

const NAV_I18N = {
  ru: {
    home: "Главная",
    about: "О проекте",
    faq: "FAQ",
    contacts: "Контакты",
    chat: "Чат",
    exercises: "Упражнения",
    news: "Новости",
    notes: "Дневник",
    analytics: "Аналитика",
    signin: "Войти",
    signup: "Регистрация",
    profile: "Профиль",
    signout: "Выйти",
  },
  en: { /* ... */ },
  kz: { /* ... */ },
};

export default function Navbar() {
  const { user, settings } = useAppSettings();
  const lang = settings?.language || "ru";
  const t = NAV_I18N[lang] || NAV_I18N.ru;

  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [userName, setUserName] = useState(null);

  const guestLinks = useMemo(
    () => [
      { href: "/", label: t.home },
      { href: "/about", label: t.about },
      { href: "/faq", label: t.faq },
      { href: "/contacts", label: t.contacts },
      { href: "/chat", label: t.chat },
    ],
    [t]
  );

  const userLinks = useMemo(
    () => [
      { href: "/", label: t.home },
      { href: "/chat", label: t.chat },
      { href: "/exercises", label: t.exercises },
      { href: "/news", label: t.news },
      { href: "/notes", label: t.notes },
      { href: "/analytics", label: t.analytics },
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

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur dark:bg-black/50 shadow-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-bold text-xl tracking-tight text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
        >
          MindfulAI
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
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
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
        </ul>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                href="/auth/sign-in?next=/chat"
                className="px-4 py-2 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-transform duration-200 transform hover:scale-105"
              >
                {t.signin}
              </Link>
              <Link
                href="/auth/sign-up"
                className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-transform duration-200 transform hover:scale-105"
              >
                {t.signup}
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {userName && (
                <span className="text-sm font-medium text-black/70 dark:text-white/70">
                  {userName}
                </span>
              )}
              <button
                onClick={() => router.push("/profile")}
                className="px-3 py-2 rounded-md text-sm text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-transform duration-200 transform hover:scale-105"
              >
                {t.profile}
              </button>
              <button
                onClick={signOut}
                className="px-3 py-2 rounded-md text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-transform duration-200 transform hover:scale-105"
              >
                {t.signout}
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
