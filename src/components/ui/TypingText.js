"use client";

import { useEffect, useState } from "react";

export default function TypingText({
  texts = [],
  speed = 55,
  pause = 1200,
  loop = true,
  className = "",
}) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!texts.length) return;

    const current = texts[index % texts.length];

    // when finished typing
    if (!deleting && subIndex === current.length) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }

    // when finished deleting
    if (deleting && subIndex === 0) {
      setDeleting(false);
      if (!loop && index === texts.length - 1) return;
      setIndex((i) => (i + 1) % texts.length);
      return;
    }

    const t = setTimeout(() => {
      setSubIndex((i) => i + (deleting ? -1 : 1));
    }, deleting ? Math.max(20, speed * 0.6) : speed);

    return () => clearTimeout(t);
  }, [texts, index, subIndex, deleting, speed, pause, loop]);

  if (!texts.length) return null;

  const current = texts[index % texts.length];

  return (
    <span className={className}>
      {current.substring(0, subIndex)}
      <span className="ml-1 inline-block h-[1.1em] w-[2px] animate-pulse bg-black/40 align-[-2px]" />
    </span>
  );
}
