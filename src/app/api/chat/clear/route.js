import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { clearStoredConversationSummary } from "@/lib/chat/conversationMemory";
import { clearCrisisTopicMode } from "@/lib/chat/crisisSession";

export async function POST() {
  const supabase = await supabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("ai_messages")
    .delete()
    .eq("user_id", user.id)
    .eq("source", "web");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await clearStoredConversationSummary(supabase, user.id);
  await clearCrisisTopicMode(supabase, user.id);

  return NextResponse.json({ ok: true });
}
