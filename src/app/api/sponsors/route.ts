import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Sponsor } from '@/types';

// Endpoint PÚBLICO para el cintillo de la página principal
export async function GET() {
  try {
    const db = await getDatabase();
    const today = new Date().toISOString().split('T')[0];

    // Buscar patrocinadores activos cuya fecha de vigencia no haya expirado
    const rawSponsors = await db
      .collection('Sponsors')
      .find({
        $or: [
          { status: 'active' },
          { status: { $exists: false } },
        ],
      })
      .sort({ tier: 1, createdAt: -1 })
      .toArray();

    const sponsors: Sponsor[] = rawSponsors
      .filter((s) => !s.contractExpiry || s.contractExpiry >= today)
      .map((s) => ({
        id: s._id.toString(),
        name: s.name,
        logo: s.logo,
        tier: s.tier || 'oro',
        websiteUrl: s.websiteUrl || '',
        phone: s.phone || '',
        contractExpiry: s.contractExpiry || '',
        status: 'active',
      }));

    return NextResponse.json({ success: true, sponsors });
  } catch (err: unknown) {
    console.error('Error obteniendo patrocinadores públicos:', err);
    return NextResponse.json({ success: true, sponsors: [] });
  }
}
