import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const USER_DATA_TABLES = [
  "ai_messages",
  "notes",
  "chat_notes",
  "tests_log",
  "exercises_log",
  "signals",
  "ai_reports",
  "reminders",
  "notes_analysis",
];

export async function DELETE() {
  try {
    const supabase = await supabaseServer();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    for (const table of USER_DATA_TABLES) {
      const { error } = await supabase.from(table).delete().eq("user_id", userId);
      if (error) {
        console.warn(`delete ${table}:`, error.message);
      }
    }

    await supabase.from("user_settings").delete().eq("user_id", userId);
    await supabase.from("profiles").delete().eq("id", userId);

    // Avatars in storage (best-effort)
    try {
      const { data: files } = await supabaseAdmin.storage.from("avatars").list(userId);
      if (files?.length) {
        await supabaseAdmin.storage
          .from("avatars")
          .remove(files.map((f) => `${userId}/${f.name}`));
      }
    } catch (storageErr) {
      console.warn("delete avatars:", storageErr?.message || storageErr);
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("deleteUser error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/profile/delete:", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
