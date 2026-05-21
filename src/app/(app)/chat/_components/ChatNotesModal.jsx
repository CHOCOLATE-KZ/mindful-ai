"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function ChatNotesModal({
  isOpen,
  onClose,
  onNoteClick,
  onSaveNote,
  savingNote,
  savedNotes,
  notesLoading,
  notesError,
}) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setDraft("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSave(e) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    await onSaveNote(title);
    setDraft("");
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-black/10 w-full max-w-md max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-black/10 flex items-center justify-between p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Заметки чата
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors text-slate-600"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <form onSubmit={handleSave} className="space-y-3">
              <label className="block text-xs uppercase tracking-widest font-semibold text-slate-700">
                Новая заметка
              </label>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Тема или мысль для разговора…"
                maxLength={120}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#74AA9C]/50"
              />
              <button
                type="submit"
                disabled={!draft.trim() || Boolean(savingNote)}
                className="w-full rounded-xl bg-[#74AA9C] text-white text-sm font-medium py-2.5 hover:bg-[#5d9088] transition disabled:opacity-50"
              >
                {savingNote ? "Сохранение…" : "Сохранить"}
              </button>
            </form>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-xs uppercase tracking-widest font-semibold text-slate-700">
                  Сохранённые
                </div>
                {savedNotes.length > 0 && (
                  <span className="text-xs font-medium text-white bg-[#74AA9C] rounded-full px-2 py-0.5">
                    {savedNotes.length}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {notesLoading && (
                  <p className="text-xs text-slate-500 py-2">Загрузка…</p>
                )}
                {!notesLoading && notesError && (
                  <p className="text-xs text-rose-600 py-2">{notesError}</p>
                )}
                {!notesLoading && !notesError && savedNotes.length === 0 && (
                  <p className="text-xs text-slate-500 py-2">Сохранённых заметок нет</p>
                )}
                {!notesLoading &&
                  !notesError &&
                  savedNotes.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => {
                        onNoteClick(note.title);
                        onClose();
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 hover:bg-[#74AA9C]/10 hover:border-[#74AA9C]/40 px-3 py-2 text-left transition group"
                    >
                      <p className="text-xs text-slate-900 group-hover:text-[#74AA9C] truncate font-medium">
                        {note.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {note.created_at
                          ? new Date(note.created_at).toLocaleDateString("ru-RU", {
                              day: "2-digit",
                              month: "short",
                            })
                          : ""}
                      </p>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
