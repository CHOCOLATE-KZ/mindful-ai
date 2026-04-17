"use client";

import { translations } from "./translations";

/**
 * Хук для использования переводов
 * @param {string} section - Секция переводов (nav, profile, analytics, notes, chat, exercises, common)
 * @param {string} lang - Язык (ru, en, kz)
 * @returns {function} Функция t(key) для получения перевода
 * 
 * @example
 * const t = useTranslation('profile', 'ru');
 * return <h1>{t('title')}</h1>
 */
export function useTranslation(section, lang = "ru") {
  return (key) => {
    const sectionData = translations[section];
    if (!sectionData) {
      console.warn(`[i18n] Section "${section}" not found`);
      return key;
    }

    const langData = sectionData[lang] || sectionData.ru;
    if (langData[key]) return langData[key];

    // Fallback to common dictionary for shared UI labels like Save/Cancel.
    const commonData = translations.common?.[lang] || translations.common?.ru;
    return commonData?.[key] || key;
  };
}

/**
 * Альтернативный вариант - возвращает объект со всеми переводами секции
 * @param {string} section - Секция переводов
 * @param {string} lang - Язык
 * @returns {object} Объект с переводами
 * 
 * @example
 * const t = getTranslations('profile', 'ru');
 * return <h1>{t.title}</h1>
 */
export function getTranslations(section, lang = "ru") {
  const sectionData = translations[section];
  if (!sectionData) {
    console.warn(`[i18n] Section "${section}" not found`);
    return {};
  }

  return sectionData[lang] || sectionData.ru;
}
