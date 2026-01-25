"use client";

export default function AiPersonalizationCard({ settings, onChange, t }) {
  const enabled = !!settings?.ai_personalization;

  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:bg-black/30 dark:border-white/10">
      <h3 className="text-base font-semibold text-black dark:text-white">{t("ai")}</h3>

      <div className="mt-4 rounded-2xl bg-white/60 p-4 dark:bg-white/5 flex items-center justify-between">
        <div>
          <div className="font-medium text-black dark:text-white">Personalized Recommendations</div>
          <div className="text-sm text-black/60 dark:text-white/60">{t("aiHint")}</div>
        </div>

        <button
          onClick={() => onChange({ ai_personalization: !enabled })}
          className={`h-7 w-12 rounded-full p-1 transition ${enabled ? "bg-black/80" : "bg-black/20"}`}
          aria-label="toggle ai personalization"
        >
          <div className={`h-5 w-5 rounded-full bg-white transition ${enabled ? "translate-x-5" : ""}`} />
        </button>
      </div>
    </div>
  );
}
