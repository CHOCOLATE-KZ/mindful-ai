"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

const AppCtx = createContext(null);

export function useAppSettings() {
  return useContext(AppCtx);
}

export default function AppShell({ children }) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({ theme: "light", language: "ru" });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const u = auth?.user || null;
    setUser(u);

    if (u) {
      const { data: s } = await supabase
        .from("user_settings")
        .select("theme, language")
        .eq("user_id", u.id)
        .maybeSingle();

      if (s) setSettings((prev) => ({ ...prev, ...s }));
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load(); // eslint-disable-line react-hooks/set-state-in-effect

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, [supabase, load]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  const updateSettings = useCallback(
    async (patch) => {
      setSettings((prev) => ({ ...prev, ...patch }));

      const { data: auth } = await supabase.auth.getUser();
      const u = auth?.user || null;
      setUser(u);

      if (!u) return;

      const { error } = await supabase
        .from("user_settings")
        .upsert({ user_id: u.id, ...patch }, { onConflict: "user_id" });
      if (error) {
        console.error("Failed to update settings:", error.message);
        load();
      }
    },
    [supabase, load]
  );

  const value = useMemo(
    () => ({
      loading,
      user,
      settings,
      setLanguage: (language) => updateSettings({ language }),
      setTheme: (theme) => updateSettings({ theme }),
      updateSettings,
    }),
    [loading, user, settings, updateSettings]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
