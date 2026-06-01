import { supabaseServer } from "@/lib/supabase/server";
import { formatRecommendationRow } from "@/lib/tests/recommendTest";

export async function GET(_req, { params }) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { data, error } = await supabase
    .from("ai_test_recommendations")
    .select("id, status, approach, catalog_key, generated_test, rationale, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ recommendation: formatRecommendationRow(data) });
}
