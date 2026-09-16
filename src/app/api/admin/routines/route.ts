import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Routine, ExerciseItem, ExerciseMeasureUnit } from '@/types';

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

// Helper para sincronizar y guardar ejercicios directamente en la colección Exercises de MongoDB
async function syncExercisesToCatalog(exercises: ExerciseItem[]) {
  if (!Array.isArray(exercises) || exercises.length === 0) return;
  try {
    const db = await getDatabase();
    const collection = db.collection('Exercises');
    for (const ex of exercises) {
      if (ex.name && ex.name.trim()) {
        const cleanName = ex.name.trim();
        const unit: ExerciseMeasureUnit =
          ex.repsOrDurationUnit === 'segundos' ? 'segundos' : 'repeticiones';
        const val =
          ex.repsOrDurationValue !== undefined && !isNaN(Number(ex.repsOrDurationValue))
            ? Number(ex.repsOrDurationValue)
            : 12;

        await collection.updateOne(
          { name: { $regex: `^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } },
          {
            $set: {
              name: cleanName,
              defaultSets: ex.sets || 3,
              defaultRepsOrDurationValue: val,
              defaultRepsOrDurationUnit: unit,
              defaultReps: `${val} ${unit}`,
              defaultRestSeconds: ex.restSeconds !== undefined ? ex.restSeconds : 45,
              defaultNotes: ex.notes || '',
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          { upsert: true }
        );
      }
    }
  } catch (err) {
    console.error('Error al sincronizar ejercicios al catálogo:', err);
  }
}

// Sanitizar array de ejercicios soportando número y combo de unidad
function sanitizeExerciseList(rawList: unknown[]): ExerciseItem[] {
  if (!Array.isArray(rawList)) return [];

  return (rawList as Record<string, unknown>[])
    .filter((ex) => !!ex && typeof ex.name === 'string' && ex.name.trim().length > 0)
    .map((ex, idx) => {
      const unit: ExerciseMeasureUnit =
        ex.repsOrDurationUnit === 'segundos' ||
        (typeof ex.reps === 'string' && ex.reps.toLowerCase().includes('seg'))
          ? 'segundos'
          : 'repeticiones';

      const numVal =
        ex.repsOrDurationValue !== undefined && !isNaN(Number(ex.repsOrDurationValue))
          ? Number(ex.repsOrDurationValue)
          : typeof ex.reps === 'string'
          ? parseInt(ex.reps, 10) || 12
          : 12;

      return {
        id: (ex.id as string) || `ex-${Date.now()}-${idx}`,
        name: (ex.name as string).trim(),
        sets: ex.sets ? Number(ex.sets) : 3,
        repsOrDurationValue: numVal,
        repsOrDurationUnit: unit,
        reps: `${numVal} ${unit}`,
        restSeconds: ex.restSeconds !== undefined ? Number(ex.restSeconds) : 45,
        notes: ex.notes ? String(ex.notes).trim() : undefined,
      };
    });
}

// GET: Listar rutinas con búsqueda
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason || 'Acceso no autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';

    const db = await getDatabase();
    const collection = db.collection('Routines');

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'exercises.name': { $regex: search, $options: 'i' } },
      ];
    }

    const rawRoutines = await collection.find(query).sort({ createdAt: -1 }).toArray();

    const routines: Routine[] = rawRoutines.map((r) => ({
      id: r._id.toString(),
      _id: r._id.toString(),
      title: r.title || 'Rutina sin título',
      description: r.description || '',
      durationMinutes: Number(r.durationMinutes) || 45,
      exercises: sanitizeExerciseList(r.exercises || []),
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
      durationMinutes,
      exercises,
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'El nombre de la rutina es obligatorio' }, { status: 400 });
    }

    const sanitizedExercises = sanitizeExerciseList(exercises || []);

    const newRoutineDoc = {
      title: title.trim(),
      description: (description || '').trim(),
      durationMinutes: Number(durationMinutes) > 0 ? Number(durationMinutes) : 45,
      exercises: sanitizedExercises,
      createdBy: auth.userEmail || 'Administrador',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection('Routines').insertOne(newRoutineDoc);

    // Guardar los ejercicios directamente en la colección Exercises de MongoDB
    await syncExercisesToCatalog(sanitizedExercises);

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
    if (durationMinutes !== undefined) updateFields.durationMinutes = Number(durationMinutes);

    if (Array.isArray(exercises)) {
      const sanitized = sanitizeExerciseList(exercises);
      updateFields.exercises = sanitized;
      await syncExercisesToCatalog(sanitized);
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
