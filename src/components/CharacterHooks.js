'use client';

import { useState, useCallback } from 'react';
import PsychologistCharacter from './PsychologistCharacter';

/**
 * Hook для управления состоянием персонажа в чатах
 * Автоматически обновляет эмоцию на основе типа сообщения
 */
export function usePsychologistCharacter() {
  const [emotion, setEmotion] = useState('neutral');
  const [thoughtText, setThoughtText] = useState('');
  const [showThoughts, setShowThoughts] = useState(false);

  const setCharacterEmotion = useCallback((newEmotion, thoughts = '') => {
    setEmotion(newEmotion);
    if (thoughts) {
      setThoughtText(thoughts);
      setShowThoughts(true);
    } else {
      setShowThoughts(false);
    }
  }, []);

  const resetCharacter = useCallback(() => {
    setEmotion('neutral');
    setThoughtText('');
    setShowThoughts(false);
  }, []);

  return {
    emotion,
    thoughtText,
    showThoughts,
    setCharacterEmotion,
    resetCharacter,
    renderCharacter: (props = {}) => (
      <PsychologistCharacter
        emotion={emotion}
        showThoughts={showThoughts}
        thoughtText={thoughtText}
        animated={true}
        {...props}
      />
    ),
  };
}

/**
 * Утилиты для анализа сообщений и определения подходящей эмоции
 */
export const EmotionKeywords = {
  concerned: [
    'беспокой',
    'тревог',
    'страх',
    'паник',
    'грустно',
    'плач',
    'депресс',
    'одиноч',
    'суицид',
    'больно',
  ],
  happy: [
    'спасибо',
    'благодар',
    'хорошо',
    'стало лучше',
    'помог',
    'работает',
    '',
    '',
    'отлич',
    'замечател',
  ],
  thinking: [
    'что значит',
    'почему',
    'как',
    'объясни',
    'разъясни',
    'помощь',
    'совет',
    'рекомендация',
  ],
};

/**
 * Функция для определения эмоции на основе текста
 */
export function getEmotionFromText(text) {
  const lowerText = text.toLowerCase();

  for (const [emotion, keywords] of Object.entries(EmotionKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return emotion;
      }
    }
  }

  return 'listening';
}

/**
 * Функция для определения текста мыслей на основе эмоции и контекста
 */
export function getThoughtText(emotion, userMessage = '') {
  const thoughts = {
    concerned: [
      'Я вас слушаю...',
      'Это важно...',
      'Давайте разберемся...',
      'Ваши чувства важны...',
    ],
    happy: [
      'Рада помочь!',
      'Это замечательно!',
      'Продолжайте в том же духе!',
    ],
    thinking: [
      'Интересный вопрос...',
      'Давайте разберемся...',
      'Размышляю...',
      'Отличное наблюдение...',
    ],
    listening: [
      'Я вас слушаю...',
      'Продолжайте, пожалуйста...',
      'Я понимаю...',
    ],
  };

  const emotionThoughts = thoughts[emotion] || thoughts.listening;
  return emotionThoughts[Math.floor(Math.random() * emotionThoughts.length)];
}

/**
 * Компонент для демонстрации всех эмоций персонажа
 */
export function CharacterShowcase() {
  const emotions = ['neutral', 'happy', 'listening', 'thinking', 'concerned'];
  const [selected, setSelected] = useState('neutral');

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 justify-center">
        {emotions.map((emotion) => (
          <button
            key={emotion}
            onClick={() => setSelected(emotion)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selected === emotion
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {emotion}
          </button>
        ))}
      </div>

      <div className="relative min-h-[400px] bg-gray-50 rounded-lg p-8 flex items-center justify-center">
        <PsychologistCharacter
          emotion={selected}
          isActive={selected === 'thinking'}
          showThoughts={selected !== 'neutral'}
          thoughtText={getThoughtText(selected)}
          position="center"
          size="medium"
        />
      </div>
    </div>
  );
}
