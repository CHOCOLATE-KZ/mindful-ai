/**
 *  API для анализа комментариев заметок с помощью ИИ
 * POST /api/notes/analyze
 * 
 * Принимает структурированные данные заметок и возвращает анализ
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    // Аутентификация через сессию (не доверяем userId из тела запроса)
    const supabase = await supabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    let rawBody = null;
    try {
      rawBody = await request.text();
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
    const { comments, mood, sleep } = body;

    // basic validation
    if (!comments) {
      console.error('analyze: missing fields', { comments });
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!Array.isArray(comments)) {
      console.error('analyze: comments is not array', typeof comments);
      return Response.json({ error: 'Invalid comments format' }, { status: 400 });
    }

    //  Подготовка данных для анализа
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

    //  Сохранение запроса анализа в БД
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
