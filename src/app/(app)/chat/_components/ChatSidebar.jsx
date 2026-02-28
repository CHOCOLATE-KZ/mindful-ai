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
      <div className="pointer-events-auto rounded-2xl border border-blue-100/50 bg-gradient-to-b from-blue-50/80 to-white/80 backdrop-blur p-4 shadow-sm ring-1 ring-blue-500/10 w-60 mt-10 max-h-[calc(100dvh-var(--app-nav-offset)-6rem)] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-xs uppercase tracking-widest font-semibold text-blue-700">💭 Якоря</div>
          <button
            ref={helpIconRef}
            type="button"
            onMouseEnter={onHelpEnter}
            onMouseLeave={onHelpLeave}
            className="inline-flex items-center justify-center text-blue-500 hover:text-blue-700 transition-colors cursor-help"
            aria-label="Что такое якоря?"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-1.5">
          {latestAnchors.length === 0 && <p className="text-xs text-slate-500 py-2">Напиши запрос</p>}
          {latestAnchors.map((anchor) => (
            <div key={anchor} className="group flex items-stretch gap-1.5 bg-white rounded-lg border border-slate-200 hover:border-blue-300 overflow-hidden transition">
              <button
                type="button"
                onClick={() => onAnchorClick(anchor)}
                className="flex-1 px-3 py-2 text-xs text-slate-700 text-left hover:text-blue-700 hover:bg-blue-50/50 transition truncate"
                title={anchor}
              >
                {anchor}
              </button>
              <button
                type="button"
                onClick={() => onSaveAnchor(anchor)}
                disabled={savingAnchor === anchor}
                className="px-2 py-2 border-l border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition disabled:opacity-40 text-xs font-medium"
                title="Сохранить"
              >
                {savingAnchor === anchor ? "…" : "✓"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-blue-100/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs uppercase tracking-widest font-semibold text-slate-700">📝 Заметки</div>
            {savedNotes.length > 0 && (
              <span className="text-xs font-medium text-white bg-blue-600 rounded-full px-2 py-0.5">{savedNotes.length}</span>
            )}
          </div>
          <div className="space-y-1.5">
            {notesLoading && <p className="text-xs text-slate-500 py-2">Загрузка…</p>}
            {!notesLoading && notesError && <p className="text-xs text-rose-600 py-2">{notesError}</p>}
            {!notesLoading && !notesError && savedNotes.length === 0 && (
              <p className="text-xs text-slate-500 py-2">Сохрани ✓</p>
            )}
            {!notesLoading &&
              !notesError &&
              savedNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => onAnchorClick(note.title)}
                  className="w-full rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 px-3 py-2 text-left transition group"
                >
                  <p className="text-xs text-slate-900 group-hover:text-blue-700 truncate font-medium">{note.title}</p>
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
