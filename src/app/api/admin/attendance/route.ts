import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const SUPER_ADMINS = [
  'david.artavia.rodriguez@gmail.com',
  'davidartaviarodriguez@gmail.com',
];

const isSuperAdminEmail = (email?: string | null) => {
  if (!email) return false;
  return SUPER_ADMINS.includes(email.toLowerCase().trim());
};

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return { authorized: false, reason: 'No autenticado' };
  }

  const userEmail = session.user.email.toLowerCase().trim();
  if (isSuperAdminEmail(userEmail)) {
    return { authorized: true, userEmail };
  }

  const db = await getDatabase();
  const dbUser = await db.collection('Users').findOne({ email: userEmail });
  if (dbUser && dbUser.role === 'administrator' && dbUser.status === 'active') {
    return { authorized: true, userEmail };
  }

  return { authorized: false, reason: 'Privilegios insuficientes' };
}

// GET: Obtener registros de asistencia para una fecha determinada
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const classSession = searchParams.get('classSession') || 'general';

    const db = await getDatabase();

    const query: Record<string, unknown> = { date };
    if (classSession && classSession !== 'all') {
      query.classSession = classSession;
    }

    const records = await db
      .collection('Attendance')
      .find(query)
      .toArray();

    // Resumen de asistencia
    const presentCount = records.filter((r) => r.status === 'present').length;
    const absentCount = records.filter((r) => r.status === 'absent').length;
    const justifiedCount = records.filter((r) => r.status === 'justified').length;

    return NextResponse.json({
      success: true,
      date,
      classSession,
      records: records.map((r) => ({
        id: r._id.toString(),
        userId: r.userId,
        userEmail: r.userEmail,
        userName: r.userName,
        date: r.date,
        classSession: r.classSession,
        status: r.status,
        markedAt: r.markedAt,
      })),
      stats: {
        total: records.length,
        present: presentCount,
        absent: absentCount,
        justified: justifiedCount,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Registrar o actualizar asistencia de un estudiante
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const {
      userId,
      userEmail,
      userName,
      date = new Date().toISOString().split('T')[0],
      classSession = 'general',
      status = 'present', // 'present' | 'absent' | 'justified'
    } = body;

    if (!userEmail) {
      return NextResponse.json({ error: 'Correo de alumno requerido' }, { status: 400 });
    }

    const normalizedEmail = userEmail.toLowerCase().trim();
    const db = await getDatabase();
    const attendanceCol = db.collection('Attendance');
    const usersCol = db.collection('Users');

    const query = {
      userEmail: normalizedEmail,
      date,
      classSession,
    };

    const previousRecord = await attendanceCol.findOne(query);

    // Guardar registro de asistencia
    await attendanceCol.updateOne(
      query,
      {
        $set: {
          userId: userId || null,
          userName: userName || 'Alumno',
          status,
          markedBy: auth.userEmail,
          markedAt: new Date(),
        },
        $setOnInsert: {
          userEmail: normalizedEmail,
          date,
          classSession,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Ajustar contador de clases asistidas (classesAttended) en Users
    // Si antes no era 'present' y ahora sí lo es -> incrementar +1
    // Si antes era 'present' y ahora cambia a 'absent' o 'justified' -> decrementar -1
    const wasPresent = previousRecord?.status === 'present';
    const isNowPresent = status === 'present';

    if (!wasPresent && isNowPresent) {
      await usersCol.updateOne(
        { email: normalizedEmail },
        { $inc: { classesAttended: 1 } }
      );
    } else if (wasPresent && !isNowPresent) {
      await usersCol.updateOne(
        { email: normalizedEmail, classesAttended: { $gt: 0 } },
        { $inc: { classesAttended: -1 } }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Asistencia actualizada para ${userName || normalizedEmail}: ${status}`,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
