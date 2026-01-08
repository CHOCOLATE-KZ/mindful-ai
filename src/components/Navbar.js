"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

const links = [
  { href: "/", label: "Главная" },
  { href: "/about", label: "О проекте" },
  { href: "/faq", label: "FAQ" },
  { href: "/contacts", label: "Контакты" },
  { href: "/chat", label: "Чат" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const supabase = supabaseBrowser();
  const [userName, setUserName] = useState(null); 

  useEffect(() => {
    const supabase = supabaseBrowser();
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session || null);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess || null);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    if (!error && data?.name) {
      setUserName(data.name);
    }
  }

  loadProfile();
}, []);

  async function signOut() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          DiplomaProject
        </Link>
        <ul className="flex items-center gap-4 text-sm">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={
                    "rounded-md px-3 py-1.5 hover:bg-gray-100 " +
                    (active ? "bg-gray-100 font-medium" : "text-gray-700")
                  }
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {!session ? (
            <>
              <Link
                href="/auth/sign-in"
                className="rounded-full px-3 py-1.5 text-sm hover:bg-gray-100"
              >
                Войти
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1.5 text-sm text-white shadow-sm"
              >
                Регистрация
              </Link>
            </>
          ) : (
            <>
              {/* <Link href="/profile" className="rounded-full px-3 py-1.5 text-sm hover:bg-gray-100">Профиль</Link>
              <button onClick={signOut} className="rounded-full px-3 py-1.5 text-sm hover:bg-gray-100">Выйти</button> */}
                <div className="flex items-center gap-3">
                  {userName && (
                    <span className="text-sm text-gray-700 font-medium">
                      {userName}
                    </span>
                  )}

                  <button className="text-sm font-medium">
                    Профиль
                  </button>

                  <button className="text-sm text-gray-500 hover:text-gray-800">
                    Выйти
                  </button>
                </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
