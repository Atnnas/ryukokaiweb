import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/lib/mongodb';
import { calculateMartialStreak, formatDateString } from '@/lib/streakUtils';

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
      .find({ userEmail }, { projection: { durationSeconds: 1, completedAt: 1 } })
      .toArray();

    const totalSeconds = allUserLogs.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
    const totalMinutes = Math.round(totalSeconds / 60);

    // 3. Entrenamientos en el mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthWorkouts = allUserLogs.filter((l) => new Date(l.completedAt) >= startOfMonth).length;

    // 4. Racha Marcial de Disciplina (Tanren Streak):
    // Reglas:
    // - Se gana a partir del 3er día consecutivo.
    // - Por cada 5 días de entrenamiento se gana 1 día de descanso libre.
    // - Si un día no se entrena, se gasta 1 día de descanso (si hay) o se rompe la racha.
    const uniqueDatesArray: string[] = [];
    allUserLogs.forEach((l) => {
      if (l.completedAt) {
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
    } = body;

    if (!routineTitle) {
      return NextResponse.json({ error: 'Datos de entrenamiento incompletos' }, { status: 400 });
    }

    const db = await getDatabase();
    const newLog = {
      userEmail,
      userName: session.user.name || '',
      routineId: String(routineId || ''),
      routineTitle: String(routineTitle),
      durationSeconds: Math.max(1, Number(durationSeconds) || 0),
      stepsCompleted: Number(stepsCompleted) || 0,
      totalSteps: Number(totalSteps) || 0,
      completedAt: new Date(),
    };

    const result = await db.collection('TrainingLogs').insertOne(newLog);

    return NextResponse.json({
      success: true,
      logId: result.insertedId,
      message: '¡Entrenamiento registrado con éxito!',
    });
  } catch (error) {
    console.error('Error saving training log:', error);
    return NextResponse.json({ error: 'Error al registrar entrenamiento' }, { status: 500 });
  }
}
