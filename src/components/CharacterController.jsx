'use client';

import { useState, useEffect } from 'react';
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
  const [emotion, setEmotion] = useState('neutral');
  const [showThoughts, setShowThoughts] = useState(false);
  const [thoughtText, setThoughtText] = useState('');

  // Логика для изменения эмоций на основе сообщений
  useEffect(() => {
    if (isLoading) {
      setEmotion('thinking');
      setShowThoughts(false); // Убрали фиолетовое облако
      return;
    }

    if (!chatMessages || chatMessages.length === 0) {
      setEmotion('happy');
      setShowThoughts(false);
      return;
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
        setEmotion('concerned');
        setShowThoughts(false);
      }
      // Признаки позитивного настроения
      else if (
        content.includes('спасибо') ||
        content.includes('хорошо') ||
        content.includes('стало лучше') ||
        content.includes('помог')
      ) {
        setEmotion('happy');
        setShowThoughts(false);
      }
      // Вопросы - слушаем
      else if (content.includes('?')) {
        setEmotion('listening');
        setShowThoughts(false);
      }
      // Стандартное состояние слушания
      else {
        setEmotion('listening');
        setShowThoughts(false);
      }
    }
    // Когда AI отвечает - счастливое состояние
    else if (lastMessage.role === 'assistant') {
      setEmotion('happy');
      setShowThoughts(false);
    }
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
