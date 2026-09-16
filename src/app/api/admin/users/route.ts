import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { calculateWKFCategories } from '@/lib/wkf-categories';

const SUPER_ADMINS = [
  'david.artavia.rodriguez@gmail.com',
  'davidartaviarodriguez@gmail.com',
];

const isSuperAdminEmail = (email?: string | null) => {
  if (!email) return false;
  return SUPER_ADMINS.includes(email.toLowerCase().trim());
};

// Verificar si el usuario que hace la solicitud es un administrador autorizado
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

  return { authorized: false, reason: 'Privilegios insuficientes' };
}

// GET: Obtener lista de usuarios de la colección Users
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason || 'Acceso no autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const statusFilter = searchParams.get('status') || '';
    const roleFilter = searchParams.get('role') || '';

    const db = await getDatabase();
    const query: Record<string, unknown> = {};

    if (statusFilter && statusFilter !== 'all') {
      query.status = statusFilter;
    }
    if (roleFilter && roleFilter !== 'all') {
      query.role = roleFilter;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const rawUsers = await db
      .collection('Users')
      .find(query)
      .sort({ lastLogin: -1, createdAt: -1 })
      .toArray();

    // Asegurar que david.artavia.rodriguez@gmail.com exista con rol administrator si aún no está en BD
    const hasSuperAdmin = rawUsers.some((u) => isSuperAdminEmail(u.email));
    if (!hasSuperAdmin && !search && (!statusFilter || statusFilter === 'active')) {
      // Upsert super admin en caso de consulta inicial
      await db.collection('Users').updateOne(
        { email: 'david.artavia.rodriguez@gmail.com' },
        {
          $set: {
            name: 'David Artavia (Sensei / Admin)',
            role: 'administrator',
            status: 'active',
            belt: 'Cinturón Negro',
            kyuDan: '1° Dan',
            approvedAt: new Date().toISOString(),
            approvedBy: 'system_root',
            lastLogin: new Date(),
          },
          $setOnInsert: {
            email: 'david.artavia.rodriguez@gmail.com',
            joinedDate: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
            classesAttended: 120,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    const users = rawUsers.map((u) => {
      const wkf = calculateWKFCategories({
        birthDate: u.birthDate,
        weight: u.weight,
        gender: u.gender || 'male',
        kyuDan: u.kyuDan || '9° Kyu',
      });

      return {
        id: u._id.toString(),
        _id: u._id.toString(),
        name: u.name || 'Sin nombre',
        email: u.email,
        avatar: u.avatar || null,
        belt: u.belt || wkf.beltName,
        beltColor: u.beltColor || wkf.beltColor,
        kyuDan: u.kyuDan || '9° Kyu',
        birthDate: u.birthDate || '',
        weight: u.weight !== undefined ? u.weight : null,
        gender: u.gender || 'male',
        age: wkf.age,
        kataCategory: u.kataCategory || wkf.kataCategory,
        kumiteCategory: u.kumiteCategory || wkf.kumiteCategory,
        role: isSuperAdminEmail(u.email) ? 'administrator' : (u.role || 'viewer'),
        status: isSuperAdminEmail(u.email) ? 'active' : (u.status || 'pending'),
        joinedDate: u.joinedDate || 'Reciente',
        classesAttended: u.classesAttended || 0,
        approvedAt: u.approvedAt || null,
        approvedBy: u.approvedBy || null,
        lastLogin: u.lastLogin || null,
      };
    });

    return NextResponse.json({ success: true, users });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear o pre-aprobar un nuevo estudiante / usuario manualmente
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const {
      email,
      name,
      role = 'student',
      status = 'active',
      kyuDan = '9° Kyu',
      birthDate = '',
      weight = null,
      gender = 'male',
    } = body;

    if (!email) {
      return NextResponse.json({ error: 'El correo electrónico es obligatorio' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = await getDatabase();
    const usersCol = db.collection('Users');

    const existing = await usersCol.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este correo electrónico en la base de datos' },
        { status: 409 }
      );
    }

    const parsedWeight = weight !== null && weight !== undefined && weight !== '' ? Number(weight) : null;
    const wkf = calculateWKFCategories({
      birthDate,
      weight: parsedWeight || undefined,
      gender: gender || 'male',
      kyuDan,
    });

    const newUser = {
      email: normalizedEmail,
      name: name || 'Estudiante',
      role: isSuperAdminEmail(normalizedEmail) ? 'administrator' : role,
      status: isSuperAdminEmail(normalizedEmail) ? 'active' : status,
      belt: wkf.beltName,
      beltColor: wkf.beltColor,
      kyuDan: kyuDan || '9° Kyu',
      birthDate: birthDate || '',
      weight: parsedWeight,
      gender: gender || 'male',
      age: wkf.age,
      kataCategory: wkf.kataCategory,
      kumiteCategory: wkf.kumiteCategory,
      classesAttended: 0,
      joinedDate: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      createdAt: new Date(),
      approvedAt: status === 'active' ? new Date().toISOString() : null,
      approvedBy: auth.userEmail,
    };

    const result = await usersCol.insertOne(newUser);

    return NextResponse.json({
      success: true,
      user: { ...newUser, id: result.insertedId.toString() },
      message: 'Estudiante registrado exitosamente con categorías WKF calculadas',
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Modificar rol, estado, grado o datos marciales de un usuario
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      email,
      role,
      status,
      kyuDan,
      birthDate,
      weight,
      gender,
      classesAttended,
    } = body;

    if (!id && !email) {
      return NextResponse.json({ error: 'Se requiere ID o email del usuario' }, { status: 400 });
    }

    const db = await getDatabase();
    const usersCol = db.collection('Users');

    const query = id ? { _id: new ObjectId(id) } : { email: email.toLowerCase().trim() };
    const userToUpdate = await usersCol.findOne(query);

    if (!userToUpdate) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Proteger cuenta super admin contra degradación accidental
    if (isSuperAdminEmail(userToUpdate.email) && role && role !== 'administrator') {
      return NextResponse.json(
        { error: 'No se pueden revocar los permisos del Super Administrador principal' },
        { status: 400 }
      );
    }

    const updateFields: Record<string, unknown> = {};

    if (role) updateFields.role = role;
    if (status) {
      updateFields.status = status;
      if (status === 'active' && userToUpdate.status !== 'active') {
        updateFields.approvedAt = new Date().toISOString();
        updateFields.approvedBy = auth.userEmail;
      }
    }
    if (typeof classesAttended === 'number') updateFields.classesAttended = classesAttended;

    // Calcular y actualizar datos marciales
    const targetKyuDan = kyuDan !== undefined ? kyuDan : userToUpdate.kyuDan;
    const targetBirthDate = birthDate !== undefined ? birthDate : userToUpdate.birthDate;
    const targetWeight = weight !== undefined ? (weight !== '' && weight !== null ? Number(weight) : null) : userToUpdate.weight;
    const targetGender = gender !== undefined ? gender : (userToUpdate.gender || 'male');

    const wkf = calculateWKFCategories({
      birthDate: targetBirthDate,
      weight: targetWeight ? Number(targetWeight) : undefined,
      gender: targetGender,
      kyuDan: targetKyuDan,
    });

    if (kyuDan !== undefined) {
      updateFields.kyuDan = kyuDan;
      updateFields.belt = wkf.beltName;
      updateFields.beltColor = wkf.beltColor;
    }
    if (birthDate !== undefined) {
      updateFields.birthDate = birthDate;
      updateFields.age = wkf.age;
      updateFields.kataCategory = wkf.kataCategory;
      updateFields.kumiteCategory = wkf.kumiteCategory;
    }
    if (weight !== undefined) {
      updateFields.weight = targetWeight;
      updateFields.kumiteCategory = wkf.kumiteCategory;
    }
    if (gender !== undefined) {
      updateFields.gender = gender;
      updateFields.kataCategory = wkf.kataCategory;
      updateFields.kumiteCategory = wkf.kumiteCategory;
    }

    await usersCol.updateOne(query, { $set: updateFields });

    return NextResponse.json({
      success: true,
      message: 'Datos del estudiante y categorías WKF actualizados correctamente',
      wkf,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un usuario de la colección Users
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id && !email) {
      return NextResponse.json({ error: 'Se requiere id o email para eliminar' }, { status: 400 });
    }

    const db = await getDatabase();
    const query = id ? { _id: new ObjectId(id) } : { email: email?.toLowerCase().trim() };

    const target = await db.collection('Users').findOne(query);
    if (target && isSuperAdminEmail(target.email)) {
      return NextResponse.json(
        { error: 'No es posible eliminar al Super Administrador principal' },
        { status: 400 }
      );
    }

    await db.collection('Users').deleteOne(query);

    return NextResponse.json({ success: true, message: 'Usuario eliminado de la base de datos' });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
