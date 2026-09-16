import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Award, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nosotros | Ryoku Kai - Escuela de Karate Do',
  description: 'Conoce la historia, linaje marcial y filosofía de Ryoku Kai.',
};

export default function NosotrosPage() {
  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* ================= HERO NOSOTROS ================= */}
      <section
        style={{
          padding: 'clamp(3rem, 6vw, 5rem) 0 3rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
          backgroundColor: '#0A0B0E',
          position: 'relative',
        }}
      >
        <div className="container-dojo">
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#F5D77F',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.75rem',
              }}
            >
              Linaje, Historia & Tradición
            </span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', marginBottom: '1.25rem' }}>
              Sobre Ryoku Kai
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#9DA3B4', lineHeight: 1.7 }}>
              Nacimos con el firme propósito de ser más que una academia deportiva: un santuario donde cada alumno descubre su máximo potencial físico y cultiva una mente inquebrantable.
            </p>
          </div>
        </div>
      </section>

      {/* ================= HISTORIA & LINAJE ================= */}
      <section style={{ padding: 'clamp(3.5rem, 7vw, 5.5rem) 0' }}>
        <div className="container-dojo">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F5D77F', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                Nuestra Génesis
              </span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', marginBottom: '1.25rem' }}>
                La Fuerza del Dragón y el Tigre
              </h2>
              <p style={{ fontSize: '1rem', color: '#9DA3B4', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                Fundado con el más alto rigor marcial, <strong>Ryoku Kai</strong> toma su inspiración de la unión del Dragón y el Tigre. Creemos que la fuerza sin control mental es destructiva, y que la calma sin capacidad de respuesta es vulnerable.
              </p>
              <p style={{ fontSize: '1rem', color: '#9DA3B4', lineHeight: 1.7, marginBottom: '2rem' }}>
                Nuestro método forja al practicante en el dominio técnico integral: la serenidad táctica, la fluidez del esquive, la explosividad del impacto y un código de honor inquebrantable.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ padding: '1.25rem', backgroundColor: '#0E0F14', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '8px' }}>
                  <Award size={24} color="#D4AF37" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '1.1rem', margin: 0, color: '#FFFFFF' }}>Afiliación Oficial</h4>
                  <p style={{ fontSize: '0.82rem', color: '#9DA3B4', margin: '0.35rem 0 0' }}>Reconocidos por federaciones nacionales e internacionales de Karate Do.</p>
                </div>
                <div style={{ padding: '1.25rem', backgroundColor: '#0E0F14', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '8px' }}>
                  <Shield size={24} color="#F5D77F" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '1.1rem', margin: 0, color: '#FFFFFF' }}>Espacio Seguro</h4>
                  <p style={{ fontSize: '0.82rem', color: '#9DA3B4', margin: '0.35rem 0 0' }}>Ambiente familiar con protocolos estrictos de cuidado y cero tolerancia al abuso.</p>
                </div>
              </div>
            </div>

            {/* Ilustración de Marca con Logo y Marco Ceremonial */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '440px',
                  backgroundColor: '#0E0F14',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '16px',
                  padding: '2.5rem',
                  textAlign: 'center',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 175, 55, 0.1)',
                }}
              >
                <div
                  style={{
                    width: '160px',
                    height: '160px',
                    margin: '0 auto 1.5rem',
                    position: 'relative',
                  }}
                >
                  <Image
                    src="/images/logos/LogoRyukukaiSinFondo.png"
                    alt="Emblema Oficial Ryūko Kai"
                    fill
                    sizes="160px"
                    style={{ objectFit: 'contain' }}
                  />
                </div>

                <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>
                  Uniformes & Grados Certificados
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#9DA3B4', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Todos los cinturones y grados emitidos en nuestro dojo están avalados con certificado de autenticidad y registro de linaje.
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    fontSize: '0.8rem',
                    color: '#F5D77F',
                  }}
                >
                  <span style={{ padding: '0.35rem 0.75rem', backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '4px' }}>
                    Kata
                  </span>
                  <span style={{ padding: '0.35rem 0.75rem', backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '4px' }}>
                    Kumite
                  </span>
                  <span style={{ padding: '0.35rem 0.75rem', backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '4px' }}>
                    Bunkai
                  </span>
                  <span style={{ padding: '0.35rem 0.75rem', backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '4px' }}>
                    Kihon
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <Link href="/contacto" className="btn-martial-primary" style={{ padding: '0.9rem 2.25rem' }}>
              <span>Ven a Conocer Nuestras Instalaciones</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
