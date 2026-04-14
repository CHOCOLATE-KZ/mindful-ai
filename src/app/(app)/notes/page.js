"use client";

import NotesAIAnalysis from "./_components/NotesAIAnalysis";
import MoodCalendar from "./_components/MoodCalendar";
import ReminderBanner from "./_components/ReminderBanner";
import NotesHeader from "./_components/NotesHeader";
import NotesForm from "./_components/NotesForm";
import NotesHistory from "./_components/NotesHistory";
import NotesInsights from "./_components/NotesInsights";
import WeeklyTracker from "./_components/WeeklyTracker";
import { useNotesData } from "./_hooks/useNotesData";
import { useNoteEditor } from "./_hooks/useNoteEditor";
import { useQuickNotes } from "./_hooks/useQuickNotes";
import { useNotesStats } from "./_hooks/useNotesStats";

export default function NotesPage() {
  const { notes, setNotes, loading } = useNotesData();
  const editor = useNoteEditor({ setNotes });
  const quickNotesHook = useQuickNotes({ setNotes });
  const stats = useNotesStats(notes);

  if (loading) {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
            <div className="h-6 w-56 rounded-lg bg-black/[0.06] animate-pulse" />
            <div className="mt-3 h-4 w-96 rounded-lg bg-black/[0.04] animate-pulse" />
            <div className="mt-8 h-[400px] rounded-3xl bg-black/[0.04] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-light min-h-screen" style={{ background: "#eaf5f0" }}>
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <ReminderBanner hasRecordToday={stats.hasRecordToday} notesLength={notes.length} />

      <NotesHeader
        avgMood={stats.avgMood}
        avgSleep={stats.avgSleep}
        fullNotesCount={stats.fullNotes.length}
        quickNotesCount={stats.quickNotes.length}
      />

      <NotesForm
        editor={editor}
        quickNotes={{
          ...quickNotesHook,
          quickNotesCount: stats.quickNotes.length,
        }}
      />

      <NotesHistory
        notes={notes}
        fullNotes={stats.fullNotes}
        quickNotes={stats.quickNotes}
        chartData={stats.chartData}
        avgMood={stats.avgMood}
        avgSleep={stats.avgSleep}
        editNote={editor.editNote}
        removeNote={editor.removeNote}
      />

      {notes.length > 0 && (
        <NotesAIAnalysis notes={notes} avgMood={stats.avgMood} avgSleep={stats.avgSleep} />
      )}

      {notes.length > 0 && (
        <MoodCalendar notes={notes} />
      )}

      {stats.fullNotes.length > 0 && (
        <WeeklyTracker notes={notes} />
      )}

      {stats.fullNotes.length >= 5 && (
        <NotesInsights notes={notes} fullNotes={stats.fullNotes} />
      )}
    </div>
    </div>
  );
}

// Export функция для ИИ-анализа
export function prepareNotesForAIAnalysis(notes) {
  const fullNotes = notes.filter((n) => n.mood != null || n.sleep != null);
  const quickNotes = notes.filter((n) => n.mood == null && n.sleep == null && n.comment);

  const moodOnly = fullNotes.filter((n) => n.mood != null);
  const avgMood =
    moodOnly.length > 0
      ? (moodOnly.reduce((sum, n) => sum + n.mood, 0) / moodOnly.length).toFixed(1)
      : 0;

  return {
    totalNotes: notes.length,
    fullNotesCount: fullNotes.length,
    quickNotesCount: quickNotes.length,
    averageMood: parseFloat(avgMood),
    allComments: notes
      .filter((n) => n.comment)
      .map((n) => ({
        id: n.id,
        text: n.comment,
        mood: n.mood,
        sleep: n.sleep,
        energy: n.energy,
        stress: n.stress,
        nutrition: n.nutrition,
        exercise: n.exercise,
        hobbies: n.hobbies,
        social: n.social,
        date: n.date,
        type: n.mood != null || n.sleep != null ? "full" : "quick",
      }))
      .reverse(),
    moodTrend: fullNotes
      .filter((n) => n.mood != null)
      .map((n) => ({ date: n.date, mood: n.mood }))
      .reverse(),
    sleepTrend: fullNotes
      .filter((n) => n.sleep != null)
      .map((n) => ({ date: n.date, sleep: n.sleep }))
      .reverse(),
  };
}
