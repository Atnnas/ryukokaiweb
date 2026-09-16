import type { Metadata } from 'next';
import { Zen_Kaku_Gothic_New } from 'next/font/google';
import './globals.css';
import NextAuthWrapper from '@/context/NextAuthWrapper';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GoogleAuthModal from '@/components/auth/GoogleAuthModal';

const zenKaku = Zen_Kaku_Gothic_New({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-zen-kaku',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dojo de Karate Ying Yang | Disciplina, Poder y Equilibrio',
  description: 'Dojo oficial de Karate Do tradicional y de alta competencia. Formación marcial, valores de disciplina, karate infantil, juvenil y adultos.',
  keywords: ['karate', 'dojo', 'ying yang', 'artes marciales', 'defensa personal', 'kata', 'kumite'],
  openGraph: {
    title: 'Dojo de Karate Ying Yang',
    description: 'Equilibrio entre la mente, la técnica y el espíritu. Conoce nuestros programas marciales y entrena en el Dojo Ying Yang.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={zenKaku.variable}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NextAuthWrapper>
          <AuthProvider>
            <Header />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
            <GoogleAuthModal />
          </AuthProvider>
        </NextAuthWrapper>
      </body>
    </html>
  );
}
