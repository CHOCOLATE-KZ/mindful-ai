import { useState, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

/**
 * Хук для редактирования и создания заметок
 */
export function useNoteEditor({ setNotes }) {
  const [mood, setMood] = useState("");
  const [sleep, setSleep] = useState("");
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Дополнительные поля
  const [energy, setEnergy] = useState("");
  const [stress, setStress] = useState("");
  const [nutrition, setNutrition] = useState("");
  const [exercise, setExercise] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [social, setSocial] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Сохранение заметки
  const saveNote = useCallback(async (e) => {
    e.preventDefault();
    const supabase = supabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return alert("Пожалуйста, войдите в аккаунт");

    const payload = {
      user_id: user.id,
      mood: mood ? Number(mood) : null,
      sleep: sleep ? Number(sleep) : null,
      comment: comment || null,
      energy: energy ? Number(energy) : null,
      stress: stress ? Number(stress) : null,
      nutrition: nutrition || null,
      exercise: exercise || null,
      hobbies: hobbies || null,
      social: social || null,
    };

    let response;
    if (editingId) {
      response = await supabase
        .from("notes")
        .update(payload)
        .eq("id", editingId)
        .select("id, date, mood, sleep, comment, energy, stress, nutrition, exercise, hobbies, social");
    } else {
      response = await supabase
        .from("notes")
        .insert(payload)
        .select("id, date, mood, sleep, comment, energy, stress, nutrition, exercise, hobbies, social");
    }

    const { data, error } = response;
    if (error) return alert(error.message);

    if (editingId) {
      setNotes((s) => s.map((n) => (n.id === editingId ? data[0] : n)));
      setEditingId(null);
    } else {
      setNotes((s) => [data[0], ...s]);
    }

    // Сброс формы
    setMood("");
    setSleep("");
    setComment("");
    setEnergy("");
    setStress("");
    setNutrition("");
    setExercise("");
    setHobbies("");
    setSocial("");
  }, [mood, sleep, comment, energy, stress, nutrition, exercise, hobbies, social, editingId, setNotes]);

  // Удаление заметки
  const removeNote = useCallback(async (id) => {
    const supabase = supabaseBrowser();
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) return alert(error.message);
    setNotes((s) => s.filter((n) => n.id !== id));
  }, [setNotes]);

  // Начало редактирования
  const editNote = useCallback((n) => {
    setMood(n.mood ?? "");
    setSleep(n.sleep ?? "");
    setComment(n.comment ?? "");
    setEnergy(n.energy ?? "");
    setStress(n.stress ?? "");
    setNutrition(n.nutrition ?? "");
    setExercise(n.exercise ?? "");
    setHobbies(n.hobbies ?? "");
    setSocial(n.social ?? "");
    setEditingId(n.id);
    if (n.energy || n.stress || n.nutrition || n.exercise || n.hobbies || n.social) {
      setShowAdvanced(true);
    }
  }, []);

  // Сброс формы
  const resetEditor = useCallback(() => {
    setEditingId(null);
    setMood("");
    setSleep("");
    setComment("");
    setEnergy("");
    setStress("");
    setNutrition("");
    setExercise("");
    setHobbies("");
    setSocial("");
  }, []);

  return {
    // State
    mood, setMood,
    sleep, setSleep,
    comment, setComment,
    energy, setEnergy,
    stress, setStress,
    nutrition, setNutrition,
    exercise, setExercise,
    hobbies, setHobbies,
    social, setSocial,
    showAdvanced, setShowAdvanced,
    editingId,
    
    // Actions
    saveNote,
    removeNote,
    editNote,
    resetEditor,
  };
}
