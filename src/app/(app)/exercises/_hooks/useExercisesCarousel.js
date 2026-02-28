import { useState, useCallback } from "react";
import { EXERCISES } from "../_data/exercisesData";

export function useExercisesCarousel() {
  const [exerciseIdx, setExerciseIdx] = useState(0);

  const pickedExercise = EXERCISES[exerciseIdx];

  const prevExercise = useCallback(() => {
    setExerciseIdx((i) => (i - 1 + EXERCISES.length) % EXERCISES.length);
  }, []);

  const nextExercise = useCallback(() => {
    setExerciseIdx((i) => (i + 1) % EXERCISES.length);
  }, []);

  const pickRandomExercise = useCallback(() => {
    if (EXERCISES.length <= 1) return;
    setExerciseIdx((i) => {
      let n = Math.floor(Math.random() * EXERCISES.length);
      if (n === i) n = (n + 1) % EXERCISES.length;
      return n;
    });
  }, []);

  return {
    pickedExercise,
    prevExercise,
    nextExercise,
    pickRandomExercise,
  };
}
