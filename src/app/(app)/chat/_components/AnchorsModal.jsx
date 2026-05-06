"use client";

import { useState, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";

export default function AnchorsModal({
  isOpen,
  onClose,
  latestAnchors,
  helpIconRef,
  onHelpEnter,
  onHelpLeave,
  onAnchorClick,
  onSaveAnchor,
  savingAnchor,
  savedNotes,
  notesLoading,
  notesError,
  showAnchorsInChat,
  onToggleAnchorsInChat,
}) {
  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 w-full max-w-md max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-black/10 dark:border-white/10 flex items-center justify-between p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Якоря разговора
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleAnchorsInChat}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
                  showAnchorsInChat
                    ? "border-[#74AA9C]/50 bg-[#74AA9C]/10 text-[#5d9088] hover:bg-[#74AA9C]/20"
                    : "border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10"
                }`}
                title={showAnchorsInChat ? "Скрыть якоря в чате" : "Показать якоря в чате"}
              >
                <span>{showAnchorsInChat ? "Видны в чате" : "Скрыты в чате"}</span>
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Anchors Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-xs uppercase tracking-widest font-semibold text-[#74AA9C]">
                  Якоря
                </div>
                <button
                  ref={helpIconRef}
                  type="button"
                  onMouseEnter={onHelpEnter}
                  onMouseLeave={onHelpLeave}
                  className="inline-flex items-center justify-center text-[#74AA9C] hover:text-[#5d9088] transition-colors cursor-help"
                  aria-label="Что такое якоря?"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {latestAnchors.length === 0 && (
                  <p className="text-xs text-slate-500 py-2">Напиши запрос</p>
                )}
                {latestAnchors.map((anchor) => (
                  <div
                    key={anchor}
                    className="group flex items-stretch gap-2 bg-slate-50 dark:bg-white/[0.04] rounded-lg border border-slate-200 dark:border-white/[0.08] hover:border-[#74AA9C]/60 dark:hover:border-[#74AA9C]/40 overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => onAnchorClick(anchor)}
                      className="flex-1 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 text-left hover:text-[#74AA9C] dark:hover:text-[#74AA9C] hover:bg-[#74AA9C]/8 dark:hover:bg-white/[0.05] transition truncate"
                      title={anchor}
                    >
                      {anchor}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSaveAnchor(anchor)}
                      disabled={savingAnchor === anchor}
                      className="px-2 py-2 border-l border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-[#74AA9C] dark:hover:text-[#74AA9C] hover:bg-[#74AA9C]/10 dark:hover:bg-white/[0.06] transition disabled:opacity-40 text-xs font-medium flex-shrink-0"
                      title="Сохранить"
                    >
                      {savingAnchor === anchor ? "…" : "★"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div className="border-t border-slate-200 dark:border-white/[0.08] pt-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-xs uppercase tracking-widest font-semibold text-slate-700 dark:text-slate-400">
                  Заметки
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
                        onAnchorClick(note.title);
                        onClose();
                      }}
                      className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] hover:bg-[#74AA9C]/10 dark:hover:bg-white/[0.07] hover:border-[#74AA9C]/40 dark:hover:border-[#74AA9C]/30 px-3 py-2 text-left transition group"
                    >
                      <p className="text-xs text-slate-900 dark:text-slate-200 group-hover:text-[#74AA9C] dark:group-hover:text-[#74AA9C] truncate font-medium">
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
