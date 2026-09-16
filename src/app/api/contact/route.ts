import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, program, experience, message } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Los campos nombre, correo y teléfono son obligatorios.' },
        { status: 400 }
      );
    }

    const leadDoc = {
      name,
      email,
      phone,
      program: program || 'Karate Tradicional (Adultos)',
      experience: experience || 'Principiante',
      message: message || '',
      status: 'nuevo',
      createdAt: new Date(),
    };

    const uri = process.env.MONGODB_URI || '';
    let savedToDb = false;

    // Si ya está configurada la contraseña real, guardamos en MongoDB Atlas
    if (uri && !uri.includes('<TU_PASSWORD>')) {
      try {
        const db = await getDatabase();
        const collection = db.collection('contact_leads');
        const result = await collection.insertOne(leadDoc);
        savedToDb = true;
        return NextResponse.json({
          success: true,
          message: 'Mensaje de contacto guardado con éxito en MongoDB.',
          id: result.insertedId,
          savedToDb: true,
        });
      } catch (dbError) {
        console.error('Error guardando en MongoDB:', dbError);
      }
    }

    // Fallback si la BD está en modo configuración
    return NextResponse.json({
      success: true,
      message: 'Solicitud recibida (Modo demo: configura tu contraseña en .env.local para persistir en Atlas).',
      savedToDb: false,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
