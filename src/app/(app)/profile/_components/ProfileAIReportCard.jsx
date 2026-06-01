"use client";

import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Copy, Check, ChevronDown, ChevronUp, History } from "lucide-react";
import { ReportMarkdown, StructuredReportExtras } from "@/components/ai/ReportMarkdown";
import { formatStoredReportText } from "@/lib/ai/formatProfileReport";

export default function ProfileAIReportCard({ settings, t }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const allowed = settings?.data_sharing_ai !== false;

  useEffect(() => {
    if (!allowed) return;
    fetch("/api/ai/profile-report")
      .then((r) => r.json())
      .then((d) => setHistory(d.reports || []))
      .catch(() => {});
  }, [allowed]);

  async function generate() {
    if (!allowed) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/profile-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: settings?.language || "ru" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to generate report");
      setReport(data);
      // Reload history after generating
      fetch("/api/ai/profile-report")
        .then((r) => r.json())
        .then((d) => setHistory(d.reports || []))
        .catch(() => {});
    } catch (e) {
      setError(e?.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  function reportMarkdown(text, reportMode = "profile") {
    return formatStoredReportText(text || "", reportMode);
  }

  async function copyReport() {
    if (!report?.text) return;
    await navigator.clipboard.writeText(reportMarkdown(report.text, report.mode));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-md">
      {/* header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">{t("aiReportTitle")}</h3>
            <p className="mt-0.5 text-sm text-slate-500">{t("aiReportHint")}</p>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !allowed}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? t("aiReportGenerating") : t("aiReportGenerate")}
        </button>
      </div>

      {!allowed && (
        <div className="mx-6 mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("aiReportDisabled")}
        </div>
      )}

      {loading && (
        <div className="mx-6 mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Анализирую ваши данные... Это может занять 20–60 секунд.
        </div>
      )}

      {!!error && (
        <div className="mx-6 mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <div className="font-medium mb-0.5">Ошибка генерации</div>
          <div className="text-rose-600/80">{error}</div>
          <div className="mt-1.5 text-xs text-rose-500">Убедитесь что LM Studio запущен и модель загружена.</div>
        </div>
      )}

      {/* Current report */}
      {report?.text && (
        <div className="border-t border-slate-100 bg-slate-50 px-6 pb-6 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {new Date(report.generatedAt).toLocaleString()}
              </span>
              {report.hasPreviousComparison && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  с анализом динамики
                </span>
              )}
            </div>
            <button
              onClick={copyReport}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50 transition"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <ReportMarkdown text={reportMarkdown(report.text, report.mode)} />
          <StructuredReportExtras
            structured={report.structuredAnalysis}
            language={settings?.language || "ru"}
          />
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="border-t border-slate-100">
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <span className="flex items-center gap-2">
              <History className="h-4 w-4 text-slate-400" />
              История отчётов ({history.length})
            </span>
            {historyOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {historyOpen && (
            <div className="divide-y divide-slate-100 bg-slate-50/50">
              {history.map((r) => (
                <div key={r.id} className="px-6 py-3">
                  <button
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="text-xs font-medium text-slate-500">
                      {new Date(r.generated_at).toLocaleString()}
                    </span>
                    {expandedId === r.id
                      ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                      : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                  </button>
                  {expandedId === r.id && (
                    <div className="mt-3">
                      <ReportMarkdown text={reportMarkdown(r.text, r.mode)} />
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

