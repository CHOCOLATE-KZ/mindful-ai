"use client";

import { useMemo } from "react";
import Card from "@/components/ui/Card";
import { CalendarDays } from "lucide-react";

// Цвета по настроению (1–10)
function getMoodColor(mood) {
  if (mood === null || mood === undefined) return null;
  if (mood <= 2) return "bg-red-400";
  if (mood <= 4) return "bg-orange-400";
  if (mood <= 6) return "bg-yellow-400";
  if (mood <= 8) return "bg-lime-400";
  return "bg-emerald-500";
}

function getMoodColorHex(mood) {
  if (mood === null || mood === undefined) return null;
  if (mood <= 2) return "#f87171";
  if (mood <= 4) return "#fb923c";
  if (mood <= 6) return "#facc15";
  if (mood <= 8) return "#a3e635";
  return "#10b981";
}

const MONTHS_RU = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
];

const DAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function MoodCalendar({ notes }) {
  const { weeks, monthLabels, stats } = useMemo(() => {
    // Строим карту дата → настроение
    const moodMap = {};
    notes.forEach((n) => {
      if (n.mood != null && n.date) {
        moodMap[n.date.slice(0, 10)] = n.mood;
      }
    });

    // Диапазон: последние 6 месяцев
    const today = new Date();
    const end = new Date(today);
    // Идём до конца текущей недели (воскресенье)
    const dayOfWeek = (end.getDay() + 6) % 7; // 0=Пн, 6=Вс
    end.setDate(end.getDate() + (6 - dayOfWeek));

    const start = new Date(end);
    start.setMonth(start.getMonth() - 6);
    // Начало с понедельника
    const startDay = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - startDay);

    // Генерируем все дни
    const days = [];
    const cur = new Date(start);
    while (cur <= end) {
      const dateStr = cur.toISOString().slice(0, 10);
      days.push({
        date: dateStr,
        mood: moodMap[dateStr] ?? null,
        isFuture: cur > today,
        month: cur.getMonth(),
        day: cur.getDate(),
      });
      cur.setDate(cur.getDate() + 1);
    }

    // Разбиваем на недели (по 7)
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    // Метки месяцев — первая неделя каждого месяца
    const monthLabels = [];
    weeks.forEach((week, wi) => {
      const firstDay = week.find((d) => d.day <= 7);
      if (firstDay) {
        monthLabels.push({ weekIdx: wi, label: MONTHS_RU[firstDay.month] });
      }
    });

    // Статы
    const filled = days.filter((d) => d.mood !== null && !d.isFuture);
    const avgMood = filled.length
      ? (filled.reduce((s, d) => s + d.mood, 0) / filled.length).toFixed(1)
      : null;

    return { weeks, monthLabels, stats: { total: filled.length, avgMood } };
  }, [notes]);

  const legend = [
    { label: "1–2", color: "#f87171" },
    { label: "3–4", color: "#fb923c" },
    { label: "5–6", color: "#facc15" },
    { label: "7–8", color: "#a3e635" },
    { label: "9–10", color: "#10b981" },
  ];

  return (
    <Card className="rounded-3xl border border-black/10 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="p-7">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays size={20} className="text-[#74AA9C]" />
              <h3 className="text-xl font-semibold text-black">Календарь настроения</h3>
            </div>
            <p className="mt-1 text-sm text-black/55">Последние 6 месяцев</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {stats.avgMood && (
              <div className="rounded-2xl border border-black/10 bg-gray-50 px-4 py-2 text-center">
                <div className="text-xl font-bold text-black/80">{stats.avgMood}</div>
                <div className="text-xs text-black/45">средн. настр.</div>
              </div>
            )}
            <div className="rounded-2xl border border-black/10 bg-gray-50 px-4 py-2 text-center">
              <div className="text-xl font-bold text-black/80">{stats.total}</div>
              <div className="text-xs text-black/45">записей</div>
            </div>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="mt-6 overflow-x-auto pb-2">
          <div className="inline-flex flex-col gap-1 min-w-max">
            {/* Month labels */}
            <div className="flex gap-1 mb-1 ml-8">
              {weeks.map((_, wi) => {
                const label = monthLabels.find((m) => m.weekIdx === wi);
                return (
                  <div key={wi} className="w-4 text-[10px] text-black/40 font-medium text-center">
                    {label ? label.label : ""}
                  </div>
                );
              })}
            </div>

            {/* Day rows */}
            {DAYS_RU.map((dayName, di) => (
              <div key={di} className="flex items-center gap-1">
                <span className="w-7 text-[10px] text-black/35 font-medium text-right pr-1">
                  {di % 2 === 0 ? dayName : ""}
                </span>
                {weeks.map((week, wi) => {
                  const cell = week[di];
                  if (!cell) return <div key={wi} className="w-4 h-4" />;

                  const color = getMoodColorHex(cell.mood);
                  const isEmpty = cell.mood === null;
                  const isFuture = cell.isFuture;

                  return (
                    <div
                      key={wi}
                      title={
                        cell.mood
                          ? `${cell.date}: настроение ${cell.mood}`
                          : cell.date
                      }
                      className="w-4 h-4 rounded-sm transition-transform hover:scale-125 cursor-default"
                      style={{
                        backgroundColor: isFuture
                          ? "transparent"
                          : color
                          ? color
                          : "#f3f4f6",
                        border: isFuture ? "none" : isEmpty ? "1px solid #e5e7eb" : "none",
                        opacity: isFuture ? 0 : 1,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-black/40">Меньше</span>
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div
                className="w-3.5 h-3.5 rounded-sm"
                style={{ backgroundColor: l.color }}
              />
              <span className="text-[10px] text-black/45">{l.label}</span>
            </div>
          ))}
          <span className="text-xs text-black/40">Больше</span>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded-sm border border-gray-200 bg-gray-100" />
            <span className="text-[10px] text-black/40">нет записи</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
