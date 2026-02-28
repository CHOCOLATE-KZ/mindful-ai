"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAppSettings } from "@/components/AppShell";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { psychologyFacts, factCategories } from "@/data/psychologyFacts";
import {
  psychologyVideos,
  miniPractices,
  videoCategories,
  featuredVideoId,
} from "@/data/psychologyMedia";
import Footer from "@/components/landing/Footer";
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

export default function PsychologyPage() {
  const { settings } = useAppSettings();
  const lang = settings?.language || "ru";
  const t = useTranslation("psychology", lang);

  const [activeSection, setActiveSection] = useState("facts");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVideoCategory, setSelectedVideoCategory] = useState("Все");

  const filteredFacts = useMemo(() => {
    let facts = psychologyFacts;

    // Фильтр по категории
    if (selectedCategory !== "Все") {
      facts = facts.filter((f) => f.category === selectedCategory);
    }

    // Поиск
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      facts = facts.filter(
        (f) =>
          f.title.toLowerCase().includes(query) ||
          f.fact.toLowerCase().includes(query) ||
          f.category.toLowerCase().includes(query)
      );
    }

    return facts;
  }, [selectedCategory, searchQuery]);

  const filteredVideos = useMemo(() => {
    if (selectedVideoCategory === "Все") {
      return psychologyVideos;
    }

    return psychologyVideos.filter(
      (video) => video.category === selectedVideoCategory
    );
  }, [selectedVideoCategory]);

  const featuredVideo = useMemo(() => {
    const preferredVideo = psychologyVideos.find((video) => video.id === featuredVideoId);
    if (selectedVideoCategory === "Все") {
      return preferredVideo || psychologyVideos[0] || null;
    }

    const byCategory = filteredVideos[0] || null;
    return byCategory;
  }, [selectedVideoCategory, filteredVideos]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h100v100H0z%22 fill=%22none%22/%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22white%22 opacity=%220.1%22/%3E%3C/svg%3E')] bg-repeat"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-12 h-12" />
            <h1 className="text-5xl font-extrabold leading-tight">
              {t("title")}
            </h1>
          </div>
          <p className="mt-4 max-w-2xl text-xl text-purple-100">
            {t("subtitle")}
          </p>
          <div className="mt-6 flex items-center gap-2 text-purple-200">
            <Sparkles className="w-5 h-5" />
            <span>{t("scientificBasis")}</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveSection("facts")}
            className={`px-4 py-2.5 rounded-xl font-semibold transition-all ${
              activeSection === "facts"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:border-indigo-500"
            }`}
          >
            {t("tabFacts")}
          </button>
          <button
            onClick={() => setActiveSection("videos")}
            className={`px-4 py-2.5 rounded-xl font-semibold transition-all ${
              activeSection === "videos"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:border-indigo-500"
            }`}
          >
            {t("tabVideos")}
          </button>
          <button
            onClick={() => setActiveSection("practice")}
            className={`px-4 py-2.5 rounded-xl font-semibold transition-all ${
              activeSection === "practice"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:border-indigo-500"
            }`}
          >
            {t("tabPractice")}
          </button>
        </div>

        {/* Search & Filter Section */}
        <div className={`mb-12 space-y-4 ${activeSection === "facts" ? "block" : "hidden"}`}>
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full px-5 py-4 pr-12 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-lg"
            />
            <BookOpen className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          </div>

          {/* Category Filter */}
          <div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-gray-200 hover:border-indigo-500 transition-all"
            >
              <Filter className="w-5 h-5" />
              <span className="font-semibold">{t("categoriesLabel")}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {showFilters && (
              <div className="mt-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {factCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white shadow-lg scale-105"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-indigo-500 hover:shadow-md"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-600">
            {t("resultsCount")} <span className="font-bold text-indigo-600">{filteredFacts.length}</span>
          </p>
        </div>

        {/* Facts Grid */}
        {activeSection === "facts" && filteredFacts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFacts.map((fact) => (
              <div
                key={fact.id}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md border border-gray-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${fact.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                />

                {/* Category Badge */}
                <div className="relative flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                    {fact.category}
                  </span>
                  <span className="text-3xl">{fact.icon}</span>
                </div>

                {/* Title */}
                <h3 className="relative text-lg font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {fact.title}
                </h3>

                {/* Fact Text */}
                <p className="relative text-gray-700 text-sm leading-relaxed mb-4">
                  {fact.fact}
                </p>

                {/* Source */}
                <div className="relative pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 italic">
                    📚 {t("source")} {fact.source}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : activeSection === "facts" ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t("noResults")}
            </h3>
            <p className="text-gray-600">
              {t("noResultsHint")}
            </p>
          </div>
        ) : null}

        {activeSection === "videos" && (
          <section>
            {featuredVideo && (
              <article className="mb-8 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 md:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-indigo-600" />
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
                        <Clock className="w-4 h-4" />
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
              {videoCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedVideoCategory(cat)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    selectedVideoCategory === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-indigo-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {filteredVideos.map((video) => (
                <article
                  key={video.id}
                  className="rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden"
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
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                        {video.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-4 h-4" />
                        {video.duration}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{video.title}</h3>
                    <p className="text-sm text-gray-700 mb-3">{video.whyWatch}</p>
                    <p className="text-xs text-gray-500">{t("source")} {video.channel}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeSection === "practice" && (
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {miniPractices.map((practice) => (
              <article
                key={practice.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <Activity className="w-4 h-4" />
                  {t("practiceLabel")}
                  </span>
                  <span className="text-xs text-gray-500">{practice.duration}</span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{practice.title}</h3>
                <p className="text-sm text-gray-700">{practice.instruction}</p>
              </article>
            ))}
          </section>
        )}

        {/* Educational Banner */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 border-2 border-indigo-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-2xl">
              {activeSection === "videos" ? <PlayCircle className="w-6 h-6 text-white" /> : "💡"}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {activeSection === "videos" ? t("educationalBannerTitleVideos") : t("educationalBannerTitle")}
              </h3>
              <p className="text-gray-700 mb-4">
                {activeSection === "videos" ? t("educationalBannerTextVideos") : t("educationalBannerText")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/exercises"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                >
                  {t("practicesButton")}
                </Link>
                <Link
                  href="/auth/login"
                  className="px-5 py-2.5 rounded-xl bg-white text-indigo-600 font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  {t("aiButton")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
