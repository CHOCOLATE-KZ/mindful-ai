import Image from "next/image";
import Link from "next/link";

export function AboutHeroSection() {
  return (
    <section className="bg-slate-900 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
            About Mindful AI
          </p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Помогаем строить устойчивое ментальное благополучие каждый день
          </h1>
          <p className="mt-5 max-w-xl text-base text-slate-200 sm:text-lg">
            Простые практики, тёплые диалоги с ИИ и понятные шаги для
            самоподдержки в одном удобном пространстве.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth/login"
              className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Начать
            </Link>
            <Link
              href="/psychology"
              className="rounded-xl border border-slate-400 px-6 py-3 font-semibold text-slate-100 transition-colors hover:border-indigo-300 hover:text-indigo-100"
            >
              Узнать больше
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-700 bg-slate-800 p-4 shadow-2xl">
          <div className="overflow-hidden rounded-2xl bg-slate-700">
            <Image
              src="/faq-illustration.png"
              alt="Mindful AI"
              width={640}
              height={640}
              className="h-[360px] w-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}