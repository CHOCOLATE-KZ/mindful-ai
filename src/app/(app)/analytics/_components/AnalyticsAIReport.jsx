"use client";

import { useState } from "react";
import { useAppSettings } from "@/components/AppShell";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Button from "@/components/ui/Button";

function confidenceText(confidence, t) {
  if (confidence === "high") return t("confidenceHigh");
  if (confidence === "medium") return t("confidenceMedium");
  return t("confidenceLow");
}

function scoreColor(score, inverted = false) {
  if (score == null) return "text-[#4a7a70]";
  if (!inverted) {
    if (score >= 70) return "text-[#2a4842]";
    if (score >= 40) return "text-[#3a6058]";
    return "text-[#4a7a70]";
  }
  if (score >= 70) return "text-[#2a4842]";
  if (score >= 40) return "text-[#3a6058]";
  return "text-[#4a7a70]";
}

function AnalysisMetaBlock({ data, t }) {
  const meta = data?.analysisMeta;
  if (!meta) return null;

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
        <h4 className="text-sm font-semibold text-slate-900">{t("riskResourceTitle")}</h4>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#b3ddd6] bg-[#f0f7f5] p-4">
            <p className="text-xs text-slate-600">{t("riskIndex")}</p>
            <p className={`text-2xl font-bold ${scoreColor(meta.riskIndex, false)}`}>{meta.riskIndex ?? "?"}/100</p>
          </div>
          <div className="rounded-xl border border-[#8ecbc2] bg-[#d9eeea] p-4">
            <p className="text-xs text-slate-600">{t("resourceIndex")}</p>
            <p className={`text-2xl font-bold ${scoreColor(meta.resourceIndex, true)}`}>{meta.resourceIndex ?? "?"}/100</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-600">
          {t("confidence")}: <span className="font-semibold text-slate-800">{confidenceText(meta.confidence, t)}</span>
        </p>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
        <h4 className="text-sm font-semibold text-slate-900">{t("explainabilityTitle")}</h4>
        <p className="mt-1 text-xs text-slate-600">{t("basedOnSources")}</p>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="rounded-lg bg-slate-50 p-2 text-slate-800">{t("sourceNotes")}: <strong>{meta?.evidence?.notesCount ?? 0}</strong></div>
          <div className="rounded-lg bg-slate-50 p-2 text-slate-800">{t("sourceChats")}: <strong>{meta?.evidence?.chatsCount ?? 0}</strong></div>
          <div className="rounded-lg bg-slate-50 p-2 text-slate-800">{t("sourceTests")}: <strong>{meta?.evidence?.testsCount ?? 0}</strong></div>
          <div className="rounded-lg bg-slate-50 p-2 text-slate-800">{t("sourceCbt")}: <strong>{meta?.evidence?.cbtNotesCount ?? 0}</strong></div>
        </div>
      </div>
    </div>
  );
}

function ListSection({ title, items, tone = "slate" }) {
  if (!items?.length) return null;

  const toneClass =
    tone === "danger"
      ? "border-[#b3ddd6] bg-[#eef8f6]"
      : tone === "success"
      ? "border-[#8ecbc2] bg-[#e5f3f0]"
      : tone === "accent"
      ? "border-[#8ecbc2] bg-[#f0f7f5]"
      : "border-slate-200 bg-slate-50";

  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-700">{title}</h5>
      <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="leading-relaxed">• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function StructuredPlanBlock({ data, t }) {
  const structured = data?.structuredAnalysis;
  if (!structured) return null;

  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-black/10 bg-white/95 p-4">
      <h4 className="text-sm font-semibold text-slate-900">{t("impactPlanTitle")}</h4>

      <ListSection title={t("keyFindings")} items={structured.keyFindings} tone="accent" />
      <ListSection title={t("likelyDrivers")} items={structured.likelyDrivers} tone="slate" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ListSection title={t("plan24h")} items={structured.plan24h} tone="success" />
        <ListSection title={t("plan7d")} items={structured.plan7d} tone="success" />
      </div>

      <ListSection title={t("expectedSignals")} items={structured.expectedSignals} tone="accent" />
      <ListSection title={t("checkInQuestions")} items={structured.checkInQuestions} tone="danger" />
    </div>
  );
}

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
        body: JSON.stringify({ mode, language: lang }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Не удалось получить AI-отчет");

      if (mode === "weekly") setWeekly(data);
      else setReport(data);
    } catch (e) {
      setError(e?.message || "Не удалось получить AI-отчет");
    } finally {
      setLoadingWeekly(false);
      setLoadingReport(false);
    }
  }

  return (
    <div className="rounded-[24px] border border-[#8ecbc2] bg-[linear-gradient(160deg,#74AA9C_0%,#5d9088_60%,#4a7a70_100%)] p-5 text-white shadow-[0_16px_40px_rgba(17,24,39,0.14)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">{t("aiInsightsTitle")}</h3>
          <p className="mt-1 text-sm text-white/85">
            {t("aiInsightsSubtitle")}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={() => run("weekly")} disabled={loadingWeekly} className="bg-white !text-[#2a4842] hover:bg-white/90">
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
        <Button onClick={() => run("profile")} disabled={loadingReport} className="bg-[#4a7a70] text-white hover:bg-[#3a6058]">
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
        <div className="mt-4 rounded-xl border border-white/50 bg-white/15 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full border-4 border-white/30 border-t-white animate-spin"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{t("aiAnalyzing")}</p>
              <p className="text-xs text-white/80 mt-1">{t("aiAnalyzingHint")}</p>
            </div>
          </div>
          {/* Анимированная полоса */}
          <div className="mt-3 h-1.5 bg-white/25 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-pulse" style={{width: "70%"}}></div>
          </div>
        </div>
      )}

      {!!error && (
        <div className="mt-4 rounded-xl border border-[#8ecbc2] bg-[#eef8f6] p-4 text-sm text-[#2a4842]">
          {error}
        </div>
      )}

      {weekly?.text && (
        <>
          <AnalysisMetaBlock data={weekly} t={t} />
          <StructuredPlanBlock data={weekly} t={t} />
          <div className="mt-4 rounded-2xl border border-white/45 bg-white/95 p-4 text-sm text-black/80 whitespace-pre-wrap">
            {weekly.text}
          </div>
        </>
      )}

      {report?.text && (
        <>
          <AnalysisMetaBlock data={report} t={t} />
          <StructuredPlanBlock data={report} t={t} />
          <div className="mt-4 rounded-2xl border border-white/45 bg-white/95 p-4 text-sm text-black/80 whitespace-pre-wrap">
            {report.text}
          </div>
        </>
      )}
    </div>
  );
}
