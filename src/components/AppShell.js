"use client";
import { usePathname } from "next/navigation";

export default function AppShell({ children }) {
  const isWelcome = usePathname() === "/";
  if (isWelcome) return <>{children}</>;
  return <>{children}</>;
}
