"use client";

import { Heart, Moon, CheckCircle } from "lucide-react";

export default function SummaryCard({ stats, t }) {
  const mood = Number(stats?.overallMood ?? 0);
  const sleep = Number(stats?.avgSleepHours ?? 0);
  const goals = Number(stats?.goalsCompletedPct ?? 0);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
      <h3 className="mb-4 text-base font-semibold text-slate-800">
        {t ? t("weekSummary") : "This Week's Summary"}
      </h3>

      <div className="space-y-4">
        <StatRow
          icon={<Heart className="h-4 w-4" />}
          color="rose"
          label={t ? t("overallMood") : "Overall Mood"}
          value={`${mood.toFixed(1)} / 10`}
          pct={(mood / 10) * 100}
        />
        <StatRow
          icon={<Moon className="h-4 w-4" />}
          color="indigo"
          label={t ? t("avgSleep") : "Average Sleep"}
          value={`${sleep} ${t ? t("hours") : "h"}`}
          pct={(sleep / 12) * 100}
        />
        <StatRow
          icon={<CheckCircle className="h-4 w-4" />}
          color="emerald"
          label={t ? t("goalsCompleted") : "Goals Completed"}
          value={`${goals}%`}
          pct={goals}
        />
      </div>
    </div>
  );
}

const colorMap = {
  rose:    { bar: "bg-rose-400",    icon: "text-rose-500",    track: "bg-rose-100" },
  indigo:  { bar: "bg-blue-400",  icon: "text-blue-500",  track: "bg-blue-100" },
  emerald: { bar: "bg-emerald-400", icon: "text-emerald-500", track: "bg-emerald-100" },
};

function StatRow({ icon, color, label, value, pct }) {
  const c = colorMap[color];
  const pctClamped = Math.min(100, Math.max(0, pct));
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className={`flex items-center gap-1.5 font-medium text-slate-600 ${c.icon}`}>
          {icon}
          <span className="text-slate-600">{label}</span>
        </span>
        <span className="font-semibold text-slate-800">{value}</span>
      </div>
      <div className={`h-2 w-full rounded-full ${c.track}`}>
        <div
          className={`h-2 rounded-full transition-all ${c.bar}`}
          style={{ width: `${pctClamped}%` }}
        />
      </div>
    </div>
  );
}
