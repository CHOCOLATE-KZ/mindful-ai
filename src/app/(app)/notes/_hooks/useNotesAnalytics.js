import { useMemo } from 'react';

/**
 * 🎯 Хук для аналитики заметок с поддержкой ИИ-анализа
 * Обеспечивает все необходимые вычисления и данные для анализа
 */
export function useNotesAnalytics(notes) {
  // 🔹 Разделение на типы заметок
  const fullNotes = useMemo(() => 
    notes.filter(n => n.mood != null || n.sleep != null), 
    [notes]
  );

  const quickNotes = useMemo(() => 
    notes.filter(n => n.mood == null && n.sleep == null && n.comment), 
    [notes]
  );

  // 🔹 Среднее настроение
  const avgMood = useMemo(() => {
    const moodNotes = fullNotes.filter(n => n.mood != null);
    if (!moodNotes.length) return 0;
    return (moodNotes.reduce((sum, n) => sum + n.mood, 0) / moodNotes.length).toFixed(1);
  }, [fullNotes]);

  // 🔹 Средний сон (в минутах)
  const avgSleep = useMemo(() => {
    const sleepNotes = fullNotes.filter(n => n.sleep != null);
    if (!sleepNotes.length) return 0;
    return Math.round(sleepNotes.reduce((sum, n) => sum + n.sleep, 0) / sleepNotes.length);
  }, [fullNotes]);

  // 🔹 Тренд настроения (последних 7 дней)
  const moodTrend = useMemo(() => {
    return fullNotes
      .filter(n => n.mood != null)
      .slice(0, 7)
      .reverse()
      .map(n => ({
        date: new Date(n.date).toLocaleDateString('ru-RU'),
        mood: n.mood
      }));
  }, [fullNotes]);

  // 🔹 Выявление эмоциональных паттернов
  const emotionalInsights = useMemo(() => {
    if (fullNotes.length === 0) return null;

    const moodValues = fullNotes.filter(n => n.mood != null).map(n => n.mood);
    if (moodValues.length === 0) return null;

    const maxMood = Math.max(...moodValues);
    const minMood = Math.min(...moodValues);
    const moodRange = maxMood - minMood;

    return {
      bestMood: maxMood,
      worstMood: minMood,
      moodStability: moodRange <= 3 ? 'Стабильное' : moodRange <= 6 ? 'Умеренное' : 'Нестабильное',
      averageMood: parseFloat(avgMood),
      totalDays: new Set(fullNotes.map(n => new Date(n.date).toDateString())).size
    };
  }, [fullNotes, avgMood]);

  // 🔹 Связь настроения и сна
  const moodSleepCorrelation = useMemo(() => {
    const correlatedNotes = fullNotes.filter(n => n.mood != null && n.sleep != null);
    if (correlatedNotes.length < 2) return null;

    const moodValues = correlatedNotes.map(n => n.mood);
    const sleepValues = correlatedNotes.map(n => n.sleep);

    const moodMean = moodValues.reduce((a, b) => a + b) / moodValues.length;
    const sleepMean = sleepValues.reduce((a, b) => a + b) / sleepValues.length;

    let correlation = 0;
    let moodDev = 0, sleepDev = 0;

    for (let i = 0; i < moodValues.length; i++) {
      const moodDiff = moodValues[i] - moodMean;
      const sleepDiff = sleepValues[i] - sleepMean;
      correlation += moodDiff * sleepDiff;
      moodDev += moodDiff * moodDiff;
      sleepDev += sleepDiff * sleepDiff;
    }

    const r = correlation / Math.sqrt(moodDev * sleepDev || 1);
    
    return {
      correlation: isNaN(r) ? 0 : r.toFixed(2),
      interpretation: Math.abs(r) > 0.6 ? 'Сильная связь' : Math.abs(r) > 0.3 ? 'Умеренная связь' : 'Слабая связь'
    };
  }, [fullNotes]);

  // 🔹 Подготовка данных для ИИ-анализа
  const aiAnalysisPayload = useMemo(() => ({
    metadata: {
      totalNotes,
      fullNotesCount: fullNotes.length,
      quickNotesCount: quickNotes.length,
      analyzeDate: new Date().toISOString()
    },
    statistics: {
      averageMood: parseFloat(avgMood),
      averageSleep: avgSleep,
      emotionalInsights,
      moodSleepCorrelation
    },
    comments: notes
      .filter(n => n.comment)
      .map(n => ({
        date: n.date,
        text: n.comment,
        mood: n.mood,
        sleep: n.sleep
      }))
      .reverse()
  }), [notes, fullNotes.length, quickNotes.length, avgMood, avgSleep, emotionalInsights, moodSleepCorrelation]);

  return {
    fullNotes,
    quickNotes,
    avgMood,
    avgSleep,
    moodTrend,
    emotionalInsights,
    moodSleepCorrelation,
    aiAnalysisPayload,
    totalNotes: notes.length
  };
}
