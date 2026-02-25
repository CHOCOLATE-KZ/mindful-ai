import { supabaseServer } from "@/lib/supabase/server";

export async function GET(request) {
  try {
    const supabase = await supabaseServer();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Fetch all user data in parallel
    const [
      { data: profile },
      { data: settings },
      { data: notes },
      { data: exercises },
      { data: tests },
      { data: signals },
      { data: messages },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("notes").select("*").eq("user_id", userId).order("date", { ascending: false }),
      supabase.from("exercises_log").select("*").eq("user_id", userId).order("completed_at", { ascending: false }),
      supabase.from("tests_log").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("signals").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("ai_messages").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      userId,
      profile,
      settings,
      data: {
        notes: notes || [],
        exercises: exercises || [],
        tests: tests || [],
        signals: signals || [],
        aiMessages: messages || [],
      },
      statistics: {
        totalNotes: notes?.length || 0,
        totalExercises: exercises?.length || 0,
        totalTests: tests?.length || 0,
        totalSignals: signals?.length || 0,
        totalMessages: messages?.length || 0,
      },
    };

    // Create JSON response with download headers
    const filename = `mindfulai_export_${userId}_${Date.now()}.json`;
    
    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Export data error:", error);
    return Response.json(
      { error: error.message || "Failed to export data" },
      { status: 500 }
    );
  }
}
