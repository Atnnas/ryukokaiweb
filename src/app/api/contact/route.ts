import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, program, experience, message } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: 'Por favor, proporciona un correo electrónico válido.' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { error: 'El número de teléfono es obligatorio.' },
        { status: 400 }
      );
    }

    // Limitar tamaños de campos para prevenir denegación de servicio de almacenamiento
    const leadDoc = {
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 120),
      phone: phone.trim().slice(0, 30),
      program: typeof program === 'string' ? program.trim().slice(0, 100) : 'Karate Tradicional (Adultos)',
      experience: typeof experience === 'string' ? experience.trim().slice(0, 50) : 'Principiante',
      message: typeof message === 'string' ? message.trim().slice(0, 2000) : '',
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
