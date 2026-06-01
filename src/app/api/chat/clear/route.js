import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { clearUserChat } from "@/lib/chat/processChatTurn";

export async function POST() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await clearUserChat(supabase, user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
