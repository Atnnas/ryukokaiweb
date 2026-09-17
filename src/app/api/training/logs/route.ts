import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/lib/mongodb';
import { calculateMartialStreak, formatDateString, evaluateWorkoutHonesty } from '@/lib/streakUtils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase().trim();
    const db = await getDatabase();

    // Obtener los logs de entrenamiento de este usuario ordenados por fecha descendente
    const logs = await db
      .collection('TrainingLogs')
      .find({ userEmail })
      .sort({ completedAt: -1 })
      .limit(30)
      .toArray();

    // 1. Total de entrenamientos
    const totalWorkouts = await db.collection('TrainingLogs').countDocuments({ userEmail });

    // 2. Minutos totales
    const allUserLogs = await db
      .collection('TrainingLogs')
      .find({ userEmail }, { projection: { durationSeconds: 1, completedAt: 1, isRushed: 1, isValidForStreak: 1 } })
      .toArray();

    const totalSeconds = allUserLogs.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
    const totalMinutes = Math.round(totalSeconds / 60);

    // 3. Entrenamientos en el mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthWorkouts = allUserLogs.filter((l) => new Date(l.completedAt) >= startOfMonth).length;

    // 4. Racha Marcial de Disciplina (Tanren Streak):
    // Solo cuentan las sesiones honestas y válidas (isRushed !== true && isValidForStreak !== false)
    const uniqueDatesArray: string[] = [];
    allUserLogs.forEach((l) => {
      if (l.completedAt && l.isValidForStreak !== false && !l.isRushed) {
        uniqueDatesArray.push(formatDateString(new Date(l.completedAt)));
      }
    });

    const streakData = calculateMartialStreak(uniqueDatesArray, new Date());

    return NextResponse.json({
      success: true,
      stats: {
        streak: streakData.streak,
        consecutiveDays: streakData.consecutiveDays,
        isStreakActive: streakData.isStreakActive,
        daysNeededForStreak: streakData.daysNeededForStreak,
        restDaysAvailable: streakData.restDaysAvailable,
        restDaysUsed: streakData.restDaysUsed,
        daysUntilNextRestDay: streakData.daysUntilNextRestDay,
        statusMessage: streakData.statusMessage,
        totalWorkouts,
        totalMinutes,
        monthWorkouts,
      },
      logs,
    });
  } catch (error) {
    console.error('Error fetching training logs:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase().trim();
    const body = await request.json();

    const {
      routineId,
      routineTitle,
      durationSeconds,
      stepsCompleted,
      totalSteps,
      estimatedMinutes,
      isRushed: clientIsRushed,
    } = body;

    if (!routineTitle) {
      return NextResponse.json({ error: 'Datos de entrenamiento incompletos' }, { status: 400 });
    }

    const validDuration = Math.max(1, Number(durationSeconds) || 0);
    const validTotalSteps = Math.max(1, Number(totalSteps) || Number(stepsCompleted) || 1);

    // Validación de honestidad marcial (Makoto) en servidor
    const honestyCheck = evaluateWorkoutHonesty({
      durationSeconds: validDuration,
      stepsCount: validTotalSteps,
      estimatedMinutes: Number(estimatedMinutes) || undefined,
    });

    const isRushed = clientIsRushed === true || honestyCheck.isRushed;
    const isValidForStreak = !isRushed;
    const integrityNote = isRushed
      ? 'Sesión completada a ritmo inusualmente apresurado. No cuenta para la racha marcial por principio de Makoto (Honestidad).'
      : 'Sesión completada con disciplina marcial.';

    const db = await getDatabase();
    const newLog = {
      userEmail,
      userName: session.user.name || '',
      routineId: String(routineId || ''),
      routineTitle: String(routineTitle),
      durationSeconds: validDuration,
      stepsCompleted: Number(stepsCompleted) || 0,
      totalSteps: validTotalSteps,
      isRushed,
      isValidForStreak,
      integrityNote,
      completedAt: new Date(),
    };

    const result = await db.collection('TrainingLogs').insertOne(newLog);

    return NextResponse.json({
      success: true,
      logId: result.insertedId,
      isRushed,
      isValidForStreak,
      message: isRushed
        ? 'Entrenamiento registrado con advertencia (no suma a la racha marcial).'
        : '¡Entrenamiento registrado con éxito!',
    });
  } catch (error) {
    console.error('Error saving training log:', error);
    return NextResponse.json({ error: 'Error al registrar entrenamiento' }, { status: 500 });
  }
}
