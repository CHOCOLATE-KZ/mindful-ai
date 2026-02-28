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

    // Analyze answers
    const answerStats = {};
    filtered.forEach((result) => {
      Object.entries(result.answers || {}).forEach(([questionIdx, answer]) => {
        const key = `Q${questionIdx}: ${answer}`;
        answerStats[key] = (answerStats[key] || 0) + 1;
      });
    });

    return {
      totalAttempts: filtered.length,
      dailyChart,
      answerStats: Object.entries(answerStats)
        .map(([answer, count]) => ({ answer, count }))
        .sort((a, b) => b.count - a.count),
      lastAttempt: filtered[0].created_at,
    };
  }, [selectedTest, testResults]);
}
