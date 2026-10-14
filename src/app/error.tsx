'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error no capturado en la aplicación:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '65vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '2.5rem',
          textAlign: 'center',
          border: '1px solid rgba(212, 175, 55, 0.35)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(212, 175, 55, 0.12)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            color: '#F5D77F',
          }}
        >
          <AlertTriangle size={28} />
        </div>
        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 900,
            color: '#FFFFFF',
            marginBottom: '0.75rem',
            letterSpacing: '0.04em',
          }}
        >
          Ha ocurrido un percance en el Dojo
        </h2>
        <p
          style={{
            fontSize: '0.95rem',
            color: '#D1D5DB',
            lineHeight: 1.6,
            marginBottom: '1.75rem',
          }}
        >
          No te preocupes. Como en el karate, la resiliencia es clave. Puedes reintentar la acción o volver a la entrada principal.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => reset()}
            className="btn-martial-primary"
            style={{ cursor: 'pointer' }}
          >
            <RotateCcw size={18} />
            Reintentar
          </button>
          <Link href="/" className="btn-martial-secondary">
            <Home size={18} />
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
