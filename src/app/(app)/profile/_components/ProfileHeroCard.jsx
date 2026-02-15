"use client";

export default function ProfileHeroCard({ user, profile, stats, onEdit, onSecurity }) {
  const name = profile?.name || "User";
  const email = user?.email || "";

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.08)]">
      {/* фирменный акцент сверху */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-blue-600" />

      {/* лёгкий голубой glow (очень мягкий, как на мейне) */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-black/10 bg-white text-xl font-semibold text-black">
              {(name?.[0] || "U").toUpperCase()}
            </div>

            <div>
              <div className="text-xl font-semibold text-black">{name}</div>
              <div className="text-sm text-black/60">{email}</div>
            </div>
          </div>

          <div className="flex gap-2">
            {/* primary */}
            <button
              onClick={onEdit}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              Edit profile
            </button>

            {/* secondary */}
            <button
              onClick={onSecurity}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-black/[0.03]"
            >
              Security
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-black/10 bg-white p-4">
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
    <div className="rounded-xl border border-black/10 bg-white px-3 py-3 text-center">
      <div className="text-2xl font-semibold text-black">{value}</div>
      <div className="mt-1 text-xs text-black/60">{label}</div>
    </div>
  );
}
