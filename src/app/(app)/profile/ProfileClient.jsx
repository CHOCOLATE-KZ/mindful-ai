"use client";

import { useMemo, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useProfileData } from "@/features/profile/useProfileData";
import { useAppSettings } from "@/components/AppShell";
import { useTranslation } from "@/lib/i18n/useTranslation";

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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-white">
            {t("title")} <span className="align-middle">⚙️</span>
          </h1>
          <p className="mt-2 text-black/60 dark:text-white/60">{t("subtitle")}</p>
          {!!msg && <p className="mt-3 text-sm text-rose-600">{msg}</p>}
        </div>

        <button
          onClick={safeActions.signOut}
          className="cursor-pointer rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-black/[0.03] dark:bg-white/10 dark:border-white/10 dark:text-white dark:hover:bg-white/15"
        >
          {t("signout")}
        </button>
      </div>

      <div className="mt-8">
        <ProfileHeroCard
          user={user}
          profile={safeProfile}
          stats={safeStats}
          onEdit={() => safeUi.setEditOpen(true)}
          onSecurity={() => safeUi.setSecurityOpen(true)}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SummaryCard stats={safeStats} t={t} />
        <AppearanceCard
          theme={mergedSettings.theme}
          language={mergedSettings.language}
          onChange={updateAllSettings}
          t={t}
        />
      </div>

      <div className="mt-8 space-y-6">
        <ProfileAIReportCard settings={mergedSettings} t={t} />
        <NotificationsCard settings={mergedSettings} onChange={updateAllSettings} t={t} />
        <AiPersonalizationCard settings={mergedSettings} onChange={updateAllSettings} t={t} />
        <TelegramLinkCard />
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
