"use client";

export default function SummaryCard({ stats, t }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:bg-black/30 dark:border-white/10">
      <h3 className="text-base font-semibold text-black dark:text-white">This Week’s Summary</h3>

      <div className="mt-4 space-y-3 text-sm">
        <Row label="Overall Mood" value={`${(stats?.overallMood ?? 0).toFixed(1)} / 10`} />
        <Row label="Average Sleep" value={`${stats?.avgSleepHours ?? 0} hours`} />
        <Row label="Goals Completed" value={`${stats?.goalsCompletedPct ?? 0}%`} />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3 dark:bg-white/5">
      <span className="text-black/70 dark:text-white/70">{label}</span>
      <span className="font-semibold text-black dark:text-white">{value}</span>
    </div>
  );
}
