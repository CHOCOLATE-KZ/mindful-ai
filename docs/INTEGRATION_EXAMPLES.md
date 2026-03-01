// ======================================
// ПРИМЕРЫ ИНТЕГРАЦИИ ПЕРСОНАЖА ПСИХОЛОГА
// ======================================

/*
  Этот файл содержит готовые примеры для интеграции персонажа
  на разные страницы вашего проекта
*/

// ========== ПРИМЕР 1: ЧАТА (ОСНОВНАЯ ИНТЕГРАЦИЯ) ==========

// Файл: src/app/(app)/chat/page.js

/*
"use client";

import { useState, useEffect } from "react";
import ChatHeader from "./_components/ChatHeader";
import ChatComposer from "./_components/ChatComposer";
import ChatBackground from "./_components/ChatBackground";
import ChatSidebar from "./_components/ChatSidebar";
import CharacterController from "@/components/CharacterController";  // ← ДОБАВЬТЕ
import AnchorTooltip from "./_components/AnchorTooltip";
import ScrollToTopButton from "./_components/ScrollToTopButton";
import ChatConversation from "./_components/ChatConversation";
import { useChatPageModel } from "./_hooks/useChatPageModel";

export default function ChatPage() {
  const {
    messages,
    input,
    loading,
    atBottom,
    savedNotes,
    // ... остальные переменные
  } = useChatPageModel();

  return (
    <div className="min-h-dvh flex flex-col bg-white text-slate-900 relative">
      <ChatBackground />

      {/* ДОБАВЬТЕ ПЕРСОНАЖА */}
      <CharacterController
        chatMessages={messages}
        isLoading={loading}
        position="right"
        size="medium"
        showCharacter={true}
      />

      <ChatHeader {...headerProps} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-48 pr-40">
        {/* Добавьте pr-40 чтобы персонаж не перекрывал контент */}
        <ChatSidebar {...sidebarProps} />
        <ChatConversation {...conversationProps} />
      </div>

      <ChatComposer {...composerProps} />
      <ScrollToTopButton onClick={scrollToTop} />
      <AnchorTooltip show={showAnchorTooltip} position={tooltipPosition} />
    </div>
  );
}
*/

// ========== ПРИМЕР 2: СТРАНИЦА УПРАЖНЕНИЙ (EXERCISES) ==========

/*
// Файл: src/app/(app)/exercises/page.js

"use client";

import { useState } from "react";
import PsychologistCharacter from "@/components/PsychologistCharacter";
import { getEmotionFromText } from "@/components/CharacterHooks";

export default function ExercisesPage() {
  const [currentExercise, setCurrentExercise] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [characterEmotion, setCharacterEmotion] = useState("happy");

  const handleExerciseSelect = (exercise) => {
    setCurrentExercise(exercise);
    setIsCompleted(false);
    setCharacterEmotion("listening");
  };

  const handleExerciseComplete = () => {
    setIsCompleted(true);
    setCharacterEmotion("happy");
    setTimeout(() => {
      setCharacterEmotion("neutral");
    }, 5000);
  };

  return (
    <div className="relative min-h-screen p-8">
      <h1>Упражнения для эмоционального благополучия</h1>

      {/* Персонаж присутствует во время выполнения упражнения */}
      {currentExercise && (
        <PsychologistCharacter
          emotion={characterEmotion}
          isActive={!isCompleted}
          showThoughts={isCompleted}
          thoughtText="Отлично сделано! Вы двигаетесь в правильном направлении."
          position="right"
          size="medium"
        />
      )}

      <div className="max-w-3xl mx-auto">
        {/* Список упражнений */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Карточки упражнений */}
        </div>

        {/* Текущее упражнение */}
        {currentExercise && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h2>{currentExercise.title}</h2>
            <p>{currentExercise.description}</p>
            <button
              onClick={handleExerciseComplete}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
            >
              Завершить упражнение
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
*/

// ========== ПРИМЕР 3: СТРАНИЦА АНАЛИТИКИ (ANALYTICS) ==========

/*
// Файл: src/app/(app)/analytics/page.js

"use client";

import { useState, useEffect } from "react";
import PsychologistCharacter from "@/components/PsychologistCharacter";
import { CharacterScene } from "@/components/CharacterScenes";

export default function AnalyticsPage() {
  const [dataLoading, setDataLoading] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setDataLoading(false);
      setAnalysisComplete(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen p-8">
      {dataLoading ? (
        // Während загрузки показываем персонажа с мыслями
        <PsychologistCharacter
          emotion="thinking"
          isActive={true}
          showThoughts={true}
          thoughtText="Анализирую вашу активность..."
          position="center"
          size="medium"
        />
      ) : (
        <>
          {/* После анализа показываем сцену с результатами */}
          <CharacterScene
            type="encouraging"
            subtitle="Вы делаете хороший прогресс! Продолжайте заботиться о себе."
            showBackground={true}
          />

          <div className="max-w-5xl mx-auto mt-16">
            {/* Ваши графики и статистика */}
            <div className="grid grid-cols-2 gap-8">
              {/* Карточки аналитики */}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
*/

// ========== ПРИМЕР 4: СТРАНИЦА ЗАМЕТОК (NOTES) ==========

/*
// Файл: src/app/(app)/notes/page.js

"use client";

import { useState } from "react";
import CharacterController from "@/components/CharacterController";
import { usePsychologistCharacter } from "@/components/CharacterHooks";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const character = usePsychologistCharacter();

  const handleAnalyzeNote = async (note) => {
    setSelectedNote(note);
    setIsAnalyzing(true);
    character.setCharacterEmotion("thinking", "Анализирую вашу заметку...");

    // Имитация анализа
    await new Promise((r) => setTimeout(r, 2000));

    setIsAnalyzing(false);
    character.setCharacterEmotion(
      "happy",
      "Спасибо за то, что поделились своими мыслями!"
    );
  };

  return (
    <div className="relative min-h-screen p-8">
      {/* Персонаж меняет эмоции в зависимости от состояния */}
      {character.renderCharacter({
        position: "right",
        size: "medium",
      })}

      <div className="max-w-4xl mx-auto">
        <h1>Ваши заметки</h1>

        {selectedNote && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2>{selectedNote.title}</h2>
            <p>{selectedNote.content}</p>
            {isAnalyzing && <div className="mt-4">Анализируется...</div>}
          </div>
        )}

        <div className="grid gap-4 mt-8">
          {notes.map((note) => (
            <div key={note.id} className="p-4 bg-white rounded-lg shadow">
              <h3 onClick={() => handleAnalyzeNote(note)}>{note.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
*/

// ========== ПРИМЕР 5: СТРАНИЦА ТЕСТИРОВАНИЯ ЯЗЫКА (LANGUAGE TEST) ==========

/*
// Файл: src/app/(app)/language-test/page.js

"use client";

import { useState } from "react";
import PsychologistCharacter from "@/components/PsychologistCharacter";

export default function LanguageTestPage() {
  const [testActive, setTestActive] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testComplete, setTestComplete] = useState(false);

  return (
    <div className="relative min-h-screen p-8">
      {testActive ? (
        // Во время теста - персонаж в режиме слушания
        <PsychologistCharacter
          emotion={testProgress < 50 ? "listening" : "thinking"}
          isActive={!testComplete}
          showThoughts={true}
          thoughtText={
            testProgress < 50
              ? "Прислушайтесь к себе..."
              : "Вы почти готовы..."
          }
          position="left"
          size="medium"
        />
      ) : (
        // Перед тестом - приветствие
        <PsychologistCharacter
          emotion="happy"
          showThoughts={true}
          thoughtText="Готовы ли вы пройти тест?"
          position="center"
          size="large"
        />
      )}

      <div className="max-w-3xl mx-auto">
        {/* Контент теста */}
      </div>
    </div>
  );
}
*/

// ========== ПРИМЕР 6: ИНТЕГРАЦИЯ В CUSTOM HOOK ==========

/*
// Файл: src/hooks/useCharacterEmotion.js

import { useCallback } from "react";
import {
  getEmotionFromText,
  getThoughtText,
} from "@/components/CharacterHooks";

export function useCharacterEmotion() {
  const getCharacterResponse = useCallback((userMessage, isAIResponding) => {
    if (isAIResponding) {
      return {
        emotion: "thinking",
        showThoughts: true,
        thoughtText: getThoughtText("thinking"),
      };
    }

    const emotion = getEmotionFromText(userMessage);

    return {
      emotion,
      showThoughts: emotion !== "neutral",
      thoughtText: getThoughtText(emotion, userMessage),
    };
  }, []);

  return { getCharacterResponse };
}

// Использование в компоненте:
/*
const { getCharacterResponse } = useCharacterEmotion();

const handleMessage = (message) => {
  const characterState = getCharacterResponse(message, loading);
  setCharacterEmotion(characterState.emotion);
  setShowThoughts(characterState.showThoughts);
  setThoughtText(characterState.thoughtText);
};
*/

// ========== ПРИМЕР 7: УСЛОВНОЕ ОТОБРАЖЕНИЕ НА МОБИЛЬНЫХ ==========

/*
// Скрыть персонажа на маленьких экранах для оптимизации

import { useMediaQuery } from "@/hooks/useMediaQuery";
import PsychologistCharacter from "@/components/PsychologistCharacter";

export default function ChatPage() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div>
      {isDesktop && (
        <PsychologistCharacter
          emotion="happy"
          position="right"
          size="small" // Используйте 'small' на больших экранах
        />
      )}
      {/* Остальной контент */}
    </div>
  );
}
*/

// ========== ПРИМЕР 8: ДИНАМИЧЕСКОЕ ОКРАШИВАНИЕ ПЕРСОНАЖА ==========

/*
// Изменение цветов персонажа на основе темы или брендинга

import { useTheme } from "next-themes";

export function DynamicCharacter(props) {
  const { theme } = useTheme();

  // Вы можете передавать цвета как переменные CSS
  // или создать несколько версий персонажа

  return (
    <div
      style={{
        "--character-primary": theme === "dark" ? "#60a5fa" : "#4a90e2",
      }}
    >
      <PsychologistCharacter {...props} />
    </div>
  );
}
*/

export default {
  examples: "Смотрите примеры выше для интеграции на разные страницы",
};
