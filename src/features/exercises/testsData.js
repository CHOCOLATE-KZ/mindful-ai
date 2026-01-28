/**
 * TESTS_DATA — центральный источник данных для всех тестов
 * Ключи должны совпадать с keys в TESTS каталоге (exercises/page.js)
 */

export const TESTS_DATA = {
  uncertainty_tolerance: {
    title: "Умеете ли вы выдерживать неопределённость?",
    description: "Оцените, как вы реагируете на неопределённость и нестабильные ситуации.",
    questions: [
      {
        question: "Вы легко принимаете решения в неопределённых ситуациях?",
        options: ["Да", "Иногда", "Нет"],
      },
      {
        question: "Новые задачи вас мотивируют?",
        options: ["Да", "Иногда", "Нет"],
      },
      {
        question: "Вы планируете всё заранее или предпочитаете импровизировать?",
        options: ["Всегда план", "Баланс", "Люблю спонтанность"],
      },
    ],
  },
  manipulation_test: {
    title: "Легко ли вами манипулировать?",
    description: "Тест на вашу восприимчивость к влиянию других людей.",
    questions: [
      {
        question: "Вы часто сомневаетесь в своих решениях под влиянием других?",
        options: ["Да", "Иногда", "Нет"],
      },
      {
        question: "Легко ли вас убедить в чём-то, что вы первоначально отвергали?",
        options: ["Очень легко", "Иногда", "Сложно"],
      },
      {
        question: "Вы предпочитаете слушать других или идти своим путём?",
        options: ["Слушаю советы", "Баланс", "Свой путь"],
      },
    ],
  },
  money_attitude: {
    title: "Тест на отношение к деньгам",
    description: "Проверка ваших привычек и отношения к финансам.",
    questions: [
      {
        question: "Вы планируете свой бюджет заранее?",
        options: ["Да, всегда", "Иногда", "Нет, спонтанно"],
      },
      {
        question: "Деньги для вас — это инструмент или символ статуса?",
        options: ["Инструмент", "Оба варианта", "Статус"],
      },
      {
        question: "Вы предпочитаете откладывать деньги или тратить их сразу?",
        options: ["Откладывать", "Баланс", "Тратить сразу"],
      },
    ],
  },
};

/**
 * Получить один тест по ключу
 */
export function getTestByKey(key) {
  if (!key) return null;
  return TESTS_DATA[key] || null;
}

/**
 * Получить все доступные ключи тестов
 */
export function getAvailableTestKeys() {
  return Object.keys(TESTS_DATA);
}

/**
 * Валидировать testKey
 */
export function isValidTestKey(key) {
  if (!key || typeof key !== "string") return false;
  return getAvailableTestKeys().includes(key.toLowerCase().trim());
}
