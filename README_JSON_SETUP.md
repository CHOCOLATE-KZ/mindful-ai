/**
 * ═══════════════════════════════════════════════════════════════════
 *  ДОКУМЕНТАЦИЯ: Использование JSON для тестов и упражнений
 * ═══════════════════════════════════════════════════════════════════
 * 
 * СТРУКТУРА:
 * src/
 * ├── data/
 * │   ├── tests/
 * │   │   ├── uncertainty_tolerance.json
 * │   │   ├── manipulation_test.json
 * │   │   └── money_attitude.json
 * │   └── exercises/
 * │       ├── box_breathing.json
 * │       ├── 5_4_3_2_1.json
 * │       └── micro_body_scan.json
 * └── lib/
 *     └── loadTestsAndExercises.js  ← Загрузчик данных
 * 
 * ═══════════════════════════════════════════════════════════════════
 *  КАК ДОБАВИТЬ НОВЫЙ ТЕСТ?
 * ═══════════════════════════════════════════════════════════════════
 * 
 * 1. Создай JSON файл в src/data/tests/my_test_key.json:
 * 
 *    {
 *      "key": "my_test_key",
 *      "title": "Название теста",
 *      "description": "Описание",
 *      "time": "2–3 мин",
 *      "tags": ["Тег1", "Тег2"],
 *      "iconKey": "Compass",  ← Ключ иконки (см. ICON_MAP в loadTestsAndExercises.js)
 *      "accent": "from-blue-100 via-white to-purple-100",
 *      "questions": [
 *        {
 *          "question": "Текст вопроса?",
 *          "options": ["Вариант 1", "Вариант 2", "Вариант 3"]
 *        }
 *      ]
 *    }
 * 
 * 2. Обновль loadTestsAndExercises.js:
 * 
 *    import myTest from "@/data/tests/my_test_key.json";
 *    
 *    export const TESTS_FROM_JSON = [
 *      // ... существующие
 *      myTest,
 *    ].map(enrichWithIcon);
 * 
 * 3. Готово! Тест автоматически загрузится.
 * 
 * ═══════════════════════════════════════════════════════════════════
 *  КАК ДОБАВИТЬ НОВОЕ УПРАЖНЕНИЕ?
 * ═══════════════════════════════════════════════════════════════════
 * 
 * 1. Создай JSON файл в src/data/exercises/my_exercise_key.json:
 * 
 *    {
 *      "key": "my_exercise_key",
 *      "title": "Название упражнения",
 *      "why": "Почему это полезно?",
 *      "steps": ["Шаг 1", "Шаг 2", "Шаг 3"],
 *      "time": "2 минуты",
 *      "tags": ["Тег1", "Тег2"],
 *      "iconKey": "Wind",
 *      "accent": "from-blue-100 via-white to-purple-100"
 *    }
 * 
 * 2. Обновь loadTestsAndExercises.js аналогично.
 * 
 * ═══════════════════════════════════════════════════════════════════
 *  ДОСТУПНЫЕ ИКОНКИ (iconKey)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Доступные иконки из lucide-react:
 * - Compass
 * - Hand
 * - BadgeDollarSign
 * - Wind
 * - Anchor
 * - ScanFace
 * 
 * Можно добавить больше, просто обновив ICON_MAP в loadTestsAndExercises.js
 * 
 * ═══════════════════════════════════════════════════════════════════
 *  КАК ИСПОЛЬЗОВАТЬ ТЕСТЫ ИЗ JSON В КОДЕ?
 * ═══════════════════════════════════════════════════════════════════
 * 
 * // Получить все тесты
 * import { TESTS_FROM_JSON } from "@/lib/loadTestsAndExercises";
 * const allTests = TESTS_FROM_JSON;
 * 
 * // Получить один тест по ключу
 * import { getTestByKeyFromJSON } from "@/lib/loadTestsAndExercises";
 * const test = getTestByKeyFromJSON("uncertainty_tolerance");
 * 
 * // Получить все ключи
 * import { getAvailableTestKeysFromJSON } from "@/lib/loadTestsAndExercises";
 * const keys = getAvailableTestKeysFromJSON();
 * 
 * // То же самое для упражнений
 * import {
 *   EXERCISES_FROM_JSON,
 *   getExerciseByKeyFromJSON,
 *   getAvailableExerciseKeysFromJSON
 * } from "@/lib/loadTestsAndExercises";
 * 
 * ═══════════════════════════════════════════════════════════════════
 *  ТЕКУЩЕЕ СОСТОЯНИЕ (ГИБРИДНОЕ)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Сейчас проект использует ОБАА подхода:
 * 
 * 1. exercises/page.js — использует hardcoded TESTS и EXERCISES
 * 2. features/exercises/testsData.js — источник для TestRunner
 * 3. lib/loadTestsAndExercises.js — новый способ с JSON (примеры)
 * 
 * Чтобы полностью мигрировать на JSON:
 * 1. Скопируй все данные из TESTS и EXERCISES в JSON файлы
 * 2. Обнови loadTestsAndExercises.js с импортами
 * 3. Замени в exercises/page.js:
 *    const TESTS = TESTS_FROM_JSON;
 *    const EXERCISES = EXERCISES_FROM_JSON;
 * 4. Замени в features/exercises/testsData.js:
 *    import { TESTS_FROM_JSON } from "@/lib/loadTestsAndExercises";
 *    export const TESTS_DATA = createTestsDataFromJSON(TESTS_FROM_JSON);
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

// Этот файл — только документация. Импорты находятся в src/lib/loadTestsAndExercises.js
