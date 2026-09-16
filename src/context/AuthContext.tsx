'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sincronizar usuario de NextAuth con nuestro estado de aplicación
  useEffect(() => {
    if (session?.user) {
      const u = session.user as Record<string, unknown>;
      const authUser: User = {
        id: (u.id as string) || session.user.email || 'usr_google',
        name: session.user.name || 'Alumno',
        email: session.user.email || '',
        avatar: session.user.image || undefined,
        belt: (u.belt as string) || 'Cinturón Blanco',
        beltColor: (u.beltColor as string) || ((u.belt as string)?.toLowerCase().includes('negro') ? '#000000' : '#FFFFFF'),
        kyuDan: (u.kyuDan as string) || '9° Kyu',
        birthDate: (u.birthDate as string) || undefined,
        weight: typeof u.weight === 'number' ? u.weight : undefined,
        gender: (u.gender as 'male' | 'female') || undefined,
        age: typeof u.age === 'number' ? u.age : undefined,
        kataCategory: (u.kataCategory as string) || undefined,
        kumiteCategory: (u.kumiteCategory as string) || undefined,
        role: (u.role as User['role']) || 'viewer',
        status: (u.status as User['status']) || 'pending',
        joinedDate: 'Registrado',
        classesAttended: (u.classesAttended as number) || 0,
      };
      setUser(authUser);
    } else if (status === 'unauthenticated') {
      setUser(null);
    }
  }, [session, status]);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loginWithGoogle = async () => {
    try {
      // Iniciar el flujo de OAuth 2.0 oficial de Google
      await signIn('google', { callbackUrl: window.location.href });
    } catch (err) {
      console.error('Error al iniciar sesión con Google:', err);
    }
  };

  const logout = () => {
    setUser(null);
    signOut({ callbackUrl: '/' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: status === 'loading',
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
