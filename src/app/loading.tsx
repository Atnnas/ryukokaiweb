import React from 'react';

export default function Loading() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem',
      }}
      aria-live="polite"
      aria-busy="true"
    >
      <div
        style={{
          position: 'relative',
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(212, 175, 55, 0.15)',
            borderTopColor: '#D4AF37',
            animation: 'spin 1s linear infinite',
          }}
        />
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#D4AF37',
            boxShadow: '0 0 12px #D4AF37',
          }}
        />
      </div>
      <p
        style={{
          fontSize: '0.88rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#F5D77F',
          fontWeight: 700,
        }}
      >
        Cargando Dojo Ryoku Kai...
      </p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
