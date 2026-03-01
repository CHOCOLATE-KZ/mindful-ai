import Link from "next/link";
import { factCategories } from "@/data/psychologyFacts";
import { videoCategories, miniPractices } from "@/data/psychologyMedia";
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
} from "lucide-react";

export function HeroSection({ t }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h100v100H0z%22 fill=%22none%22/%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22white%22 opacity=%220.1%22/%3E%3C/svg%3E')] bg-repeat"></div>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="mb-4 flex items-center gap-3">
          <Brain className="h-12 w-12" />
          <h1 className="text-5xl font-extrabold leading-tight">{t("title")}</h1>
        </div>
        <p className="mt-4 max-w-2xl text-xl text-purple-100">{t("subtitle")}</p>
        <div className="mt-6 flex items-center gap-2 text-purple-200">
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
            ? "bg-indigo-600 text-white shadow-md"
            : "border border-gray-300 bg-white text-gray-700 hover:border-indigo-500"
        }`}
      >
        {t("tabFacts")}
      </button>
      <button
        onClick={() => setActiveSection(PSYCHOLOGY_SECTIONS.VIDEOS)}
        className={`rounded-xl px-4 py-2.5 font-semibold transition-all ${
          activeSection === PSYCHOLOGY_SECTIONS.VIDEOS
            ? "bg-indigo-600 text-white shadow-md"
            : "border border-gray-300 bg-white text-gray-700 hover:border-indigo-500"
        }`}
      >
        {t("tabVideos")}
      </button>
      <button
        onClick={() => setActiveSection(PSYCHOLOGY_SECTIONS.PRACTICE)}
        className={`rounded-xl px-4 py-2.5 font-semibold transition-all ${
          activeSection === PSYCHOLOGY_SECTIONS.PRACTICE
            ? "bg-indigo-600 text-white shadow-md"
            : "border border-gray-300 bg-white text-gray-700 hover:border-indigo-500"
        }`}
      >
        {t("tabPractice")}
      </button>
    </div>
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
            className="w-full rounded-2xl border-2 border-gray-200 px-5 py-4 pr-12 text-lg outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <BookOpen className="absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
        </div>

        <div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 transition-all hover:border-indigo-500"
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
                      ? "scale-105 bg-indigo-600 text-white shadow-lg"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-indigo-500 hover:shadow-md"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600">
          {t("resultsCount")} <span className="font-bold text-indigo-600">{filteredFacts.length}</span>
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
                className={`absolute inset-0 bg-gradient-to-br ${fact.color} opacity-0 transition-opacity group-hover:opacity-10`}
              />

              <div className="relative mb-3 flex items-center justify-between">
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  {fact.category}
                </span>
                <span className="text-3xl">{fact.icon}</span>
              </div>

              <h3 className="relative mb-3 text-lg font-bold text-gray-900 transition-colors group-hover:text-indigo-600">
                {fact.title}
              </h3>

              <p className="relative mb-4 text-sm leading-relaxed text-gray-700">{fact.fact}</p>

              <div className="relative border-t border-gray-100 pt-4">
                <p className="text-xs italic text-gray-500">📚 {t("source")} {fact.source}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="mb-4 text-6xl">🔍</div>
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
      {featuredVideo && (
        <article className="mb-8 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 md:p-6">
          <div className="mb-3 flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700">{t("videoOfWeek")}</span>
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
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
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
                ? "bg-indigo-600 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:border-indigo-500"
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
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
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
    <div className="mt-16 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-2xl">
          {isVideosSection ? <PlayCircle className="h-6 w-6 text-white" /> : "💡"}
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
              className="rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              {t("practicesButton")}
            </Link>
            <Link
              href="/auth/login"
              className="rounded-xl border-2 border-indigo-600 bg-white px-5 py-2.5 font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
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