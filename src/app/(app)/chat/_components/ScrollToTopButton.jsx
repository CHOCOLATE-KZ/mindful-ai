"use client";

import { ArrowUp, ArrowDown } from "lucide-react";

export default function ScrollToTopButton({ onClick, atTop, ambientBg = "none" }) {
  const accentPalette = {
    none: "bg-[#74AA9C] hover:bg-[#5d9088]",
    rain: "bg-[#355A8A] hover:bg-[#2D4D75]",
    forest: "bg-[#2F6A4F] hover:bg-[#265740]",
    fireplace: "bg-[#8A4F36] hover:bg-[#73422D]",
    ocean: "bg-[#2C6F7B] hover:bg-[#245D67]",
    space: "bg-[#4C4F8A] hover:bg-[#404276]",
    lofi: "bg-[#6A4F8A] hover:bg-[#5A4476]",
  };

  const accentClass = accentPalette[ambientBg] || accentPalette.none;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed right-8 bottom-10 z-[120] h-12 w-12 rounded-full text-white shadow-2xl ring-2 ring-white grid place-items-center transition-all duration-300 opacity-100 translate-y-0 pointer-events-auto cursor-pointer ${accentClass}`}
      aria-label={atTop ? "Scroll to bottom" : "Scroll to top"}
      title={atTop ? "Вниз" : "Наверх"}
    >
      {atTop ? (
        <ArrowDown className="h-6 w-6 text-white" />
      ) : (
        <ArrowUp className="h-6 w-6 text-white" />
      )}
    </button>
  );
}
