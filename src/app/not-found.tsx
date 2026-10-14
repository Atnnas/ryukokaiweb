import React from 'react';
import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
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
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(212, 175, 55, 0.12)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            color: '#F5D77F',
          }}
        >
          <Compass size={32} />
        </div>
        <span
          style={{
            display: 'block',
            fontSize: '3.5rem',
            fontWeight: 900,
            lineHeight: 1,
            color: '#D4AF37',
            marginBottom: '0.5rem',
            fontFamily: 'monospace',
          }}
        >
          404
        </span>
        <h1
          style={{
            fontSize: '1.4rem',
            fontWeight: 900,
            color: '#FFFFFF',
            marginBottom: '0.75rem',
            letterSpacing: '0.04em',
          }}
        >
          Camino No Encontrado
        </h1>
        <p
          style={{
            fontSize: '0.95rem',
            color: '#D1D5DB',
            lineHeight: 1.6,
            marginBottom: '1.75rem',
          }}
        >
          El área del dojo o la sección que estás buscando no existe o fue reubicada en el tatami.
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Link href="/" className="btn-martial-primary">
            <Home size={18} />
            Regresar al Dojo Principal
          </Link>
        </div>
      </div>
    </div>
  );
}
