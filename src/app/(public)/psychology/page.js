"use client";

import { useState } from "react";
import { useAppSettings } from "@/components/AppShell";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Footer from "@/components/landing/Footer";
import { PSYCHOLOGY_SECTIONS } from "./constants";
import { useFilteredFacts, useVideoSelection } from "./usePsychologyData";
import {
  HeroSection,
  InteractiveSupportSection,
  SectionTabs,
  FactsSection,
  VideosSection,
  PracticeSection,
  EducationalBanner,
  ALL_CATEGORY,
} from "./PsychologySections";

export default function PsychologyPage() {
  const { settings } = useAppSettings();
  const lang = settings?.language || "ru";
  const t = useTranslation("psychology", lang);

  const [activeSection, setActiveSection] = useState(PSYCHOLOGY_SECTIONS.FACTS);
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVideoCategory, setSelectedVideoCategory] = useState(ALL_CATEGORY);

  const filteredFacts = useFilteredFacts(selectedCategory, searchQuery);
  const { filteredVideos, featuredVideo } = useVideoSelection(selectedVideoCategory);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection t={t} />

      <main className="mx-auto max-w-7xl px-6 py-16">
        <InteractiveSupportSection t={t} />

        <SectionTabs
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          t={t}
        />

        <FactsSection
          activeSection={activeSection}
          t={t}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          filteredFacts={filteredFacts}
        />

        <VideosSection
          activeSection={activeSection}
          t={t}
          selectedVideoCategory={selectedVideoCategory}
          setSelectedVideoCategory={setSelectedVideoCategory}
          filteredVideos={filteredVideos}
          featuredVideo={featuredVideo}
        />

        <PracticeSection activeSection={activeSection} t={t} />

        <EducationalBanner activeSection={activeSection} t={t} />
      </main>

      <Footer />
    </div>
  );
}
