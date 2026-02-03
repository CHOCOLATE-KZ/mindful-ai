"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function ProfileAIReportCard({ settings, t }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const allowed = settings?.data_sharing_with_ai !== false;

  async function generate() {
    if (!allowed) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/profile-report", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to generate report");
      setReport(data);
    } catch (e) {
      setError(e?.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:bg-black/30 dark:border-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-black dark:text-white">
            {t("aiReportTitle")}
          </h3>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            {t("aiReportHint")}
          </p>
        </div>
        <Button
          onClick={generate}
          disabled={loading || !allowed}
          className="min-w-[140px]"
        >
          {loading ? t("aiReportGenerating") : t("aiReportGenerate")}
        </Button>
      </div>

      {!allowed && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          {t("aiReportDisabled")}
        </div>
      )}

      {!!error && (
        <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {report?.text && (
        <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-black/10 bg-white/80 p-4 text-sm text-black/80 dark:bg-black/40 dark:text-white/80">
          {report.text}
        </div>
      )}

      {report?.generatedAt && (
        <p className="mt-2 text-xs text-black/50 dark:text-white/50">
          Updated: {new Date(report.generatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
