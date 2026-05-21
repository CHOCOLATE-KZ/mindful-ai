/**
 * Состояние кризисной темы в рамках сессии чата.
 * continuing — пользователь хочет продолжать тяжёлую тему
 * declined — пользователь переключился на другую тему, без повторных предупреждений
 */

import {
  assessCrisisIntent,
  messageContainsCrisisKeyword,
  messageHasCrisisSignal,
  normalizeCrisisText,
} from "./crisisIntent.js";

export { assessCrisisIntent, messageContainsCrisisKeyword, messageHasCrisisSignal };

export const CRISIS_TOPIC_MODES = ["continuing", "declined"];
export const CRISIS_TOPIC_MODE_STORAGE_KEY = "mindfulai_crisis_topic_mode";

export function readCrisisTopicModeFromStorage() {
  if (typeof window === "undefined") return null;
  return normalizeCrisisTopicMode(localStorage.getItem(CRISIS_TOPIC_MODE_STORAGE_KEY));
}

export function writeCrisisTopicModeToStorage(mode) {
  if (typeof window === "undefined") return;
  const normalized = normalizeCrisisTopicMode(mode);
  if (normalized) {
    localStorage.setItem(CRISIS_TOPIC_MODE_STORAGE_KEY, normalized);
  } else {
    localStorage.removeItem(CRISIS_TOPIC_MODE_STORAGE_KEY);
  }
}

export function normalizeCrisisTopicMode(raw) {
  const mode = String(raw || "").trim().toLowerCase();
  return CRISIS_TOPIC_MODES.includes(mode) ? mode : null;
}

export function isDeclineCrisisTopicMessage(text) {
  const n = normalizeCrisisText(text);
  if (!n) return false;

  if (messageContainsCrisisKeyword(text)) return false;

  const declinePatterns = [
    /^нет\b/,
    /\bне хочу\b.*\b(об этом|это|эту тему|продолжать|говорить)\b/,
    /\bдругая тема\b/,
    /\bо другом\b/,
    /\bна другую тему\b/,
    /\bхватит\b.*\b(это|насчет|про это)\b/,
    /\bдавай\b.*\b(о|про|поговорим)\b/,
    /\bпоговорим о\b/,
    /\bпереключим\b/,
    /\bне будем\b.*\b(об этом|это)\b/,
    /\bзабудь\b.*\b(про|об)\b/,
    /\bдостаточно\b.*\b(об этом|про это)\b/,
    /\bхочу говорить\b.*\b(о|про)\b/,
    /\bcan we talk about\b/,
    /\banother topic\b/,
  ];

  return declinePatterns.some((p) => p.test(n));
}

export function isAffirmContinueCrisisTopicMessage(text) {
  const n = normalizeCrisisText(text);
  if (!n) return false;

  const affirmPatterns = [
    /^да\b/,
    /\bхочу продолжить\b/,
    /\bпродолжим\b.*\b(эту|это|тему)\b/,
    /\bдавай об этом\b/,
    /\bпоговорим об этом\b/,
    /\bостаемся на теме\b/,
  ];

  return affirmPatterns.some((p) => p.test(n));
}

function isMissingCrisisColumnError(error) {
  const msg = String(error?.message || error || "").toLowerCase();
  return (
    error?.code === "42703" ||
    msg.includes("crisis_topic_mode") ||
    msg.includes("does not exist") ||
    msg.includes("column")
  );
}

export async function loadCrisisTopicMode(supabase, userId) {
  const { data, error } = await supabase
    .from("user_settings")
    .select("crisis_topic_mode")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingCrisisColumnError(error)) return { mode: null, persist: false };
    console.warn("[crisisSession] load:", error.message);
    return { mode: null, persist: false };
  }

  return {
    mode: normalizeCrisisTopicMode(data?.crisis_topic_mode),
    persist: true,
  };
}

export async function saveCrisisTopicMode(supabase, userId, mode) {
  const normalized = normalizeCrisisTopicMode(mode);

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      crisis_topic_mode: normalized,
    },
    { onConflict: "user_id" }
  );

  if (error && !isMissingCrisisColumnError(error)) {
    console.warn("[crisisSession] save:", error.message);
    return false;
  }

  return !error;
}

export async function clearCrisisTopicMode(supabase, userId) {
  return saveCrisisTopicMode(supabase, userId, null);
}

export const CRISIS_TOPIC_CONTINUING_SYSTEM =
  "Пользователь ранее поделился тяжёлыми мыслями и выбрал продолжить эту тему. " +
  "Отвечай по его словам, без шаблона «Похоже, в тебе сейчас много…». " +
  "Не повторяй длинные списки телефонов и «не могу продолжать беседу». Линию 150 — только при прямой опасности.";

export const CRISIS_TOPIC_DECLINED_SYSTEM =
  "Пользователь ранее упоминал тяжёлые/суицидальные мысли, но выбрал говорить о другой теме. " +
  "НЕ возвращайся к суициду и НЕ повторяй предупреждения/телефоны, пока он сам снова явно не поднимет опасность для жизни. " +
  "Слушай текущую тему пользователя (отношения, тревога, быт и т.д.) и отвечай по ней.";
