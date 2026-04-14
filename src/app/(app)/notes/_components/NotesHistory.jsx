import Card from "@/components/ui/Card";
import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  BarChart3,
  FileText,
  CalendarDays,
  Battery,
  Flame,
  Apple,
  Dumbbell,
  Gamepad2,
  Users,
  Smile,
  Moon,
  Pencil,
  Trash2,
  MessageSquare,
  TrendingUp,
  NotebookPen,
} from "lucide-react";

/**
 * Компонент истории заметок и аналитики
 */
export default function NotesHistory({ notes, fullNotes, quickNotes, chartData, avgMood, avgSleep, editNote, removeNote }) {
  const [tab, setTab] = useState("all");

  const tabs = [
    { id: "all", label: "Все", count: notes.length },
    { id: "full", label: "Полные", count: fullNotes.length },
    { id: "quick", label: "Мини", count: quickNotes.length },
  ];

  const visibleFull = tab === "quick" ? [] : fullNotes;
  const visibleQuick = tab === "full" ? [] : quickNotes;

  return (
    <Card className="rounded-3xl border border-black/10 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <BarChart3 size={22} className="text-blue-600" />
              <h2 className="text-2xl font-semibold text-black">История и аналитика</h2>
            </div>
            <p className="mt-2 text-sm text-black/65 leading-relaxed">
              Записи и динамика по дням
            </p>
          </div>

          <span className="rounded-full border border-black/15 bg-gray-50 px-4 py-1.5 text-xs font-semibold text-black/60 shadow-sm">
            Всего: {notes.length}
          </span>
        </div>

        {/* Табы */}
        {notes.length > 0 && (
          <div className="mt-5 flex gap-1 rounded-2xl bg-gray-100/70 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  tab === t.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-black/50 hover:text-black/70"
                }`}
              >
                {t.label}
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                  tab === t.id ? "bg-blue-100 text-blue-600" : "bg-black/10 text-black/40"
                }`}>{t.count}</span>
              </button>
            ))}
          </div>
        )}

        {notes.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-black/15 bg-gray-50/50 p-8 text-center">
            <NotebookPen size={44} className="mx-auto mb-3 text-gray-300" />
            <p className="text-base font-medium text-black/70">Пока нет записей</p>
            <p className="mt-1 text-sm text-black/50">Добавьте первую запись слева</p>
          </div>
        ) : (
          <>
            {/* FULL NOTES */}
            {visibleFull.length > 0 && (
              <div className="mt-5">
                {tab === "all" && (
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-black/60 uppercase tracking-wide">
                      <FileText size={14} className="text-blue-500" />
                      Полные записи
                    </h3>
                  </div>
                )}

                <ul className="space-y-3 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                  {visibleFull.map((n) => (
                    <li
                      key={n.id}
                      className="group rounded-2xl border border-black/10 bg-blue-50/20 p-4 transition-all hover:shadow-md hover:border-blue-200/60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-black/50">
                             <span className="inline-flex items-center gap-1"><CalendarDays size={12} /> {format(new Date(n.date), "dd MMM yyyy", { locale: ru })}</span>
                          </div>

                          {n.comment && (
                            <div className="mt-2 text-sm text-black/80 break-words leading-relaxed">
                              {n.comment}
                            </div>
                          )}

                          {/* Дополнительные параметры */}
                          {(n.energy || n.stress || n.nutrition || n.exercise || n.hobbies || n.social) && (
                            <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                              {n.energy && (
                                <span className="rounded-md bg-blue-100/70 text-blue-700 px-2 py-0.5 font-medium">
                                  <span className="inline-flex items-center gap-1"><Battery size={12} /> {n.energy}/10</span>
                                </span>
                              )}
                              {n.stress && (
                                <span className="rounded-md bg-orange-100/70 text-orange-700 px-2 py-0.5 font-medium">
                                  <span className="inline-flex items-center gap-1"><Flame size={12} /> {n.stress}/10</span>
                                </span>
                              )}
                              {n.nutrition && (
                                <span className="rounded-md bg-green-100/70 text-green-700 px-2 py-0.5 font-medium">
                                  <span className="inline-flex items-center gap-1"><Apple size={12} /> {n.nutrition}</span>
                                </span>
                              )}
                              {n.exercise && (
                                <span className="rounded-md bg-blue-100/70 text-blue-700 px-2 py-0.5 font-medium">
                                  <span className="inline-flex items-center gap-1"><Dumbbell size={12} /> {n.exercise}</span>
                                </span>
                              )}
                              {n.hobbies && (
                                <span className="rounded-md bg-pink-100/70 text-pink-700 px-2 py-0.5 font-medium">
                                  <span className="inline-flex items-center gap-1"><Gamepad2 size={12} /> {n.hobbies}</span>
                                </span>
                              )}
                              {n.social && (
                                <span className="rounded-md bg-blue-100/70 text-blue-700 px-2 py-0.5 font-medium">
                                  <span className="inline-flex items-center gap-1"><Users size={12} /> {n.social}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex gap-1.5 text-xs whitespace-nowrap">
                            {n.mood != null && (
                              <span className="rounded-lg bg-blue-100/80 text-blue-700 px-2.5 py-1.5 font-semibold shadow-sm">
                                <span className="inline-flex items-center gap-1"><Smile size={12} /> {n.mood}/10</span>
                              </span>
                            )}
                            {n.sleep != null && (
                              <span className="rounded-lg bg-emerald-100/80 text-emerald-700 px-2.5 py-1.5 font-semibold shadow-sm">
                                <span className="inline-flex items-center gap-1"><Moon size={12} /> {Math.round(n.sleep / 60)}ч</span>
                              </span>
                            )}
                          </div>

                          <div className="flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => editNote(n)}
                              className="rounded-lg border border-blue-200/60 bg-blue-50/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm"
                            >
                              <span className="inline-flex items-center gap-1"><Pencil size={12} /> Редактировать</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeNote(n.id)}
                              className="rounded-lg border border-red-200/60 bg-red-50/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 hover:border-red-300 transition-all shadow-sm"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* QUICK NOTES */}
            {visibleQuick.length > 0 && (
              <div className="mt-5">
                {tab === "all" && (
                  <>
                    <div className="my-4 h-px w-full rounded-full" style={{ background: "linear-gradient(to right, transparent, #6ee7b7, #34d399, #6ee7b7, transparent)" }} />
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-black/60 uppercase tracking-wide">
                        <MessageSquare size={14} className="text-blue-500" />
                        Мини-заметки
                      </h3>
                    </div>
                  </>
                )}

                <div className="grid gap-2.5 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                  {visibleQuick.map((n) => (
                    <div
                      key={n.id}
                      className="group rounded-2xl border border-black/10 bg-blue-50/30 p-3.5 transition-all hover:shadow-md hover:border-blue-200/60"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-black/80 break-words leading-relaxed flex-1">{n.comment}</p>

                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            type="button"
                            onClick={() => editNote(n)}
                            className="rounded-lg border border-blue-200/60 bg-white/80 backdrop-blur-sm px-2 py-1 text-xs hover:bg-blue-50 hover:border-blue-300 transition-all"
                            aria-label="Редактировать"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeNote(n.id)}
                            className="rounded-lg border border-red-200/60 bg-white/80 backdrop-blur-sm px-2 py-1 text-xs hover:bg-red-50 hover:border-red-300 transition-all"
                            aria-label="Удалить"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5 text-xs text-black/50">
                        <CalendarDays size={12} />
                        {format(new Date(n.date), "dd MMM yyyy HH:mm", { locale: ru })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* CHART + SUMMARY */}
        {fullNotes.length > 0 && (
          <div className="mt-8 pt-6 border-t border-black/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-black/80">
                <TrendingUp size={16} className="text-blue-600" />
                Динамика
              </h3>
              <span className="rounded-lg bg-gray-100/70 px-2.5 py-1 text-xs font-semibold text-black/60">
                {chartData.length} точек
              </span>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/50 p-5 shadow-sm">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    style={{ fontSize: "12px", fill: "#6b7280" }}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    style={{ fontSize: "12px", fill: "#6b7280" }}
                    stroke="#9ca3af"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="#74AA9C" 
                    name="Настроение" 
                    strokeWidth={3}
                    dot={{ fill: "#74AA9C", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sleep" 
                    stroke="#10b981" 
                    name="Сон (мин)" 
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>
        )}
      </div>
    </Card>
  );
}
