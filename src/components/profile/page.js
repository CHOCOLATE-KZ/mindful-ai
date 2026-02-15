"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

import ProfileStats from "@/components/profile/ProfileStats";
import SummaryCard from "@/components/profile/SummaryCard";
import AppearanceCard from "@/components/profile/AppearanceCard";
import NotificationsCard from "@/components/profile/NotificationsCard";
import AIPersonalizationCard from "@/components/profile/AIPersonalizationCard";
import PrivacyDataCard from "@/components/profile/PrivacyDataCard";

import EditProfileModal from "@/components/profile/modals/EditProfileModal";
import PrivacySettingsModal from "@/components/profile/modals/PrivacySettingsModal";
import SecurityModal from "@/components/profile/modals/SecurityModal";

export default function ProfilePage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);

  const loadAll = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (u) setUser(u);
  }, [supabase]);

  useEffect(() => {
    loadAll(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadAll]);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function updateSettings(patch) {
    if (!user) return;
    await supabase.from("user_settings").upsert({ user_id: user.id, ...patch });
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{profile?.name || user?.email || "Профиль"}</h1>
      </div>

      <ProfileStats stats={stats} />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SummaryCard stats={stats} />
        <AppearanceCard settings={settings} onChange={updateSettings} />
      </div>

      <NotificationsCard settings={settings} onChange={updateSettings} />
      <AIPersonalizationCard settings={settings} onChange={updateSettings} />
      <PrivacyDataCard onPrivacy={() => setPrivacyOpen(true)} />

      <EditProfileModal open={editOpen} />
      <PrivacySettingsModal open={privacyOpen} />
      <SecurityModal open={securityOpen} />
    </div>
  );
}
