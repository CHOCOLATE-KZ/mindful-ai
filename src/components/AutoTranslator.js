"use client";

import { useEffect, useRef } from "react";

const LANGUAGE_MAP = {
  ru: "ru",
  en: "en",
  kz: "kk",
};

function getGoogleTarget(lang) {
  return LANGUAGE_MAP[lang] || "ru";
}

function setGoogTransCookie(target) {
  const value = `/ru/${target}`;
  document.cookie = `googtrans=${value}; path=/; max-age=31536000`;
  document.cookie = `googtrans=${value}; path=/; max-age=31536000; domain=${window.location.hostname}`;
}

function applyViaCombo(target) {
  const combo = document.querySelector(".goog-te-combo");
  if (!combo) return false;

  if (combo.value !== target) {
    combo.value = target;
    combo.dispatchEvent(new Event("change"));
  }
  return true;
}

// Безопасно удаляем все элементы Google Translate из DOM
function cleanupGoogleTranslateElements() {
  try {
    // Удаляем все iframes которые Google Translate добавляет
    const iframes = document.querySelectorAll('iframe.goog-te-menu-frame, iframe.goog-te-banner-frame, iframe[id^="google_translate"]');
    iframes.forEach((iframe) => {
      try {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      } catch (e) {
        // Игнорируем если уже удален
      }
    });

    // Удаляем toolbar и другие div элементы
    const divs = document.querySelectorAll('.goog-te-banner-frame, .goog-te-menu2, #google_translate_element, [class*="goog-te"]');
    divs.forEach((div) => {
      try {
        if (div.parentNode && div.id !== "google_translate_element") {
          div.parentNode.removeChild(div);
        }
      } catch (e) {
        // Игнорируем если уже удален
      }
    });

    // Очищаем стили которые Google Translate добавляет
    const styles = document.querySelectorAll('style[id*="goog"], link[href*="translate.googleapis.com"]');
    styles.forEach((style) => {
      try {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      } catch (e) {
        // Игнорируем если уже удален
      }
    });
  } catch (error) {
    console.debug('[AutoTranslator] Cleanup error (non-critical):', error.message);
  }
}

export default function AutoTranslator({ language = "ru" }) {
  const initialized = useRef(false);
  const scriptRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const htmlLang = language === "kz" ? "kk" : language;
    document.documentElement.lang = htmlLang;
  }, [language]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    isMountedRef.current = true;

    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        // Проверяем что компонент все еще mounted
        if (!isMountedRef.current) return;
        if (initialized.current) return;
        if (!window.google?.translate?.TranslateElement) return;

        initialized.current = true;
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "ru",
              includedLanguages: "ru,en,kk",
              autoDisplay: false,
              multilanguagePage: true,
            },
            "google_translate_element"
          );
        } catch (error) {
          console.debug('[AutoTranslator] Init error:', error.message);
        }
      };
    }

    // Отложить загрузку скрипта на следующий frame чтобы избежать конфликтов с React рендерингом
    const timeoutId = setTimeout(() => {
      if (!isMountedRef.current) return;

      const existing = document.querySelector(
        'script[src*="translate.google.com/translate_a/element.js"]'
      );

      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        scriptRef.current = script;
        try {
          document.head.appendChild(script);
        } catch (error) {
          console.debug('[AutoTranslator] Script append error:', error.message);
        }
      } else if (window.google?.translate?.TranslateElement && !initialized.current) {
        window.googleTranslateElementInit();
      }
    }, 100); // Увеличили с 0 до 100ms для стабильности

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);
      
      // Безопасно удаляем скрипт только если он все еще в документе
      try {
        if (scriptRef.current?.parentNode) {
          scriptRef.current.parentNode.removeChild(scriptRef.current);
          scriptRef.current = null;
        }
      } catch (error) {
        console.debug('[AutoTranslator] Script removal error:', error.message);
      }

      // КРИТИЧНО: очищаем ВСЕ элементы Google Translate из DOM
      cleanupGoogleTranslateElements();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isMountedRef.current) return;

    const target = getGoogleTarget(language);
    setGoogTransCookie(target);

    let attempts = 0;
    const maxAttempts = 20;
    const timer = window.setInterval(() => {
      if (!isMountedRef.current) {
        window.clearInterval(timer);
        return;
      }

      attempts += 1;
      const applied = applyViaCombo(target);

      if (applied || attempts >= maxAttempts) {
        window.clearInterval(timer);
      }
    }, 200);

    return () => window.clearInterval(timer);
  }, [language]);

  return <div id="google_translate_element" style={{ display: "none" }} />;
}
