import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Routine, RoutineDifficulty } from '@/types';

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
    return { authorized: true, userEmail, isSuper: true };
  }

  const db = await getDatabase();
  const dbUser = await db.collection('Users').findOne({ email: userEmail });
  if (dbUser && dbUser.role === 'administrator' && dbUser.status === 'active') {
    return { authorized: true, userEmail, isSuper: false };
  }

  return { authorized: false, reason: 'Privilegios insuficientes de administrador' };
}

// GET: Listar rutinas con filtros y búsqueda
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason || 'Acceso no autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const difficultyFilter = searchParams.get('difficulty') || '';

    const db = await getDatabase();
    const collection = db.collection('Routines');

    const query: Record<string, unknown> = {};

    if (difficultyFilter && difficultyFilter !== 'all') {
      query.difficulty = difficultyFilter;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { targetBelt: { $regex: search, $options: 'i' } },
        { 'exercises.name': { $regex: search, $options: 'i' } },
      ];
    }

    const rawRoutines = await collection.find(query).sort({ createdAt: -1 }).toArray();

    const routines: Routine[] = rawRoutines.map((r) => ({
      id: r._id.toString(),
      _id: r._id.toString(),
      title: r.title || 'Rutina sin título',
      description: r.description || '',
      difficulty: (r.difficulty as RoutineDifficulty) || 'all-levels',
      targetBelt: r.targetBelt || 'Todos los niveles',
      durationMinutes: Number(r.durationMinutes) || 45,
      exercises: Array.isArray(r.exercises) ? r.exercises : [],
      createdBy: r.createdBy || 'Sensei',
      createdAt: r.createdAt || new Date(),
      updatedAt: r.updatedAt || new Date(),
    }));

    return NextResponse.json({ success: true, routines });
  } catch (error) {
    console.error('Error al obtener rutinas:', error);
    return NextResponse.json({ error: 'Error interno del servidor al consultar rutinas' }, { status: 500 });
  }
}

// POST: Crear una nueva rutina de ejercicio (guardada en MongoDB)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason || 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      difficulty,
      targetBelt,
      durationMinutes,
      exercises,
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'El título de la rutina es obligatorio' }, { status: 400 });
    }

    const sanitizedExercises = Array.isArray(exercises)
      ? exercises
          .filter((ex) => ex && typeof ex.name === 'string' && ex.name.trim())
          .map((ex, idx) => ({
            id: ex.id || `ex-${Date.now()}-${idx}`,
            name: ex.name.trim(),
            sets: ex.sets ? Number(ex.sets) : undefined,
            reps: ex.reps ? String(ex.reps).trim() : undefined,
            restSeconds: ex.restSeconds ? Number(ex.restSeconds) : undefined,
            notes: ex.notes ? String(ex.notes).trim() : undefined,
          }))
      : [];

    const newRoutineDoc = {
      title: title.trim(),
      description: (description || '').trim(),
      difficulty: (difficulty as RoutineDifficulty) || 'all-levels',
      targetBelt: (targetBelt || 'Todos los niveles').trim(),
      durationMinutes: Number(durationMinutes) > 0 ? Number(durationMinutes) : 45,
      exercises: sanitizedExercises,
      createdBy: auth.userEmail || 'Administrador',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection('Routines').insertOne(newRoutineDoc);

    const createdRoutine: Routine = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newRoutineDoc,
    };

    return NextResponse.json({ success: true, routine: createdRoutine }, { status: 201 });
  } catch (error) {
    console.error('Error al crear rutina:', error);
    return NextResponse.json({ error: 'Error interno del servidor al crear la rutina' }, { status: 500 });
  }
}

// PATCH: Actualizar una rutina existente
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason || 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      _id,
      title,
      description,
      difficulty,
      targetBelt,
      durationMinutes,
      exercises,
    } = body;

    const routineId = id || _id;
    if (!routineId) {
      return NextResponse.json({ error: 'ID de rutina no especificado' }, { status: 400 });
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(routineId);
    } catch {
      return NextResponse.json({ error: 'Formato de ID inválido' }, { status: 400 });
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (typeof title === 'string') updateFields.title = title.trim();
    if (typeof description === 'string') updateFields.description = description.trim();
    if (difficulty) updateFields.difficulty = difficulty;
    if (typeof targetBelt === 'string') updateFields.targetBelt = targetBelt.trim();
    if (durationMinutes !== undefined) updateFields.durationMinutes = Number(durationMinutes);

    if (Array.isArray(exercises)) {
      updateFields.exercises = exercises
        .filter((ex) => ex && typeof ex.name === 'string' && ex.name.trim())
        .map((ex, idx) => ({
          id: ex.id || `ex-${Date.now()}-${idx}`,
          name: ex.name.trim(),
          sets: ex.sets ? Number(ex.sets) : undefined,
          reps: ex.reps ? String(ex.reps).trim() : undefined,
          restSeconds: ex.restSeconds ? Number(ex.restSeconds) : undefined,
          notes: ex.notes ? String(ex.notes).trim() : undefined,
        }));
    }

    const db = await getDatabase();
    const result = await db.collection('Routines').findOneAndUpdate(
      { _id: objectId },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Rutina no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      routine: {
        ...result,
        id: result._id.toString(),
        _id: result._id.toString(),
      },
    });
  } catch (error) {
    console.error('Error al actualizar rutina:', error);
    return NextResponse.json({ error: 'Error interno del servidor al actualizar rutina' }, { status: 500 });
  }
}

// DELETE: Eliminar una rutina
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason || 'Acceso no autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de rutina no proporcionado' }, { status: 400 });
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Formato de ID inválido' }, { status: 400 });
    }

    const db = await getDatabase();
    const result = await db.collection('Routines').deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Rutina no encontrada para eliminar' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Rutina eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar rutina:', error);
    return NextResponse.json({ error: 'Error interno del servidor al eliminar rutina' }, { status: 500 });
  }
}
