/**
 * Sistema de Racha Marcial de Ryoku Kai (Tanren Streak System)
 * Reglas:
 * 1. La racha se gana y activa a partir del 3er día de entrenamiento consecutivo (consecutiveDays >= 3).
 * 2. Por cada 5 días de entrenamiento se gana 1 día de descanso libre (Escudo de Racha).
 * 3. Si un día no se entrena y se cuenta con días de descanso acumulados, se consume 1 y la racha se preserva.
 * 4. Si no se entrena y no hay días de descanso disponibles, la racha se pierde y vuelve a 0.
 */

export interface StreakCalculation {
  streak: number;
  consecutiveDays: number;
  isStreakActive: boolean;
  daysNeededForStreak: number;
  restDaysAvailable: number;
  restDaysUsed: number;
  daysUntilNextRestDay: number;
  statusMessage: string;
}

export interface WorkoutIntegrityCheck {
  isRushed: boolean;
  isValidForStreak: boolean;
  minHonestSeconds: number;
  reason?: string;
}

/**
 * Evalúa si una rutina fue completada a un ritmo apresurado o simulado (Makoto / Honestidad Marcial)
 */
export function evaluateWorkoutHonesty(params: {
  durationSeconds: number;
  stepsCount: number;
  estimatedMinutes?: number;
  steps?: { targetQuantity: number; targetUnit: string }[];
}): WorkoutIntegrityCheck {
  const { durationSeconds, stepsCount, estimatedMinutes, steps } = params;

  let minHonestSeconds = 0;

  if (steps && steps.length > 0) {
    let stepsSum = 0;
    for (const step of steps) {
      if (step.targetUnit === 'segundos') {
        // Al menos el 25% del tiempo establecido o mínimo 5s por ejercicio
        stepsSum += Math.max(5, Math.floor(step.targetQuantity * 0.25));
      } else {
        // Al menos 0.6s por repetición marcial o mínimo 5s por serie
        stepsSum += Math.max(5, Math.floor(step.targetQuantity * 0.6));
      }
    }
    // Mínimo de transición entre ejercicios (2 segundos por paso)
    stepsSum += Math.max(0, (steps.length - 1) * 2);

    const estimatedMinSecs = estimatedMinutes ? Math.floor(estimatedMinutes * 60 * 0.15) : 0;
    minHonestSeconds = Math.max(stepsSum, estimatedMinSecs, stepsCount * 4, 25);
  } else {
    const estimatedMinSecs = estimatedMinutes ? Math.floor(estimatedMinutes * 60 * 0.18) : 0;
    minHonestSeconds = Math.max(stepsCount * 4, estimatedMinSecs, 25);
  }

  const isRushed = durationSeconds < minHonestSeconds;

  return {
    isRushed,
    isValidForStreak: !isRushed,
    minHonestSeconds,
    reason: isRushed
      ? `Tiempo invertido (${durationSeconds}s) muy inferior al mínimo requerido (${minHonestSeconds}s) para ${stepsCount} ejercicios.`
      : undefined,
  };
}

export function formatDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, days: number): Date {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return res;
}

export function calculateMartialStreak(
  trainedDatesArray: string[],
  referenceDate: Date = new Date()
): StreakCalculation {
  if (!trainedDatesArray || trainedDatesArray.length === 0) {
    return {
      streak: 0,
      consecutiveDays: 0,
      isStreakActive: false,
      daysNeededForStreak: 3,
      restDaysAvailable: 0,
      restDaysUsed: 0,
      daysUntilNextRestDay: 5,
      statusMessage: 'Inicia hoy tu primer entrenamiento para activar tu racha marcial (3 días seguidos para activarla).',
    };
  }

  // Filtrar fechas únicas válidas y ordenarlas cronológicamente
  const uniqueDates = Array.from(new Set(trainedDatesArray.filter(Boolean))).sort();
  if (uniqueDates.length === 0) {
    return {
      streak: 0,
      consecutiveDays: 0,
      isStreakActive: false,
      daysNeededForStreak: 3,
      restDaysAvailable: 0,
      restDaysUsed: 0,
      daysUntilNextRestDay: 5,
      statusMessage: 'Inicia hoy tu primer entrenamiento para activar tu racha marcial.',
    };
  }

  const trainedSet = new Set(uniqueDates);
  const todayStr = formatDateString(referenceDate);

  // Comenzar a recorrer desde la primera fecha registrada
  const [sy, sm, sd] = uniqueDates[0].split('-').map(Number);
  let current = new Date(sy, sm - 1, sd);

  let currentStreak = 0;
  let restDaysBank = 0;
  let restDaysUsed = 0;
  let trainingDaysCounterForRest = 0;

  // Recorremos día a día hasta la fecha de hoy
  while (formatDateString(current) <= todayStr) {
    const dStr = formatDateString(current);
    const isToday = dStr === todayStr;

    if (trainedSet.has(dStr)) {
      // El practicante completó un entrenamiento este día
      currentStreak++;
      trainingDaysCounterForRest++;

      // Por cada 5 días de entrenamiento gana 1 día de descanso libre
      if (trainingDaysCounterForRest >= 5) {
        restDaysBank++;
        trainingDaysCounterForRest = 0;
      }
    } else {
      // El practicante NO entrenó este día
      if (isToday) {
        // Hoy aún está en curso, no penalizamos antes de que termine el día
        break;
      }

      // Si fue un día pasado sin entrenamiento:
      if (restDaysBank > 0) {
        // Usa un día de descanso ganado para proteger la racha
        restDaysBank--;
        restDaysUsed++;
      } else {
        // No hay días de descanso disponibles: se rompe la racha
        currentStreak = 0;
        trainingDaysCounterForRest = 0;
        restDaysBank = 0;
      }
    }

    current = addDays(current, 1);
  }

  const isStreakActive = currentStreak >= 3;
  const daysNeededForStreak = isStreakActive ? 0 : Math.max(0, 3 - currentStreak);
  const daysUntilNextRestDay = 5 - trainingDaysCounterForRest;

  let statusMessage = '';
  if (isStreakActive) {
    if (restDaysBank > 0) {
      statusMessage = `🔥 ¡Racha activa de ${currentStreak} días! Tienes ${restDaysBank} día${restDaysBank === 1 ? '' : 's'} de descanso disponible${restDaysBank === 1 ? '' : 's'}.`;
    } else {
      statusMessage = `🔥 ¡Racha activa de ${currentStreak} días! Te faltan ${daysUntilNextRestDay} día${daysUntilNextRestDay === 1 ? '' : 's'} para ganar 1 día de descanso libre.`;
    }
  } else if (currentStreak > 0) {
    statusMessage = `Llevas ${currentStreak}/3 días seguidos. ¡Falta${daysNeededForStreak === 1 ? '' : 'n'} ${daysNeededForStreak} día${daysNeededForStreak === 1 ? '' : 's'} para activar tu racha marcial! 🔥`;
  } else {
    statusMessage = 'Inicia hoy tu entrenamiento (se gana la racha tras 3 días consecutivos).';
  }

  return {
    streak: isStreakActive ? currentStreak : 0,
    consecutiveDays: currentStreak,
    isStreakActive,
    daysNeededForStreak,
    restDaysAvailable: restDaysBank,
    restDaysUsed,
    daysUntilNextRestDay,
    statusMessage,
  };
}
