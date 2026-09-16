import { MongoClient } from 'mongodb';
import dns from 'dns';

// Resolver DNS con servidores confiables de Google y Cloudflare
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignorar si el entorno no lo permite
}

import fs from 'fs';
import path from 'path';

// Cargar variables de .env.local si no están en process.env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0 && !process.env[key.trim()]) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  });
}

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'ryokukai_web_db';

if (!uri) {
  console.error('❌ Error: MONGODB_URI no está definida en .env.local');
  process.exit(1);
}

async function main() {
  console.log(`📡 Conectando a MongoDB Atlas en la base de datos: "${dbName}"...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Conexión establecida con éxito.');

    const db = client.db(dbName);

    // 1. Crear / Asegurar Colección: Users
    console.log('\n🥋 Configurando colección "Users"...');
    const existingCols = (await db.listCollections().toArray()).map((c) => c.name);

    if (!existingCols.includes('Users')) {
      await db.createCollection('Users');
      console.log('  -> Colección "Users" creada.');
    } else {
      console.log('  -> Colección "Users" ya existe.');
    }

    const usersCol = db.collection('Users');
    await usersCol.createIndex({ email: 1 }, { unique: true });
    await usersCol.createIndex({ role: 1, status: 1 });
    await usersCol.createIndex({ kyuDan: 1 });
    console.log('  -> Índices para "Users" verificados ({ email: 1 (único) }, { role, status }, { kyuDan }).');

    // Sembrar usuario Super Administrador si no existe
    const superAdminEmail = 'david.artavia.rodriguez@gmail.com';
    const existingAdmin = await usersCol.findOne({ email: superAdminEmail });
    if (!existingAdmin) {
      await usersCol.insertOne({
        email: superAdminEmail,
        name: 'David Artavia Rodríguez',
        role: 'administrator',
        status: 'active',
        kyuDan: '1° Dan',
        belt: 'Cinturón Negro (Kuro-Obi)',
        phone: '+506 8888-8888',
        classesAttended: 120,
        wkfKataCategory: 'Senior Kata Masculino',
        wkfKumiteCategory: 'Senior Kumite -75 kg',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`  -> Creado usuario Administrador Titular (${superAdminEmail}).`);
    } else {
      await usersCol.updateOne(
        { email: superAdminEmail },
        {
          $set: {
            role: 'administrator',
            status: 'active',
            updatedAt: new Date(),
          },
        }
      );
      console.log(`  -> Permisos de administrador activo confirmados para (${superAdminEmail}).`);
    }

    // 2. Crear / Asegurar Colección: Sponsors
    console.log('\n🤝 Configurando colección "Sponsors"...');
    if (!existingCols.includes('Sponsors')) {
      await db.createCollection('Sponsors');
      console.log('  -> Colección "Sponsors" creada.');
    } else {
      console.log('  -> Colección "Sponsors" ya existe.');
    }

    const sponsorsCol = db.collection('Sponsors');
    await sponsorsCol.createIndex({ tier: 1, active: 1 });
    await sponsorsCol.createIndex({ order: 1 });
    console.log('  -> Índices para "Sponsors" verificados ({ tier, active }, { order }).');

    // Sembrar patrocinadores iniciales si la colección está vacía
    const sponsorCount = await sponsorsCol.countDocuments();
    if (sponsorCount === 0) {
      const initialSponsors = [
        {
          name: 'Arawaza Martial Gear',
          logoUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&auto=format&fit=crop&q=80',
          tier: 'oro',
          active: true,
          contractExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          websiteUrl: 'https://arawaza.com',
          phone: '+1 800 555 1234',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Tokaido Karate Wear',
          logoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80',
          tier: 'oro',
          active: true,
          contractExpiresAt: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
          websiteUrl: 'https://tokaido.japan',
          phone: '+81 3 1234 5678',
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Kuma Nutrition Labs',
          logoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80',
          tier: 'plata',
          active: true,
          contractExpiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          websiteUrl: 'https://kumanutrition.com',
          phone: '+506 7000 0000',
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      await sponsorsCol.insertMany(initialSponsors);
      console.log(`  -> Insertados ${initialSponsors.length} patrocinadores oficiales iniciales.`);
    }

    // 3. Crear / Asegurar Colección: Attendance
    console.log('\n📅 Configurando colección "Attendance"...');
    if (!existingCols.includes('Attendance')) {
      await db.createCollection('Attendance');
      console.log('  -> Colección "Attendance" creada.');
    } else {
      console.log('  -> Colección "Attendance" ya existe.');
    }

    const attendanceCol = db.collection('Attendance');
    await attendanceCol.createIndex({ date: 1, classSession: 1 }, { unique: true });
    console.log('  -> Índice para "Attendance" verificado ({ date: 1, classSession: 1 (único) }).');

    // 4. Crear / Asegurar Colección: contact_leads
    console.log('\n✉️ Configurando colección "contact_leads"...');
    if (!existingCols.includes('contact_leads')) {
      await db.createCollection('contact_leads');
      console.log('  -> Colección "contact_leads" creada.');
    } else {
      console.log('  -> Colección "contact_leads" ya existe.');
    }

    const contactCol = db.collection('contact_leads');
    await contactCol.createIndex({ createdAt: -1 });
    console.log('  -> Índice para "contact_leads" verificado ({ createdAt: -1 }).');

    // Verificación final del listado de colecciones
    const finalCols = await db.listCollections().toArray();
    console.log('\n🎉 ¡Base de datos "ryokukai_web_db" inicializada al 100%!');
    console.log('Colecciones activas:');
    finalCols.forEach((c) => console.log(`  • ${c.name}`));

  } catch (error) {
    console.error('❌ Error durante la configuración de MongoDB:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔒 Conexión cerrada.');
  }
}

main();
