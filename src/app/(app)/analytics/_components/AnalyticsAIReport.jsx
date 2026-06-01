"use client";

import { useState, useEffect } from "react";
import { useAppSettings } from "@/components/AppShell";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Button from "@/components/ui/Button";
import ReactMarkdown from "react-markdown";
import { History, ChevronDown, ChevronUp } from "lucide-react";
import { formatStoredReportText } from "@/lib/ai/formatProfileReport";

const mdComponents = {
  h1: ({ children }) => <h1 className="text-base font-bold text-slate-900 mt-3 mb-1">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-bold text-slate-900 mt-3 mb-1">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold text-[#2a4842] mt-2 mb-1">{children}</h3>,
  strong: ({ children }) => <strong className="font-bold text-[#2a4842]">{children}</strong>,
  p: ({ children }) => <p className="text-sm text-black/75 mb-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="my-2 space-y-1 list-none">{children}</ul>,
  li: ({ children }) => (
    <li className="text-sm text-black/75 flex gap-2 leading-relaxed">
      <span className="text-[#74AA9C] font-bold flex-shrink-0">•</span>
      <span>{children}</span>
    </li>
  ),
};

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
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch("/api/ai/profile-report")
      .then((r) => r.json())
      .then((d) => setHistory(d.reports || []))
      .catch(() => {});
  }, []);

  function refreshHistory() {
    fetch("/api/ai/profile-report")
      .then((r) => r.json())
      .then((d) => setHistory(d.reports || []))
      .catch(() => {});
  }

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
      refreshHistory();
    } catch (e) {
      setError(e?.message || "Не удалось получить AI-отчет");
    } finally {
      setLoadingWeekly(false);
      setLoadingReport(false);
    }
  }

  const modeLabel = (mode) => {
    if (mode === "weekly") return "Нед. отчёт";
    if (mode === "profile") return "Полный";
    return mode || "Отчёт";
  };

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
          <div className="mt-4 rounded-2xl border border-white/45 bg-white/95 p-4">
            <ReactMarkdown components={mdComponents}>
              {formatStoredReportText(weekly.text, "weekly")}
            </ReactMarkdown>
          </div>
          <button
            onClick={() => window.print()}
            className="mt-3 w-full rounded-xl border border-white/40 bg-white/15 py-2 text-xs font-semibold text-white hover:bg-white/25 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Экспорт в PDF
          </button>
        </>
      )}

      {report?.text && (
        <>
          <AnalysisMetaBlock data={report} t={t} />
          <StructuredPlanBlock data={report} t={t} />
          <div className="mt-4 rounded-2xl border border-white/45 bg-white/95 p-4">
            <ReactMarkdown components={mdComponents}>
              {formatStoredReportText(report.text, report.mode || "profile")}
            </ReactMarkdown>
          </div>
          <button
            onClick={() => window.print()}
            className="mt-3 w-full rounded-xl border border-white/40 bg-white/15 py-2 text-xs font-semibold text-white hover:bg-white/25 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Экспорт в PDF
          </button>
        </>
      )}

      {/* История отчётов */}
      {history.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/30 bg-white/10 overflow-hidden">
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            <span className="flex items-center gap-2">
              <History className="h-4 w-4 text-white/70" />
              История отчётов ({history.length})
            </span>
            {historyOpen
              ? <ChevronUp className="h-4 w-4 text-white/70" />
              : <ChevronDown className="h-4 w-4 text-white/70" />}
          </button>

          {historyOpen && (
            <div className="divide-y divide-white/10">
              {history.map((r) => (
                <div key={r.id} className="px-4 py-3">
                  <button
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    className="flex w-full items-center justify-between text-left gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white shrink-0">
                        {modeLabel(r.mode)}
                      </span>
                      <span className="text-xs text-white/70 truncate">
                        {new Date(r.generated_at).toLocaleString("ru-RU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {expandedId === r.id
                      ? <ChevronUp className="h-3.5 w-3.5 text-white/60 shrink-0" />
                      : <ChevronDown className="h-3.5 w-3.5 text-white/60 shrink-0" />}
                  </button>

                  {expandedId === r.id && (
                    <div className="mt-3 rounded-xl border border-white/30 bg-white/95 p-3">
                      <ReactMarkdown components={mdComponents}>{r.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
