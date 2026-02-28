"use client";

import { useAppSettings } from "@/components/AppShell";
import { useTranslation } from "./useTranslation";

/**
 * Универсальный хук для получения текущего языка и t функции
 * Гарантирует что язык всегда синхронизирован с AppShell context
 * @param {string} section - Секция переводов (nav, profile, analytics и т.д.)
 * @returns {object} { lang, t } где t(key) возвращает перевод
 */
export function useLanguage(section = "common") {
  const { settings } = useAppSettings();
  const lang = settings?.language || "ru";
  const t = useTranslation(section, lang);

  return { lang, t };
}
