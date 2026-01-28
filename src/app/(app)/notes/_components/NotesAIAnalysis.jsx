'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { supabaseBrowser } from '@/lib/supabase/browser';

export default function NotesAIAnalysis({ notes, avgMood, avgSleep }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const comments = notes
    .filter(n => n.comment)
    .map(n => ({
      date: n.date,
      text: n.comment,
      mood: n.mood,
      sleep: n.sleep
    }));

  async function handleAnalyze() {
    if (comments.length === 0) {
      setError('Нет комментариев для анализа');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      // Получаем текущего пользователя и добавляем userId в тело запроса
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Пожалуйста, войдите в аккаунт для анализа');

      const response = await fetch('/api/notes/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          comments,
          mood: avgMood,
          sleep: avgSleep // avgSleep уже в минутах
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        🤖 ИИ-анализ комментариев
      </h2>

      <p className="text-sm text-gray-600 mb-4">
        Анализирует твои комментарии для выявления паттернов и рекомендаций ({comments.length} комментариев)
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {analysis ? (
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-semibold">✅ Запрос подготовлен</p>
            <p className="text-green-600 text-xs mt-1">ID анализа: {analysis.analysisId}</p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg max-h-[200px] overflow-y-auto">
            <p className="text-blue-700 font-semibold mb-2">📋 Подготовленный запрос:</p>
            <p className="text-blue-600 text-xs whitespace-pre-wrap font-mono">
              {analysis.prompt.substring(0, 300)}...
            </p>
          </div>

          <Button 
            onClick={() => setAnalysis(null)}
            className="w-full bg-gray-500 hover:bg-gray-600"
          >
            Новый анализ
          </Button>
        </div>
      ) : (
        <Button 
          onClick={handleAnalyze}
          disabled={analyzing || comments.length === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
        >
          {analyzing ? '⏳ Анализирую...' : '🔍 Проанализировать'}
        </Button>
      )}
    </Card>
  );
}
