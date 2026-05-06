"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LayoutContent({ children }) {
  const pathname = usePathname();
  const isChatPage = pathname?.startsWith("/chat");

  if (isChatPage) {
    // On chat page: no navbar, no padding
    return <div>{children}</div>;
  }

  // On other pages: show navbar with padding
  return (
    <>
      <Navbar />
      <div className="pt-[4.5rem]">{children}</div>
    </>
  );
}
