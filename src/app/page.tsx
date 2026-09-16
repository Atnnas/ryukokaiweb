'use client';

import React from 'react';
import Image from 'next/image';
import { Droplets, Flame } from 'lucide-react';
import SponsorsTicker from '@/components/sponsors/SponsorsTicker';

export default function HomePage() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 76px)', display: 'flex', alignItems: 'center' }}>
      {/* ================= HERO SECTION (PANTALLA COMPLETA) ================= */}
      <section
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          paddingTop: 'clamp(2rem, 4vw, 3.5rem)',
          paddingBottom: 'clamp(2.5rem, 5vw, 4rem)',
          position: 'relative',
        }}
      >
        <div className="container-dojo" style={{ width: '100%' }}>
          <div
            className="hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'clamp(2.5rem, 5vw, 6rem)',
              width: '100%',
            }}
          >
            {/* Columna Izquierda: Texto y Pasarela de Patrocinadores */}
            <div style={{ maxWidth: '780px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.45rem 1rem',
                  borderRadius: '30px',
                  backgroundColor: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  marginBottom: '1.25rem',
                  boxShadow: '0 0 15px rgba(212, 175, 55, 0.1)',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#D4AF37',
                    boxShadow: '0 0 8px #D4AF37',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#F5D77F',
                  }}
                >
                  Dojo Tradicional & Kumite Deportivo
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                  marginBottom: '1.25rem',
                  color: '#FFFFFF',
                }}
              >
                Camino a la Excelencia Marcial en{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5D77F 50%, #D4AF37 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Ryoku Kai
                </span>
              </h1>

              <p
                style={{
                  fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
                  color: '#D1D5DB',
                  lineHeight: 1.65,
                  marginBottom: '1.75rem',
                  maxWidth: '640px',
                }}
              >
                Forjamos mente, cuerpo y espíritu a través del Karate Do tradicional y formativo. Forja tu carácter con disciplina, poder, honor y excelencia marcial.
              </p>

              {/* Cintillo / Pasarela de Patrocinadores */}
              <SponsorsTicker />
            </div>

            {/* Columna Derecha: Tarjeta Glassmorphic con el Logo Oficial */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                position: 'relative',
                width: '100%',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '520px',
                  background: 'linear-gradient(145deg, rgba(16, 18, 24, 0.85) 0%, rgba(8, 9, 12, 0.98) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '16px',
                  padding: 'clamp(2rem, 4vw, 3rem)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 50px rgba(212, 175, 55, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'center',
                }}
              >
                {/* Símbolo Central: Logo Oficial */}
                <div
                  style={{
                    width: 'clamp(180px, 30vw, 250px)',
                    height: 'clamp(180px, 30vw, 250px)',
                    margin: '0 auto 1.5rem',
                    position: 'relative',
                    filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 20px rgba(212, 175, 55, 0.2))',
                  }}
                >
                  <Image
                    src="/images/logos/LogoRyukukaiSinFondo.png"
                    alt="Logo Insignia Oficial Ryūko Kai"
                    fill
                    sizes="(max-width: 768px) 200px, 250px"
                    style={{ objectFit: 'contain' }}
                    priority
                  />
                </div>

                <h3
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                    marginBottom: '0.5rem',
                    color: '#FFFFFF',
                  }}
                >
                  <span style={{ color: '#D4AF37' }}>RYOKU</span> KAI
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#9FA6B8', margin: '0 auto 1.5rem', maxWidth: '360px', lineHeight: 1.5 }}>
                  El arte de vencer sin luchar y la firmeza del golpe que nace de la calma interior.
                </p>

                {/* Pilares Marciales Dragón y Tigre en Dorado y Blanco */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div
                    style={{
                      padding: '0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(212, 175, 55, 0.12)',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#F5D77F', fontWeight: 800, fontSize: '0.85rem' }}>
                      <Droplets size={16} color="#D4AF37" />
                      <span>RYŪ • DRAGÓN</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#CBD5E1', margin: '0.3rem 0 0' }}>
                      Sabiduría, fluidez técnica, concentración y autocontrol.
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FFFFFF', fontWeight: 800, fontSize: '0.85rem' }}>
                      <Flame size={16} color="#FFFFFF" />
                      <span>KO • TIGRE</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#CBD5E1', margin: '0.3rem 0 0' }}>
                      Potencia de impacto, espíritu indomable y resolución.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Media query para grid responsivo */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
