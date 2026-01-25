"use client";

import { useEffect, useMemo, useState } from "react";
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
  
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      console.log("SESSION:", data?.session);
    })();
  }, [supabase]);


  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    // твой текущий код без изменений
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ProfileHeader user={user} profile={profile} onSignOut={signOut} />

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
