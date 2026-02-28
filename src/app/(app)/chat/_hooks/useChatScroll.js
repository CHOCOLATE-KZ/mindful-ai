"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function useChatScroll() {
  const [atBottom, setAtBottom] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef?.current;
    if (!el) return;

    const onScroll = () => {
      const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
      setAtBottom(gap < 80);
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    const root = scrollRef.current;
    if (root) {
      root.scrollTo({ top: 0, behavior: "smooth" });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return {
    atBottom,
    scrollRef,
    scrollToTop,
  };
}
