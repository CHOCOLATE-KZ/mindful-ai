'use client';

import PsychologistCharacter from './PsychologistCharacter';
import { motion } from 'framer-motion';

/**
 * Предустановленные сцены персонажа для распространённых случаев
 */

export function WelcomingCharacter() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <PsychologistCharacter
        emotion="happy"
        position="center"
        size="medium"
        animated={true}
      />
      <motion.div
        className="text-center mt-16 text-lg font-semibold text-gray-700 dark:text-gray-300"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Добро пожаловать! 👋 <br />
        Я здесь, чтобы помочь вам.
      </motion.div>
    </motion.div>
  );
}

export function ListerCharacter() {
  return (
    <PsychologistCharacter
      emotion="listening"
      showThoughts={true}
      thoughtText="Я вас внимательно слушаю..."
      position="right"
      size="medium"
      animated={true}
    />
  );
}

export function ThinkingCharacter() {
  return (
    <PsychologistCharacter
      emotion="thinking"
      isActive={true}
      showThoughts={true}
      thoughtText="Анализирую ситуацию..."
      position="right"
      size="medium"
      animated={true}
    />
  );
}

export function ConcernedCharacter() {
  return (
    <PsychologistCharacter
      emotion="concerned"
      showThoughts={true}
      thoughtText="Я понимаю вашу озабоченность"
      position="left"
      size="medium"
      animated={true}
    />
  );
}

export function EncouragingCharacter() {
  return (
    <PsychologistCharacter
      emotion="happy"
      showThoughts={true}
      thoughtText="Вы отлично справляетесь!"
      position="right"
      size="medium"
      animated={true}
    />
  );
}

/**
 * CharacterScene - комплексная сцена с персонажем и контекстной информацией
 */
export function CharacterScene({
  type = 'welcome', // 'welcome', 'listening', 'thinking', 'concerned', 'encouraging'
  subtitle = '',
  showBackground = true,
}) {
  const componentMap = {
    welcome: WelcomingCharacter,
    listening: ListerCharacter,
    thinking: ThinkingCharacter,
    concerned: ConcernedCharacter,
    encouraging: EncouragingCharacter,
  };

  const Component = componentMap[type] || WelcomingCharacter;

  return (
    <div className={`relative w-full py-12 ${showBackground ? 'bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800' : ''}`}>
      <div className="relative min-h-[400px] flex items-center justify-center">
        <Component />
      </div>

      {subtitle && (
        <motion.div
          className="text-center mt-8 text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p>{subtitle}</p>
        </motion.div>
      )}
    </div>
  );
}
