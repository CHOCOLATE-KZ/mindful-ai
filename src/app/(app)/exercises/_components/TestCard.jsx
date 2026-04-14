import Link from "next/link";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function TestCard({ test }) {
  return (
    <Link
      href={`/exercises/${test.key}`}
      className="group relative h-full overflow-hidden rounded-3xl border border-white/20 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/40"
    >
      {/* gradient accent */}
      <div
        className={cn(
          "pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full blur-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-100",
          test.accent
        )}
      />

      <div className="relative p-6 flex h-full flex-col">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-blue-700 flex-shrink-0">
              <test.Icon className="h-6 w-6" />
            </div>
            <div className="text-lg font-semibold text-slate-900 leading-snug">{test.title}</div>
          </div>

          <span className="shrink-0 rounded-full border border-white/30 bg-white/60 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur-sm">
            {test.time}
          </span>
        </div>

        <p className="text-sm text-slate-600 mb-4">{test.description}</p>

        <div className="flex flex-wrap gap-2 mb-auto">
          {test.tags.map((tg) => (
            <span
              key={tg}
              className="rounded-full border border-white/30 bg-white/60 px-2.5 py-1 text-[11px] font-medium text-slate-600 backdrop-blur-sm"
            >
              {tg}
            </span>
          ))}
        </div>

        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
          Открыть <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}
