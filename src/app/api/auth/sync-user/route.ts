import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const user: User = await request.json();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Datos de usuario incompletos' }, { status: 400 });
    }

    const uri = process.env.MONGODB_URI || '';
    if (uri && !uri.includes('<TU_PASSWORD>')) {
      try {
        const db = await getDatabase();
        const collection = db.collection('Users');
        const email = user.email.toLowerCase().trim();
        const isAdmin = email === 'david.artavia.rodriguez@gmail.com' || email === 'davidartaviarodriguez@gmail.com';

        const updateSet: Record<string, unknown> = {
          name: user.name,
          avatar: user.avatar,
          lastLogin: new Date(),
        };

        if (isAdmin) {
          updateSet.role = 'administrator';
          updateSet.status = 'active';
        }

        // Upsert usuario por email o Google ID
        await collection.updateOne(
          { email },
          {
            $set: updateSet,
            $setOnInsert: {
              id: user.id,
              email,
              belt: isAdmin ? 'Cinturón Negro' : (user.belt || 'Cinturón Blanco'),
              kyuDan: isAdmin ? '1° Dan' : (user.kyuDan || '9° Kyu'),
              role: isAdmin ? 'administrator' : (user.role || 'viewer'),
              status: isAdmin ? 'active' : (user.status || 'pending'),
              joinedDate: new Date(),
              classesAttended: 0,
            },
          },
          { upsert: true }
        );

        return NextResponse.json({ success: true, message: 'Usuario sincronizado con MongoDB Users' });
      } catch (dbErr) {
        console.error('Error sincronizando usuario en MongoDB:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Modo demo activo: configura tu contraseña en .env.local para persistir usuarios en Atlas',
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
