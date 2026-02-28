import Card from "@/components/ui/Card";
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

/**
 * Компонент истории заметок и аналитики
 */
export default function NotesHistory({ notes, fullNotes, quickNotes, chartData, avgMood, avgSleep, editNote, removeNote }) {
  return (
    <Card className="rounded-3xl border border-black/10 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 lg:sticky lg:top-6">
      <div className="p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <h2 className="text-2xl font-semibold text-black">История и аналитика</h2>
            </div>
            <p className="mt-2 text-sm text-black/65 leading-relaxed">
              Полные записи и мини-заметки. Ниже — динамика по дням
            </p>
          </div>

          <span className="rounded-full border border-black/15 bg-gradient-to-br from-gray-50 to-white px-4 py-1.5 text-xs font-semibold text-black/60 shadow-sm">
            Всего: {notes.length}
          </span>
        </div>

        {notes.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-black/15 bg-gradient-to-br from-gray-50/50 to-white p-8 text-center">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-base font-medium text-black/70">Пока нет записей</p>
            <p className="mt-1 text-sm text-black/50">Добавьте первую запись слева</p>
          </div>
        ) : (
          <>
            {/* FULL NOTES */}
            {fullNotes.length > 0 && (
              <div className="mt-7">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-black/80">
                    <span>📋</span>
                    Полные записи
                  </h3>
                  <span className="rounded-lg bg-violet-100/70 px-2.5 py-1 text-xs font-semibold text-violet-700">
                    {fullNotes.length} шт.
                  </span>
                </div>

                <ul className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {fullNotes.map((n) => (
                    <li
                      key={n.id}
                      className="group rounded-2xl border border-black/10 bg-gradient-to-br from-violet-50/40 via-white to-blue-50/30 p-4 transition-all hover:shadow-md hover:border-violet-200/60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-black/50">
                            📅 {format(new Date(n.date), "dd MMM yyyy", { locale: ru })}
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
                                  ⚡ {n.energy}/10
                                </span>
                              )}
                              {n.stress && (
                                <span className="rounded-md bg-orange-100/70 text-orange-700 px-2 py-0.5 font-medium">
                                  😰 {n.stress}/10
                                </span>
                              )}
                              {n.nutrition && (
                                <span className="rounded-md bg-green-100/70 text-green-700 px-2 py-0.5 font-medium">
                                  🥗 {n.nutrition}
                                </span>
                              )}
                              {n.exercise && (
                                <span className="rounded-md bg-purple-100/70 text-purple-700 px-2 py-0.5 font-medium">
                                  🏃 {n.exercise}
                                </span>
                              )}
                              {n.hobbies && (
                                <span className="rounded-md bg-pink-100/70 text-pink-700 px-2 py-0.5 font-medium">
                                  🎨 {n.hobbies}
                                </span>
                              )}
                              {n.social && (
                                <span className="rounded-md bg-indigo-100/70 text-indigo-700 px-2 py-0.5 font-medium">
                                  👥 {n.social}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex gap-1.5 text-xs whitespace-nowrap">
                            {n.mood != null && (
                              <span className="rounded-lg bg-violet-100/80 text-violet-700 px-2.5 py-1.5 font-semibold shadow-sm">
                                😊 {n.mood}/10
                              </span>
                            )}
                            {n.sleep != null && (
                              <span className="rounded-lg bg-emerald-100/80 text-emerald-700 px-2.5 py-1.5 font-semibold shadow-sm">
                                😴 {Math.round(n.sleep / 60)}ч
                              </span>
                            )}
                          </div>

                          <div className="flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => editNote(n)}
                              className="rounded-lg border border-blue-200/60 bg-blue-50/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm"
                            >
                              ✏️ Редактировать
                            </button>
                            <button
                              type="button"
                              onClick={() => removeNote(n.id)}
                              className="rounded-lg border border-red-200/60 bg-red-50/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 hover:border-red-300 transition-all shadow-sm"
                            >
                              🗑️
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
            {quickNotes.length > 0 && (
              <div className="mt-7">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-black/80">
                    <span>💬</span>
                    Мини-заметки
                  </h3>
                  <span className="rounded-lg bg-blue-100/70 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {quickNotes.length} шт.
                  </span>
                </div>

                <div className="grid gap-2.5 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                  {quickNotes.map((n) => (
                    <div
                      key={n.id}
                      className="group rounded-2xl border border-black/10 bg-gradient-to-br from-blue-50/40 to-white p-3.5 transition-all hover:shadow-md hover:border-blue-200/60"
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
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => removeNote(n.id)}
                            className="rounded-lg border border-red-200/60 bg-white/80 backdrop-blur-sm px-2 py-1 text-xs hover:bg-red-50 hover:border-red-300 transition-all"
                            aria-label="Удалить"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5 text-xs text-black/50">
                        <span>🕐</span>
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
                <span>📈</span>
                Динамика
              </h3>
              <span className="rounded-lg bg-gray-100/70 px-2.5 py-1 text-xs font-semibold text-black/60">
                {chartData.length} точек
              </span>
            </div>

            <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-white to-gray-50/50 p-5 shadow-sm">
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
                    stroke="#8b5cf6" 
                    name="Настроение" 
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", r: 4 }}
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

            <div className="mt-4 rounded-2xl border border-black/10 bg-gradient-to-br from-violet-50/40 via-blue-50/30 to-white p-5 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="flex items-center gap-2.5 rounded-xl bg-white/70 backdrop-blur-sm px-4 py-3 border border-violet-200/50">
                  <span className="text-xl">😊</span>
                  <div>
                    <div className="text-xs text-black/50 font-medium">Среднее настроение</div>
                    <div className="text-lg font-bold text-violet-600">{avgMood}/10</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl bg-white/70 backdrop-blur-sm px-4 py-3 border border-emerald-200/50">
                  <span className="text-xl">😴</span>
                  <div>
                    <div className="text-xs text-black/50 font-medium">Средний сон</div>
                    <div className="text-lg font-bold text-emerald-600">
                      {Math.round(avgSleep / 60)}ч {avgSleep % 60}м
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-black/10 text-xs text-black/55 text-center">
                📊 Полных записей: <b className="text-black/70">{fullNotes.length}</b> • 
                💬 Мини-заметок: <b className="text-black/70">{quickNotes.length}</b>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
