export function extractAnchors(text) {
  if (!text || text.length < 20) return [];

  // Исключаем фразы которые явно не якоря
  const exclusionPatterns = [
    /^(Настроение|Эмоциональная|Физическая|Сон|Дата|Как дела)[\s:?]*$/i,
    /^(активность|регуляция|пример)[\s:]*$/i,
    /^(как|что|кто|где|при|это|все|и|а|но)$/i,
  ];

  const isExcluded = (phrase) => {
    return exclusionPatterns.some((pattern) => pattern.test(phrase));
  };

  // Разбиваем на предложения
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter((s) => {
      const length = s.length > 15;
      const enoughWords = s.split(/\s+/).length >= 4;
      const notExcluded = !isExcluded(s);
      const hasQuestion = s.includes('?') || s.includes('как') || s.includes('что');
      return length && enoughWords && notExcluded && !hasQuestion;
    });

  // Если есть хорошие предложения - берем их целиком (до 60 символов)
  const anchors = sentences.slice(0, 3).map((s) => {
    if (s.length > 60) {
      // Обрезаем в конце слова, не в середине
      const truncated = s.slice(0, 60);
      const lastSpace = truncated.lastIndexOf(' ');
      return lastSpace > 30 ? truncated.slice(0, lastSpace) : truncated;
    }
    return s;
  }).filter(a => a.length > 15);

  return anchors.length > 0 ? anchors : [];
}
