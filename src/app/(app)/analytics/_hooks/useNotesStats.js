import { useMemo } from "react";
import { avg, stddev, buildDailySeries, extractKeywords } from "../_utils/analyticsUtils";

export function useNotesStats(notes, t) {
  return useMemo(() => {
    const withMood = notes.filter((n) => typeof n.mood === "number");
    const withSleep = notes.filter((n) => typeof n.sleep === "number");
    const avgMood = avg(withMood.map((n) => n.mood));
    const avgSleep = avg(withSleep.map((n) => n.sleep));
    const moodStd = stddev(withMood.map((n) => n.mood));

    const series30 = buildDailySeries(notes, 30);
    const series14 = buildDailySeries(notes, 14);
    const last7 = series14.slice(7);
    const prev7 = series14.slice(0, 7);

    const avgMoodLast7 = avg(last7.map((d) => d.mood).filter((v) => v != null));
    const avgMoodPrev7 = avg(prev7.map((d) => d.mood).filter((v) => v != null));
    const avgSleepLast7 = avg(last7.map((d) => d.sleep).filter((v) => v != null));
    const avgSleepPrev7 = avg(prev7.map((d) => d.sleep).filter((v) => v != null));

    const comments = notes.filter((n) => n.comment).map((n) => n.comment);
    const topTopics = extractKeywords(comments, 6);

    const positiveTopics = extractKeywords(
      notes.filter((n) => n.comment && typeof n.mood === "number" && n.mood >= 7).map((n) => n.comment),
      4
    );
    const stressTopics = extractKeywords(
      notes.filter((n) => n.comment && typeof n.mood === "number" && n.mood <= 4).map((n) => n.comment),
      4
    );

    let profile = t("notEnoughData");
    if (withMood.length >= 5) {
      if (avgMood >= 7 && moodStd <= 1.5) profile = t("stablePositive");
      else if (avgMood <= 4) profile = t("difficultPeriod");
      else if (moodStd >= 2.5) profile = t("emotionalSwings");
      else if (avgMood >= 5.5) profile = t("neutralStable");
      else profile = t("unstableMood");
    }

    const moodDelta = (avgMoodLast7 != null && avgMoodPrev7 != null) ? (avgMoodLast7 - avgMoodPrev7) : null;
    const sleepDelta = (avgSleepLast7 != null && avgSleepPrev7 != null) ? (avgSleepLast7 - avgSleepPrev7) : null;

    let stressSignal = t("notEnoughData");
    if (moodDelta != null) {
      if (moodDelta <= -1) stressSignal = t("stressLikelyIncreasing");
      else if (moodDelta >= 1) stressSignal = t("stateImproving");
      else stressSignal = t("stateStable");
    }

    return {
      avgMood,
      avgSleep,
      moodStd,
      series30,
      avgMoodLast7,
      avgMoodPrev7,
      avgSleepLast7,
      avgSleepPrev7,
      moodDelta,
      sleepDelta,
      profile,
      topTopics,
      positiveTopics,
      stressTopics,
      stressSignal,
      totalNotes: notes.length,
    };
  }, [notes, t]);
}
