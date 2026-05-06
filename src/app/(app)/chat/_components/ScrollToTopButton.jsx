"use client";

import { ArrowUp, ArrowDown } from "lucide-react";

export default function ScrollToTopButton({ onClick, atTop }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed right-8 bottom-10 z-[120] h-12 w-12 rounded-full bg-[#74AA9C] text-white shadow-2xl ring-2 ring-white grid place-items-center hover:bg-[#5d9088] transition-all duration-300 opacity-100 translate-y-0 pointer-events-auto cursor-pointer"
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
