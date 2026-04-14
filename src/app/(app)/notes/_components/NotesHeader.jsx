/**
 * Компонент заголовка страницы со статистикой
 */
import { Smile, Moon, NotebookText } from "lucide-react";

export default function NotesHeader({ avgMood, avgSleep, fullNotesCount, quickNotesCount }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-200/60 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-blue-700 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500"></span>
            </span>
            Дневник заметок
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-black">
            Настроение, сон и мысли
          </h1>
          <p className="mt-3 text-base text-black/65 max-w-2xl leading-relaxed">
            Записывайте состояние дня и смотрите динамику. Сон указывайте в минутах
            <span className="inline-flex items-center ml-2 rounded-md bg-blue-100/70 px-2 py-0.5 text-xs font-medium text-blue-700">420 = 7 часов</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="group rounded-2xl border border-blue-200/50 bg-blue-50 px-5 py-3.5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2">
              <Smile size={18} className="text-blue-600" />
              <div className="text-xs font-medium text-black/50">Среднее настроение</div>
            </div>
            <div className="mt-1.5 text-2xl font-bold text-blue-600">
              {avgMood}
              <span className="text-base font-normal text-black/40 ml-1">/10</span>
            </div>
          </div>

          <div className="group rounded-2xl border border-emerald-200/50 bg-emerald-50 px-5 py-3.5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2">
              <Moon size={18} className="text-emerald-600" />
              <div className="text-xs font-medium text-black/50">Средний сон</div>
            </div>
            <div className="mt-1.5 text-2xl font-bold text-emerald-600">
              {Math.round(avgSleep / 60)}
              <span className="text-base font-normal text-black/40">ч </span>
              {avgSleep % 60}
              <span className="text-base font-normal text-black/40">м</span>
            </div>
          </div>

          <div className="group rounded-2xl border border-blue-200/50 bg-blue-50 px-5 py-3.5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-2">
              <NotebookText size={18} className="text-blue-600" />
              <div className="text-xs font-medium text-black/50">Всего записей</div>
            </div>
            <div className="mt-1.5 text-2xl font-bold text-blue-600">
              {fullNotesCount}
              <span className="text-base font-normal text-black/40"> + </span>
              {quickNotesCount}
            </div>
            <div className="text-[11px] text-black/50 font-medium mt-0.5">полные + мини</div>
          </div>
        </div>
      </div>
    </div>
  );
}
