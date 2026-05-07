"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LayoutContent({ children }) {
  const pathname = usePathname();
  const isChatPage = pathname?.startsWith("/chat");
  const isHomePage = pathname === "/";
  const isAuthPage = pathname?.startsWith("/auth");

  if (isChatPage) {
    // On chat page: no navbar, no padding
    return <div>{children}</div>;
  }

  if (isAuthPage) {
    // On auth pages: show navbar but no padding (AuthFrame handles its own layout)
    return (
      <>
        <Navbar />
        <div>{children}</div>
      </>
    );
  }

  // On other pages: show navbar with padding
  return (
    <>
      <Navbar />
      <div className={isHomePage ? "pt-0" : "pt-[4.5rem]"}>{children}</div>
    </>
  );
}
