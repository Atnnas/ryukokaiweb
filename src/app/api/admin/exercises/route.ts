import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/lib/mongodb';
import { ExerciseCatalogItem, ExerciseMeasureUnit } from '@/types';

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

// Catálogo base para predicciones iniciales con número y combo de unidad (repeticiones o segundos)
const BASE_EXERCISES: Omit<ExerciseCatalogItem, 'id' | '_id'>[] = [
  { name: 'Flexiones de pecho (Push-ups)', defaultSets: 4, defaultRepsOrDurationValue: 15, defaultRepsOrDurationUnit: 'repeticiones', defaultReps: '15 repeticiones', defaultRestSeconds: 45, defaultNotes: 'Torso recto y codos a 45 grados' },
  { name: 'Burpees explosivos', defaultSets: 3, defaultRepsOrDurationValue: 12, defaultRepsOrDurationUnit: 'repeticiones', defaultReps: '12 repeticiones', defaultRestSeconds: 60, defaultNotes: 'Extensión completa en el salto' },
  { name: 'Sentadillas pliométricas con salto', defaultSets: 4, defaultRepsOrDurationValue: 15, defaultRepsOrDurationUnit: 'repeticiones', defaultReps: '15 repeticiones', defaultRestSeconds: 45, defaultNotes: 'Amortiguar caída suavemente' },
  { name: 'Plancha isométrica abdominal', defaultSets: 3, defaultRepsOrDurationValue: 45, defaultRepsOrDurationUnit: 'segundos', defaultReps: '45 segundos', defaultRestSeconds: 30, defaultNotes: 'Alineación de cadera y activación de core' },
  { name: 'Abdominales en V (V-Ups)', defaultSets: 4, defaultRepsOrDurationValue: 15, defaultRepsOrDurationUnit: 'repeticiones', defaultReps: '15 repeticiones', defaultRestSeconds: 45, defaultNotes: 'Control excéntrico en descenso' },
  { name: 'Saltos al cajón o banco', defaultSets: 4, defaultRepsOrDurationValue: 10, defaultRepsOrDurationUnit: 'repeticiones', defaultReps: '10 repeticiones', defaultRestSeconds: 60, defaultNotes: 'Potencia explosiva de despegue' },
  { name: 'Zancadas dinámicas (Lunges)', defaultSets: 3, defaultRepsOrDurationValue: 12, defaultRepsOrDurationUnit: 'repeticiones', defaultReps: '12 repeticiones', defaultRestSeconds: 45, defaultNotes: 'Rodilla delantera en 90 grados' },
  { name: 'Fondos de tríceps en paralelas o banco', defaultSets: 3, defaultRepsOrDurationValue: 12, defaultRepsOrDurationUnit: 'repeticiones', defaultReps: '12 repeticiones', defaultRestSeconds: 45, defaultNotes: 'Codos flexionados a 90 grados' },
  { name: 'Escaladores (Mountain Climbers)', defaultSets: 4, defaultRepsOrDurationValue: 40, defaultRepsOrDurationUnit: 'segundos', defaultReps: '40 segundos', defaultRestSeconds: 30, defaultNotes: 'Ritmo constante sin elevar la cadera' },
  { name: 'Jumping Jacks (Tijeras con salto)', defaultSets: 3, defaultRepsOrDurationValue: 60, defaultRepsOrDurationUnit: 'segundos', defaultReps: '60 segundos', defaultRestSeconds: 30, defaultNotes: 'Apertura fluida de extremidades' },
  { name: 'Desplazamientos laterales con banda', defaultSets: 3, defaultRepsOrDurationValue: 15, defaultRepsOrDurationUnit: 'repeticiones', defaultReps: '15 repeticiones', defaultRestSeconds: 30, defaultNotes: 'Tensión constante en glúteos' },
  { name: 'Elevación de talones / Gemelos', defaultSets: 4, defaultRepsOrDurationValue: 20, defaultRepsOrDurationUnit: 'repeticiones', defaultReps: '20 repeticiones', defaultRestSeconds: 30, defaultNotes: 'Pausa de 1 segundo arriba' },
];

// GET: Obtener ejercicios del catálogo
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

    // Sembrar catálogo inicial si está vacío
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

    const exercises: ExerciseCatalogItem[] = raw.map((doc) => {
      const unit: ExerciseMeasureUnit =
        doc.defaultRepsOrDurationUnit === 'segundos' ? 'segundos' : 'repeticiones';
      const val =
        doc.defaultRepsOrDurationValue !== undefined
          ? Number(doc.defaultRepsOrDurationValue)
          : doc.defaultReps
          ? parseInt(doc.defaultReps, 10) || 12
          : 12;

      return {
        id: doc._id.toString(),
        _id: doc._id.toString(),
        name: doc.name,
        defaultSets: doc.defaultSets || 3,
        defaultRepsOrDurationValue: val,
        defaultRepsOrDurationUnit: unit,
        defaultReps: doc.defaultReps || `${val} ${unit}`,
        defaultRestSeconds: doc.defaultRestSeconds || 45,
        defaultNotes: doc.defaultNotes || '',
        createdAt: doc.createdAt,
      };
    });

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
    const { name, sets, repsOrDurationValue, repsOrDurationUnit, restSeconds, notes } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'El nombre del ejercicio es obligatorio' }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanUnit: ExerciseMeasureUnit =
      repsOrDurationUnit === 'segundos' ? 'segundos' : 'repeticiones';
    const cleanValue =
      repsOrDurationValue !== undefined && !isNaN(Number(repsOrDurationValue))
        ? Number(repsOrDurationValue)
        : 12;
    const formattedReps = `${cleanValue} ${cleanUnit}`;

    const db = await getDatabase();
    const collection = db.collection('Exercises');

    // Buscar si ya existe por nombre (case-insensitive)
    const existing = await collection.findOne({
      name: { $regex: `^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });

    const updateData = {
      defaultSets: sets ? Number(sets) : 3,
      defaultRepsOrDurationValue: cleanValue,
      defaultRepsOrDurationUnit: cleanUnit,
      defaultReps: formattedReps,
      defaultRestSeconds: restSeconds !== undefined ? Number(restSeconds) : 45,
      defaultNotes: notes ? String(notes).trim() : '',
      updatedAt: new Date(),
    };

    if (existing) {
      await collection.updateOne({ _id: existing._id }, { $set: updateData });

      return NextResponse.json({
        success: true,
        exercise: {
          id: existing._id.toString(),
          _id: existing._id.toString(),
          name: existing.name,
          ...updateData,
        },
      });
    }

    const newDoc = {
      name: cleanName,
      ...updateData,
      createdAt: new Date(),
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
