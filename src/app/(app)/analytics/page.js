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

  const hasTests = testResults.length > 0;

  return (
    <div className="relative min-h-screen bg-[#d8dce2] p-3 sm:p-5 md:p-7">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white/40 to-transparent" />

      <div className="relative mx-auto max-w-[1460px] rounded-[32px] border border-white/60 bg-[#eff2f6] p-3 sm:p-5 shadow-[0_28px_60px_rgba(15,23,42,0.14)]">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:gap-5">
          <div className="xl:col-span-8 space-y-4">
            <AnalyticsHeader
              t={t}
              notesCount={notesStats.totalNotes}
              testsCount={testResults.length}
            />

            {notesStats.totalNotes === 0 ? (
              <NotesEmpty t={t} />
            ) : (
              <>
                <StatsCards notesStats={notesStats} testsCount={testResults.length} t={t} />
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-8">
                    <MoodChart series30={notesStats.series30} t={t} />
                  </div>
                  <div className="lg:col-span-4">
                    <WeekSummary notesStats={notesStats} t={t} />
                  </div>
                </div>
                <TopicsCards notesStats={notesStats} t={t} />
              </>
            )}

            <div className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-5 shadow-[0_14px_32px_rgba(15,23,42,0.06)] space-y-5">
              <TestSelector
                testResults={testResults}
                selectedTest={selectedTest}
                setSelectedTest={setSelectedTest}
                t={t}
              />

              {!hasTests && <TestsEmpty t={t} />}

              {testAnalytics && selectedTest && (
                <div className="space-y-5">
                  <TestStatsCards testAnalytics={testAnalytics} selectedTest={selectedTest} />
                  <TestCharts testAnalytics={testAnalytics} />
                  <TestHistory testResults={testResults} selectedTest={selectedTest} />
                </div>
              )}

              {selectedTest && !testAnalytics && hasTests && (
                <div className="rounded-2xl border border-[#8ecbc2] bg-[#eef8f6] p-8 text-center">
                  <p className="text-[#2a4842] font-semibold mb-4">
                    {t("noAnalyticsYet")}
                  </p>
                  <p className="text-[#3a6058] text-sm">
                    {t("noAnalyticsHint")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="xl:col-span-4 space-y-4 self-start">
            <AnalyticsAIReport />
            <BackButtons />
          </aside>
        </div>
      </div>
    </div>
  );
}
