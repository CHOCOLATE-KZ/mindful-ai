import { useMemo } from "react";
import Card from "@/components/ui/Card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

/**
 * Компонент недельного трекера активностей
 */
export default function WeeklyTracker({ notes }) {
  // Получаем последние 7 дней
  const weekData = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayNotes = notes.filter((n) => {
        const noteDate = new Date(n.date).toISOString().split('T')[0];
        return noteDate === dateStr;
      });

      // Берем последнюю запись за день или первую с заполненными активностями
      const note = dayNotes.find(n => n.nutrition || n.exercise || n.hobbies || n.social) || dayNotes[0];

      result.push({
        date: d,
        dateStr,
        dayName: format(d, "EEE", { locale: ru }),
        dayNum: format(d, "d MMM", { locale: ru }),
        note: note || null,
      });
    }
    return result;
  }, [notes]);

  const activities = [
    { key: "nutrition", icon: "🥗", label: "Питание" },
    { key: "exercise", icon: "🏃", label: "Спорт" },
    { key: "hobbies", icon: "🎨", label: "Хобби" },
    { key: "social", icon: "👥", label: "Общение" },
  ];

  const getRatingColor = (val) => {
    if (!val) return "bg-gray-100 text-gray-400";
    switch (val) {
      case "great": return "bg-emerald-200 text-emerald-800 font-semibold";
      case "fine": return "bg-blue-200 text-blue-800 font-medium";
      case "ok": return "bg-yellow-200 text-yellow-800";
      case "poor": return "bg-red-200 text-red-800";
      default: return "bg-gray-100 text-gray-400";
    }
  };

  const getRatingIcon = (val) => {
    switch (val) {
      case "great": return "⭐";
      case "fine": return "✓";
      case "ok": return "○";
      case "poor": return "✗";
      default: return "—";
    }
  };

  return (
    <Card className="rounded-3xl border border-black/10 bg-white shadow-md">
      <div className="p-7">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📅</span>
              <h2 className="text-2xl font-semibold text-black">Недельный трекер</h2>
            </div>
            <p className="mt-2 text-sm text-black/65 leading-relaxed">
              Визуальный обзор ваших активностей за последние 7 дней
            </p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-7 px-7">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b-2 border-black/10">
                <th className="text-left py-3 px-3 text-sm font-semibold text-black/70 w-[140px]">
                  Активность
                </th>
                {weekData.map((day) => (
                  <th key={day.dateStr} className="text-center py-3 px-2 min-w-[90px]">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-black/50 uppercase">
                        {day.dayName}
                      </span>
                      <span className="text-sm font-semibold text-black/80">
                        {day.dayNum}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, idx) => (
                <tr 
                  key={activity.key}
                  className={`border-b border-black/10 ${idx % 2 === 0 ? 'bg-gray-50/30' : ''}`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{activity.icon}</span>
                      <span className="text-sm font-medium text-black/70">
                        {activity.label}
                      </span>
                    </div>
                  </td>
                  {weekData.map((day) => {
                    const value = day.note?.[activity.key];
                    return (
                      <td key={day.dateStr} className="text-center py-3 px-2">
                        <div className={`
                          inline-flex items-center justify-center
                          rounded-lg px-2.5 py-1.5 text-xs
                          transition-all hover:scale-105
                          ${getRatingColor(value)}
                        `}>
                          <span className="mr-1">{getRatingIcon(value)}</span>
                          <span className="capitalize">{value || "—"}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Mood & Energy row */}
              <tr className="border-b border-black/10 bg-violet-50/30">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">😊</span>
                    <span className="text-sm font-medium text-black/70">Настроение</span>
                  </div>
                </td>
                {weekData.map((day) => {
                  const mood = day.note?.mood;
                  return (
                    <td key={day.dateStr} className="text-center py-3 px-2">
                      {mood != null ? (
                        <div className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-violet-200 text-violet-800">
                          {mood}/10
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              <tr className="bg-blue-50/30">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    <span className="text-sm font-medium text-black/70">Энергия</span>
                  </div>
                </td>
                {weekData.map((day) => {
                  const energy = day.note?.energy;
                  return (
                    <td key={day.dateStr} className="text-center py-3 px-2">
                      {energy != null ? (
                        <div className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-blue-200 text-blue-800">
                          {energy}/10
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 items-center justify-center text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-emerald-200 flex items-center justify-center text-emerald-800">⭐</div>
            <span className="text-black/60">Отлично</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-blue-200 flex items-center justify-center text-blue-800">✓</div>
            <span className="text-black/60">Хорошо</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-yellow-200 flex items-center justify-center text-yellow-800">○</div>
            <span className="text-black/60">OK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-red-200 flex items-center justify-center text-red-800">✗</div>
            <span className="text-black/60">Плохо</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
