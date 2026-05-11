'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PsychologistCharacter from './PsychologistCharacter';

/**
 * CharacterController - контейнер для управления персонажом психолога
 * Автоматически показывает/скрывает персонажа и меняет эмоции в зависимости от состояния чата
 */
export default function CharacterController({
  chatMessages,
  isLoading,
  position = 'right',
  size = 'medium',
  showCharacter = true,
}) {
  const [showThoughts] = useState(false);
  const [thoughtText, setThoughtText] = useState('');

  const emotion = useMemo(() => {
    if (isLoading) {
      return 'thinking';
    }

    if (!chatMessages || chatMessages.length === 0) {
      return 'happy';
    }

    const lastMessage = chatMessages[chatMessages.length - 1];

    // Анализируем последнее сообщение пользователя для определения эмоции
    if (lastMessage.role === 'user') {
      const content = lastMessage.content.toLowerCase();

      // Признаки беспокойства/тревоги
      if (
        content.includes('беспокой') ||
        content.includes('тревог') ||
        content.includes('страх') ||
        content.includes('паник') ||
        content.includes('грустно') ||
        content.includes('плач')
      ) {
        return 'concerned';
      }
      // Признаки позитивного настроения
      else if (
        content.includes('спасибо') ||
        content.includes('хорошо') ||
        content.includes('стало лучше') ||
        content.includes('помог')
      ) {
        return 'happy';
      }
      // Вопросы - слушаем
      else if (content.includes('?')) {
        return 'listening';
      }
      // Стандартное состояние слушания
      else {
        return 'listening';
      }
    }
    // Когда AI отвечает - счастливое состояние
    else if (lastMessage.role === 'assistant') {
      return 'happy';
    }

    return 'neutral';
  }, [chatMessages, isLoading]);

  if (!showCharacter) return null;

  return (
    <AnimatePresence>
      {showCharacter && (
        <PsychologistCharacter
          isActive={isLoading}
          emotion={emotion}
          showThoughts={showThoughts}
          thoughtText={thoughtText}
          position={position}
          size={size}
          animated={true}
        />
      )}
    </AnimatePresence>
  );
}
