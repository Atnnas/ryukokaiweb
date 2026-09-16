import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/lib/mongodb';
import { ExerciseCatalogItem } from '@/types';

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

// Catálogo base para predicciones iniciales
const BASE_EXERCISES: Omit<ExerciseCatalogItem, 'id' | '_id'>[] = [
  { name: 'Flexiones de pecho (Push-ups)', defaultSets: 4, defaultReps: '15 reps', defaultRestSeconds: 45, defaultNotes: 'Mantener el torso recto y codos a 45 grados' },
  { name: 'Burpees explosivos', defaultSets: 3, defaultReps: '12 reps', defaultRestSeconds: 60, defaultNotes: 'Extensión completa en el salto vertical' },
  { name: 'Sentadillas pliométricas con salto', defaultSets: 4, defaultReps: '15 reps', defaultRestSeconds: 45, defaultNotes: 'Amortiguar la caída sobre la punta y talón' },
  { name: 'Plancha isométrica abdominal', defaultSets: 3, defaultReps: '45 seg', defaultRestSeconds: 30, defaultNotes: 'Alineación de cadera y activación de core' },
  { name: 'Abdominales en V (V-Ups)', defaultSets: 4, defaultReps: '15 reps', defaultRestSeconds: 45, defaultNotes: 'Control excéntrico en el descenso' },
  { name: 'Saltos al cajón o elevación sobre banco', defaultSets: 4, defaultReps: '10 reps', defaultRestSeconds: 60, defaultNotes: 'Enfoque en potencia explosiva de despegue' },
  { name: 'Zancadas dinámicas alternas (Lunges)', defaultSets: 3, defaultReps: '12 por pierna', defaultRestSeconds: 45, defaultNotes: 'Rodilla delantera en ángulo de 90 grados' },
  { name: 'Fondos de tríceps en paralelas o banco', defaultSets: 3, defaultReps: '12 reps', defaultRestSeconds: 45, defaultNotes: 'Bajar hasta que los codos queden a 90 grados' },
  { name: 'Escaladores (Mountain Climbers)', defaultSets: 4, defaultReps: '40 seg', defaultRestSeconds: 30, defaultNotes: 'Ritmo constante sin levantar excesivamente la pelvis' },
  { name: 'Jumping Jacks (Tijeras con salto)', defaultSets: 3, defaultReps: '60 seg', defaultRestSeconds: 30, defaultNotes: 'Apertura fluida de brazos y piernas' },
  { name: 'Desplazamientos laterales con banda elástica', defaultSets: 3, defaultReps: '15 cada lado', defaultRestSeconds: 30, defaultNotes: 'Mantener tensión constante en glúteo medio' },
  { name: 'Elevación de talones / Gemelos', defaultSets: 4, defaultReps: '20 reps', defaultRestSeconds: 30, defaultNotes: 'Pausa isométrica de 1 segundo arriba' },
];

// GET: Obtener todos los ejercicios del catálogo para autocompletado y predicción
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason || 'Acceso no autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryTerm = searchParams.get('q')?.toLowerCase().trim() || '';

    const db = await getDatabase();
    const collection = db.collection('Exercises');

    // Sembrar catálogo inicial si la colección está vacía
    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(
        BASE_EXERCISES.map((ex) => ({
          ...ex,
          createdAt: new Date(),
        }))
      );
    }

    const filter: Record<string, unknown> = {};
    if (queryTerm) {
      filter.name = { $regex: queryTerm, $options: 'i' };
    }

    const raw = await collection.find(filter).sort({ name: 1 }).toArray();

    const exercises: ExerciseCatalogItem[] = raw.map((doc) => ({
      id: doc._id.toString(),
      _id: doc._id.toString(),
      name: doc.name,
      defaultSets: doc.defaultSets,
      defaultReps: doc.defaultReps,
      defaultRestSeconds: doc.defaultRestSeconds,
      defaultNotes: doc.defaultNotes,
      createdAt: doc.createdAt,
    }));

    return NextResponse.json({ success: true, exercises });
  } catch (error) {
    console.error('Error al obtener catálogo de ejercicios:', error);
    return NextResponse.json({ error: 'Error interno del servidor al consultar ejercicios' }, { status: 500 });
  }
}

// POST: Guardar o registrar un ejercicio directamente en el catálogo de la base de datos
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason || 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { name, sets, reps, restSeconds, notes } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'El nombre del ejercicio es obligatorio' }, { status: 400 });
    }

    const cleanName = name.trim();
    const db = await getDatabase();
    const collection = db.collection('Exercises');

    // Buscar si ya existe por nombre (case-insensitive)
    const existing = await collection.findOne({
      name: { $regex: `^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });

    if (existing) {
      // Actualizar defaults si se pasaron nuevos valores
      await collection.updateOne(
        { _id: existing._id },
        {
          $set: {
            defaultSets: sets ? Number(sets) : existing.defaultSets,
            defaultReps: reps ? String(reps) : existing.defaultReps,
            defaultRestSeconds: restSeconds ? Number(restSeconds) : existing.defaultRestSeconds,
            defaultNotes: notes ? String(notes) : existing.defaultNotes,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        exercise: {
          id: existing._id.toString(),
          _id: existing._id.toString(),
          name: existing.name,
          defaultSets: sets ? Number(sets) : existing.defaultSets,
          defaultReps: reps ? String(reps) : existing.defaultReps,
          defaultRestSeconds: restSeconds ? Number(restSeconds) : existing.defaultRestSeconds,
          defaultNotes: notes ? String(notes) : existing.defaultNotes,
        },
      });
    }

    // Insertar nuevo ejercicio en catálogo
    const newDoc = {
      name: cleanName,
      defaultSets: sets ? Number(sets) : undefined,
      defaultReps: reps ? String(reps).trim() : undefined,
      defaultRestSeconds: restSeconds ? Number(restSeconds) : undefined,
      defaultNotes: notes ? String(notes).trim() : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await collection.insertOne(newDoc);

    return NextResponse.json({
      success: true,
      exercise: {
        id: res.insertedId.toString(),
        _id: res.insertedId.toString(),
        ...newDoc,
      },
    });
  } catch (error) {
    console.error('Error al guardar ejercicio en catálogo:', error);
    return NextResponse.json({ error: 'Error interno del servidor al guardar ejercicio' }, { status: 500 });
  }
}
