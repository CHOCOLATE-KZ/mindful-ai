import { supabaseServer } from "@/lib/supabase/server";
import { completeRecommendation } from "@/lib/tests/recommendTest";

export async function POST(_req, { params }) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await completeRecommendation(supabase, user.id, id);
  if (!ok) {
    return Response.json({ error: "Failed to update" }, { status: 500 });
  }
  return Response.json({ ok: true });
}
