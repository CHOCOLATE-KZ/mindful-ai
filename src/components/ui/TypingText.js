"use client";

import { useEffect, useState } from "react";

export default function TypingText({
  texts = [],
  speed = 55,
  pause = 1200,
  loop = true,
  className = "",
  highlight,
  highlightClassName = "",
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
      const t = setTimeout(() => {
        setDeleting(false);
        if (!loop && index === texts.length - 1) return;
        setIndex((i) => (i + 1) % texts.length);
      }, 0);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setSubIndex((i) => i + (deleting ? -1 : 1));
    }, deleting ? Math.max(20, speed * 0.6) : speed);

    return () => clearTimeout(t);
  }, [texts, index, subIndex, deleting, speed, pause, loop]);

  if (!texts.length) return null;

  const current = texts[index % texts.length];
  const visible = current.substring(0, subIndex);

  function renderWithHighlight(text) {
    if (!highlight || !text) return text;

    const full = current;
    const hLen = highlight.length;
    if (!hLen) return text;

    // Mark every character position that belongs to any highlight occurrence.
    const marks = new Array(text.length).fill(false);
    let from = 0;
    while (from < full.length) {
      const at = full.indexOf(highlight, from);
      if (at === -1) break;

      for (let i = at; i < at + hLen && i < marks.length; i++) {
        marks[i] = true;
      }
      from = at + hLen;
    }

    const parts = [];
    let chunk = "";
    let prevMark = marks[0] || false;

    for (let i = 0; i < text.length; i++) {
      const isMarked = marks[i] || false;
      if (i > 0 && isMarked !== prevMark) {
        parts.push({ text: chunk, marked: prevMark });
        chunk = "";
      }
      chunk += text[i];
      prevMark = isMarked;
    }
    if (chunk) parts.push({ text: chunk, marked: prevMark });

    return parts.map((part, i) =>
      part.marked ? (
        <span key={`hl-${i}`} className={highlightClassName}>
          {part.text}
        </span>
      ) : (
        <span key={`tx-${i}`}>{part.text}</span>
      )
    );
  }

  return (
    <span className={className}>
      {renderWithHighlight(visible)}
      <span className="ml-1 inline-block h-[1.1em] w-[2px] animate-pulse bg-black/40 align-[-2px]" />
    </span>
  );
}
