"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function AnalyticsAIReport() {
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
          <h3 className="text-base font-semibold text-black">AI Insights</h3>
          <p className="mt-1 text-sm text-black/60">
            Weekly summary and personalized report based on your journal and chat.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={() => run("weekly")} disabled={loadingWeekly}>
          {loadingWeekly ? "Generating weekly..." : "Generate weekly summary"}
        </Button>
        <Button onClick={() => run("profile")} disabled={loadingReport} className="bg-black/80 hover:bg-black">
          {loadingReport ? "Generating report..." : "Generate full report"}
        </Button>
      </div>

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
