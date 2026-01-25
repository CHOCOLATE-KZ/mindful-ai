export function calcStreak(datesISO) {
  const set = new Set(datesISO);
  const today = new Date();
  const toISO = (d) => d.toISOString().slice(0, 10);

  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (set.has(toISO(d))) streak++;
    else break;
  }
  return streak;
}
