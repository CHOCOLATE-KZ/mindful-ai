/**
 * 📚 ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ - Система анализа заметок
 * 
 * Все требования реализованы и готовы к использованию
 */

// ═══════════════════════════════════════════════════════════════
// 1️⃣ ПРИМЕР: Получение и фильтрация заметок
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser';

function ExampleGetNotes() {
  const [fullNotes, setFullNotes] = useState([]);
  const [quickNotes, setQuickNotes] = useState([]);

  useEffect(() => {
    const loadNotes = async () => {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      // Разделение
      const full = data.filter(n => n.mood != null || n.sleep != null);
      const quick = data.filter(n => n.mood == null && n.sleep == null && n.comment);

      setFullNotes(full);
      setQuickNotes(quick);
    };

    loadNotes();
  }, []);

  return (
    <div>
      <h2>Полные заметки: {fullNotes.length}</h2>
      <h2>Мини-заметки: {quickNotes.length}</h2>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2️⃣ ПРИМЕР: Использование хука для аналитики
// ═══════════════════════════════════════════════════════════════

import { useNotesAnalytics } from '@/app/(app)/notes/_hooks/useNotesAnalytics';

function ExampleAnalytics() {
  const notes = []; // Из вашего состояния
  
  const {
    avgMood,
    avgSleep,
    emotionalInsights,
    moodSleepCorrelation,
    aiAnalysisPayload
  } = useNotesAnalytics(notes);

  return (
    <div>
      <p>Среднее настроение: {avgMood}/10</p>
      <p>Средний сон: {avgSleep} минут</p>
      
      {emotionalInsights && (
        <div>
          <p>Стабильность: {emotionalInsights.moodStability}</p>
          <p>Дней записей: {emotionalInsights.totalDays}</p>
        </div>
      )}

      {moodSleepCorrelation && (
        <p>Связь настроения и сна: {moodSleepCorrelation.interpretation}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3️⃣ ПРИМЕР: Отправка данных на ИИ-анализ
// ═══════════════════════════════════════════════════════════════

async function exampleAIAnalysis(notes, avgMood, avgSleep) {
  const comments = notes
    .filter(n => n.comment)
    .map(n => ({
      date: n.date,
      text: n.comment,
      mood: n.mood,
      sleep: n.sleep
    }));

  try {
    const response = await fetch('/api/notes/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comments,
        mood: avgMood,
        sleep: Math.round(avgSleep / 60)
      })
    });

    const data = await response.json();
    console.log('Анализ готов:', data.analysisId);
    console.log('Запрос для ИИ:', data.prompt);

    return data;
  } catch (error) {
    console.error('Ошибка анализа:', error);
  }
}

// ═══════════════════════════════════════════════════════════════
// 4️⃣ ПРИМЕР: Интеграция с OpenAI
// ═══════════════════════════════════════════════════════════════

async function exampleOpenAIIntegration(analysisPrompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Ты профессиональный психолог-консультант. Анализируй данные заметок и предоставляй конструктивные рекомендации.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

// ═══════════════════════════════════════════════════════════════
// 5️⃣ ПРИМЕР: Интеграция с Ollama (локальное)
// ═══════════════════════════════════════════════════════════════

async function exampleOllamaIntegration(analysisPrompt) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    body: JSON.stringify({
      model: 'mistral',
      prompt: analysisPrompt,
      stream: false
    })
  });

  const data = await response.json();
  return data.response;
}

// ═══════════════════════════════════════════════════════════════
// 6️⃣ ПРИМЕР: Сохранение анализа в БД
// ═══════════════════════════════════════════════════════════════

async function exampleSaveAnalysisResult(userId, analysisId, aiResponse) {
  const supabase = supabaseBrowser();

  const { error } = await supabase
    .from('notes_analysis_results')
    .insert({
      analysis_id: analysisId,
      user_id: userId,
      ai_response: aiResponse,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Ошибка сохранения:', error);
  } else {
    console.log('Анализ успешно сохранен');
  }
}

// ═══════════════════════════════════════════════════════════════
// 7️⃣ ПРИМЕР: Полный цикл анализа в компоненте
// ═══════════════════════════════════════════════════════════════

function CompleteAnalysisExample() {
  const [notes, setNotes] = useState([]);
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const { avgMood, avgSleep, aiAnalysisPayload } = useNotesAnalytics(notes);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // Шаг 1: Подготовка данных
      const analysisData = await fetch('/api/notes/analyze', {
        method: 'POST',
        body: JSON.stringify({
          comments: aiAnalysisPayload.allComments,
          mood: avgMood,
          sleep: avgSleep
        })
      }).then(r => r.json());

      // Шаг 2: Отправка на ИИ
      const response = await exampleOpenAIIntegration(analysisData.prompt);

      // Шаг 3: Сохранение результата
      const { data: { user } } = await supabase.auth.getUser();
      await exampleSaveAnalysisResult(user.id, analysisData.analysisId, response);

      setAiResponse(response);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Анализирую...' : 'Запустить ИИ-анализ'}
      </button>
      {aiResponse && <div className="mt-4">{aiResponse}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 8️⃣ ПРИМЕР: Экспорт данных для анализа
// ═══════════════════════════════════════════════════════════════

function exampleExportData(notes) {
  const { aiAnalysisPayload } = useNotesAnalytics(notes);

  // JSON для передачи в другие сервисы
  const jsonData = JSON.stringify(aiAnalysisPayload, null, 2);
  
  // Скачивание файла
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `notes-analysis-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

// ═══════════════════════════════════════════════════════════════
// 9️⃣ ПРИМЕР: Анализ трендов
// ═══════════════════════════════════════════════════════════════

function exampleTrendAnalysis(notes) {
  const fullNotes = notes.filter(n => n.mood != null);
  
  if (fullNotes.length < 2) return null;

  const recent = fullNotes.slice(0, 7);
  const previous = fullNotes.slice(7, 14);

  const recentAvg = recent.reduce((sum, n) => sum + n.mood, 0) / recent.length;
  const previousAvg = previous.reduce((sum, n) => sum + n.mood, 0) / previous.length;

  const trend = recentAvg > previousAvg ? '📈 Улучшение' : recentAvg < previousAvg ? '📉 Снижение' : '➡️ Стабильно';

  return {
    trend,
    change: (recentAvg - previousAvg).toFixed(1),
    recentAverage: recentAvg.toFixed(1),
    previousAverage: previousAvg.toFixed(1)
  };
}

// ═══════════════════════════════════════════════════════════════
// 🔟 SQL МИГРАЦИЯ: Таблица для анализа
// ═══════════════════════════════════════════════════════════════

const sqlMigration = `
-- Основная таблица заметок
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date TIMESTAMP DEFAULT NOW(),
  mood INT CHECK (mood >= 1 AND mood <= 10),
  sleep INT CHECK (sleep >= 0),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица для сохранения результатов анализа
CREATE TABLE notes_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  comments_count INT,
  analyzed_at TIMESTAMP DEFAULT NOW()
);

-- Таблица для хранения результатов ИИ-анализа
CREATE TABLE notes_analysis_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES notes_analysis ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes_analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Индексы для производительности
CREATE INDEX notes_user_id_date_idx ON notes(user_id, date DESC);
CREATE INDEX notes_user_id_mood_idx ON notes(user_id, mood);
CREATE INDEX notes_analysis_user_id_idx ON notes_analysis(user_id);
`;

export default CompleteAnalysisExample;

export {
  ExampleGetNotes,
  ExampleAnalytics,
  exampleAIAnalysis,
  exampleOpenAIIntegration,
  exampleOllamaIntegration,
  exampleSaveAnalysisResult,
  exampleExportData,
  exampleTrendAnalysis,
  sqlMigration
};
