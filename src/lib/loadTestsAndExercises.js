/**
 * Загрузчик тестов и упражнений из JSON файлов
 * Объединяет JSON данные с иконками и другой информацией
 */

import {
  Compass,
  Hand,
  BadgeDollarSign,
  Wind,
  Anchor,
  ScanFace,
  AlertCircle,
  Flame,
  HeartHandshake,
} from "lucide-react";

// Маппинг иконок по ключам
const ICON_MAP = {
  Compass,
  Hand,
  BadgeDollarSign,
  Wind,
  Anchor,
  ScanFace,
  AlertCircle,
  Flame,
  HeartHandshake,
};

// Импортим JSON файлы - на build time это будет скомпилировано
// Можно добавлять новые, просто добавляя новые импорты
import uncertaintyTolerance from "@/data/tests/uncertainty_tolerance.json";
import manipulationTest from "@/data/tests/manipulation_test.json";
import moneyAttitude from "@/data/tests/money_attitude.json";
import anxietyGad7 from "@/data/tests/anxiety_gad7.json";
import stressTest from "@/data/tests/stress_test.json";
import burnoutTest from "@/data/tests/burnout_test.json";
import emotionalIntelligence from "@/data/tests/emotional_intelligence.json";

import boxBreathing from "@/data/exercises/box_breathing.json";
import exerciseFive43221 from "@/data/exercises/5_4_3_2_1.json";
import microBodyScan from "@/data/exercises/micro_body_scan.json";

/**
 * Объединить JSON данные с иконками
 */
function enrichWithIcon(item) {
  if (!item.iconKey) return item;
  return {
    ...item,
    Icon: ICON_MAP[item.iconKey] || null,
  };
}

/**
 * Загруженные из JSON тесты
 */
export const TESTS_FROM_JSON = [
  uncertaintyTolerance,
  manipulationTest,
  moneyAttitude,
  anxietyGad7,
  stressTest,
  burnoutTest,
  emotionalIntelligence,
].map(enrichWithIcon);

/**
 * Загруженные из JSON упражнения
 */
export const EXERCISES_FROM_JSON = [
  boxBreathing,
  exerciseFive43221,
  microBodyScan,
].map(enrichWithIcon);

/**
 * Получить тест по ключу
 */
export function getTestByKeyFromJSON(key) {
  if (!key) return null;
  return TESTS_FROM_JSON.find((t) => t.key === key.toLowerCase().trim()) || null;
}

/**
 * Получить все ключи тестов из JSON
 */
export function getAvailableTestKeysFromJSON() {
  return TESTS_FROM_JSON.map((t) => t.key);
}

/**
 * Получить упражнение по ключу
 */
export function getExerciseByKeyFromJSON(key) {
  if (!key) return null;
  return EXERCISES_FROM_JSON.find((e) => e.key === key.toLowerCase().trim()) || null;
}

/**
 * Получить все ключи упражнений из JSON
 */
export function getAvailableExerciseKeysFromJSON() {
  return EXERCISES_FROM_JSON.map((e) => e.key);
}
