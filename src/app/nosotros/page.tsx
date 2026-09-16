import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Award, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nosotros | Dojo de Karate Ying Yang',
  description: 'Conoce la historia, linaje marcial y filosofía de nuestro dojo de karate.',
};

export default function NosotrosPage() {
  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* ================= HERO NOSOTROS ================= */}
      <section
        style={{
          padding: 'clamp(3rem, 6vw, 5rem) 0 3rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0C0E14',
          position: 'relative',
        }}
      >
        <div className="container-dojo">
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#8CA6F8',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.75rem',
              }}
            >
              Linaje, Historia & Tradición
            </span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', marginBottom: '1.25rem' }}>
              Sobre el Dojo Ying Yang
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
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FF8A8A', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                Nuestra Génesis
              </span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', marginBottom: '1.25rem' }}>
                El Principio del Equilibrio
              </h2>
              <p style={{ fontSize: '1rem', color: '#9DA3B4', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                Fundado hace más de dos décadas, el <strong>Dojo Ying Yang</strong> toma su nombre del principio universal de la complementariedad. Creemos que la fuerza bruta sin control mental es destructiva, y que la calma sin capacidad de respuesta es vulnerable.
              </p>
              <p style={{ fontSize: '1rem', color: '#9DA3B4', lineHeight: 1.7, marginBottom: '2rem' }}>
                Nuestro método entrena al practicante en ambos polos: el <strong>Ying</strong> (la serenidad, el esquive elástico, la estrategia fría y la compasión) y el <strong>Yang</strong> (la explosividad del impacto, la decisión implacable y el coraje frente al reto).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ padding: '1.25rem', backgroundColor: '#131620', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }}>
                  <Award size={24} color="#8CA6F8" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '1.1rem', margin: 0, color: '#F7F8FA' }}>Afiliación Oficial</h4>
                  <p style={{ fontSize: '0.82rem', color: '#9DA3B4', margin: '0.35rem 0 0' }}>Reconocidos por federaciones nacionales e internacionales de Karate Do.</p>
                </div>
                <div style={{ padding: '1.25rem', backgroundColor: '#131620', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }}>
                  <Shield size={24} color="#FF8A8A" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '1.1rem', margin: 0, color: '#F7F8FA' }}>Espacio Seguro</h4>
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
                  backgroundColor: '#11141C',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  padding: '2.5rem',
                  textAlign: 'center',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
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
                    src="/images/logos/Logo_Blanco_Transparente.png"
                    alt="Emblema Dojo Ying Yang"
                    fill
                    sizes="160px"
                    style={{ objectFit: 'contain' }}
                  />
                </div>

                <h3 style={{ fontSize: '1.3rem', color: '#F7F8FA', marginBottom: '0.5rem' }}>
                  Uniformes & Grados Certificados
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#9DA3B4', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Todos los cinturones y grados emitidos en nuestro dojo están avalados con certificado de autenticidad y registro de linaje.
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    fontSize: '0.8rem',
                    color: '#CBD5E1',
                  }}
                >
                  <span style={{ padding: '0.35rem 0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                    Kata
                  </span>
                  <span style={{ padding: '0.35rem 0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                    Kumite
                  </span>
                  <span style={{ padding: '0.35rem 0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                    Bunkai
                  </span>
                  <span style={{ padding: '0.35rem 0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
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
