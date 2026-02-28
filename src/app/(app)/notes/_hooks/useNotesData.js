import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

/**
 * Хук для загрузки заметок пользователя из Supabase
 */
export function useNotesData() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        if (mounted) {
          setNotes([]);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("notes")
        .select("id, date, mood, sleep, comment, energy, stress, nutrition, exercise, hobbies, social")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(200);

      if (mounted) {
        if (!error) setNotes(data || []);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { notes, setNotes, loading };
}
