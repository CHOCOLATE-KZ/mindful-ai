"use client";

import { useState } from "react";
import { useAppSettings } from "@/components/AppShell";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Button from "@/components/ui/Button";

export default function AnalyticsAIReport() {
  const { settings } = useAppSettings();
  const lang = settings?.language || "ru";
  const t = useTranslation("analytics", lang);
  
  const [weekly, setWeekly] = useState(null);
  const [report, setReport] = useState(null);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState("");

  async function run(mode) {
    setError("");
    if (mode === "weekly") setLoadingWeekly(true);
    else setLoadingReport(true);

    try {
      const res = await fetch("/api/ai/profile-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "AI report failed");

      if (mode === "weekly") setWeekly(data);
      else setReport(data);
    } catch (e) {
      setError(e?.message || "AI report failed");
    } finally {
      setLoadingWeekly(false);
      setLoadingReport(false);
    }
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-black">{t("aiInsightsTitle")}</h3>
          <p className="mt-1 text-sm text-black/60">
            {t("aiInsightsSubtitle")}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={() => run("weekly")} disabled={loadingWeekly}>
          {loadingWeekly ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t("analyzingData")}
            </span>
          ) : t("generateWeekly")}
        </Button>
        <Button onClick={() => run("profile")} disabled={loadingReport} className="bg-black/80 hover:bg-black">
          {loadingReport ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t("analyzingData")}
            </span>
          ) : t("generateFull")}
        </Button>
      </div>

      {/* Полоса загрузки */}
      {(loadingWeekly || loadingReport) && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">{t("aiAnalyzing")}</p>
              <p className="text-xs text-blue-700 mt-1">{t("aiAnalyzingHint")}</p>
            </div>
          </div>
          {/* Анимированная полоса */}
          <div className="mt-3 h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{width: "70%"}}></div>
          </div>
        </div>
      )}

      {!!error && (
        <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {weekly?.text && (
        <div className="mt-4 rounded-2xl border border-black/10 bg-white/80 p-4 text-sm text-black/80 whitespace-pre-wrap">
          {weekly.text}
        </div>
      )}

      {report?.text && (
        <div className="mt-4 rounded-2xl border border-black/10 bg-white/80 p-4 text-sm text-black/80 whitespace-pre-wrap">
          {report.text}
        </div>
      )}
    </div>
  );
}
