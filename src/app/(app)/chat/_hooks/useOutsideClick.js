"use client";
import { useEffect } from "react";

export function useOutsideClick(ref, onOutside, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function onDocClick(e) {
      if (!ref?.current) return;
      if (!ref.current.contains(e.target)) onOutside?.();
    }

    document.addEventListener("pointerdown", onDocClick);
    return () => document.removeEventListener("pointerdown", onDocClick);
  }, [ref, onOutside, enabled]);
}
