export async function POST(req) {
  // Получаем user_id и emotion из тела запроса
  const { user_id, emotion } = await req.json();
  if (!user_id || !emotion) {
    return new Response(JSON.stringify({ ok: false, error: 'user_id and emotion required' }), { status: 400 });
  }
  // Глобальное хранилище эмоций (in-memory, для прототипа)
  globalThis.userEmotions = globalThis.userEmotions || {};
  globalThis.userEmotions[user_id] = {
    emotion,
    timestamp: Date.now(),
  };
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

export async function GET(req) {
  // Получить эмоцию по user_id (например, для отладки)
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');
  if (!user_id) {
    return new Response(JSON.stringify({ ok: false, error: 'user_id required' }), { status: 400 });
  }
  const data = globalThis.userEmotions?.[user_id] || { emotion: 'neutral' };
  return new Response(JSON.stringify({ ok: true, ...data }), { status: 200 });
}
