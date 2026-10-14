import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getDatabase } from '@/lib/mongodb';
import { calculateWKFCategories } from '@/lib/wkf-categories';

// Detección y sanitización automática de URL para Vercel
const getNextAuthUrl = () => {
  const rawUrl = process.env.NEXTAUTH_URL;
  if (rawUrl && rawUrl.startsWith('http') && !rawUrl.includes('secret')) {
    return rawUrl;
  }
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://ryukokaiweb.vercel.app';
  }
  return 'http://localhost:3000';
};

process.env.NEXTAUTH_URL = getNextAuthUrl();

// Verificar si el correo corresponde al Super Administrador del Dojo
const isSuperAdminEmail = (email?: string | null) => {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return normalized === 'david.artavia.rodriguez@gmail.com' || normalized === 'davidartaviarodriguez@gmail.com';
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (user.email) {
          const db = await getDatabase();
          const usersCol = db.collection('Users');
          const isAdmin = isSuperAdminEmail(user.email);

          // Si es el super admin, forzar siempre rol administrator y status active
          const updateFields: Record<string, unknown> = {
            name: user.name,
            avatar: user.image,
            lastLogin: new Date(),
          };

          if (isAdmin) {
            updateFields.role = 'administrator';
            updateFields.status = 'active';
            updateFields.approvedAt = new Date().toISOString();
            updateFields.approvedBy = 'system_root';
          }

          await usersCol.updateOne(
            { email: user.email.toLowerCase().trim() },
            {
              $set: updateFields,
              $setOnInsert: {
                googleId: user.id || account?.providerAccountId,
                email: user.email.toLowerCase().trim(),
                belt: isAdmin ? 'Cinturón Negro' : 'Cinturón Blanco',
                beltColor: isAdmin ? '#000000' : '#FFFFFF',
                kyuDan: isAdmin ? '1° Dan' : '9° Kyu',
                role: isAdmin ? 'administrator' : 'viewer',
                status: isAdmin ? 'active' : 'pending',
                joinedDate: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
                classesAttended: 0,
                createdAt: new Date(),
              },
            },
            { upsert: true }
          );
        }
      } catch (err) {
        console.error('Error guardando usuario de Google en MongoDB Users:', err);
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      try {
        const email = token.email?.toLowerCase().trim();
        // Sincronizar con MongoDB solo en login inicial, actualizaciones explícitas o si faltan datos
        if (user || trigger === 'update' || !token.kyuDan) {
          if (email) {
            const db = await getDatabase();
            const dbUser = await db.collection('Users').findOne({ email });
            const isAdmin = isSuperAdminEmail(email);

            if (dbUser) {
              const wkf = calculateWKFCategories({
                birthDate: dbUser.birthDate,
                weight: dbUser.weight,
                gender: dbUser.gender || 'male',
                kyuDan: dbUser.kyuDan || (isAdmin ? '1° Dan' : '9° Kyu'),
              });

              token.userId = dbUser._id.toString();
              token.belt = wkf.beltName || dbUser.belt || (isAdmin ? 'Cinturón Negro' : 'Cinturón Blanco');
              token.beltColor = wkf.beltColor || dbUser.beltColor || '#FFFFFF';
              token.kyuDan = dbUser.kyuDan || (isAdmin ? '1° Dan' : '9° Kyu');
              token.birthDate = dbUser.birthDate || '';
              token.weight = dbUser.weight !== undefined ? dbUser.weight : null;
              token.gender = dbUser.gender || 'male';
              token.age = wkf.age;
              token.kataCategory = wkf.kataCategory;
              token.kumiteCategory = wkf.kumiteCategory;
              token.role = isAdmin ? 'administrator' : (dbUser.role || 'viewer');
              token.status = isAdmin ? 'active' : (dbUser.status || 'pending');
              token.classesAttended = dbUser.classesAttended || 0;
            } else if (isAdmin) {
              token.role = 'administrator';
              token.status = 'active';
              token.kyuDan = '1° Dan';
              token.belt = 'Cinturón Negro';
              token.beltColor = '#000000';
            }
          }
        }
      } catch (err) {
        console.error('Error enriqueciendo JWT con MongoDB:', err);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as Record<string, unknown>;
        if (token.userId) u.id = token.userId;
        if (token.belt) u.belt = token.belt;
        if (token.beltColor) u.beltColor = token.beltColor;
        if (token.kyuDan) u.kyuDan = token.kyuDan;
        if (token.birthDate !== undefined) u.birthDate = token.birthDate;
        if (token.weight !== undefined) u.weight = token.weight;
        if (token.gender) u.gender = token.gender;
        if (token.age !== undefined) u.age = token.age;
        if (token.kataCategory) u.kataCategory = token.kataCategory;
        if (token.kumiteCategory) u.kumiteCategory = token.kumiteCategory;
        if (token.role) u.role = token.role;
        if (token.status) u.status = token.status;
        if (token.classesAttended !== undefined) u.classesAttended = token.classesAttended;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET || 'ryokukai_auth_super_secret_key_88921471',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
