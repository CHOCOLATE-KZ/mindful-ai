"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

function Pill({ href, label, active }) {
  return (
    <Link
      href={href}
      className={
        "rounded-full px-4 py-2 text-sm transition " +
        (active
          ? "text-white shadow-card bg-gradient-to-r from-violet-600 to-blue-600"
          : "text-gray-700 hover:bg-gray-100")
      }
    >
      {label}
    </Link>
  );
}

function Navbar() {
  const p = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="/" className="text-base font-semibold tracking-tight">DiplomaProject</a>
        <div className="flex items-center gap-2">
          <Pill href="/" label="Главная" active={p === "/"} />
          <Pill href="/notes" label="Заметки" active={p.startsWith("/notes")} />
          <Pill href="/analytics" label="Аналитика" active={p.startsWith("/analytics")} />
          <Pill href="/chat" label="Чат с ИИ" active={p.startsWith("/chat")} />
          <Pill href="/auth/sign-in" label="Вход" active={p.startsWith("/auth/sign-in")} />
          <Pill href="/auth/sign-up" label="Регистрация" active={p.startsWith("/auth/sign-up")} />
        </div>
      </nav>
    </header>
  );
}

export default function AppShell({ children }) {
  const isWelcome = usePathname() === "/";
  if (isWelcome) return <>{children}</>;
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );
}
