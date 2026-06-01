import { supabaseServer } from "@/lib/supabase/server";

import { getTestsGateStatus } from "@/lib/tests/testGate";

import {

  ensurePendingRecommendations,

  getPendingRecommendations,

} from "@/lib/tests/recommendTest";



export async function GET() {

  const supabase = await supabaseServer();

  const {

    data: { user },

    error: userError,

  } = await supabase.auth.getUser();



  if (userError || !user) {

    return Response.json({ error: "Unauthorized" }, { status: 401 });

  }



  const gate = await getTestsGateStatus(supabase, user.id);



  let pendingRecommendations = await getPendingRecommendations(supabase, user.id);



  if (gate.unlocked && (!pendingRecommendations.generated || !pendingRecommendations.catalog)) {

    const ensured = await ensurePendingRecommendations(supabase, user.id);

    if (ensured.recommendations) {

      pendingRecommendations = ensured.recommendations;

    }

  }



  return Response.json({

    gate,

    pendingRecommendations,

    pendingRecommendation:

      pendingRecommendations.generated || pendingRecommendations.catalog || null,

  });

}

