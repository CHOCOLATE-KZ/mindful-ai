import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req) {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
  }

  const { emotion } = await req.json();
  if (!emotion) {
    return new Response(JSON.stringify({ ok: false, error: "emotion required" }), { status: 400 });
  }

  const userId = user.id;
  globalThis.userEmotions = globalThis.userEmotions || {};
  globalThis.userEmotions[userId] = {
    emotion,
    timestamp: Date.now(),
  };
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

export async function GET(req) {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
  }

  const data = globalThis.userEmotions?.[user.id] || { emotion: "neutral" };
  return new Response(JSON.stringify({ ok: true, ...data }), { status: 200 });
}
