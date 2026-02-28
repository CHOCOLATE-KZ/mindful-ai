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
  AlertCircle,
  Flame,
  HeartHandshake,
  Dumbbell,
  Heart,
  BookHeart,
  Palmtree,
  Bed,
  Footprints,
} from "lucide-react";

// ====== КАТАЛОГ ТЕСТОВ ====== (обновлённый с новыми тестами)
const TESTS = [
  {
    key: "uncertainty_tolerance",
    title: "Умеете ли вы выдерживать неопределённость?",
    description: "Оцените, как вы реагируете на неопределённость и нестабильные ситуации.",
    time: "3–4 мин",
    tags: ["Тревога", "Устойчивость", "Самопознание"],
    Icon: Compass,
    accent: "from-blue-100 via-white to-purple-100",
  },
  {
    key: "manipulation_test",
    title: "Легко ли вами манипулировать?",
    description: "Оцените вашу устойчивость к манипуляциям и умение защищать личные границы.",
    time: "3–4 мин",
    tags: ["Отношения", "Границы", "Самопознание"],
    Icon: Hand,
    accent: "from-purple-100 via-white to-blue-100",
  },
  {
    key: "money_attitude",
    title: "Тест на отношение к деньгам",
    description: "Оцените ваши финансовые привычки и психологическое отношение к деньгам.",
    time: "3–4 мин",
    tags: ["Финансы", "Привычки", "Самопознание"],
    Icon: BadgeDollarSign,
    accent: "from-orange-100 via-white to-blue-100",
  },
  // ========== НОВЫЕ ТЕСТЫ ==========
  {
    key: "anxiety_gad7",
    title: "Тест на уровень тревожности (GAD-7)",
    description: "Оцените уровень тревоги за последние 2 недели. Клинический тест GAD-7.",
    time: "2–3 мин",
    tags: ["Тревога", "Самопознание", "Здоровье"],
    Icon: AlertCircle,
    accent: "from-red-100 via-white to-orange-100",
  },
  {
    key: "stress_test",
    title: "Тест на уровень стресса",
    description: "Оцените ваш текущий уровень стресса и получите персональные рекомендации.",
    time: "3–4 мин",
    tags: ["Стресс", "Самопознание", "Здоровье"],
    Icon: Flame,
    accent: "from-orange-100 via-white to-amber-100",
  },
  {
    key: "emotional_intelligence",
    title: "Тест на эмоциональный интеллект (EQ)",
    description: "Оцените вашу способность распознавать, понимать и управлять эмоциями.",
    time: "4–5 мин",
    tags: ["Эмоции", "Самопознание", "Отношения"],
    Icon: HeartHandshake,
    accent: "from-pink-100 via-white to-purple-100",
  },
  {
    key: "burnout_test",
    title: "Тест на профессиональное выгорание",
    description: "Оцените уровень эмоционального, физического и ментального истощения.",
    time: "3–4 мин",
    tags: ["Выгорание", "Работа", "Здоровье"],
    Icon: Flame,
    accent: "from-red-100 via-white to-orange-100",
  },
];

// ====== МИНИ-УПРАЖНЕНИЯ ====== (обновлённый с новыми упражнениями)
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
  // ========== НОВЫЕ УПРАЖНЕНИЯ ==========
  {
    key: "4_7_8_breathing",
    title: "Дыхание 4-7-8 (2 минуты)",
    why: "Активирует парасимпатическую нервную систему, снижает тревогу.",
    steps: ["Выдох через рот со звуком", "Вдох через нос 4 сек", "Задержка 7 сек", "Выдох через рот 8 сек", "Повтори 4 цикла"],
    time: "2 минуты",
    tags: ["Дыхание", "Тревога", "Сон"],
    Icon: Wind,
    accent: "from-sky-100 via-white to-blue-100",
  },
  {
    key: "progressive_muscle_relaxation",
    title: "Прогрессивная мышечная релаксация (5 мин)",
    why: "Снимает мышечное напряжение и физические проявления стресса.",
    steps: ["Напряги стопы 5 сек → расслабь", "Икры → бёдра → живот", "Кулаки → плечи → шею", "Лицо: сморщи → расслабь всё тело"],
    time: "5 минут",
    tags: ["Тело", "Напряжение", "Релаксация"],
    Icon: Dumbbell,
    accent: "from-violet-100 via-white to-purple-100",
  },
  {
    key: "loving_kindness_meditation",
    title: "Медитация любящей доброты (3 мин)",
    why: "Развивает эмпатию, снижает негативные эмоции.",
    steps: ["Пожелай счастья себе", "Близкому человеку", "Нейтральному знакомому", "Трудному человеку", "Всем живым существам"],
    time: "3 минуты",
    tags: ["Медитация", "Эмпатия", "Отношения"],
    Icon: Heart,
    accent: "from-pink-100 via-white to-rose-100",
  },
  {
    key: "gratitude_journal",
    title: "Дневник благодарности (3 минуты)",
    why: "Перепрограммирует мозг на поиск позитивного.",
    steps: ["Запиши 3 вещи благодарности", "Будь конкретен", "Добавь эмоцию", "Делай 21 день подряд", "Перечитывай в трудные моменты"],
    time: "3 минуты",
    tags: ["Позитив", "Привычки", "Рефлексия"],
    Icon: BookHeart,
    accent: "from-amber-100 via-white to-yellow-100",
  },
  {
    key: "safe_place_visualization",
    title: "Визуализация безопасного места (4 мин)",
    why: "Создаёт внутренний ресурс для успокоения в стрессе.",
    steps: ["Представь безопасное место", "Что видишь? Детали цвета", "Что слышишь? Звуки", "Что ощущаешь? Тепло, запах", "Побудь там 2-3 минуты"],
    time: "4 минуты",
    tags: ["Визуализация", "Стресс", "Тревога"],
    Icon: Palmtree,
    accent: "from-emerald-100 via-white to-teal-100",
  },
  {
    key: "autogenic_training",
    title: "Автогенная тренировка (5 минут)",
    why: "Глубокая релаксация через самовнушение.",
    steps: ["'Моя рука тяжёлая и тёплая'", "'Обе ноги тяжёлые и тёплые'", "'Моё дыхание спокойное'", "'Моё сердцебиение спокойное'", "'Тело расслаблено'"],
    time: "5 минут",
    tags: ["Релаксация", "Самовнушение", "Глубокий отдых"],
    Icon: Bed,
    accent: "from-indigo-100 via-white to-violet-100",
  },
  {
    key: "mindful_walking",
    title: "Осознанная прогулка (5-10 минут)",
    why: "Снижает руминацию (навязчивые мысли).",
    steps: ["Иди медленно без телефона", "Почувствуй стопы на земле", "Заметь движение ног, рук, дыхание", "Если отвлёкся → верни внимание", "Наблюдай цвета, звуки, запахи"],
    time: "5-10 минут",
    tags: ["Mindfulness", "Движение", "Осознанность"],
    Icon: Footprints,
    accent: "from-green-100 via-white to-lime-100",
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
    <>
      {/* Фоновые элементы */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-purple-300/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-300/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 space-y-12">
      {/* ===== HERO / HEADER ===== */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/80 via-white to-blue-50/50 p-8 shadow-lg backdrop-blur-sm">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 rounded-3xl pointer-events-none" />
        
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/60 px-4 py-2 text-sm font-medium text-blue-700 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Упражнения и тесты
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Быстрые инструменты для фокуса и спокойствия
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600">
              Выберите тест или сделайте короткое упражнение — это займёт всего пару минут. Начните прямо сейчас.
            </p>
          </div>

          <Link
            href="/analytics"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
          >
            <BarChart3 className="h-4 w-4" />
            Моя аналитика
          </Link>
        </div>
      </div>

      {/* ===== КАТАЛОГ ТЕСТОВ ===== */}
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Каталог тестов</h2>
            <p className="mt-2 text-sm text-slate-600">
              Короткие опросы, чтобы лучше понять привычки, реакции и установки.
            </p>
          </div>

          {/* Search */}
          <div className="w-full sm:w-[420px]">
            <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-4 py-2.5 shadow-sm backdrop-blur-sm transition focus-within:shadow-md focus-within:border-blue-200">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Поиск тестов и тегов…"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              {q.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
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
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-600 backdrop-blur-sm">
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
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition duration-200",
                  active
                    ? "border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100/80 text-blue-700 shadow-sm"
                    : "border-white/20 bg-white/60 text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:border-white/40 backdrop-blur-sm"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid gap-5 md:grid-cols-2 items-stretch">
          {filteredTests.map((t) => (
            <Link
              key={t.key}
              href={`/exercises/${t.key}`}
              className="group relative h-full overflow-hidden rounded-3xl border border-white/20 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/40"
            >
              {/* gradient accent */}
              <div
                className={cn(
                  "pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full blur-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-100",
                  t.accent
                )}
              />

              <div className="relative p-6 flex h-full flex-col">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 flex-shrink-0">
                      <t.Icon className="h-6 w-6" />
                    </div>
                    <div className="text-lg font-semibold text-slate-900 leading-snug">{t.title}</div>
                  </div>

                  <span className="shrink-0 rounded-full border border-white/30 bg-white/60 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur-sm">
                    {t.time}
                  </span>
                </div>

                <p className="text-sm text-slate-600 mb-4">{t.description}</p>

                <div className="flex flex-wrap gap-2 mb-auto">
                  {t.tags.map((tg) => (
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
          ))}

          {filteredTests.length === 0 && (
            <div className="md:col-span-2 rounded-3xl border border-white/20 bg-white/70 p-8 text-center backdrop-blur-sm shadow-sm">
              <p className="text-slate-600 font-medium">Ничего не найдено</p>
              <p className="text-slate-500 text-sm mt-1">Попробуйте изменить запрос или фильтр.</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== МИНИ-УПРАЖНЕНИЯ (КАРУСЕЛЬ) ===== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Мини-упражнения</h2>
          <p className="mt-2 text-sm text-slate-600">
            Быстрые техники, которые помогут снять стресс прямо сейчас.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 backdrop-blur-sm shadow-lg p-8">
          {/* background blobs */}
          <div
            className={cn(
              "pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-gradient-to-br blur-3xl opacity-50",
              pickedExercise.accent
            )}
          />
          <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-tl from-indigo-200/30 via-purple-200/20 to-blue-200/30 blur-3xl opacity-50" />

          <div className="relative z-10 space-y-6">
            {/* Header and controls */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 flex-shrink-0">
                  <pickedExercise.Icon className="h-7 w-7" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/60 px-4 py-2 text-xs font-medium text-blue-700 backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    Рекомендация
                  </div>
                  <h3 className="mt-3 text-2xl font-bold text-slate-900">{pickedExercise.title}</h3>
                  <p className="mt-1 text-base text-slate-600">{pickedExercise.why}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {pickedExercise.tags.map((tg) => (
                      <span
                        key={tg}
                        className="rounded-full border border-white/30 bg-white/60 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur-sm"
                      >
                        {tg}
                      </span>
                    ))}
                    <span className="rounded-full border border-white/30 bg-white/60 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur-sm">
                      ⏱️ {pickedExercise.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Carousel controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={prevExercise}
                  className="h-11 w-11 rounded-2xl border border-white/30 bg-white/70 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white/90 hover:border-white/50 active:scale-95"
                  aria-label="Предыдущее упражнение"
                >
                  <ChevronLeft className="mx-auto h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={pickRandomExercise}
                  className="h-11 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 font-semibold text-white shadow-lg transition hover:shadow-xl hover:opacity-95 active:scale-95 flex items-center gap-2"
                  aria-label="Случайное упражнение"
                >
                  <Shuffle className="h-4 w-4" />
                  <span className="hidden sm:inline">Случайное</span>
                  <span className="sm:hidden">Выбрать</span>
                </button>

                <button
                  type="button"
                  onClick={nextExercise}
                  className="h-11 w-11 rounded-2xl border border-white/30 bg-white/70 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white/90 hover:border-white/50 active:scale-95"
                  aria-label="Следующее упражнение"
                >
                  <ChevronRight className="mx-auto h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Steps */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {pickedExercise.steps.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/30 bg-white/60 px-5 py-4 text-sm text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 text-sm font-bold text-blue-700 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="font-medium">{s}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="mt-7 flex items-center justify-between gap-3 rounded-2xl border border-blue-200/50 bg-blue-50/60 px-5 py-4 backdrop-blur-sm">
              <div className="text-sm text-slate-700">
                <span className="font-semibold text-blue-900">💡 Совет:</span> выполняйте {" "}
                <span className="font-semibold text-blue-900">медленно</span> и {" "}
                <span className="font-semibold text-blue-900">без напряжения</span>.
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
                <ShieldCheck className="h-4 w-4" />
                Безопасно
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== маленький блок “что дальше” (опционально, но красиво) ===== */}
      <section className="grid gap-5 md:grid-cols-3 items-stretch">
        <div className="rounded-3xl border border-white/20 bg-white/70 backdrop-blur-sm p-6 shadow-md hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex-shrink-0">
              <Brain className="h-6 w-6" />
            </div>
            <div className="font-semibold text-slate-900">Понимание себя</div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Пройдите тест и посмотрите, какие темы требуют внимания. Узнайте себя лучше.
          </p>
        </div>

        <div className="rounded-3xl border border-white/20 bg-white/70 backdrop-blur-sm p-6 shadow-md hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 flex-shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="font-semibold text-slate-900">Микро-привычки</div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Делайте 1 упражнение в день — эффект накапливается быстрее, чем кажется.
          </p>
        </div>

        <div className="rounded-3xl border border-white/20 bg-white/70 backdrop-blur-sm p-6 shadow-md hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 flex-shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="font-semibold text-slate-900">Спокойный темп</div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Без гонки. Главное — регулярность и бережность к себе.
          </p>
        </div>
      </section>
      </div>
    </>
  );
}
