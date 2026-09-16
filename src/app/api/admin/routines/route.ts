import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Routine, RoutineCategory, RoutineDifficulty } from '@/types';

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

// Semilla inicial de rutinas de artes marciales en caso de estar vacía
const SEED_ROUTINES: Omit<Routine, 'id' | '_id'>[] = [
  {
    title: 'Kihon Fundamental y Desplazamientos',
    description: 'Rutina base para perfeccionar posiciones, alineación corporal y transiciones dinámicas en Zenkutsu y Kokutsu Dachi.',
    category: 'kihon',
    difficulty: 'beginner',
    targetBelt: 'Blanco a Naranja',
    durationMinutes: 45,
    exercises: [
      {
        id: 'ex-1',
        name: 'Oi Tsuki en Zenkutsu Dachi',
        sets: 4,
        reps: '20 pasos (10 ida, 10 vuelta)',
        restSeconds: 45,
        notes: 'Enfoque en rotación final del puño y cadera fija al impacto.',
      },
      {
        id: 'ex-2',
        name: 'Age Uke con contragolpe Gyaku Tsuki',
        sets: 4,
        reps: '16 repeticiones',
        restSeconds: 45,
        notes: 'Bloqueo a 45 grados sobre la frente antes de proyectar el tsuki.',
      },
      {
        id: 'ex-3',
        name: 'Mae Geri Keage con retorno controlado',
        sets: 3,
        reps: '15 por pierna',
        restSeconds: 60,
        notes: 'Elevación de rodilla previa a la extensión y retracción antes de apoyar el pie.',
      },
      {
        id: 'ex-4',
        name: 'Transiciones Zenkutsu Dachi a Kiba Dachi',
        sets: 3,
        reps: '12 transiciones',
        restSeconds: 45,
        notes: 'Mantener la altura de las caderas sin oscilar hacia arriba.',
      },
    ],
    createdBy: 'Sensei Ryoku Kai',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: 'Explosividad y Coordinación para Kumite',
    description: 'Circuito de alta intensidad orientado a velocidad de reacción, rebote táctico y entradas con Kizami/Gyaku Tsuki.',
    category: 'kumite',
    difficulty: 'intermediate',
    targetBelt: 'Verde a Negro',
    durationMinutes: 40,
    exercises: [
      {
        id: 'ex-5',
        name: 'Rebote táctico y desplazamiento lateral con bandas',
        sets: 4,
        reps: '45 segundos de trabajo',
        restSeconds: 30,
        notes: 'Pies ligeros sobre las puntas, guardia alta y mirada al frente.',
      },
      {
        id: 'ex-6',
        name: 'Entrada Kizami Tsuki explosivo al saco o escudo',
        sets: 5,
        reps: '10 repeticiones por guardia',
        restSeconds: 45,
        notes: 'Empuje desde el pie retrasado y recuperación instantánea de guardia.',
      },
      {
        id: 'ex-7',
        name: 'Combinación Kizami Tsuki + Gyaku Tsuki + Mawashi Geri Chudan',
        sets: 4,
        reps: '8 secuencias fluidas',
        restSeconds: 60,
        notes: 'Máxima velocidad de encadenamiento entre las técnicas.',
      },
      {
        id: 'ex-8',
        name: 'Burpees marciales con salto y caída en guardia',
        sets: 3,
        reps: '12 repeticiones',
        restSeconds: 60,
        notes: 'Caer equilibrado en postura Kumite tras cada elevación.',
      },
    ],
    createdBy: 'Sensei Ryoku Kai',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: 'Perfeccionamiento y Dinámica de Kata Superior',
    description: 'Enfoque en ritmo, respiración Ibuki, pausas de Kime y bunkai dinámico para competidores de formas avanzadas.',
    category: 'kata',
    difficulty: 'advanced',
    targetBelt: 'Marrón y Cinta Negra',
    durationMinutes: 60,
    exercises: [
      {
        id: 'ex-9',
        name: 'Calentamiento articular y micro-pausas de Kime',
        sets: 1,
        reps: '10 minutos continuos',
        restSeconds: 30,
        notes: 'Tensión isométrica final de 1 segundo al término de cada técnica.',
      },
      {
        id: 'ex-10',
        name: 'Ejecución seccionada de secuencias críticas de Kata',
        sets: 4,
        reps: '5 repeticiones por sección',
        restSeconds: 60,
        notes: 'Analizar balance, eje de rotación y alineación lumbar.',
      },
      {
        id: 'ex-11',
        name: 'Kata completo a velocidad 70% con respiración consciente',
        sets: 3,
        reps: '1 ejecución por serie',
        restSeconds: 90,
        notes: 'Cuidar transiciones lentas y transiciones explosivas.',
      },
      {
        id: 'ex-12',
        name: 'Kata completo con Kiai en potencia máxima de torneo',
        sets: 3,
        reps: '1 ejecución por serie',
        restSeconds: 120,
        notes: 'Presentación formal, mirada fija y Zanshin impecable.',
      },
    ],
    createdBy: 'Sensei Ryoku Kai',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: 'Flexibilidad Dinámica y Movilidad Pélvica',
    description: 'Sesión de apertura articular y elongación para mejorar la altura y fluidez de patadas como Ura Mawashi y Yoko Geri.',
    category: 'flexibility',
    difficulty: 'all-levels',
    targetBelt: 'Todos los niveles',
    durationMinutes: 30,
    exercises: [
      {
        id: 'ex-13',
        name: 'Balanceos controlados de pierna en barra o pared',
        sets: 3,
        reps: '15 frontal, 15 lateral por pierna',
        restSeconds: 30,
        notes: 'Torso erguido sin inclinar excesivamente la espalda.',
      },
      {
        id: 'ex-14',
        name: 'Postura de Rana y estiramiento de aductores',
        sets: 3,
        reps: '45 segundos sostenido',
        restSeconds: 30,
        notes: 'Respiración diafragmática profunda sin forzar la articulación.',
      },
      {
        id: 'ex-15',
        name: 'Apertura Spagat frontal y transversal asistida',
        sets: 3,
        reps: '30 segundos por ángulo',
        restSeconds: 45,
        notes: 'Descenso suave apoyando manos en el tatami.',
      },
      {
        id: 'ex-16',
        name: 'Relajación lumbar y Seiza con respiración Mokuso',
        sets: 1,
        reps: '5 minutos',
        restSeconds: 0,
        notes: 'Calma mental y agradecimiento final.',
      },
    ],
    createdBy: 'Sensei Ryoku Kai',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// GET: Listar rutinas con filtros y búsqueda
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason || 'Acceso no autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const categoryFilter = searchParams.get('category') || '';
    const difficultyFilter = searchParams.get('difficulty') || '';

    const db = await getDatabase();
    const collection = db.collection('Routines');

    // Comprobar si se necesita sembrar datos iniciales
    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(SEED_ROUTINES);
    }

    const query: Record<string, unknown> = {};

    if (categoryFilter && categoryFilter !== 'all') {
      query.category = categoryFilter;
    }
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
      category: (r.category as RoutineCategory) || 'kihon',
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

// POST: Crear una nueva rutina de ejercicio
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
      category,
      difficulty,
      targetBelt,
      durationMinutes,
      exercises,
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'El título de la rutina es obligatorio' }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: 'La categoría es obligatoria' }, { status: 400 });
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
      category: (category as RoutineCategory) || 'kihon',
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
      category,
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
    if (category) updateFields.category = category;
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
