'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, ShieldCheck, Lock, Award, CheckCircle2 } from 'lucide-react';

export default function GoogleAuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, isLoading } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 10, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={closeAuthModal}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#12151E',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          padding: 'clamp(1.5rem, 5vw, 2.25rem)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(35, 52, 107, 0.25)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: '#9FA6B8',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            transition: 'color 0.2s',
          }}
          aria-label="Cerrar modal"
        >
          <X size={20} />
        </button>

        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(35, 52, 107, 0.25)',
              border: '1px solid rgba(57, 79, 154, 0.4)',
              color: '#8CA6F8',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck size={14} /> Portal de Alumnos & Maestros
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: '#F7F8FA' }}>
            Acceso al Dojo Ying Yang
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#9FA6B8', lineHeight: 1.5 }}>
            Inicia sesión con tu cuenta oficial de Google para gestionar tus asistencias, exámenes de grado y horarios.
          </p>
        </div>

        {/* Botón Oficial de Google */}
        <button
          onClick={loginWithGoogle}
          disabled={isLoading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.85rem',
            padding: '0.9rem 1.25rem',
            backgroundColor: '#ffffff',
            color: '#1f1f1f',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {/* Logo SVG Oficial de Google */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          {isLoading ? 'Conectando con Google...' : 'Continuar con Google'}
        </button>

        {/* Beneficios / Seguridad */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#8891A6' }}>
            <CheckCircle2 size={15} color="#48BB78" />
            <span>Registro de asistencias y calendario de entrenamientos</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#8891A6' }}>
            <Award size={15} color="#ECC94B" />
            <span>Historial de grados (Kyu / Dan) y preparación para exámenes</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#8891A6' }}>
            <Lock size={15} color="#4299E1" />
            <span>Seguridad y privacidad respaldadas por Google Identity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
