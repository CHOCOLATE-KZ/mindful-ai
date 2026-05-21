"use client";

import { useEffect, useState, useCallback } from "react";

export function useChatNotes() {
  const [savedNotes, setSavedNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState("");
  const [savingNote, setSavingNote] = useState("");

  const loadChatNotes = useCallback(async () => {
    setNotesLoading(true);
    setNotesError("");
    try {
      const res = await fetch("/api/chat/notes", { method: "GET", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Notes error");
      setSavedNotes(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error(err);
      setNotesError("Не удалось загрузить заметки");
    } finally {
      setNotesLoading(false);
    }
  }, []);

  const saveChatNote = useCallback(async (title) => {
    if (!title || savingNote) return;
    setSavingNote(title);
    setNotesError("");
    try {
      const res = await fetch("/api/chat/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Notes save error");
      if (data.item) setSavedNotes((prev) => [data.item, ...prev].slice(0, 20));
    } catch (err) {
      console.error(err);
      setNotesError("Не удалось сохранить заметку");
    } finally {
      setSavingNote("");
    }
  }, [savingNote]);

  useEffect(() => {
    loadChatNotes();
  }, [loadChatNotes]);

  return {
    savedNotes,
    notesLoading,
    notesError,
    savingNote,
    saveChatNote,
    reloadChatNotes: loadChatNotes,
  };
}
