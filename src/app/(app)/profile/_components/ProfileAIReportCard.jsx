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
    <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.06)]">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-blue-600" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-black">{t("aiReportTitle")}</h3>
          <p className="mt-1 text-sm text-black/60">{t("aiReportHint")}</p>
        </div>

        {/* если Button у тебя уже стилизован — ок.
            если нет — можно заменить на обычный <button className="..."> */}
        <Button
          onClick={generate}
          disabled={loading || !allowed}
          className="min-w-[140px]"
        >
          {loading ? t("aiReportGenerating") : t("aiReportGenerate")}
        </Button>
      </div>

      {!allowed && (
        <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {t("aiReportDisabled")}
        </div>
      )}

      {!!error && (
        <div className="mt-4 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {report?.text && (
        <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/80">
          {report.text}
        </div>
      )}

      {report?.generatedAt && (
        <p className="mt-2 text-xs text-black/50">
          Updated: {new Date(report.generatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
