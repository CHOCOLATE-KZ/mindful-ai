import { useState, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

/**
 * Хук для быстрых мини-заметок
 */
export function useQuickNotes({ setNotes }) {
  const [quickNote, setQuickNote] = useState("");

  const addQuickNote = useCallback(async () => {
    const supabase = supabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return alert("Войдите в аккаунт");
    if (!quickNote.trim()) return;

    const { data, error } = await supabase
      .from("notes")
      .insert({ user_id: user.id, comment: quickNote })
      .select("id, date, mood, sleep, comment, energy, stress, nutrition, exercise, hobbies, social");

    if (error) return alert(error.message);
    setNotes((s) => [data[0], ...s]);
    setQuickNote("");
  }, [quickNote, setNotes]);

  return {
    quickNote,
    setQuickNote,
    addQuickNote,
  };
}
