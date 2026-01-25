"use client";

export default function ProfileHeroCard({ user, profile, stats, onEdit, onSecurity }) {
  const name = profile?.name || "User";
  const email = user?.email || "";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:bg-black/30 dark:border-white/10">
      <div className="absolute inset-0 bg-gradient-to-r from-[#E8E0FF] via-[#B7D8FF] to-[#FFDCC8] opacity-70 dark:opacity-30" />
      <div className="relative p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/70 text-xl font-semibold text-black/70 dark:bg-white/10 dark:text-white/80">
              {(name?.[0] || "U").toUpperCase()}
            </div>
            <div>
              <div className="text-xl font-semibold text-black dark:text-white">{name}</div>
              <div className="text-sm text-black/60 dark:text-white/60">{email}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-black hover:bg-white dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              Edit profile
            </button>
            <button
              onClick={onSecurity}
              className="rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-black hover:bg-white dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              Security
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-white/50 p-4 text-center dark:bg-white/5">
          <Stat label="Active Days" value={stats?.activeDays ?? 0} />
          <Stat label="Day Streak" value={stats?.dayStreak ?? 0} />
          <Stat label="Achievements" value={stats?.achievements ?? 0} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white/60 px-3 py-3 dark:bg-white/5">
      <div className="text-2xl font-semibold text-black dark:text-white">{value}</div>
      <div className="mt-1 text-xs text-black/60 dark:text-white/60">{label}</div>
    </div>
  );
}
