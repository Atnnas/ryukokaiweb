'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Clock, Mail, Shield, Award, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Footer() {
  const pathname = usePathname();
  const { openAuthModal } = useAuth();

  // El footer se muestra en TODAS las rutas excepto en el área administrativa (/admin)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer
      style={{
        backgroundColor: '#07080B',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        zIndex: 10,
        paddingTop: '4.5rem',
        paddingBottom: '2.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="container-dojo">
        {/* Cuadrícula Principal del Footer */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'clamp(2rem, 4vw, 3.5rem)',
            marginBottom: '3.5rem',
          }}
        >
          {/* Columna 1: Marca & Identidad */}
          <div style={{ maxWidth: '360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 80%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/images/logos/Logo_Blanco_Color_Transparente.png"
                  alt="Logo Dojo Ying Yang"
                  width={38}
                  height={38}
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.06em', lineHeight: 1.1 }}>
                  DOJO <span style={{ color: '#8CA6F8' }}>YING</span> <span style={{ color: '#E55353' }}>YANG</span>
                </span>
                <span style={{ fontSize: '0.68rem', color: '#9FA6B8', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700 }}>
                  Karate Do Tradicional
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#9DA3B4', lineHeight: 1.65, marginBottom: '1.5rem' }}>
              Forjamos carácter, rectitud moral, autocontrol y fortaleza física y mental a través del camino del Karate Do tradicional y formativo.
            </p>

            {/* Redes Sociales */}
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  backgroundColor: '#131620',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#CBD5E1',
                  transition: 'all 0.2s',
                }}
                aria-label="Instagram Dojo Ying Yang"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  backgroundColor: '#131620',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#CBD5E1',
                  transition: 'all 0.2s',
                }}
                aria-label="Facebook Dojo Ying Yang"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  backgroundColor: '#131620',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#CBD5E1',
                  transition: 'all 0.2s',
                }}
                aria-label="YouTube Dojo Ying Yang"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                  <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Columna 2: Navegación & Acceso */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#F7F8FA', marginBottom: '1.25rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Navegación
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
              <li>
                <Link href="/" style={{ color: '#9DA3B4', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.15s' }}>
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/nosotros" style={{ color: '#9DA3B4', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.15s' }}>
                  Nosotros & Senseis
                </Link>
              </li>
              <li>
                <Link href="/noticias" style={{ color: '#9DA3B4', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.15s' }}>
                  Noticias & Redes
                </Link>
              </li>
              <li>
                <Link href="/contacto" style={{ color: '#9DA3B4', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.15s' }}>
                  Ubicación & Contacto
                </Link>
              </li>
              <li>
                <button
                  onClick={openAuthModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8CA6F8',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Users size={14} /> Acceso Alumnos
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 3: Principios del Dojo (Dojo Kun) */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#F7F8FA', marginBottom: '1.25rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Dojo Kun (Principios)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: '#9DA3B4' }}>
              <p style={{ margin: 0 }}>• Perfeccionar el carácter personal.</p>
              <p style={{ margin: 0 }}>• Ser leal y mantener el camino de la sinceridad.</p>
              <p style={{ margin: 0 }}>• Cultivar el espíritu de superación constante.</p>
              <p style={{ margin: 0 }}>• Honrar los principios de la cortesía y el respeto.</p>
              <p style={{ margin: 0 }}>• Abstenerse de la conducta violenta.</p>
            </div>
          </div>

          {/* Columna 4: Contacto Directo */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#F7F8FA', marginBottom: '1.25rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Horarios & Contacto
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', color: '#9DA3B4' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <MapPin size={17} color="#E55353" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Instalaciones Centrales del Dojo, Área de Tatami Oficial</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Clock size={17} color="#8CA6F8" style={{ flexShrink: 0 }} />
                <span>Lun a Vie: 16:00 - 21:30 | Sáb: 08:00 - 13:00</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Phone size={17} color="#4ADE80" style={{ flexShrink: 0 }} />
                <span>Informes & WhatsApp Directo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Mail size={17} color="#ECC94B" style={{ flexShrink: 0 }} />
                <span>contacto@dojoyingyang.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fila Intermedia: Copyright y Seguridad */}
        <div
          style={{
            paddingTop: '1.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#676E80',
          }}
        >
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} Dojo de Karate Ying Yang. Todos los derechos reservados.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Shield size={14} /> Sistema Autenticado con Google OAuth 2.0
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Award size={14} color="#ECC94B" /> Grados Oficiales
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PURA BASE: DEVELOPED BY KUMADEV.INC                          */}
        {/* ============================================================ */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.78rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#8A92A6',
          }}
        >
          <span>developed by</span>
          <span
            style={{
              fontWeight: 800,
              color: '#8CA6F8',
              letterSpacing: '0.14em',
              backgroundColor: 'rgba(35, 52, 107, 0.25)',
              padding: '0.2rem 0.65rem',
              borderRadius: '4px',
              border: '1px solid rgba(140, 166, 248, 0.25)',
              boxShadow: '0 0 12px rgba(35, 52, 107, 0.2)',
            }}
          >
            Kumadev.inc
          </span>
        </div>
      </div>
    </footer>
  );
}
