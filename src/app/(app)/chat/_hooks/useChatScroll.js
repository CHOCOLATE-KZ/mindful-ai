"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function useChatScroll() {
  const BOTTOM_EPSILON = 16;
  const [atBottom, setAtBottom] = useState(true);
  const [atTop, setAtTop] = useState(true);
  const [scrolledDown, setScrolledDown] = useState(false);
  const scrollRef = useRef(null);

  const getScrollState = useCallback(() => {
    const root = scrollRef.current;
    const rootScrollable = !!root && root.scrollHeight - root.clientHeight > 1;

    if (rootScrollable) {
      const maxTop = root.scrollHeight - root.clientHeight;
      const top = root.scrollTop;
      return {
        atTop: top <= 12,
        atBottom: maxTop - top <= BOTTOM_EPSILON,
        scrolledDown: top > 24,
      };
    }

    const pageTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const pageMaxTop = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    ) - window.innerHeight;

    return {
      atTop: pageTop <= 12,
      atBottom: pageMaxTop - pageTop <= BOTTOM_EPSILON,
      scrolledDown: pageTop > 24,
    };
  }, [BOTTOM_EPSILON]);

  useEffect(() => {
    const el = scrollRef?.current;

    const onScroll = () => {
      const state = getScrollState();
      setAtTop(state.atTop);
      setAtBottom(state.atBottom);
      setScrolledDown(state.scrolledDown);
    };

    onScroll();
    if (el) {
      el.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (el) {
        el.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, [getScrollState]);

  const scrollToTop = useCallback(() => {
    const root = scrollRef.current;
    if (root && root.scrollHeight - root.clientHeight > 1) {
      root.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToBottom = useCallback(() => {
    const root = scrollRef.current;
    if (root && root.scrollHeight - root.clientHeight > 1) {
      root.scrollTo({ top: root.scrollHeight, behavior: "smooth" });
      return;
    }

    const pageBottom = document.documentElement.scrollHeight;
    window.scrollTo({ top: pageBottom, behavior: "smooth" });
    document.documentElement.scrollTo({ top: pageBottom, behavior: "smooth" });
    document.body.scrollTo({ top: pageBottom, behavior: "smooth" });
  }, []);

  return {
    atTop,
    atBottom,
    scrolledDown,
    scrollRef,
    scrollToTop,
    scrollToBottom,
  };
}
