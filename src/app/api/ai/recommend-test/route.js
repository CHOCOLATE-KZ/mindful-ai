import { supabaseServer } from "@/lib/supabase/server";

import {

  createTestRecommendations,

  getPendingRecommendations,

  skipRecommendation,

} from "@/lib/tests/recommendTest";

import { getTestsGateStatus } from "@/lib/tests/testGate";



export async function GET() {

  const supabase = await supabaseServer();

  const {

    data: { user },

  } = await supabase.auth.getUser();

  if (!user) {

    return Response.json({ error: "Unauthorized" }, { status: 401 });

  }



  const recommendations = await getPendingRecommendations(supabase, user.id);

  return Response.json({ recommendations });

}



export async function POST(req) {

  const supabase = await supabaseServer();

  const {

    data: { user },

  } = await supabase.auth.getUser();

  if (!user) {

    return Response.json({ error: "Unauthorized" }, { status: 401 });

  }



  let force = false;

  let skipId = null;

  try {

    const body = await req.json();

    force = body?.force === true;

    skipId = body?.skipId || null;

  } catch {

    // empty body ok

  }



  if (skipId) {

    await skipRecommendation(supabase, user.id, skipId);

    return Response.json({ ok: true, skipped: true });

  }



  const gate = await getTestsGateStatus(supabase, user.id);

  if (!gate.unlocked) {

    return Response.json({ error: "tests_locked", gate }, { status: 403 });

  }



  const result = await createTestRecommendations(supabase, user.id, { force });

  if (result.error) {

    return Response.json({ error: result.error }, { status: 502 });

  }



  return Response.json(result);

}

