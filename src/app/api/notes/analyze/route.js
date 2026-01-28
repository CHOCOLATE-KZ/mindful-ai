/**
 * 🤖 API для анализа комментариев заметок с помощью ИИ
 * POST /api/notes/analyze
 * 
 * Принимает структурированные данные заметок и возвращает анализ
 */

import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request) {
  try {
    // Log incoming request for debugging (avoid leaking sensitive data)
    let rawBody = null;
    try {
      rawBody = await request.text();
      console.info('analyze: raw request body:', rawBody);
    } catch (e) {
      console.warn('analyze: failed to read raw body', e && e.message);
    }
    let body = {};
    try {
      body = rawBody ? JSON.parse(rawBody) : await request.json();
    } catch (e) {
      console.error('analyze: invalid JSON body', e && e.message);
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { userId, comments, mood, sleep } = body;

    // basic validation
    if (!userId || !comments) {
      console.error('analyze: missing fields', { userId, comments });
      return Response.json({ error: 'Missing required fields', details: { userId: !!userId, comments: !!comments } }, { status: 400 });
    }

    if (!Array.isArray(comments)) {
      console.error('analyze: comments is not array', typeof comments);
      return Response.json({ error: 'Invalid comments format' }, { status: 400 });
    }

    // 🔹 Валидация пользователя (defensive)
    let user = null;
    try {
      if (!supabaseAdmin) throw new Error('supabaseAdmin client not initialized');
      const res = await supabaseAdmin.auth.admin.getUserById(userId);
      // res might be { data: { user }, error }
      if (res && res.data && res.data.user) user = res.data.user;
      if (res && res.error) console.warn('supabase getUserById returned error', res.error);
    } catch (e) {
      console.error('analyze: error fetching user by id', e && (e.message || e));
      // don't leak service-role key, just fail auth
      return Response.json({ error: 'User validation failed', message: e.message || String(e) }, { status: 500 });
    }

    if (!user) {
      console.error('analyze: user not found for id', userId);
      return Response.json({ error: 'User not found' }, { status: 401 });
    }

    // 🔹 Подготовка данных для анализа
    const analysisPrompt = `
Проанализируй следующие заметки пользователя и предоставь инсайты:

ДАННЫЕ:
- Среднее настроение: ${mood || 'не указано'}/10
- Средний сон: ${sleep || 'не указано'} минут

КОММЕНТАРИИ (от новых к старым):
${comments.map((c, i) => `${i + 1}. [${new Date(c.date).toLocaleDateString('ru-RU')}] ${c.text}`).join('\n')}

ЗАПРОС:
1. Выяви основные эмоциональные паттерны
2. Определи ключевые факторы, влияющие на настроение
3. Предложи конкретные рекомендации для улучшения благополучия
4. Выяви тренды и долгосрочные тенденции

Ответь структурированно на русском языке.
    `.trim();

    // 🔹 Сохранение запроса анализа в БД
    const { data: analysisRecord, error: saveError } = await supabaseAdmin
      .from('notes_analysis')
      .insert({
        user_id: userId,
        prompt: analysisPrompt,
        comments_count: comments.length,
        analyzed_at: new Date().toISOString()
      })
      .select('id');

    if (saveError) {
      return Response.json({ 
        error: 'Failed to save analysis request',
        details: saveError.message
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      analysisId: analysisRecord?.[0]?.id,
      prompt: analysisPrompt,
      message: 'Analysis data prepared for AI processing',
      commentsCount: comments.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Notes analysis error:', error && (error.stack || error));
    const payload = {
      error: 'Analysis failed',
      message: error && error.message ? error.message : String(error)
    };
    if (process.env.NODE_ENV !== 'production') {
      payload.stack = error && error.stack ? error.stack : null;
    }
    return Response.json(payload, { status: 500 });
  }
}
