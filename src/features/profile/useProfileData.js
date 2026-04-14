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

  const [stats, setStats] = useState({
    activeDays: 0,
    dayStreak: 0,
    achievements: 0,
    overallMood: 0,
    avgSleepHours: 0,
    goalsCompletedPct: 0,
  });

  useEffect(() => {
    let mounted = true;

    // если initialUser уже есть — загружаем stats
    (async () => {
      try {
        const res = await fetch("/api/profile/stats");
        if (!mounted) return;
        
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  async function updateSettings(patch) {
    if (!user) return;
    const prev = settings || {};
    const next = { ...prev, ...patch, user_id: user.id, updated_at: new Date().toISOString() };
    setSettings(next);

    if (patch.theme) {
      const root = document.documentElement;
      if (patch.theme === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
    }

    const { error } = await supabase.from("user_settings").upsert(next);
    if (error) {
      setSettings(prev);
      setMsg(error.message || "Failed to update settings");
    }
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
    setMsg("Профиль обновлён ");
    setEditOpen(false);
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
      setMsg("Пароль обновлён ");
      setPasswordDraft("");
      setSecurityOpen(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function exportMyData() {
    try {
      setMsg("");
      const res = await fetch("/api/profile/export");

      if (!res.ok) {
        const data = await res.json();
        setMsg(data.error || "Failed to export data");
        return;
      }

      // Get filename from headers
      const disposition = res.headers.get("content-disposition");
      const filename = disposition ? disposition.split("filename=")[1].replace(/"/g, "") : "export.json";

      // Download file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMsg("Data exported successfully ");
    } catch (err) {
      setMsg(err.message || "Error exporting data");
    }
  }

  async function onAvatarSelected(file) {
    if (!user || !file) return;

    try {
      setMsg("");

      const ext =
        file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${user.id}/avatar.${ext}`;

      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = pub?.publicUrl;

      const { data, error } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id)
        .select("id, name, avatar_url")
        .maybeSingle();

      if (error) throw error;

      setProfile(data || null);
      setMsg("Аватар обновлен");
    } catch (e) {
      setMsg(e?.message || "Не удалось загрузить аватар");
    }
  }

  return {
    loading,
    user,
    profile,
    settings,
    stats,
    msg,
    ui: { editOpen, setEditOpen, privacyOpen, setPrivacyOpen, securityOpen, setSecurityOpen, nameDraft, setNameDraft, passwordDraft, setPasswordDraft },
    actions: { updateSettings, saveProfile, changePassword, exportMyData, signOut, onAvatarSelected },
  };
}
