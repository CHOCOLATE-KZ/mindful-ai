"use client";

import { useEffect, useMemo, useState } from "react";

export function useProfileData(supabase, initial = {}) {
  const [loading, setLoading] = useState(!initial?.initialUser);
  const [user, setUser] = useState(initial?.initialUser ?? null);
  const [profile, setProfile] = useState(initial?.initialProfile ?? null);
  const [settings, setSettings] = useState(initial?.initialSettings ?? null);
  const [msg, setMsg] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);

  const [nameDraft, setNameDraft] = useState(initial?.initialProfile?.name || "");
  const [passwordDraft, setPasswordDraft] = useState("");

  const stats = useMemo(() => {
    return {
      activeDays: 2,
      dayStreak: 0,
      achievements: 0,
      overallMood: 2.0,
      avgSleepHours: 7.5,
      goalsCompletedPct: 0,
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    // если initialUser уже есть — не тормозим
    if (initial?.initialUser) return;

    (async () => {
      setLoading(true);
      setMsg("");

      const { data: auth } = await supabase.auth.getUser();
      const u = auth?.user;

      if (!mounted) return;

      if (!u) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(u);

      const { data: p } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .eq("id", u.id)
        .maybeSingle();

      const { data: s } = await supabase
        .from("user_settings")
        .select("user_id, theme, language, anonymous_analytics, activity_tracking, ai_personalization, push_notifications")
        .eq("user_id", u.id)
        .maybeSingle();

      setProfile(p || { id: u.id, name: u.user_metadata?.name || "User", avatar_url: null });
      setSettings(
        s || {
          user_id: u.id,
          theme: "light",
          language: "ru",
          anonymous_analytics: true,
          activity_tracking: false,
          ai_personalization: false,
          push_notifications: false,
        }
      );

      setNameDraft(p?.name || u.user_metadata?.name || "");
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [supabase, initial?.initialUser]);

  async function updateSettings(patch) {
    if (!user) return;
    const next = { ...(settings || {}), ...patch, user_id: user.id, updated_at: new Date().toISOString() };
    setSettings(next);

    if (patch.theme) {
      const root = document.documentElement;
      if (patch.theme === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
    }

    await supabase.from("user_settings").upsert(next);
  }

  async function saveProfile() {
    if (!user) return;
    const name = (nameDraft || "").trim();
    if (!name) {
      setMsg("Введите имя");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({ id: user.id, name });
    if (error) {
      setMsg(error.message);
      return;
    }

    setProfile((p) => ({ ...(p || {}), name }));
    setMsg("Профиль обновлён ✅");
    setEditOpen(false);
  }

  async function onAvatarSelected() {
    setMsg("Загрузка аватара будет подключена позже.");
  }

  async function changePassword() {
    const pwd = (passwordDraft || "").trim();
    if (pwd.length < 6) {
      setMsg("Пароль должен быть минимум 6 символов");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) setMsg(error.message);
    else {
      setMsg("Пароль обновлён ✅");
      setPasswordDraft("");
      setSecurityOpen(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function exportMyData() {
    // у тебя уже работало — можно оставить как есть (если надо, позже расширим)
  }

  return {
    loading,
    user,
    profile,
    settings,
    stats,
    msg,
    ui: { editOpen, setEditOpen, privacyOpen, setPrivacyOpen, securityOpen, setSecurityOpen, nameDraft, setNameDraft, passwordDraft, setPasswordDraft },
    actions: { updateSettings, saveProfile, onAvatarSelected, changePassword, exportMyData, signOut },
  };
}
