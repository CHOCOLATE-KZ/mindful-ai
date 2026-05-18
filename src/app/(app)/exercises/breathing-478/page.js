import Link from "next/link";
import Breathing478Trainer from "./Breathing478Trainer";

export default function Breathing478Page() {
  return (
    <>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-36 -right-32 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute top-1/3 -left-36 h-80 w-80 rounded-full bg-indigo-300/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
        <Link
          href="/exercises"
          className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
        >
          ← Назад к упражнениям
        </Link>

        <Breathing478Trainer />
      </div>
    </>
  );
}
