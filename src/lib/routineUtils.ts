import { ExerciseItem, ExerciseMeasureUnit } from '@/types';

export interface RoutineDurationCalculation {
  totalMinutes: number;
  totalSeconds: number;
  formatted: string;
  breakdown: {
    workSeconds: number;
    restSeconds: number;
  };
}

/**
 * Calcula la duración estimada de una rutina a partir de sus ejercicios:
 * - series: número de series
 * - si unidad === 'segundos': el trabajo es el valor en segundos
 * - si unidad === 'repeticiones': el trabajo se estima a 3 segundos por repetición
 * - descanso: segundos de recuperación por serie
 * Duración total = Σ (series * (tiempo_trabajo + descanso))
 */
export function calculateRoutineDuration(
  exercises?: Partial<ExerciseItem>[] | null
): RoutineDurationCalculation {
  if (!exercises || exercises.length === 0) {
    return {
      totalMinutes: 0,
      totalSeconds: 0,
      formatted: '0 min',
      breakdown: { workSeconds: 0, restSeconds: 0 },
    };
  }

  let totalWorkSeconds = 0;
  let totalRestSeconds = 0;

  for (const ex of exercises) {
    if (!ex) continue;
    const sets = ex.sets && Number(ex.sets) > 0 ? Number(ex.sets) : 1;

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

    // Si la unidad es segundos, el tiempo activo de la serie es numVal.
    // Si son repeticiones, estimamos un promedio técnico de 3 segundos por repetición.
    const workSecondsPerSet = unit === 'segundos' ? numVal : numVal * 3;

    totalWorkSeconds += sets * workSecondsPerSet;
    totalRestSeconds += sets * restSec;
  }

  const totalSeconds = totalWorkSeconds + totalRestSeconds;
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
    },
  };
}
