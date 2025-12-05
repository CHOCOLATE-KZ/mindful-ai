"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Главная" },
  { href: "/notes", label: "Заметки" },
  { href: "/auth/sign-in", label: "Вход" },
  { href: "/auth/sign-up", label: "Регистрация" },
];

export default function Navbar() {
  const pathname = usePathname();
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
      </nav>
    </header>
  );
}
