import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  const uri = process.env.MONGODB_URI || '';

  if (!uri || uri.includes('<TU_PASSWORD>')) {
    return NextResponse.json({
      status: 'pending_password',
      message: 'MongoDB está configurado en el código, pero falta ingresar la contraseña en .env.local reemplazando <TU_PASSWORD>.',
      database: process.env.MONGODB_DB || 'ryokukai_web_db',
    });
  }

  try {
    const db = await getDatabase();
    // Ping para verificar conectividad
    const pingResult = await db.command({ ping: 1 });
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      status: 'connected',
      message: '¡Conexión exitosa a MongoDB Atlas!',
      database: db.databaseName,
      ping: pingResult,
      collections: collections.map((c) => c.name),
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error al conectar con MongoDB Atlas',
        error: err.message,
      },
      { status: 500 }
    );
  }
}
