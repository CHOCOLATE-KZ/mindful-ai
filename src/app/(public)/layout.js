"use client";

import { usePathname } from "next/navigation";

export default function PublicLayout({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAuthPage = pathname?.startsWith("/auth");

  if (isHomePage || isAuthPage) {
    return <main className="w-full">{children}</main>;
  }

  return <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>;
}
