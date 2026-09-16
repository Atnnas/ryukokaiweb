import type { Metadata, Viewport } from 'next';
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#070709',
};

export const metadata: Metadata = {
  title: 'Ryoku Kai | Escuela de Karate Do • Disciplina, Poder y Honor',
  description: 'Dojo oficial de Karate Do tradicional y de alta competencia Ryoku Kai. Formación marcial, valores de disciplina, karate infantil, juvenil y adultos.',
  keywords: ['karate', 'dojo', 'ryoku kai', 'ryuko kai', 'artes marciales', 'defensa personal', 'kata', 'kumite'],
  openGraph: {
    title: 'Ryoku Kai | Escuela de Karate Do',
    description: 'Equilibrio entre la mente, la técnica y el espíritu. Conoce nuestros programas marciales y entrena en Ryoku Kai.',
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
