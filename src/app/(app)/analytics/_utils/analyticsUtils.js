import { STOPWORDS } from "../_data/analyticsData";

export function toISODate(d) {
  return new Date(d).toISOString().slice(0, 10);
}

export function avg(list) {
  if (!list.length) return null;
  return list.reduce((a, b) => a + b, 0) / list.length;
}

export function stddev(list) {
  if (!list.length) return null;
  const m = avg(list);
  const v = avg(list.map((x) => (x - m) ** 2));
  return Math.sqrt(v);
}

export function buildDailySeries(notes, days) {
  const map = new Map();
  for (const n of notes) {
    const day = toISODate(n.date || n.created_at || new Date());
    if (!map.has(day)) map.set(day, { moods: [], sleeps: [] });
    if (typeof n.mood === "number") map.get(day).moods.push(n.mood);
    if (typeof n.sleep === "number") map.get(day).sleeps.push(n.sleep);
  }
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = toISODate(d);
    const rec = map.get(day);
    out.push({
      date: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }),
      mood: rec?.moods?.length ? avg(rec.moods) : null,
      sleep: rec?.sleeps?.length ? avg(rec.sleeps) : null,
      _iso: day,
    });
  }
  return out;
}

export function extractKeywords(texts, limit = 6) {
  const counts = new Map();
  for (const t of texts) {
    const words = String(t || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, " ")
      .split(/\s+/)
      .filter((w) => w && w.length >= 4 && !STOPWORDS.has(w));
    for (const w of words) {
      counts.set(w, (counts.get(w) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}
