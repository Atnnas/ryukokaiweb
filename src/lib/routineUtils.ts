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
 * Calcula la duración estimada de una rutina a partir de sus ejercicios con cadencia deportiva/marcial:
 * - series: número de series por ejercicio (mínimo 1)
 * - si unidad === 'segundos': el trabajo activo es el valor en segundos (mínimo 5s)
 * - si unidad === 'repeticiones': cada repetición se estima a 4 segundos de ejecución técnica
 *   + 10 segundos de preparación de postura/respiración por serie (mínimo 15s de trabajo por serie)
 * - descanso: segundos de pausa por serie (por defecto 45s)
 * - transiciones: 45s entre estaciones/ejercicios diferentes
 * - calentamiento base: 300s (5 min) para la sesión dojo
 * Duración total = Σ (series * (trabajo + descanso)) + transiciones + calentamiento
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
    (ex) => !!ex && ((ex.name && ex.name.trim().length > 0) || (ex.sets && Number(ex.sets) > 0))
  );

  const listToCalculate = validExercises.length > 0 ? validExercises : exercises;

  let totalWorkSeconds = 0;
  let totalRestSeconds = 0;

  for (const ex of listToCalculate) {
    if (!ex) continue;
    const sets = Math.max(1, Number(ex.sets) || 1);

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

    const restSec =
      ex.restSeconds !== undefined && !isNaN(Number(ex.restSeconds))
        ? Math.max(0, Number(ex.restSeconds))
        : 45;

    // Cálculo estimado de trabajo por serie
    let workSecondsPerSet: number;
    if (unit === 'segundos') {
      workSecondsPerSet = Math.max(5, numVal);
    } else {
      // Repeticiones: 4s por repetición técnica + 10s de preparación por serie
      workSecondsPerSet = Math.max(15, numVal * 4 + 10);
    }

    totalWorkSeconds += sets * workSecondsPerSet;
    totalRestSeconds += sets * restSec;
  }

  // Transición entre ejercicios (45s entre cada ejercicio)
  const transitionsSeconds = Math.max(0, listToCalculate.length - 1) * 45;

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
