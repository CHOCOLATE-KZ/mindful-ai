"use client";

import { useEffect } from "react";

export default function NavObserver() {
  useEffect(() => {
    const nav = document.getElementById("app-navbar");
    if (!nav) return;

    // 1) выставим точную высоту Navbar в CSS переменную
    const setOffset = () => {
      const h = Math.round(nav.getBoundingClientRect().height || 0);
      document.documentElement.style.setProperty("--app-nav-offset", `${h}px`);
    };
    setOffset();

    const ro = new ResizeObserver(() => setOffset());
    ro.observe(nav);

    // 2) отслеживаем: виден Navbar или нет
    const io = new IntersectionObserver(
      ([entry]) => {
        const hidden = !entry.isIntersecting;
        document.documentElement.classList.toggle("nav-hidden", hidden);
      },
      { threshold: 0.01 }
    );

    io.observe(nav);

    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return null;
}
