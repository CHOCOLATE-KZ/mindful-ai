"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useAppSettings } from "@/components/AppShell";

const NAV_I18N = {
  ru: { home: "Главная", about: "О проекте", faq: "FAQ", contacts: "Контакты", chat: "Чат", signin: "Войти", signup: "Регистрация", profile: "Профиль", signout: "Выйти" },
  en: { home: "Home", about: "About", faq: "FAQ", contacts: "Contacts", chat: "Chat", signin: "Sign in", signup: "Sign up", profile: "Profile", signout: "Sign out" },
  kz: { home: "Басты бет", about: "Жоба туралы", faq: "FAQ", contacts: "Байланыс", chat: "Чат", signin: "Кіру", signup: "Тіркелу", profile: "Профиль", signout: "Шығу" },
};

export default function Navbar() {
  const { user, settings } = useAppSettings();
  const lang = settings?.language || "ru";
  const t = NAV_I18N[lang] || NAV_I18N.ru;

  const pathname = usePathname();
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [userName, setUserName] = useState(null);

  const guestLinks = [
    { href: "/", label: t.home },
    { href: "/about", label: t.about },
    { href: "/faq", label: t.faq },
    { href: "/contacts", label: t.contacts },
    { href: "/chat", label: t.chat },
  ];

  const userLinks = [
    { href: "/", label: t.home },
    { href: "/chat", label: t.chat },
    { href: "/profile", label: t.profile },
    // если есть эти страницы — раскомментируй:
    // { href: "/notes", label: lang === "ru" ? "Дневник" : "Journal" },
    // { href: "/analytics", label: lang === "ru" ? "Аналитика" : "Analytics" },
  ];
  const links = user ? userLinks : guestLinks;

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;
      if (!error && data?.name) setUserName(data.name);
    })();

    return () => { mounted = false; };
  }, [supabase, user]);

  async function signOut() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur dark:bg-black/40">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold cursor-pointer">
          MindfulAI
        </Link>

        <ul className="flex items-center gap-4 text-sm">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={
                    "cursor-pointer rounded-md px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 " +
                    (active ? "bg-black/5 dark:bg-white/10 font-medium" : "text-black/70 dark:text-white/70")
                  }
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {!user ? (
            <>
              <Link href="/auth/sign-in?next=/chat" className="cursor-pointer rounded-full px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10">
                {t.signin}
              </Link>
              <Link href="/auth/sign-up" className="cursor-pointer ml-3 inline-flex h-10 items-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition">
                {t.signup}
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {userName && <span className="text-sm text-black/70 dark:text-white/70 font-medium">{userName}</span>}

              <button onClick={() => router.push("/profile")} className="cursor-pointer text-sm font-medium hover:opacity-80">
                {t.profile}
              </button>

              <button onClick={signOut} className="cursor-pointer text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white">
                {t.signout}
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
