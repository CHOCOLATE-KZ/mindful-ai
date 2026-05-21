"use client";

export default function ChatBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Light mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4f1] via-[#f5f5f5] to-[#ffffff]" />
      {/* Dark mode — Premium Dark с бирюзовым акцентом бренда */}
      <div className="absolute inset-0 hidden bg-gradient-to-br from-[#152e28] via-[#1a1d2e] to-[#111318]" />
    </div>
  );
}
