"use client";

import { useCallback, useEffect, useState } from "react";

const EMPTY_RECOMMENDATIONS = { generated: null, catalog: null };

export function useTestsStatus() {
  const [gate, setGate] = useState(null);
  const [pendingRecommendations, setPendingRecommendations] = useState(EMPTY_RECOMMENDATIONS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/tests/status", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setGate(data.gate || null);
        setPendingRecommendations(
          data.pendingRecommendations || EMPTY_RECOMMENDATIONS
        );
      }
    } catch (e) {
      console.warn("[useTestsStatus]", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pendingRecommendation =
    pendingRecommendations.generated || pendingRecommendations.catalog || null;

  return {
    gate,
    pendingRecommendations,
    pendingRecommendation,
    loading,
    refresh,
    unlocked: gate?.unlocked === true,
  };
}
