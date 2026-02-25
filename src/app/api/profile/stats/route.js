import { supabaseServer } from "@/lib/supabase/server";

export async function GET(request) {
  try {
    const supabase = await supabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgoDate = weekAgo.toISOString().split('T')[0];

    // Get notes for the week
    const { data: weekNotes, error: notesError } = await supabase
      .from("notes")
      .select("date, mood, sleep")
      .eq("user_id", userId)
      .gte("date", weekAgoDate);

    if (notesError) throw notesError;

    // Get all notes for streak calculation
    const { data: allNotes, error: allNotesError } = await supabase
      .from("notes")
      .select("date")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (allNotesError) throw allNotesError;

    // Get exercises log
    const { data: exercises, error: exercisesError } = await supabase
      .from("exercises_log")
      .select("completed_at")
      .eq("user_id", userId)
      .gte("completed_at", weekAgo.toISOString());

    if (exercisesError) throw exercisesError;

    // Get tests log
    const { data: tests, error: testsError } = await supabase
      .from("tests_log")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", weekAgo.toISOString());

    if (testsError) throw testsError;

    // Calculate stats
    const uniqueDates = new Set(weekNotes?.map(n => n.date) || []);
    const activeDays = uniqueDates.size;

    // Calculate day streak
    let dayStreak = 0;
    if (allNotes && allNotes.length > 0) {
      const sortedDates = allNotes.map(n => new Date(n.date + 'T00:00:00')).sort((a, b) => b - a);
      
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      for (const noteDate of sortedDates) {
        const diffTime = currentDate - noteDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === dayStreak) {
          dayStreak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate average mood
    const moodValues = weekNotes?.filter(n => n.mood !== null).map(n => n.mood) || [];
    const overallMood = moodValues.length > 0 
      ? (moodValues.reduce((a, b) => a + b, 0) / moodValues.length).toFixed(1)
      : 0;

    // Calculate average sleep (assuming sleep is in minutes)
    const sleepValues = weekNotes?.filter(n => n.sleep !== null).map(n => n.sleep) || [];
    const avgSleepMinutes = sleepValues.length > 0 
      ? sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length
      : 0;
    const avgSleepHours = (avgSleepMinutes / 60).toFixed(1);

    // Calculate achievements (exercises + tests completed)
    const achievements = (exercises?.length || 0) + (tests?.length || 0);

    // Goals completed percentage (assuming 7 exercises per week as goal)
    const weeklyGoal = 7;
    const goalsCompletedPct = Math.round(Math.min(((exercises?.length || 0) / weeklyGoal) * 100, 100));

    return Response.json({
      activeDays,
      dayStreak,
      overallMood: parseFloat(overallMood),
      avgSleepHours: parseFloat(avgSleepHours),
      achievements,
      goalsCompletedPct,
    });

  } catch (error) {
    console.error("Stats API error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
