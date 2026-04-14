"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, Copy, Check } from "lucide-react";

export default function ProfileAIReportCard({ settings, t }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const allowed = settings?.data_sharing_with_ai !== false;

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
    } catch (e) {
      setError(e?.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  async function copyReport() {
    if (!report?.text) return;
    await navigator.clipboard.writeText(report.text);
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

      {!!error && (
        <div className="mx-6 mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {report?.text && (
        <div className="border-t border-slate-100 bg-slate-50 px-6 pb-6 pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {new Date(report.generatedAt).toLocaleString()}
            </span>
            <button
              onClick={copyReport}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50 transition"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <ReportText text={report.text} />
        </div>
      )}
    </div>
  );
}

function ReportText({ text }) {
  // Simple markdown-like renderer: bold, headers, bullet lists
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-sm text-slate-700 leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        if (/^#{1,3}\s/.test(line)) {
          const content = line.replace(/^#{1,3}\s/, "");
          return <p key={i} className="font-semibold text-slate-900 mt-2">{content}</p>;
        }
        if (/^\*\*(.+?)\*\*$/.test(line.trim())) {
          return <p key={i} className="font-semibold text-slate-900 mt-2">{line.replace(/\*\*/g, "")}</p>;
        }
        if (/^[-•*]\s/.test(line.trim())) {
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
              <span>{line.replace(/^[-•*]\s/, "")}</span>
            </div>
          );
        }
        if (/^\d+\.\s/.test(line.trim())) {
          const num = line.match(/^(\d+)\.\s/)?.[1];
          return (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 font-semibold text-blue-600">{num}.</span>
              <span>{line.replace(/^\d+\.\s/, "")}</span>
            </div>
          );
        }
        // inline bold
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              /^\*\*(.+)\*\*$/.test(part)
                ? <strong key={j} className="font-semibold text-slate-900">{part.replace(/\*\*/g, "")}</strong>
                : <span key={j}>{part}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}
