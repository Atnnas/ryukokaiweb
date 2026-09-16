import { ExerciseItem, ExerciseMeasureUnit } from '@/types';

export interface RoutineDurationCalculation {
  totalMinutes: number;
  totalSeconds: number;
  formatted: string;
  breakdown: {
    workSeconds: number;
    restSeconds: number;
    transitionsSeconds: number;
    warmupSeconds: number;
  };
}

/**
 * Helper para calcular los segundos de trabajo activo de una serie individual.
 */
export function getExerciseWorkSecondsPerSet(ex: Partial<ExerciseItem>): number {
  const unit: ExerciseMeasureUnit =
    ex.repsOrDurationUnit === 'segundos' ||
    (typeof ex.reps === 'string' && ex.reps.toLowerCase().includes('seg'))
      ? 'segundos'
      : 'repeticiones';

  const numVal =
    ex.repsOrDurationValue !== undefined && !isNaN(Number(ex.repsOrDurationValue))
      ? Math.max(1, Number(ex.repsOrDurationValue))
      : typeof ex.reps === 'string'
      ? parseInt(ex.reps, 10) || 12
      : 12;

  if (unit === 'segundos') {
    return Math.max(5, numVal);
  }
  // Repeticiones: 4s por repetición técnica + 10s de preparación por serie
  return Math.max(15, numVal * 4 + 10);
}

/**
 * Calcula la duración estimada de una rutina a partir de sus ejercicios con cadencia deportiva/marcial:
 * - Soporta ejercicios individuales y bloques de "Loop" (Súper Series / Circuitos por rondas).
 * - En ejercicios individuales: series * (trabajo + descanso)
 * - En Loops / Súper Series: rondas * (Σ trabajo_ejercicios + Σ descansos_intermedios + descanso_fin_ronda)
 * - Transiciones: 45s entre bloques distintos
 * - Calentamiento base: 300s (5 min) para la sesión dojo
 */
export function calculateRoutineDuration(
  exercises?: Partial<ExerciseItem>[] | null
): RoutineDurationCalculation {
  if (!exercises || exercises.length === 0) {
    return {
      totalMinutes: 0,
      totalSeconds: 0,
      formatted: '0 min',
      breakdown: { workSeconds: 0, restSeconds: 0, transitionsSeconds: 0, warmupSeconds: 0 },
    };
  }

  // Considerar ejercicios que tengan nombre o datos asignados
  const validExercises = exercises.filter(
    (ex) => !!ex && ((ex.name && ex.name.trim().length > 0) || (ex.sets && Number(ex.sets) > 0) || !!ex.loopId)
  );

  const listToCalculate = validExercises.length > 0 ? validExercises : exercises;

  type Block =
    | { type: 'single'; exercise: Partial<ExerciseItem> }
    | {
        type: 'loop';
        loopId: string;
        loopName?: string;
        loopRounds: number;
        loopRestBetweenRounds: number;
        exercises: Partial<ExerciseItem>[];
      };

  const blocks: Block[] = [];
  const loopMap = new Map<string, {
    type: 'loop';
    loopId: string;
    loopName?: string;
    loopRounds: number;
    loopRestBetweenRounds: number;
    exercises: Partial<ExerciseItem>[];
  }>();

  for (const ex of listToCalculate) {
    if (!ex) continue;
    if (ex.loopId) {
      let loopBlock = loopMap.get(ex.loopId);
      if (!loopBlock) {
        loopBlock = {
          type: 'loop',
          loopId: ex.loopId,
          loopName: ex.loopName || 'Súper Serie',
          loopRounds: Math.max(1, Number(ex.loopRounds) || 3),
          loopRestBetweenRounds:
            ex.loopRestBetweenRounds !== undefined && !isNaN(Number(ex.loopRestBetweenRounds))
              ? Math.max(0, Number(ex.loopRestBetweenRounds))
              : 60,
          exercises: [],
        };
        loopMap.set(ex.loopId, loopBlock);
        blocks.push(loopBlock);
      }
      loopBlock.exercises.push(ex);
      if (ex.loopRounds && Number(ex.loopRounds) > 0) loopBlock.loopRounds = Number(ex.loopRounds);
      if (ex.loopRestBetweenRounds !== undefined && !isNaN(Number(ex.loopRestBetweenRounds))) {
        loopBlock.loopRestBetweenRounds = Math.max(0, Number(ex.loopRestBetweenRounds));
      }
      if (ex.loopName) loopBlock.loopName = ex.loopName;
    } else {
      blocks.push({ type: 'single', exercise: ex });
    }
  }

  let totalWorkSeconds = 0;
  let totalRestSeconds = 0;

  for (const block of blocks) {
    if (block.type === 'single') {
      const ex = block.exercise;
      const sets = Math.max(1, Number(ex.sets) || 1);
      const workSecondsPerSet = getExerciseWorkSecondsPerSet(ex);
      const restSec =
        ex.restSeconds !== undefined && !isNaN(Number(ex.restSeconds))
          ? Math.max(0, Number(ex.restSeconds))
          : 45;

      totalWorkSeconds += sets * workSecondsPerSet;
      totalRestSeconds += sets * restSec;
    } else {
      // Bloque Loop / Súper Serie
      const rounds = Math.max(1, block.loopRounds || 3);
      let roundWork = 0;
      let roundRest = 0;

      for (let i = 0; i < block.exercises.length; i++) {
        const ex = block.exercises[i];
        roundWork += getExerciseWorkSecondsPerSet(ex);

        const isLastInLoop = i === block.exercises.length - 1;
        if (!isLastInLoop) {
          // Descanso rápido entre ejercicios dentro de la ronda
          roundRest +=
            ex.restSeconds !== undefined && !isNaN(Number(ex.restSeconds))
              ? Math.max(0, Number(ex.restSeconds))
              : 15;
        } else {
          // Descanso de recuperación completa al terminar la vuelta
          roundRest += block.loopRestBetweenRounds;
        }
      }

      totalWorkSeconds += rounds * roundWork;
      totalRestSeconds += rounds * roundRest;
    }
  }

  // Transición entre bloques distintos (45s entre cada bloque)
  const transitionsSeconds = Math.max(0, blocks.length - 1) * 45;

  // Calentamiento y acondicionamiento marcial inicial (5 min = 300s si hay ejercicios)
  const warmupSeconds = listToCalculate.length > 0 ? 300 : 0;

  const totalSeconds = totalWorkSeconds + totalRestSeconds + transitionsSeconds + warmupSeconds;
  const totalMinutes = totalSeconds > 0 ? Math.max(1, Math.round(totalSeconds / 60)) : 0;

  const mins = Math.floor(totalSeconds / 60);
  const remainingSecs = totalSeconds % 60;
  let formatted = '';
  if (mins > 0 && remainingSecs > 0) {
    formatted = `${mins} min ${remainingSecs} s`;
  } else if (mins > 0) {
    formatted = `${mins} min`;
  } else {
    formatted = `${totalSeconds} s`;
  }

  return {
    totalMinutes,
    totalSeconds,
    formatted,
    breakdown: {
      workSeconds: totalWorkSeconds,
      restSeconds: totalRestSeconds,
      transitionsSeconds,
      warmupSeconds,
    },
  };
}
