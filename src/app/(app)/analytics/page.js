"use client";

import { useState, useEffect, useRef } from "react";
import { useAppSettings } from "@/components/AppShell";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Loader from "@/components/Loader";
import AnalyticsAIReport from "./_components/AnalyticsAIReport";
import { useAnalyticsData } from "./_hooks/useAnalyticsData";
import { useNotesStats } from "./_hooks/useNotesStats";
import { useTestAnalytics } from "./_hooks/useTestAnalytics";
import AnalyticsHeader from "./_components/AnalyticsHeader";
import AuthRequired from "./_components/AuthRequired";
import NotesEmpty from "./_components/NotesEmpty";
import StatsCards from "./_components/StatsCards";
import WeekSummary from "./_components/WeekSummary";
import MoodChart from "./_components/MoodChart";
import TopicsCards from "./_components/TopicsCards";
import TestsEmpty from "./_components/TestsEmpty";
import TestSelector from "./_components/TestSelector";
import TestStatsCards from "./_components/TestStatsCards";
import TestCharts from "./_components/TestCharts";
import TestHistory from "./_components/TestHistory";
import BackButtons from "./_components/BackButtons";

export default function AnalyticsPage() {
  const { settings } = useAppSettings();
  const lang = settings?.language || "ru";
  const t = useTranslation("analytics", lang);

  const { user, loading, testResults, notes } = useAnalyticsData();
  const [selectedTest, setSelectedTest] = useState(null);
  const initializedRef = useRef(false);

  // Инициализируем selectedTest когда testResults загружены (только один раз)
  useEffect(() => {
    if (!initializedRef.current && testResults.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTest(testResults[0].test_key);
      initializedRef.current = true;
    }
  }, [testResults]);

  const notesStats = useNotesStats(notes, t);
  const testAnalytics = useTestAnalytics(testResults, selectedTest);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <AuthRequired t={t} />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <AnalyticsHeader t={t} />
      
      <AnalyticsAIReport />

      {notesStats.totalNotes === 0 ? (
        <NotesEmpty t={t} />
      ) : (
        <>
          <StatsCards notesStats={notesStats} t={t} />
          <WeekSummary notesStats={notesStats} t={t} />
          <MoodChart series30={notesStats.series30} t={t} />
          <TopicsCards notesStats={notesStats} t={t} />
        </>
      )}

      {/* Всегда показываем селектор со всеми доступными тестами */}
      <TestSelector
        testResults={testResults}
        selectedTest={selectedTest}
        setSelectedTest={setSelectedTest}
        t={t}
      />

      {/* Если выбран тест и есть результаты для него - показываем графики */}
      {testAnalytics && selectedTest && (
        <div className="space-y-8">
          <TestStatsCards testAnalytics={testAnalytics} selectedTest={selectedTest} />
          <TestCharts testAnalytics={testAnalytics} />
          <TestHistory testResults={testResults} selectedTest={selectedTest} />
        </div>
      )}

      {/* Если выбран тест но нет результатов - показываем подсказку */}
      {selectedTest && !testAnalytics && (
        <div className="rounded-2xl border border-blue-300 bg-blue-50 p-8 text-center">
          <p className="text-blue-800 font-semibold mb-4">
            {t("noAnalyticsYet")}
          </p>
          <p className="text-blue-700 text-sm">
            {t("noAnalyticsHint")}
          </p>
        </div>
      )}

      <BackButtons />
    </div>
  );
}
