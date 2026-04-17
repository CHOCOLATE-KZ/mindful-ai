import { useMemo } from "react";

export function useTestAnalytics(testResults, selectedTest) {
  return useMemo(() => {
    if (!selectedTest) return null;

    const filtered = testResults.filter((r) => r.test_key === selectedTest);
    if (filtered.length === 0) return null;

    // Count attempts per day
    const dailyStats = {};
    filtered.forEach((result) => {
      const date = new Date(result.created_at).toLocaleDateString("ru-RU");
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    const dailyChart = Object.entries(dailyStats)
      .map(([date, count]) => ({ date, attempts: count }))
      .reverse();

    // Aggregate answers for pie chart (group similar, limit sectors)
    const answerStats = {};
    const normalize = (s = "") => {
      // Remove QN: prefix, lowercase, trim, group similar
      let v = String(s).replace(/^Q\d+:\s*/, "").toLowerCase().trim();
      if (v.startsWith("да")) return "Да";
      if (v.startsWith("нет")) return "Нет";
      if (v.includes("скорее да")) return "Скорее да";
      if (v.includes("скорее нет")) return "Скорее нет";
      if (v.includes("иногда")) return "Иногда";
      if (v.includes("часто")) return "Часто";
      if (v.includes("легко")) return "Легко";
      if (v.includes("трудно") || v.includes("сложно")) return "Трудно";
      if (v.includes("мотивир")) return "Мотивируют";
      if (v.includes("тревож")) return "Тревожат";
      if (v.includes("план")) return "Планирование";
      if (v.includes("спонтан")) return "Спонтанность";
      if (v.includes("комфорт")) return "Комфортно";
      if (v.includes("сильно")) return "Сильно";
      if (v.includes("немного")) return "Немного";
      return v.length > 18 ? v.slice(0, 16) + "…" : v.charAt(0).toUpperCase() + v.slice(1);
    };
    filtered.forEach((result) => {
      Object.entries(result.answers || {}).forEach(([questionIdx, answer]) => {
        const key = normalize(`Q${questionIdx}: ${answer}`);
        answerStats[key] = (answerStats[key] || 0) + 1;
      });
    });

    // Limit to top 6, group rest as 'Другое'
    let answerArr = Object.entries(answerStats)
      .map(([answer, count]) => ({ answer, count }))
      .sort((a, b) => b.count - a.count);
    const maxSectors = 6;
    if (answerArr.length > maxSectors) {
      const top = answerArr.slice(0, maxSectors);
      const otherCount = answerArr.slice(maxSectors).reduce((sum, a) => sum + a.count, 0);
      answerArr = [...top, { answer: "Другое", count: otherCount }];
    }

    return {
      totalAttempts: filtered.length,
      dailyChart,
      answerStats: answerArr,
      lastAttempt: filtered[0].created_at,
    };
  }, [selectedTest, testResults]);
}
