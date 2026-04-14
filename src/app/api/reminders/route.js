import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// GET /api/reminders — получить напоминание текущего пользователя
export async function GET() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: reminder } = await supabase
    .from("reminders")
    .select("id, time, days, enabled")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({ reminder: reminder || null });
}

// POST /api/reminders — создать или обновить напоминание
export async function POST(request) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { time, days, enabled } = body;

  // Проверка формата времени
  if (time && !/^([01]?\d|2[0-3]):[0-5]\d$/.test(time)) {
    return NextResponse.json({ error: "Invalid time format" }, { status: 400 });
  }

  // Проверяем телеграм привязан ли
  const { data: profile } = await supabase
    .from("profiles")
    .select("telegram_id")
    .eq("id", user.id)
    .single();

  if (!profile?.telegram_id) {
    return NextResponse.json(
      { error: "Telegram не привязан к аккаунту" },
      { status: 400 }
    );
  }

  // Ищем существующее напоминание
  const { data: existing } = await supabase
    .from("reminders")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  let result;
  if (existing) {
    const updateData = {};
    if (time !== undefined) updateData.time = time;
    if (days !== undefined) updateData.days = days;
    if (enabled !== undefined) updateData.enabled = enabled;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("reminders")
      .update(updateData)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    result = data;
  } else {
    const { data, error } = await supabase
      .from("reminders")
      .insert({
        user_id: user.id,
        telegram_id: profile.telegram_id,
        time: time || "09:00",
        days: days || "Каждый день",
        enabled: enabled !== false,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    result = data;
  }

  return NextResponse.json({ reminder: result });
}

// DELETE /api/reminders — удалить напоминание
export async function DELETE() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await supabase.from("reminders").delete().eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
