/** sleep в notes хранится в минутах */
function formatSleepForContext(sleepMinutes) {
  if (sleepMinutes == null || typeof sleepMinutes !== "number") return "?";
  const hours = (sleepMinutes / 60).toFixed(1);
  return `${hours} ч`;
}

export async function buildUserContext(supabase, userId) {
  const { data: settings } = await supabase
    .from("user_settings")
    .select("ai_personalization, data_sharing_ai, language")
    .eq("user_id", userId)
    .maybeSingle();

  if (settings?.data_sharing_ai === false) return "";

  const [{ data: profile }, { data: recentNotes }] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", userId).maybeSingle(),
    supabase
      .from("notes")
      .select("date, mood, sleep, comment")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(settings?.ai_personalization ? 7 : 1),
  ]);

  const parts = [];
  if (profile?.name) parts.push(`Имя пользователя: ${profile.name}`);
  if (settings?.language) parts.push(`Язык интерфейса: ${settings.language}`);

  const notes = Array.isArray(recentNotes) ? recentNotes : recentNotes ? [recentNotes] : [];

  if (!settings?.ai_personalization) {
    const note = notes[0];
    if (note) {
      parts.push(
        `Последняя запись: дата=${note.date || "?"}, настроение=${note.mood ?? "?"}/10, сон=${formatSleepForContext(note.sleep)}`
      );
    }
  } else if (notes.length > 0) {
    const latest = notes[0];
    parts.push(
      `Последняя запись (${latest.date || "?"}): настроение ${latest.mood ?? "?"}/10, сон ${formatSleepForContext(latest.sleep)}`
    );

    const moodValues = notes.map((n) => n.mood).filter((v) => typeof v === "number");
    if (moodValues.length >= 2) {
      const avg = (moodValues.reduce((a, b) => a + b, 0) / moodValues.length).toFixed(1);
      const first = moodValues[moodValues.length - 1];
      const last = moodValues[0];
      const trend = last > first ? "улучшается" : last < first ? "снижается" : "стабильное";
      parts.push(
        `Тренд настроения за ${moodValues.length} дн.: среднее ${avg}/10, динамика — ${trend} (было ${first}, стало ${last})`
      );
    }

    const sleepValues = notes.map((n) => n.sleep).filter((v) => typeof v === "number");
    if (sleepValues.length >= 2) {
      const avgSleepHours = (
        sleepValues.reduce((a, b) => a + b, 0) /
        sleepValues.length /
        60
      ).toFixed(1);
      const sleepTrend =
        sleepValues[0] > sleepValues[sleepValues.length - 1]
          ? "улучшается"
          : sleepValues[0] < sleepValues[sleepValues.length - 1]
          ? "снижается"
          : "стабильный";
      parts.push(`Сон за ${sleepValues.length} дн.: среднее ${avgSleepHours} ч, тренд — ${sleepTrend}`);
    }

    const lowMoodDays = moodValues.filter((v) => v <= 4).length;
    if (lowMoodDays > 0) {
      parts.push(`За период ${lowMoodDays} из ${moodValues.length} дней настроение было ≤4/10 — это важный сигнал`);
    }

    const textNotes = notes
      .filter((n) => n.comment && String(n.comment).trim().length > 10)
      .slice(0, 2)
      .map((n) => `"${String(n.comment).slice(0, 120).trim()}"`)
      .join("; ");
    if (textNotes) {
      parts.push(`Последние записи пользователя: ${textNotes}`);
    }

    parts.push(
      `Инструкция: используй этот контекст, чтобы отвечать более персонально — учитывай тренды, упоминай конкретные цифры только если это уместно и помогает диалогу. Не выводи статистику спонтанно.`
    );
  }

  return parts.length ? parts.join(". ") : "";
}
