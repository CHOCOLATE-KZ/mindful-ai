"use client";

import { Pencil, ShieldCheck, Flame, CalendarDays, Trophy } from "lucide-react";

export default function ProfileHeroCard({ user, profile, stats, onEdit, onSecurity, t }) {
  const name = profile?.name || "User";
  const email = user?.email || "";
  const initials = (name || "U").slice(0, 2).toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-lg">
      {/* gradient background */}
      <div className="absolute inset-0 bg-blue-600" />
      {/* subtle noise layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_60%)]" />

      <div className="relative px-6 pb-6 pt-8 sm:px-8 sm:pb-8">
        {/* top row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* avatar + name */}
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile avatar"
                className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-white/30"
              />
            ) : (
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/20 text-xl font-bold text-white backdrop-blur-sm ring-2 ring-white/30">
                {initials}
              </div>
            )}
            <div>
              <div className="text-xl font-bold text-white">{name}</div>
              <div className="mt-0.5 text-sm text-white/70">{email}</div>
            </div>
          </div>

          {/* action buttons */}
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 active:scale-95"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t ? t("editProfile") : "Edit profile"}
            </button>
            <button
              onClick={onSecurity}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {t ? t("security") : "Security"}
            </button>
          </div>
        </div>

        {/* stats row */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatPill icon={<CalendarDays className="h-4 w-4" />} label={t ? t("activeDays") : "Active Days"} value={stats?.activeDays ?? 0} />
          <StatPill icon={<Flame className="h-4 w-4" />} label={t ? t("dayStreak") : "Day Streak"} value={stats?.dayStreak ?? 0} accent />
          <StatPill icon={<Trophy className="h-4 w-4" />} label={t ? t("achievements") : "Achievements"} value={stats?.achievements ?? 0} />
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon, label, value, accent }) {
  return (
    <div className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-3 text-center ${
      accent ? "bg-white/25" : "bg-white/15"
    } backdrop-blur-sm`}>
      <span className="text-white/80">{icon}</span>
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-xs text-white/70 leading-tight">{label}</span>
    </div>
  );
}
