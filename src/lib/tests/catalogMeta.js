/** Validated catalog tests the AI may recommend (not generate). */

export const CATALOG_TEST_KEYS = [
  "anxiety_gad7",
  "stress_test",
  "burnout_test",
  "emotional_intelligence",
  "uncertainty_tolerance",
  "manipulation_test",
  "money_attitude",
];

export const CATALOG_TEST_HINTS = {
  anxiety_gad7: "тревога, беспокойство, паника, GAD",
  stress_test: "стресс, перегруз, напряжение",
  burnout_test: "выгорание, усталость, работа без сил",
  emotional_intelligence: "эмоции, EQ, понимание чувств",
  uncertainty_tolerance: "неопределённость, контроль, будущее",
  manipulation_test: "границы, манипуляции, давление других",
  money_attitude: "деньги, финансы, траты",
};

export function isValidCatalogKey(key) {
  return CATALOG_TEST_KEYS.includes(String(key || "").trim());
}
