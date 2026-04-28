import { useMemo, useState } from "react";
import Link from "next/link";
import { factCategories } from "@/data/psychologyFacts";
import {
  videoCategories,
  miniPractices,
  videoLearningTracks,
} from "@/data/psychologyMedia";
import { ALL_CATEGORY, PSYCHOLOGY_SECTIONS } from "./constants";
import {
  Brain,
  Filter,
  ChevronDown,
  Sparkles,
  BookOpen,
  PlayCircle,
  Activity,
  Clock,
  SearchX,
  Lightbulb,
  MessageCircleHeart,
  Loader2,
  AlertTriangle,
} from "lucide-react";

function getFactIcon(category) {
  if (category.includes("Нейро")) return <Brain className="h-7 w-7 text-blue-600" />;
  if (category.includes("Память") || category.includes("Обуч")) return <BookOpen className="h-7 w-7 text-blue-600" />;
  if (category.includes("Эмоц") || category.includes("Социаль")) return <Sparkles className="h-7 w-7 text-pink-600" />;
  if (category.includes("Стресс") || category.includes("Физиол")) return <Activity className="h-7 w-7 text-emerald-600" />;
  return <Lightbulb className="h-7 w-7 text-blue-600" />;
}

export function HeroSection({ t }) {
  return (
    <div className="relative overflow-hidden bg-[#5d9088] text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h100v100H0z%22 fill=%22none%22/%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22white%22 opacity=%220.1%22/%3E%3C/svg%3E')] bg-repeat"></div>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="mb-4 flex items-center gap-3">
          <Brain className="h-12 w-12" />
          <h1 className="text-5xl font-extrabold leading-tight">{t("title")}</h1>
        </div>
        <p className="mt-4 max-w-2xl text-xl text-blue-100">{t("subtitle")}</p>
        <div className="mt-6 flex items-center gap-2 text-blue-200">
          <Sparkles className="h-5 w-5" />
          <span>{t("scientificBasis")}</span>
        </div>
      </div>
    </div>
  );
}

export function SectionTabs({ activeSection, setActiveSection, t }) {
  return (
    <div className="mb-8 flex flex-wrap gap-3">
      <button
        onClick={() => setActiveSection(PSYCHOLOGY_SECTIONS.FACTS)}
        className={`rounded-xl px-4 py-2.5 font-semibold transition-all ${
          activeSection === PSYCHOLOGY_SECTIONS.FACTS
            ? "bg-blue-600 text-white shadow-md"
            : "border border-gray-300 bg-white text-gray-700 hover:border-blue-500"
        }`}
      >
        {t("tabFacts")}
      </button>
      <button
        onClick={() => setActiveSection(PSYCHOLOGY_SECTIONS.VIDEOS)}
        className={`rounded-xl px-4 py-2.5 font-semibold transition-all ${
          activeSection === PSYCHOLOGY_SECTIONS.VIDEOS
            ? "bg-blue-600 text-white shadow-md"
            : "border border-gray-300 bg-white text-gray-700 hover:border-blue-500"
        }`}
      >
        {t("tabVideos")}
      </button>
      <button
        onClick={() => setActiveSection(PSYCHOLOGY_SECTIONS.PRACTICE)}
        className={`rounded-xl px-4 py-2.5 font-semibold transition-all ${
          activeSection === PSYCHOLOGY_SECTIONS.PRACTICE
            ? "bg-blue-600 text-white shadow-md"
            : "border border-gray-300 bg-white text-gray-700 hover:border-blue-500"
        }`}
      >
        {t("tabPractice")}
      </button>
    </div>
  );
}

// Заглушка для раздела курсов (экспорт вне других функций)
export function CoursesSection({ activeSection, t }) {
  if (activeSection !== PSYCHOLOGY_SECTIONS.COURSES) return null;
  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-8 my-8">
      <h2 className="text-3xl font-bold mb-4 text-blue-700">{t("coursesTitle") || "Видеокурсы по психологии"}</h2>
      <p className="text-base text-blue-900 mb-4">В этом разделе появятся структурированные видеокурсы с отслеживанием прогресса пользователя. Следите за обновлениями!</p>
      {/* Здесь будет список курсов, видеоуроки и прогресс */}
    </section>
  );
}
const symptomChips = [
  "Тревога",
  "Паника",
  "Усталость",
  "Прокрастинация",
  "Бессонница",
  "Самокритика",
  "Раздражительность",
  "Одиночество",
];

function getQuickPlan(moodLevel, selectedSymptoms) {
  const plan = [];

  if (moodLevel <= 3 || selectedSymptoms.includes("Паника")) {
    plan.push("Сделайте 2 минуты дыхания 4-6: вдох 4, выдох 6, без задержки.");
    plan.push("Техника 5-4-3-2-1: найдите 5 предметов, 4 звука, 3 ощущения, 2 запаха, 1 вкус.");
  }

  if (selectedSymptoms.includes("Бессонница") || selectedSymptoms.includes("Усталость")) {
    plan.push("За 60 минут до сна уберите экран и включите мягкий свет.");
  }

  if (selectedSymptoms.includes("Прокрастинация")) {
    plan.push("Правило 2 минут: начните с самого маленького шага прямо сейчас.");
  }

  if (selectedSymptoms.includes("Самокритика")) {
    plan.push("Переформулируйте мысль: не 'я не справляюсь', а 'мне сложно, но я учусь'.");
  }

  if (!plan.length) {
    plan.push("Сделайте 3 спокойных выдоха длиннее вдоха и оцените состояние еще раз через 5 минут.");
    plan.push("Запишите одну мысль, которая тревожит, и один реалистичный альтернативный взгляд.");
  }

  return plan.slice(0, 3);
}

export function InteractiveSupportSection({ t }) {
  const [moodLevel, setMoodLevel] = useState(5);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPlan = useMemo(
    () => getQuickPlan(moodLevel, selectedSymptoms),
    [moodLevel, selectedSymptoms]
  );

  function toggleSymptom(symptom) {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((item) => item !== symptom)
        : [...prev, symptom]
    );
  }

  async function askAiNow() {
    if (loading) return;

    setLoading(true);
    setErrorText("");

    const summary = [
      `Уровень состояния сейчас: ${moodLevel}/10`,
      `Симптомы: ${selectedSymptoms.length ? selectedSymptoms.join(", ") : "не выбраны"}`,
      `Запрос пользователя: ${userMessage.trim() || "Помоги с планом самопомощи на сегодня"}`,
      "Дай короткий ответ: 1) что со мной может происходить, 2) план на 10 минут, 3) фраза поддержки.",
      "Не ставь диагнозы и не используй пугающие формулировки.",
    ].join("\n");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: summary }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) {
          setErrorText(t("interactiveNeedLogin"));
          setAiReply("");
          return;
        }
        throw new Error(data.error || "AI request failed");
      }

      setAiReply((data.reply || "").trim());
    } catch {
      setErrorText(t("interactiveAiError"));
      setAiReply("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 md:p-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-xl bg-emerald-600 p-2 text-white">
          <MessageCircleHeart className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("interactiveTitle")}</h2>
          <p className="text-sm text-gray-700">{t("interactiveSubtitle")}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-gray-200 bg-white p-5">
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            {t("interactiveMoodLabel")}: <span className="text-emerald-700">{moodLevel}/10</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={moodLevel}
            onChange={(event) => setMoodLevel(Number(event.target.value))}
            className="w-full"
          />

          <p className="mt-4 mb-2 text-sm font-semibold text-gray-900">{t("interactiveSymptomsLabel")}</p>
          <div className="flex flex-wrap gap-2">
            {symptomChips.map((symptom) => (
              <button
                key={symptom}
                type="button"
                onClick={() => toggleSymptom(symptom)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                  selectedSymptoms.includes(symptom)
                    ? "bg-emerald-600 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:border-emerald-500"
                }`}
              >
                {symptom}
              </button>
            ))}
          </div>

          <p className="mt-4 mb-2 text-sm font-semibold text-gray-900">{t("interactiveInputLabel")}</p>
          <textarea
            rows={3}
            value={userMessage}
            onChange={(event) => setUserMessage(event.target.value)}
            placeholder={t("interactiveInputPlaceholder")}
            className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={askAiNow}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? t("interactiveAiLoading") : t("interactiveAiButton")}
            </button>
            <Link
              href="/auth/login"
              className="rounded-xl border border-emerald-600 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              {t("interactiveLoginButton")}
            </Link>
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-3 text-lg font-bold text-gray-900">{t("interactivePlanTitle")}</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            {quickPlan.map((item, index) => (
              <li key={item} className="rounded-lg bg-gray-50 p-2.5">
                <span className="mr-2 font-bold text-emerald-700">{index + 1}.</span>
                {item}
              </li>
            ))}
          </ol>

          {errorText ? (
            <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="inline-flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                {errorText}
              </p>
            </div>
          ) : null}

          {aiReply ? (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                {t("interactiveAiReplyLabel")}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{aiReply}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">{t("interactiveAiHint")}</p>
          )}
        </article>
      </div>
    </section>
  );
}

export function FactsSection({
  activeSection,
  t,
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  selectedCategory,
  setSelectedCategory,
  filteredFacts,
}) {
  if (activeSection !== PSYCHOLOGY_SECTIONS.FACTS) {
    return null;
  }

  return (
    <>
      <div className="mb-12 space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-2xl border-2 border-gray-200 px-5 py-4 pr-12 text-lg outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <BookOpen className="absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
        </div>

        <div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 transition-all hover:border-blue-500"
          >
            <Filter className="h-5 w-5" />
            <span className="font-semibold">{t("categoriesLabel")}</span>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {showFilters && (
            <div className="animate-in slide-in-from-top-2 mt-4 flex flex-wrap gap-2 fade-in duration-300">
              {factCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-xl px-4 py-2 font-semibold transition-all ${
                    selectedCategory === category
                      ? "scale-105 bg-blue-600 text-white shadow-lg"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:shadow-md"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600">
          {t("resultsCount")} <span className="font-bold text-blue-600">{filteredFacts.length}</span>
        </p>
      </div>

      {filteredFacts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFacts.map((fact) => (
            <div
              key={fact.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <div
                className="absolute inset-0 bg-[#74AA9C]/0 group-hover:bg-[#74AA9C]/10 transition-all"
              />

              <div className="relative mb-3 flex items-center justify-between">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {fact.category}
                </span>
                <span>{fact.icon ? <span className="text-3xl">{fact.icon}</span> : getFactIcon(fact.category)}</span>
              </div>

              <h3 className="relative mb-3 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                {fact.title}
              </h3>

              <p className="relative mb-4 text-sm leading-relaxed text-gray-700">{fact.fact}</p>

              <div className="relative border-t border-gray-100 pt-4">
                <p className="text-xs italic text-gray-500"> {t("source")} {fact.source}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <SearchX className="mx-auto mb-4 h-14 w-14 text-gray-300" />
          <h3 className="mb-2 text-2xl font-bold text-gray-900">{t("noResults")}</h3>
          <p className="text-gray-600">{t("noResultsHint")}</p>
        </div>
      )}
    </>
  );
}

export function VideosSection({
  activeSection,
  t,
  selectedVideoCategory,
  setSelectedVideoCategory,
  filteredVideos,
  featuredVideo,
}) {
  if (activeSection !== PSYCHOLOGY_SECTIONS.VIDEOS) {
    return null;
  }

  return (
    <section>
      <div className="mb-8">
        <h3 className="mb-3 text-xl font-bold text-gray-900">{t("videoTracksTitle")}</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videoLearningTracks.map((track) => (
            <article key={track.id} className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {track.difficulty}
                </span>
                <span className="text-xs text-gray-500">{track.totalTime}</span>
              </div>
              <h4 className="text-base font-bold text-gray-900">{track.title}</h4>
              <p className="mt-1 text-sm text-gray-700">{track.goal}</p>
              <p className="mt-2 text-xs text-gray-500">
                {t("videoTracksIncludes")} {track.videoIds.length} {t("videoTracksVideos")} + {track.practicePlan.length} {t("videoTracksPractices")}
              </p>
              <button
                type="button"
                onClick={() => setSelectedVideoCategory(track.focusCategory || ALL_CATEGORY)}
                className="mt-3 rounded-lg border border-blue-600 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                {t("videoTracksStart")}
              </button>
            </article>
          ))}
        </div>
      </div>

      {featuredVideo && (
        <article className="mb-8 rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 md:p-6">
          <div className="mb-3 flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">{t("videoOfWeek")}</span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="aspect-video overflow-hidden rounded-xl bg-black">
              <iframe
                className="h-full w-full"
                src={featuredVideo.embedUrl}
                title={featuredVideo.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            <div className="flex flex-col justify-center">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {featuredVideo.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-4 w-4" />
                  {featuredVideo.duration}
                </span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">{featuredVideo.title}</h3>
              <p className="mb-2 text-sm text-gray-700">{featuredVideo.whyWatch}</p>
              <p className="text-xs text-gray-500">{t("source")}: {featuredVideo.channel}</p>
            </div>
          </div>
        </article>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {videoCategories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedVideoCategory(category)}
            className={`rounded-xl px-4 py-2 font-semibold transition-all ${
              selectedVideoCategory === category
                ? "bg-blue-600 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:border-blue-500"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredVideos.map((video) => (
          <article
            key={video.id}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md"
          >
            <div className="aspect-video bg-black">
              <iframe
                className="h-full w-full"
                src={video.embedUrl}
                title={video.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            <div className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {video.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-4 w-4" />
                  {video.duration}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-bold text-gray-900">{video.title}</h3>
              <p className="mb-3 text-sm text-gray-700">{video.whyWatch}</p>
              <p className="text-xs text-gray-500">{t("source")} {video.channel}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PracticeSection({ activeSection, t }) {
  if (activeSection !== PSYCHOLOGY_SECTIONS.PRACTICE) {
    return null;
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {miniPractices.map((practice) => (
        <article
          key={practice.id}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <Activity className="h-4 w-4" />
              {t("practiceLabel")}
            </span>
            <span className="text-xs text-gray-500">{practice.duration}</span>
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900">{practice.title}</h3>
          <p className="text-sm text-gray-700">{practice.instruction}</p>
        </article>
      ))}
    </section>
  );
}

export function EducationalBanner({ activeSection, t }) {
  const isVideosSection = activeSection === PSYCHOLOGY_SECTIONS.VIDEOS;

  return (
    <div className="mt-16 rounded-2xl border-2 border-blue-200 bg-blue-50 p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500 text-2xl">
          {isVideosSection ? <PlayCircle className="h-6 w-6 text-white" /> : <Lightbulb className="h-6 w-6 text-white" />}
        </div>
        <div>
          <h3 className="mb-2 text-xl font-bold text-gray-900">
            {isVideosSection
              ? t("educationalBannerTitleVideos")
              : t("educationalBannerTitle")}
          </h3>
          <p className="mb-4 text-gray-700">
            {isVideosSection
              ? t("educationalBannerTextVideos")
              : t("educationalBannerText")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/exercises"
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              {t("practicesButton")}
            </Link>
            <Link
              href="/auth/login"
              className="rounded-xl border-2 border-blue-600 bg-white px-5 py-2.5 font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              {t("aiButton")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ALL_CATEGORY };