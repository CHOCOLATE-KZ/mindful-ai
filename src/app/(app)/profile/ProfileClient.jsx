"use client";

import { useMemo, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useProfileData } from "@/features/profile/useProfileData";
import { useAppSettings } from "@/components/AppShell";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LogOut, Sparkles, Bell, Shield, MessageCircle, Sliders } from "lucide-react";

import ProfileHeroCard from "./_components/ProfileHeroCard";
import SummaryCard from "./_components/SummaryCard";
import AppearanceCard from "./_components/AppearanceCard";
import NotificationsCard from "./_components/NotificationsCard";
import AiPersonalizationCard from "./_components/AiPersonalizationCard";
import PrivacyDataCard from "./_components/PrivacyDataCard";
import ProfileAIReportCard from "./_components/ProfileAIReportCard";
import TelegramLinkCard from "./_components/TelegramLinkCard";

import EditProfileModal from "./_components/_modals/EditProfileModal";
import PrivacySettingsModal from "./_components/_modals/PrivacySettingsModal";
import SecurityModal from "./_components/_modals/SecurityModal";

export default function ProfileClient({ initialUser, initialProfile, initialSettings }) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const app = useAppSettings();

  const { loading, user, profile, settings, stats, msg, ui, actions } = useProfileData(supabase, {
    initialUser,
    initialProfile,
    initialSettings,
  });

  const lang = app?.settings?.language || settings?.language || "ru";
  const t = useTranslation("profile", lang);

  const mergedSettings = useMemo(() => {
    return {
      ...(settings || {}),
      theme: app?.settings?.theme || settings?.theme || "light",
      language: lang,
    };
  }, [settings, app?.settings?.theme, lang]);

  const updateAllSettings = useCallback(
    async (patch) => {
      try {
        await (actions?.updateSettings?.(patch) ?? Promise.resolve());

        const gl = {};
        if (patch?.theme) gl.theme = patch.theme;
        if (patch?.language) gl.language = patch.language;

        if (Object.keys(gl).length && app?.updateSettings) {
          await app.updateSettings(gl);
        }
      } catch (e) {
        console.error("updateAllSettings error:", e);
      }
    },
    [actions, app]
  );

  // safety defaults
  const safeUi = ui || {
    editOpen: false,
    privacyOpen: false,
    securityOpen: false,
    setEditOpen: () => {},
    setPrivacyOpen: () => {},
    setSecurityOpen: () => {},
    nameDraft: "",
    setNameDraft: () => {},
    passwordDraft: "",
    setPasswordDraft: () => {},
  };

  const safeActions = actions || {
    signOut: () => {},
    updateSettings: async () => {},
    exportMyData: async () => {},
    saveProfile: async () => {},
    onAvatarSelected: async () => {},
    changePassword: async () => {},
  };

  const safeProfile = profile || { id: user?.id, name: "", avatar_url: "" };
  const safeStats = stats || {};

  if (loading && !user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-black/10 dark:bg-white/10" />
        <div className="mt-6 h-44 animate-pulse rounded-3xl bg-black/10 dark:bg-white/10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">

        {/* ── PAGE HEADER ── */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {t("title")} <span className="align-middle text-2xl">️</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>
            {!!msg && <p className="mt-2 text-sm text-rose-600">{msg}</p>}
          </div>

          <button
            onClick={safeActions.signOut}
            className="flex items-center gap-2 cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <LogOut className="h-4 w-4" />
            {t("signout")}
          </button>
        </div>

        {/* ── HERO ── */}
        <ProfileHeroCard
          user={user}
          profile={safeProfile}
          stats={safeStats}
          onEdit={() => safeUi.setEditOpen(true)}
          onSecurity={() => safeUi.setSecurityOpen(true)}
          t={t}
        />

        {/* ── OVERVIEW ROW ── */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <SummaryCard stats={safeStats} t={t} />
          <AppearanceCard
            theme={mergedSettings.theme}
            language={mergedSettings.language}
            onChange={updateAllSettings}
            t={t}
          />
        </div>

        {/* ── AI SECTION ── */}
        <SectionHeader icon={<Sparkles className="h-4 w-4" />} label="AI" />
        <div className="space-y-5">
          <ProfileAIReportCard settings={mergedSettings} t={t} />
          <AiPersonalizationCard settings={mergedSettings} onChange={updateAllSettings} t={t} />
        </div>

        {/* ── NOTIFICATIONS & INTEGRATIONS ── */}
        <SectionHeader icon={<Bell className="h-4 w-4" />} label={t("notifications")} />
        <div className="space-y-5">
          <NotificationsCard settings={mergedSettings} onChange={updateAllSettings} t={t} />
          <SectionHeader icon={<MessageCircle className="h-4 w-4" />} label="Telegram" inner />
          <TelegramLinkCard />
        </div>

        {/* ── PRIVACY ── */}
        <SectionHeader icon={<Shield className="h-4 w-4" />} label={t("privacy")} />
        <PrivacyDataCard
          onOpenPrivacy={() => safeUi.setPrivacyOpen(true)}
          onExport={() => safeActions.exportMyData()}
          t={t}
        />

      </div>

      <EditProfileModal
        open={safeUi.editOpen}
        onClose={() => safeUi.setEditOpen(false)}
        user={user}
        profile={safeProfile}
        nameDraft={safeUi.nameDraft}
        setNameDraft={safeUi.setNameDraft}
        onSave={safeActions.saveProfile}
        onAvatarSelected={safeActions.onAvatarSelected}
        t={t}
      />

      <PrivacySettingsModal
        open={safeUi.privacyOpen}
        onClose={() => safeUi.setPrivacyOpen(false)}
        settings={mergedSettings}
        onChange={updateAllSettings}
        t={t}
      />

      <SecurityModal
        open={safeUi.securityOpen}
        onClose={() => safeUi.setSecurityOpen(false)}
        passwordDraft={safeUi.passwordDraft}
        setPasswordDraft={safeUi.setPasswordDraft}
        onChangePassword={safeActions.changePassword}
        t={t}
      />
    </div>
  );
}

function SectionHeader({ icon, label, inner = false }) {
  return (
    <div className={`flex items-center gap-2 ${inner ? "mt-5 mb-3" : "mt-10 mb-4"}`}>
      <span className={`flex items-center justify-center rounded-lg p-1.5 ${
        inner ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-600"
      }`}>
        {icon}
      </span>
      <span className={`font-semibold ${
        inner ? "text-sm text-slate-500" : "text-base text-slate-800"
      }`}>{label}</span>
      <div className="flex-1 h-px bg-slate-200/80" />
    </div>
  );
}
