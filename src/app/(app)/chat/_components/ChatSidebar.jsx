"use client";

import { HelpCircle } from "lucide-react";

export default function ChatSidebar({
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
}) {
  return (
    <aside className="mt-20 hidden lg:flex lg:flex-col items-start px-4 py-6 sticky top-0 h-fit pointer-events-none lg:fixed lg:left-4 lg:top-[calc(var(--app-nav-offset)+1rem)]">
      <div className="pointer-events-auto rounded-2xl border border-blue-100/50 dark:border-white/[0.07] bg-blue-50/60 dark:from-[rgb(46_46_62)] dark:to-[rgb(46_46_62)] backdrop-blur p-4 shadow-sm dark:shadow-[0_4px_24px_rgb(0_0_5/0.5)] ring-1 ring-blue-500/10 dark:ring-white/[0.04] w-60 mt-10 max-h-[calc(100dvh-var(--app-nav-offset)-6rem)] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-xs uppercase tracking-widest font-semibold text-[#74AA9C] dark:text-[#74AA9C]"> Якоря</div>
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

        <div className="space-y-1.5">
          {latestAnchors.length === 0 && <p className="text-xs text-slate-500 py-2">Напиши запрос</p>}
          {latestAnchors.map((anchor) => (
            <div key={anchor} className="group flex items-stretch gap-1.5 bg-white dark:bg-white/[0.04] rounded-lg border border-slate-200 dark:border-white/[0.08] hover:border-[#74AA9C]/60 dark:hover:border-[#74AA9C]/40 overflow-hidden transition">
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
                className="px-2 py-2 border-l border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-[#74AA9C] dark:hover:text-[#74AA9C] hover:bg-[#74AA9C]/10 dark:hover:bg-white/[0.06] transition disabled:opacity-40 text-xs font-medium"
                title="Сохранить"
              >
                {savingAnchor === anchor ? "…" : ""}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-blue-100/50 dark:border-white/[0.07]">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs uppercase tracking-widest font-semibold text-slate-700 dark:text-slate-400"> Заметки</div>
            {savedNotes.length > 0 && (
              <span className="text-xs font-medium text-white bg-[#74AA9C] rounded-full px-2 py-0.5">{savedNotes.length}</span>
            )}
          </div>
          <div className="space-y-1.5">
            {notesLoading && <p className="text-xs text-slate-500 py-2">Загрузка…</p>}
            {!notesLoading && notesError && <p className="text-xs text-rose-600 py-2">{notesError}</p>}
            {!notesLoading && !notesError && savedNotes.length === 0 && (
              <p className="text-xs text-slate-500 py-2">Сохрани </p>
            )}
            {!notesLoading &&
              !notesError &&
              savedNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => onAnchorClick(note.title)}
                  className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] hover:bg-[#74AA9C]/10 dark:hover:bg-white/[0.07] hover:border-[#74AA9C]/40 dark:hover:border-[#74AA9C]/30 px-3 py-2 text-left transition group"
                >
                  <p className="text-xs text-slate-900 dark:text-slate-200 group-hover:text-[#74AA9C] dark:group-hover:text-[#74AA9C] truncate font-medium">{note.title}</p>
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
    </aside>
  );
}
