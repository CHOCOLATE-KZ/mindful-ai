"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
// import AutoTranslator from "@/components/AutoTranslator"; // Временно отключен для тестирования

const AppCtx = createContext(null);

export function useAppSettings() {
  return useContext(AppCtx);
}

export default function AppShell({ children }) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({ language: "ru" });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const u = auth?.user || null;
    setUser(u);

    if (u) {
      const { data: s } = await supabase
        .from("user_settings")
        .select("language")
        .eq("user_id", u.id)
        .maybeSingle();

      if (s) setSettings((prev) => ({ ...prev, language: s.language || prev.language }));
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, [supabase, load]);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const updateSettings = useCallback(
    async (patch) => {
      // Обновляем локально СРАЗУ для мгновенного UI обновления
      setSettings((prev) => ({ ...prev, ...patch }));

      const { data: auth } = await supabase.auth.getUser();
      const u = auth?.user || null;
      setUser(u);

      if (!u) return;

      // Сохраняем в БД асинхронно в фоне
      const { error } = await supabase
        .from("user_settings")
        .upsert({ user_id: u.id, ...patch }, { onConflict: "user_id" });
      
      if (error) {
        console.error("Failed to update settings:", error.message);
        // Перезагружаем с БД если произошла ошибка
        void load();
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
      updateSettings,
    }),
    [loading, user, settings, updateSettings]
  );

  return (
    <AppCtx.Provider value={value}>
      {/* <AutoTranslator language={settings?.language || "ru"} /> */}
      {/* Временно отключен Google Translate для тестирования */}
      {children}
    </AppCtx.Provider>
  );
}
