import { useEffect, useState, useMemo } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function useAnalyticsData() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          if (mounted) setLoading(false);
          return;
        }

        if (mounted) setUser(authUser);

        // Fetch test results and notes in parallel
        const [testsResult, notesResult] = await Promise.all([
          supabase
            .from("tests_log")
            .select("id, test_key, answers, created_at")
            .eq("user_id", authUser.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("notes")
            .select("id, date, mood, sleep, comment, created_at")
            .eq("user_id", authUser.id)
            .order("date", { ascending: false })
            .limit(200),
        ]);

        if (mounted) {
          if (!testsResult.error && testsResult.data) {
            setTestResults(testsResult.data);
          }
          setNotes(notesResult.data || []);
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to load analytics data:", e);
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [supabase]);

  return {
    user,
    loading,
    testResults,
    notes,
  };
}
