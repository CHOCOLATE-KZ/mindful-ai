"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Brain,
  Sparkles,
  BadgeDollarSign,
  Hand,
  Compass,
  Wind,
  Anchor,
  ScanFace,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  X,
} from "lucide-react";

// ====== КАТАЛОГ ТЕСТОВ ======
const TESTS = [
  {
    key: "uncertainty_tolerance",
    title: "Умеете ли вы выдерживать неопределённость?",
    description: "Оцените, как вы реагируете на неопределённость и нестабильные ситуации.",
    time: "2–3 мин",
    tags: ["Тревога", "Устойчивость", "Самопознание"],
    Icon: Compass,
    accent: "from-blue-100 via-white to-purple-100",
  },
  {
    key: "manipulation_test",
    title: "Легко ли вами манипулировать?",
    description: "Тест на вашу восприимчивость к влиянию других людей.",
    time: "2–4 мин",
    tags: ["Отношения", "Границы", "Самопознание"],
    Icon: Hand,
    accent: "from-purple-100 via-white to-blue-100",
  },
  {
    key: "money_attitude",
    title: "Тест на отношение к деньгам",
    description: "Проверка ваших привычек и отношения к финансам.",
    time: "2–3 мин",
    tags: ["Финансы", "Привычки", "Самопознание"],
    Icon: BadgeDollarSign,
    accent: "from-orange-100 via-white to-blue-100",
  },
];

// ====== МИНИ-УПРАЖНЕНИЯ ======
const EXERCISES = [
  {
    key: "box_breathing",
    title: "Дыхание «Квадрат» (1–2 минуты)",
    why: "Снижает тревогу и выравнивает дыхание.",
    steps: ["Вдох 4", "Задержка 4", "Выдох 4", "Задержка 4", "Повтори 4 круга"],
    time: "1–2 минуты",
    tags: ["Дыхание", "Тревога"],
    Icon: Wind,
    accent: "from-blue-100 via-white to-purple-100",
  },
  {
    key: "5_4_3_2_1",
    title: "Заземление 5-4-3-2-1 (2 минуты)",
    why: "Возвращает в «здесь и сейчас» при стрессе.",
    steps: ["5 вещей вижу", "4 ощущаю", "3 слышу", "2 чувствую запах", "1 вкус/мысль"],
    time: "2 минуты",
    tags: ["Фокус", "Стресс"],
    Icon: Anchor,
    accent: "from-purple-100 via-white to-blue-100",
  },
  {
    key: "micro_body_scan",
    title: "Мини body scan (2 минуты)",
    why: "Снимает напряжение в теле.",
    steps: ["Лоб/челюсть расслабить", "Плечи вниз", "Дыхание мягко", "Стопы почувствовать"],
    time: "2 минуты",
    tags: ["Тело", "Напряжение"],
    Icon: ScanFace,
    accent: "from-orange-100 via-white to-purple-100",
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ExercisesPage() {
  // ====== TESTS: search + filter ======
  const [q, setQ] = useState("");
  const [selectedTag, setSelectedTag] = useState("Все");

  const allTestTags = useMemo(() => {
    const s = new Set();
    TESTS.forEach((t) => t.tags.forEach((x) => s.add(x)));
    return ["Все", ...Array.from(s)];
  }, []);

  const filteredTests = useMemo(() => {
    const query = q.trim().toLowerCase();
    return TESTS.filter((t) => {
      const matchesQuery =
        !query ||
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some((x) => x.toLowerCase().includes(query));

      const matchesTag = selectedTag === "Все" || t.tags.includes(selectedTag);
      return matchesQuery && matchesTag;
    });
  }, [q, selectedTag]);

  // ====== EXERCISES: carousel ======
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const pickedExercise = EXERCISES[exerciseIdx];

  function prevExercise() {
    setExerciseIdx((i) => (i - 1 + EXERCISES.length) % EXERCISES.length);
  }
  function nextExercise() {
    setExerciseIdx((i) => (i + 1) % EXERCISES.length);
  }
  function pickRandomExercise() {
    if (EXERCISES.length <= 1) return;
    setExerciseIdx((i) => {
      let n = Math.floor(Math.random() * EXERCISES.length);
      if (n === i) n = (n + 1) % EXERCISES.length;
      return n;
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-12">
      {/* ===== HERO / HEADER ===== */}
      <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white via-white to-blue-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-sm text-black/60">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Упражнения и тесты
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-black">
              Быстрые инструменты для фокуса и спокойствия
            </h1>
            <p className="mt-2 max-w-2xl text-base text-black/60">
              Выберите тест или сделайте короткое упражнение — это займёт всего пару минут.
            </p>
          </div>

          <Link
            href="/analytics"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
          >
            <BarChart3 className="h-4 w-4" />
            Моя аналитика
          </Link>
        </div>
      </div>

      {/* ===== КАТАЛОГ ТЕСТОВ ===== */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-black">Каталог тестов</h2>
            <p className="mt-1 text-sm text-black/60">
              Короткие опросы, чтобы лучше понять привычки, реакции и установки.
            </p>
          </div>

          {/* Search */}
          <div className="w-full sm:w-[420px]">
            <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 shadow-sm">
              <Search className="h-4 w-4 text-black/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Поиск по тестам и тегам…"
                className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/40"
              />
              {q.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="rounded-full p-1 text-black/40 transition hover:bg-black/[0.04] hover:text-black/60"
                  aria-label="Очистить поиск"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/60">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Фильтры
          </div>

          {allTestTags.map((tag) => {
            const active = tag === selectedTag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition",
                  active
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-black/10 bg-white text-black/60 hover:bg-black/[0.03] hover:text-black/80"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid gap-4 md:grid-cols-2 items-stretch">
          {filteredTests.map((t) => (
            <Link
              key={t.key}
              href={`/exercises/${t.key}`}
              className="group relative h-full overflow-hidden rounded-3xl border border-black/10 bg-white p-5 shadow-sm transition
                         hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* subtle glow */}
              <div
                className={cn(
                  "pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br blur-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-90",
                  t.accent
                )}
              />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black/[0.04] text-black/70">
                      <t.Icon className="h-5 w-5" />
                    </div>
                    <div className="text-lg font-semibold text-black leading-snug">{t.title}</div>
                  </div>

                  <span className="shrink-0 rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs text-black/50">
                    {t.time}
                  </span>
                </div>

                <div className="mt-2 text-sm text-black/60">{t.description}</div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {t.tags.map((tg) => (
                    <span
                      key={tg}
                      className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] text-black/50"
                    >
                      {tg}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                  Открыть <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </div>
            </Link>
          ))}

          {filteredTests.length === 0 && (
            <div className="md:col-span-2 rounded-3xl border border-black/10 bg-white p-6 text-black/60">
              Ничего не найдено. Попробуйте изменить запрос или фильтр.
            </div>
          )}
        </div>
      </section>

      {/* ===== МИНИ-УПРАЖНЕНИЯ (КАРУСЕЛЬ) ===== */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-black">Мини-упражнения</h2>
          <p className="mt-1 text-sm text-black/60">
            Быстрые техники: дыхание, заземление, расслабление.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          {/* background blobs */}
          <div
            className={cn(
              "pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br blur-3xl opacity-60",
              pickedExercise.accent
            )}
          />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-purple-100 via-white to-blue-50 blur-3xl opacity-60" />

          <div className="relative">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black/[0.04] text-black/70">
                  <pickedExercise.Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/60">
                    <Sparkles className="h-3.5 w-3.5" />
                    Рекомендация
                  </div>
                  <div className="mt-3 text-xl font-semibold text-black">{pickedExercise.title}</div>
                  <div className="mt-1 text-sm text-black/60">{pickedExercise.why}</div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {pickedExercise.tags.map((tg) => (
                      <span
                        key={tg}
                        className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] text-black/50"
                      >
                        {tg}
                      </span>
                    ))}
                    <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] text-black/50">
                      {pickedExercise.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Carousel controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevExercise}
                  className="h-11 w-11 rounded-2xl border border-black/10 bg-white text-black/70 shadow-sm transition hover:bg-black/[0.03]"
                  aria-label="Предыдущее упражнение"
                >
                  <ChevronLeft className="mx-auto h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={pickRandomExercise}
                  className="h-11 rounded-2xl bg-blue-600 px-4 font-semibold text-white shadow-sm transition hover:opacity-95"
                  aria-label="Случайное упражнение"
                >
                  <span className="inline-flex items-center gap-2">
                    <Shuffle className="h-4 w-4" />
                    Случайное
                  </span>
                </button>

                <button
                  type="button"
                  onClick={nextExercise}
                  className="h-11 w-11 rounded-2xl border border-black/10 bg-white text-black/70 shadow-sm transition hover:bg-black/[0.03]"
                  aria-label="Следующее упражнение"
                >
                  <ChevronRight className="mx-auto h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Steps */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {pickedExercise.steps.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black/80 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-black/[0.04] text-sm font-semibold text-black/70">
                      {i + 1}
                    </div>
                    <div className="font-medium">{s}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white/60 px-4 py-3">
              <div className="text-sm text-black/60">
                Совет: делайте упражнение <span className="font-semibold text-black">медленно</span> и{" "}
                <span className="font-semibold text-black">без напряжения</span>.
              </div>
              <div className="flex items-center gap-2 text-xs text-black/50">
                <ShieldCheck className="h-4 w-4" />
                Мягко и безопасно
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== маленький блок “что дальше” (опционально, но красиво) ===== */}
      <section className="grid gap-4 md:grid-cols-3 items-stretch">
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm h-full">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <Brain className="h-5 w-5" />
            </div>
            <div className="font-semibold text-black">Понимание себя</div>
          </div>
          <div className="mt-2 text-sm text-black/60">
            Пройдите тест и посмотрите, какие темы требуют внимания.
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm h-full">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-50 text-purple-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="font-semibold text-black">Микро-привычки</div>
          </div>
          <div className="mt-2 text-sm text-black/60">
            Делайте 1 упражнение в день — эффект накапливается быстрее, чем кажется.
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm h-full">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-50 text-orange-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="font-semibold text-black">Спокойный темп</div>
          </div>
          <div className="mt-2 text-sm text-black/60">
            Никакой гонки. Главное — регулярность и бережность к себе.
          </div>
        </div>
      </section>
    </div>
  );
}
