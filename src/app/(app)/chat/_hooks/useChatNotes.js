"use client";

import { useEffect, useState, useCallback } from "react";

export function useChatNotes() {
  const [savedNotes, setSavedNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState("");
  const [savingAnchor, setSavingAnchor] = useState("");

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

  const saveChatNote = useCallback(async (anchor) => {
    if (!anchor || savingAnchor) return;
    setSavingAnchor(anchor);
    setNotesError("");
    try {
      const res = await fetch("/api/chat/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: anchor }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Notes save error");
      if (data.item) setSavedNotes((prev) => [data.item, ...prev].slice(0, 20));
    } catch (err) {
      console.error(err);
      setNotesError("Не удалось сохранить заметку");
    } finally {
      setSavingAnchor("");
    }
  }, [savingAnchor]);

  useEffect(() => {
    loadChatNotes();
  }, [loadChatNotes]);

  return {
    savedNotes,
    notesLoading,
    notesError,
    savingAnchor,
    saveChatNote,
    reloadChatNotes: loadChatNotes,
  };
}
