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
    async session({ session }) {
      try {
        if (session.user?.email) {
          const db = await getDatabase();
          const email = session.user.email.toLowerCase().trim();
          const dbUser = await db.collection('Users').findOne({ email });
          const isAdmin = isSuperAdminEmail(email);

          if (dbUser) {
            const wkf = calculateWKFCategories({
              birthDate: dbUser.birthDate,
              weight: dbUser.weight,
              gender: dbUser.gender || 'male',
              kyuDan: dbUser.kyuDan || (isAdmin ? '1° Dan' : '9° Kyu'),
            });

            (session.user as Record<string, unknown>).id = dbUser._id.toString();
            (session.user as Record<string, unknown>).belt = wkf.beltName || dbUser.belt || (isAdmin ? 'Cinturón Negro' : 'Cinturón Blanco');
            (session.user as Record<string, unknown>).beltColor = wkf.beltColor || dbUser.beltColor || '#FFFFFF';
            (session.user as Record<string, unknown>).kyuDan = dbUser.kyuDan || (isAdmin ? '1° Dan' : '9° Kyu');
            (session.user as Record<string, unknown>).birthDate = dbUser.birthDate || '';
            (session.user as Record<string, unknown>).weight = dbUser.weight !== undefined ? dbUser.weight : null;
            (session.user as Record<string, unknown>).gender = dbUser.gender || 'male';
            (session.user as Record<string, unknown>).age = wkf.age;
            (session.user as Record<string, unknown>).kataCategory = dbUser.kataCategory || wkf.kataCategory;
            (session.user as Record<string, unknown>).kumiteCategory = dbUser.kumiteCategory || wkf.kumiteCategory;
            (session.user as Record<string, unknown>).role = isAdmin ? 'administrator' : (dbUser.role || 'viewer');
            (session.user as Record<string, unknown>).status = isAdmin ? 'active' : (dbUser.status || 'pending');
            (session.user as Record<string, unknown>).classesAttended = dbUser.classesAttended || 0;
          } else if (isAdmin) {
            (session.user as Record<string, unknown>).role = 'administrator';
            (session.user as Record<string, unknown>).status = 'active';
            (session.user as Record<string, unknown>).kyuDan = '1° Dan';
          }
        }
      } catch (err) {
        console.error('Error enriqueciendo sesión con MongoDB Users:', err);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'dojo_yingyang_auth_super_secret_key_88921471',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
