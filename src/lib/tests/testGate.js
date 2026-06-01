function readEnvInt(name, fallback) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

export function getTestsGateThreshold() {
  return readEnvInt("TESTS_GATE_MIN_USER_MESSAGES", 8);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 */
export async function countUserChatMessages(supabase, userId) {
  const { count, error } = await supabase
    .from("ai_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user");

  if (error) {
    console.warn("[testGate] count messages:", error.message);
    return 0;
  }
  return count || 0;
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 */
export async function getTestsGateStatus(supabase, userId) {
  const required = getTestsGateThreshold();
  const messageCount = await countUserChatMessages(supabase, userId);

  const { data: settings } = await supabase
    .from("user_settings")
    .select("tests_unlocked_at, tests_unlock_message_count")
    .eq("user_id", userId)
    .maybeSingle();

  const unlockedByTime = Boolean(settings?.tests_unlocked_at);
  const unlockedByCount = messageCount >= required;
  const unlocked = unlockedByTime || unlockedByCount;

  return {
    unlocked,
    messageCount,
    required,
    remaining: unlocked ? 0 : Math.max(0, required - messageCount),
    unlockedAt: settings?.tests_unlocked_at || null,
  };
}

/**
 * Persist unlock when threshold reached.
 * @returns {Promise<{ unlocked: boolean, justUnlocked: boolean }>}
 */
export async function tryUnlockTests(supabase, userId) {
  const status = await getTestsGateStatus(supabase, userId);
  if (!status.unlocked) {
    return { unlocked: false, justUnlocked: false, ...status };
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("tests_unlocked_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (settings?.tests_unlocked_at) {
    return { unlocked: true, justUnlocked: false, ...status };
  }

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      tests_unlocked_at: new Date().toISOString(),
      tests_unlock_message_count: status.messageCount,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.warn("[testGate] unlock persist:", error.message);
  }

  return {
    unlocked: true,
    justUnlocked: true,
    ...status,
    unlockedAt: new Date().toISOString(),
  };
}
