"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const EDGE_EPSILON = 16;
const TOP_EPSILON = 12;

export function useChatScroll() {
  const [atBottom, setAtBottom] = useState(true);
  /** true = вверху ленты, кнопка показывает «вниз» */
  const [atTop, setAtTop] = useState(true);
  const [scrolledDown, setScrolledDown] = useState(false);
  const scrollRef = useRef(null);
  const detachScrollRef = useRef(null);

  const getScrollMetrics = useCallback(() => {
    const root = scrollRef.current;
    if (!root) {
      return { scrollable: false, maxTop: 0, top: 0 };
    }

    const maxTop = Math.max(0, root.scrollHeight - root.clientHeight);
    const top = root.scrollTop;
    return { scrollable: maxTop > 1, maxTop, top };
  }, []);

  const syncFromScrollPosition = useCallback(() => {
    const { scrollable, maxTop, top } = getScrollMetrics();
    if (!scrollable) {
      setAtTop(true);
      setAtBottom(true);
      setScrolledDown(false);
      return;
    }

    setAtTop(top <= TOP_EPSILON);
    setAtBottom(maxTop - top <= EDGE_EPSILON);
    setScrolledDown(top > 24);
  }, [getScrollMetrics]);

  const setScrollContainerRef = useCallback(
    (node) => {
      if (detachScrollRef.current) {
        detachScrollRef.current();
        detachScrollRef.current = null;
      }

      scrollRef.current = node;
      if (!node) return;

      const onScroll = () => syncFromScrollPosition();

      syncFromScrollPosition();
      node.addEventListener("scroll", onScroll, { passive: true });
      detachScrollRef.current = () => node.removeEventListener("scroll", onScroll);
    },
    [syncFromScrollPosition]
  );

  useEffect(() => {
    return () => {
      if (detachScrollRef.current) {
        detachScrollRef.current();
        detachScrollRef.current = null;
      }
    };
  }, []);

  const scrollToTop = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;

    const { scrollable } = getScrollMetrics();
    if (!scrollable) return;

    setAtTop(true);
    setAtBottom(false);
    setScrolledDown(false);

    root.scrollTo({ top: 0, behavior: "smooth" });
  }, [getScrollMetrics]);

  const scrollToBottom = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;

    const { scrollable, maxTop } = getScrollMetrics();
    if (!scrollable) return;

    setAtTop(false);
    setAtBottom(true);
    setScrolledDown(true);

    root.scrollTo({ top: maxTop, behavior: "smooth" });
  }, [getScrollMetrics]);

  const toggleScrollEdge = useCallback(() => {
    if (atTop) {
      scrollToBottom();
    } else {
      scrollToTop();
    }
  }, [atTop, scrollToBottom, scrollToTop]);

  return {
    atTop,
    atBottom,
    scrolledDown,
    scrollRef,
    setScrollContainerRef,
    scrollToTop,
    scrollToBottom,
    toggleScrollEdge,
  };
}
