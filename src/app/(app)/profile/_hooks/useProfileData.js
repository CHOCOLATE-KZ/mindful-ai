"use client";

import { useEffect, useMemo, useState } from "react";

function calcStreak(datesISO) {
  const set = new Set(datesISO);
  const today = new Date();
  const toISO = (d) => d.toISOString().slice(0, 10);

  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (set.has(toISO(d))) streak++;
    else break;
  }
  return streak;
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useProfileData(supabase) {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState({
    activeDays: 0,
    streak: 0,
    achievements: 0,
    avgMood: null,
    avgSleep: null,
    messagesCount: 0,
    notesCount: 0,
  });

  const [msg, setMsg] = useState("");

  // UI state
  const [editOpen, setEditOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);

  const [nameDraft, setNameDraft] = useState("");
  const [passwordDraft, setPasswordDraft] = useState("");

  async function ensureProfile(userId, fallbackName = "") {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, avatar_url, created_at")
      .eq("id", userId)
      .limit(1);

    if (error) throw error;
    let p = data?.[0];

    if (!p) {
      const { data: up, error: upErr } = await supabase
        .from("profiles")
        .upsert({ id: userId, name: fallbackName }, { onConflict: "id" })
        .select("id, name, avatar_url, created_at")
        .limit(1);
      if (upErr) throw upErr;
      p = up?.[0] || null;
    }
    return p;
  }

  async function ensureSettings(userId) {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .limit(1);

    if (error) throw error;
    let s = data?.[0];

    if (!s) {
      const { data: up, error: upErr } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: userId,
            theme: "light",
            language: "ru",
            ai_personalization: true,
            data_sharing_with_ai: true,
            anonymous_analytics: true,
            activity_tracking: false,
            push_notifications: false,
          },
          { onConflict: "user_id" }
        )
        .select("*")
        .limit(1);
      if (upErr) throw upErr;
      s = up?.[0] || null;
    }
    return s;
  }

  async function loadAll() {
    setLoading(true);
    setMsg("");

    try {
      const { data: uRes, error: uErr } = await supabase.auth.getUser();
      if (uErr) throw uErr;

      const authUser = uRes?.user;
      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(authUser);

      const p = await ensureProfile(authUser.id, authUser.user_metadata?.name || "");
      const s = await ensureSettings(authUser.id);

      setProfile(p);
      setSettings(s);
      setNameDraft(p?.name || "");

      // apply theme immediately
      // const root = document.documentElement;
      // if ((s?.theme || "light") === "dark") root.classList.add("dark");
      // else root.classList.remove("dark");

      // NOTES
      const { data: notes, error: nErr } = await supabase
        .from("notes")
        .select("date, sleep, mood")
        .eq("user_id", authUser.id)
        .order("date", { ascending: false })
        .limit(400);
      if (nErr) throw nErr;

      const dates = (notes || []).map((n) => n.date).filter(Boolean);
      const uniqDates = Array.from(new Set(dates));
      const activeDays = uniqDates.length;
      const streak = calcStreak(uniqDates);

      const sleeps = (notes || []).map((n) => n.sleep).filter((v) => typeof v === "number");
      const moods = (notes || []).map((n) => n.mood).filter((v) => typeof v === "number");

      const avgSleep = sleeps.length ? sleeps.reduce((a, b) => a + b, 0) / sleeps.length : null;
      const avgMood = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : null;

      // AI MESSAGES count
      const { count: messagesCount, error: mErr } = await supabase
        .from("ai_messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", authUser.id);
      if (mErr) throw mErr;

      setStats((prev) => ({
        ...prev,
        activeDays,
        streak,
        avgSleep,
        avgMood,
        messagesCount: messagesCount || 0,
        notesCount: notes?.length || 0,
      }));
    } catch (e) {
      console.error(e);
      setMsg(e?.message || "Error loading profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: uRes, error: uErr } = await supabase.auth.getUser();
      if (!mounted) return;
      
      if (uErr) {
        console.error(uErr);
        setLoading(false);
        return;
      }

      const authUser = uRes?.user;
      if (!authUser) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      if (mounted) setUser(authUser);

      const p = await ensureProfile(authUser.id, authUser.user_metadata?.name || "");
      const s = await ensureSettings(authUser.id);

      if (!mounted) return;

      setProfile(p);
      setSettings(s);
      setNameDraft(p?.name || "");

      // NOTES
      const { data: notes, error: nErr } = await supabase
        .from("notes")
        .select("date, sleep, mood")
        .eq("user_id", authUser.id)
        .order("date", { ascending: false })
        .limit(400);
      
      if (!mounted) return;
      
      if (nErr) {
        console.error(nErr);
        setLoading(false);
        return;
      }

      const dates = (notes || []).map((n) => n.date).filter(Boolean);
      const uniqDates = Array.from(new Set(dates));
      const activeDays = uniqDates.length;
      const streak = calcStreak(uniqDates);

      const sleeps = (notes || []).map((n) => n.sleep).filter((v) => typeof v === "number");
      const moods = (notes || []).map((n) => n.mood).filter((v) => typeof v === "number");

      const avgSleep = sleeps.length ? sleeps.reduce((a, b) => a + b, 0) / sleeps.length : null;
      const avgMood = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : null;

      // AI MESSAGES count
      const { count: messagesCount, error: mErr } = await supabase
        .from("ai_messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", authUser.id);
      
      if (!mounted) return;
      
      if (mErr) {
        console.error(mErr);
        setLoading(false);
        return;
      }

      setStats((prev) => ({
        ...prev,
        activeDays,
        streak,
        avgSleep,
        avgMood,
        messagesCount: messagesCount || 0,
        notesCount: notes?.length || 0,
      }));
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateSettings(patch) {
    if (!user) return;
    setMsg("");

    // optimistic apply
    setSettings((prev) => ({ ...(prev || {}), ...patch }));

    // apply theme immediately
    

    const { data, error } = await supabase
      .from("user_settings")
      .upsert({ user_id: user.id, ...patch }, { onConflict: "user_id" })
      .select("*")
      .limit(1);

    if (error) {
      setMsg(error.message);
      // rollback by reload
      await loadAll();
      return;
    }

    setSettings(data?.[0] || null);
  }

  async function saveProfile() {
    if (!user) return;
    setMsg("");

    const name = (nameDraft || "").trim();

    const { data, error } = await supabase
      .from("profiles")
      .update({ name })
      .eq("id", user.id)
      .select("id, name, avatar_url, created_at")
      .limit(1);

    if (error) {
      setMsg(error.message);
      return;
    }

    setProfile(data?.[0] || null);
    setEditOpen(false);
  }

  async function changePassword() {
    setMsg("");
    const pwd = (passwordDraft || "").trim();
    if (pwd.length < 6) {
      setMsg("Password must be at least 6 characters");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) {
      setMsg(error.message);
      return;
    }

    setPasswordDraft("");
    setSecurityOpen(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function exportMyData() {
    if (!user) return;
    setMsg("");

    try {
      const [{ data: notes }, { data: messages }, { data: prof }, { data: setts }] =
        await Promise.all([
          supabase.from("notes").select("*").eq("user_id", user.id).order("date", { ascending: true }),
          supabase.from("ai_messages").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
          supabase.from("profiles").select("*").eq("id", user.id).limit(1),
          supabase.from("user_settings").select("*").eq("user_id", user.id).limit(1),
        ]);

      downloadJson(`mindfulai_export_${user.id}.json`, {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        profile: prof?.[0] || null,
        settings: setts?.[0] || null,
        notes: notes || [],
        ai_messages: messages || [],
      });
    } catch (e) {
      console.error(e);
      setMsg(e?.message || "Export failed");
    }
  }

  async function onAvatarSelected(file) {
    if (!user || !file) return;
    setMsg("");

    try {
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
        .select("id, name, avatar_url, created_at")
        .limit(1);

      if (error) throw error;

      setProfile(data?.[0] || null);
      setMsg("Аватар обновлён ✅");
    } catch (e) {
      console.error(e);
      setMsg(e?.message || "Avatar upload failed");
    }
  }

  return {
    loading,
    user,
    profile,
    settings,
    stats,
    msg,
    ui: useMemo(
      () => ({
        editOpen,
        privacyOpen,
        securityOpen,
        nameDraft,
        passwordDraft,
        setEditOpen,
        setPrivacyOpen,
        setSecurityOpen,
        setNameDraft,
        setPasswordDraft,
      }),
      [editOpen, privacyOpen, securityOpen, nameDraft, passwordDraft]
    ),
    actions: {
      loadAll,
      updateSettings,
      saveProfile,
      changePassword,
      signOut,
      exportMyData,
      onAvatarSelected,
    },
  };
}
