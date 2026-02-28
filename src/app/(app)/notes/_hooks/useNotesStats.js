import { useMemo } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

/**
 * Хук для вычисления статистики по заметкам
 */
export function useNotesStats(notes) {
  // Разделение на полные и быстрые заметки
  const fullNotes = useMemo(
    () => notes.filter((n) => n.mood != null || n.sleep != null),
    [notes]
  );
  
  const quickNotes = useMemo(
    () => notes.filter((n) => n.mood == null && n.sleep == null && n.comment),
    [notes]
  );

  // Проверка записи за сегодня
  const hasRecordToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return notes.some(n => {
      const noteDate = new Date(n.date).toISOString().split('T')[0];
      return noteDate === today;
    });
  }, [notes]);

  // Данные для графика
  const chartData = useMemo(() => {
    return fullNotes
      .map((n) => ({
        date: format(new Date(n.date), "dd MMM", { locale: ru }),
        mood: n.mood,
        sleep: n.sleep,
      }))
      .reverse();
  }, [fullNotes]);

  // Среднее настроение
  const avgMood = useMemo(() => {
    const moodNotes = fullNotes.filter((n) => n.mood != null);
    if (!moodNotes.length) return 0;
    return (
      moodNotes.reduce((sum, n) => sum + n.mood, 0) / moodNotes.length
    ).toFixed(1);
  }, [fullNotes]);

  // Средний сон
  const avgSleep = useMemo(() => {
    const sleepNotes = fullNotes.filter((n) => n.sleep != null);
    if (!sleepNotes.length) return 0;
    return Math.round(
      sleepNotes.reduce((sum, n) => sum + n.sleep, 0) / sleepNotes.length
    );
  }, [fullNotes]);

  return {
    fullNotes,
    quickNotes,
    hasRecordToday,
    chartData,
    avgMood,
    avgSleep,
  };
}
