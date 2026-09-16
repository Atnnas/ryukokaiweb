import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Sponsor, SponsorTier, SponsorStatus } from '@/types';

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

// Helper para calcular estado según fecha de vencimiento
function computeSponsorStatus(contractExpiry?: string): SponsorStatus {
  if (!contractExpiry) return 'active';
  const today = new Date().toISOString().split('T')[0];
  if (contractExpiry < today) {
    return 'expired';
  }
  return 'active';
}

// GET: Listar todos los patrocinadores
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason || 'Acceso no autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const tierFilter = searchParams.get('tier') || '';
    const statusFilter = searchParams.get('status') || '';

    const db = await getDatabase();
    const query: Record<string, unknown> = {};

    if (tierFilter && tierFilter !== 'all') {
      query.tier = tierFilter;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const rawSponsors = await db
      .collection('Sponsors')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const sponsors: Sponsor[] = rawSponsors.map((s) => {
      const computedStatus = computeSponsorStatus(s.contractExpiry);
      return {
        id: s._id.toString(),
        _id: s._id.toString(),
        name: s.name || 'Sin nombre',
        logo: s.logo || '',
        contractStart: s.contractStart || '',
        contractExpiry: s.contractExpiry || '',
        tier: (s.tier as SponsorTier) || 'bronce',
        websiteUrl: s.websiteUrl || '',
        phone: s.phone || '',
        notes: s.notes || '',
        status: s.status || computedStatus,
        createdAt: s.createdAt || new Date(),
        updatedAt: s.updatedAt || new Date(),
      };
    });

    const filtered = statusFilter && statusFilter !== 'all'
      ? sponsors.filter((s) => s.status === statusFilter)
      : sponsors;

    return NextResponse.json({ success: true, sponsors: filtered });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear un nuevo patrocinador
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      logo,
      contractExpiry,
      contractStart,
      tier = 'bronce',
      websiteUrl = '',
      phone = '',
      notes = '',
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'El nombre del patrocinador es obligatorio' }, { status: 400 });
    }
    if (!logo) {
      return NextResponse.json({ error: 'Debe cargar el logotipo o imagen del patrocinador' }, { status: 400 });
    }
    if (!contractExpiry) {
      return NextResponse.json({ error: 'La fecha de vigencia del contrato es obligatoria' }, { status: 400 });
    }

    const db = await getDatabase();
    const sponsorsCol = db.collection('Sponsors');

    const status = computeSponsorStatus(contractExpiry);

    const newSponsor = {
      name: name.trim(),
      logo,
      contractStart: contractStart || new Date().toISOString().split('T')[0],
      contractExpiry,
      tier: tier as SponsorTier,
      websiteUrl: websiteUrl.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      status,
      createdBy: auth.userEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await sponsorsCol.insertOne(newSponsor);

    return NextResponse.json({
      success: true,
      sponsor: { ...newSponsor, id: result.insertedId.toString() },
      message: 'Patrocinador registrado exitosamente',
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Editar un patrocinador existente
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, logo, contractExpiry, contractStart, tier, websiteUrl, phone, notes, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Se requiere el ID del patrocinador a modificar' }, { status: 400 });
    }

    const db = await getDatabase();
    const sponsorsCol = db.collection('Sponsors');

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy: auth.userEmail,
    };

    if (name) updateFields.name = name.trim();
    if (logo) updateFields.logo = logo;
    if (tier) updateFields.tier = tier;
    if (contractStart) updateFields.contractStart = contractStart;
    if (contractExpiry) {
      updateFields.contractExpiry = contractExpiry;
      updateFields.status = computeSponsorStatus(contractExpiry);
    }
    if (status) updateFields.status = status;
    if (websiteUrl !== undefined) updateFields.websiteUrl = websiteUrl.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (notes !== undefined) updateFields.notes = notes.trim();

    const result = await sponsorsCol.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Patrocinador no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Patrocinador actualizado correctamente',
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Borrar un patrocinador
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Se requiere el ID del patrocinador a eliminar' }, { status: 400 });
    }

    const db = await getDatabase();
    const result = await db.collection('Sponsors').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Patrocinador no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Patrocinador eliminado permanentemente de la base de datos',
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
