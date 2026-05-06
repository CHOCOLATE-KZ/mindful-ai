"use client";

export default function ChatBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gray-50 dark:bg-[#131314]" />
      <div className="absolute -top-56 -right-56 h-[620px] w-[620px] rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute top-1/3 -left-56 h-[620px] w-[620px] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-[-260px] left-1/2 h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
    </div>
  );
}
