"use client";

export default function SummaryCard({ stats, t }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.06)]">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-blue-600" />

      <h3 className="text-base font-semibold text-black">This Week’s Summary</h3>

      <div className="mt-4 space-y-3 text-sm">
        <Row label="Overall Mood" value={`${Number(stats?.overallMood ?? 0).toFixed(1)} / 10`} />
        <Row label="Average Sleep" value={`${Number(stats?.avgSleepHours ?? 0)} hours`} />
        <Row label="Goals Completed" value={`${Number(stats?.goalsCompletedPct ?? 0)}%`} />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3">
      <span className="text-black/70">{label}</span>
      <span className="font-semibold text-black">{value}</span>
    </div>
  );
}
