import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/lib/mongodb';
import { Routine } from '@/types';

const SUPER_ADMINS = [
  'david.artavia.rodriguez@gmail.com',
  'davidartaviarodriguez@gmail.com',
];

const isSuperAdminEmail = (email?: string | null) => {
  if (!email) return false;
  return SUPER_ADMINS.includes(email.toLowerCase().trim());
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para acceder a las rutinas de entrenamiento.' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email.toLowerCase().trim();
    const isSuper = isSuperAdminEmail(userEmail);

    const db = await getDatabase();
    const dbUser = await db.collection('Users').findOne({ email: userEmail });

    // Permitir acceso a administradores o a usuarios activos aprobados
    const isAuthorized =
      isSuper ||
      (dbUser && (dbUser.role === 'administrator' || dbUser.status === 'active'));

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error:
            'Tu cuenta está pendiente de aprobación por parte del Sensei. Contacta al dojo para activar tu acceso.',
          status: dbUser?.status || 'pending',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'exercises.name': { $regex: search, $options: 'i' } },
      ];
    }

    const routinesDocs = await db
      .collection('Routines')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const routines: Routine[] = routinesDocs.map((r) => ({
      id: r._id.toString(),
      _id: r._id.toString(),
      title: r.title || 'Rutina de Entrenamiento',
      description: r.description || '',
      durationMinutes: Number(r.durationMinutes) || 30,
      exercises: r.exercises || [],
      createdBy: r.createdBy || 'Sensei',
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
    }));

    return NextResponse.json({ success: true, routines });
  } catch (error) {
    console.error('Error al obtener rutinas de entrenamiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al consultar rutinas' },
      { status: 500 }
    );
  }
}
