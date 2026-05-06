import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server"; // если у тебя иначе — скажи, подстрою

const EXPORT_MESSAGES_LIMIT = Number(process.env.EXPORT_MESSAGES_LIMIT || 1000);
const EXPORT_NOTES_LIMIT = Number(process.env.EXPORT_NOTES_LIMIT || 1000);

export async function GET() {
  const supabase = await supabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;

  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [messagesRes, notesRes, settingsRes, profileRes] = await Promise.all([
    supabase
      .from("ai_messages")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: true })
      .limit(EXPORT_MESSAGES_LIMIT),
    supabase
      .from("notes")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(EXPORT_NOTES_LIMIT),
    supabase.from("user_settings").select("*").eq("user_id", uid).maybeSingle(),
    supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    user_id: uid,
    profile: profileRes.data ?? null,
    settings: settingsRes.data ?? null,
    notes: notesRes.data ?? [],
    messages: messagesRes.data ?? [],
    limits: {
      notes: EXPORT_NOTES_LIMIT,
      messages: EXPORT_MESSAGES_LIMIT,
    },
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="mindfulai-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
