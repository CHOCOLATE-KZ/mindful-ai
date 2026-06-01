import { supabaseServer } from "@/lib/supabase/server";
import { unifiedLlmConfig } from "@/lib/llm/unifiedClient";
import { processChatTurn } from "@/lib/chat/processChatTurn";
import { normalizeCrisisTopicMode } from "@/lib/chat/crisisSession";

const LMSTUDIO_MODEL = unifiedLlmConfig.model;
const ENABLE_PSYCHOLOGY_RAG =
  (process.env.ENABLE_PSYCHOLOGY_RAG || "true").trim().toLowerCase() !== "false";
const RAG_LIMIT = Number(process.env.RAG_LIMIT || 3);

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const crisisTopicChoice = body?.crisisTopicChoice || null;
  const message = (body?.message || body?.triggerMessage || "").toString().trim();

  if (!message && crisisTopicChoice !== "decline") {
    return Response.json({ error: "Empty message" }, { status: 400 });
  }

  const supabase = await supabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await processChatTurn({
    supabase,
    userId: user.id,
    message,
    source: "web",
    crisisTopicChoice,
    continueAfterCrisis:
      body?.continueAfterCrisis === true || crisisTopicChoice === "continue",
    skipUserInsert: body?.skipUserInsert === true || Boolean(crisisTopicChoice),
    crisisTopicMode: normalizeCrisisTopicMode(body?.crisisTopicMode),
  });

  if (result.error) {
    const status = result.error === "Empty message" ? 400 : 502;
    return Response.json({ error: result.error }, { status });
  }

  if (result.crisis) {
    return Response.json(
      {
        crisis: true,
        crisisReopen: result.crisisReopen === true,
        crisisTopicMode: result.crisisTopicMode,
      },
      { status: 200 }
    );
  }

  const debug =
    body?.debug === true
      ? {
          model: LMSTUDIO_MODEL,
          ragEnabled: ENABLE_PSYCHOLOGY_RAG,
          ragLimit: RAG_LIMIT,
          ragContextChars: result.psychologyContextChars || 0,
          mode: result.mode,
          memory: result.memory,
          summaryChars: result.summaryChars || 0,
          recentHistoryCount: result.recentHistoryCount || 0,
        }
      : undefined;

  return Response.json({
    reply: result.reply,
    debug,
    crisisTopicMode: result.crisisTopicMode,
    testsGate: result.testsGate,
    testRecommendations: result.testRecommendations || { generated: null, catalog: null },
    testRecommendation: result.testRecommendation || null,
  });
}
