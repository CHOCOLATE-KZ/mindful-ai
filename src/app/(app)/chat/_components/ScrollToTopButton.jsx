"use client";

import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed right-8 bottom-44 z-[120] h-12 w-12 rounded-full bg-blue-600 text-white shadow-2xl ring-2 ring-white grid place-items-center hover:bg-blue-700 transition-all duration-300 opacity-100 translate-y-0 pointer-events-auto"
      aria-label="Scroll to top"
      title="Наверх"
    >
      <ArrowUp className="h-6 w-6 text-white" />
    </button>
  );
}
