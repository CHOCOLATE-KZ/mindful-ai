import { useMemo } from "react";
import Card from "@/components/ui/Card";

/**
 * Компонент для показа insights и корреляций
 */
export default function NotesInsights({ notes, fullNotes }) {
  const insights = useMemo(() => {
    const result = [];

    // 1. Корреляция сна и настроения
    const withSleepAndMood = fullNotes.filter(n => n.sleep != null && n.mood != null);
    if (withSleepAndMood.length >= 3) {
      const goodSleep = withSleepAndMood.filter(n => n.sleep >= 420); // >=7 часов
      const poorSleep = withSleepAndMood.filter(n => n.sleep < 420);
      
      if (goodSleep.length > 0 && poorSleep.length > 0) {
        const avgMoodGoodSleep = goodSleep.reduce((sum, n) => sum + n.mood, 0) / goodSleep.length;
        const avgMoodPoorSleep = poorSleep.reduce((sum, n) => sum + n.mood, 0) / poorSleep.length;
        const diff = avgMoodGoodSleep - avgMoodPoorSleep;
        
        if (Math.abs(diff) > 0.5) {
          result.push({
            icon: "😴",
            type: diff > 0 ? "positive" : "neutral",
            title: "Сон и настроение",
            text: diff > 0 
              ? `При сне ≥7 часов ваше настроение выше на ${diff.toFixed(1)} балла`
              : `При недосыпе (<7ч) настроение ниже на ${Math.abs(diff).toFixed(1)} балла`,
          });
        }
      }
    }

    // 2. Корреляция спорта и настроения
    const withExerciseAndMood = fullNotes.filter(n => n.exercise && n.mood != null);
    if (withExerciseAndMood.length >= 3) {
      const withGoodExercise = withExerciseAndMood.filter(n => n.exercise === 'great' || n.exercise === 'fine');
      const withPoorExercise = withExerciseAndMood.filter(n => n.exercise === 'ok' || n.exercise === 'poor');
      
      if (withGoodExercise.length > 0 && withPoorExercise.length > 0) {
        const avgMoodGoodEx = withGoodExercise.reduce((sum, n) => sum + n.mood, 0) / withGoodExercise.length;
        const avgMoodPoorEx = withPoorExercise.reduce((sum, n) => sum + n.mood, 0) / withPoorExercise.length;
        const diff = avgMoodGoodEx - avgMoodPoorEx;
        
        if (diff > 0.5) {
          result.push({
            icon: "🏃",
            type: "positive",
            title: "Физическая активность",
            text: `Спорт улучшает ваше настроение в среднем на ${diff.toFixed(1)} балла`,
          });
        }
      }
    }

    // 3. Корреляция энергии и стресса
    const withEnergyAndStress = fullNotes.filter(n => n.energy != null && n.stress != null);
    if (withEnergyAndStress.length >= 3) {
      const correlation = calculateCorrelation(
        withEnergyAndStress.map(n => n.energy),
        withEnergyAndStress.map(n => n.stress)
      );
      
      if (correlation < -0.3) {
        result.push({
          icon: "⚡",
          type: "insight",
          title: "Энергия и стресс",
          text: `Чем выше стресс, тем ниже энергия (корреляция ${(correlation * 100).toFixed(0)}%)`,
        });
      }
    }

    // 4. Лучший день недели по настроению
    const byDayOfWeek = {};
    fullNotes.filter(n => n.mood != null).forEach(n => {
      const day = new Date(n.date).getDay();
      if (!byDayOfWeek[day]) byDayOfWeek[day] = [];
      byDayOfWeek[day].push(n.mood);
    });

    const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const dayAverages = Object.entries(byDayOfWeek).map(([day, moods]) => ({
      day: parseInt(day),
      avg: moods.reduce((a, b) => a + b, 0) / moods.length,
      count: moods.length,
    }));

    if (dayAverages.length >= 3) {
      const bestDay = dayAverages.reduce((best, curr) => curr.avg > best.avg ? curr : best);
      if (bestDay.count >= 2) {
        result.push({
          icon: "📅",
          type: "positive",
          title: "Лучший день недели",
          text: `Ваше настроение лучше всего по ${dayNames[bestDay.day].toLowerCase()}ам (${bestDay.avg.toFixed(1)}/10)`,
        });
      }
    }

    // 5. Социализация и настроение
    const withSocialAndMood = fullNotes.filter(n => n.social && n.mood != null);
    if (withSocialAndMood.length >= 3) {
      const withGoodSocial = withSocialAndMood.filter(n => n.social === 'great' || n.social === 'fine');
      const withPoorSocial = withSocialAndMood.filter(n => n.social === 'ok' || n.social === 'poor');
      
      if (withGoodSocial.length > 0) {
        const avgMoodGoodSocial = withGoodSocial.reduce((sum, n) => sum + n.mood, 0) / withGoodSocial.length;
        
        if (withPoorSocial.length > 0) {
          const avgMoodPoorSocial = withPoorSocial.reduce((sum, n) => sum + n.mood, 0) / withPoorSocial.length;
          const diff = avgMoodGoodSocial - avgMoodPoorSocial;
          
          if (diff > 0.5) {
            result.push({
              icon: "👥",
              type: "positive",
              title: "Общение важно",
              text: `Активное общение повышает настроение на ${diff.toFixed(1)} балла`,
            });
          }
        }
      }
    }

    // 6. Стресс без активностей
    const withStressAndActivities = fullNotes.filter(n => 
      n.stress != null && (n.exercise || n.hobbies)
    );
    if (withStressAndActivities.length >= 3) {
      const withGoodActivities = withStressAndActivities.filter(n => 
        (n.exercise === 'great' || n.exercise === 'fine') || 
        (n.hobbies === 'great' || n.hobbies === 'fine')
      );
      const withoutActivities = withStressAndActivities.filter(n => 
        (!n.exercise || n.exercise === 'poor') && 
        (!n.hobbies || n.hobbies === 'poor')
      );
      
      if (withGoodActivities.length > 0 && withoutActivities.length > 0) {
        const avgStressWithActivities = withGoodActivities.reduce((sum, n) => sum + n.stress, 0) / withGoodActivities.length;
        const avgStressWithout = withoutActivities.reduce((sum, n) => sum + n.stress, 0) / withoutActivities.length;
        const diff = avgStressWithout - avgStressWithActivities;
        
        if (diff > 1) {
          result.push({
            icon: "🎨",
            type: "warning",
            title: "Активности снижают стресс",
            text: `В дни без спорта/хобби стресс выше на ${diff.toFixed(1)} балла`,
          });
        }
      }
    }

    return result.slice(0, 6); // Максимум 6 инсайтов
  }, [fullNotes]);

  // Вспомогательная функция для корреляции
  function calculateCorrelation(x, y) {
    const n = x.length;
    if (n === 0) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  const getInsightColor = (type) => {
    switch (type) {
      case "positive": return "from-emerald-50 to-green-50 border-emerald-200/60";
      case "warning": return "from-orange-50 to-yellow-50 border-orange-200/60";
      case "insight": return "from-blue-50 to-violet-50 border-blue-200/60";
      default: return "from-gray-50 to-white border-gray-200/60";
    }
  };

  if (insights.length === 0) return null;

  return (
    <Card className="rounded-3xl border border-black/10 bg-white shadow-md">
      <div className="p-7">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">💡</span>
              <h2 className="text-2xl font-semibold text-black">Инсайты и паттерны</h2>
            </div>
            <p className="mt-2 text-sm text-black/65 leading-relaxed">
              Автоматический анализ ваших данных для выявления закономерностей
            </p>
          </div>
          <span className="rounded-full border border-violet-200/60 bg-violet-100/60 px-3.5 py-1.5 text-xs font-semibold text-violet-700 shadow-sm">
            {insights.length} найдено
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm hover:shadow-md transition-all ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{insight.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-black/80 mb-1">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-black/70 leading-relaxed">
                    {insight.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-blue-50/50 border border-blue-200/40 p-4">
          <p className="text-xs text-black/65 leading-relaxed">
            💡 <b>Совет:</b> Чем больше записей вы ведете, тем точнее инсайты. Заполняйте дополнительные параметры для более глубокого анализа!
          </p>
        </div>
      </div>
    </Card>
  );
}
