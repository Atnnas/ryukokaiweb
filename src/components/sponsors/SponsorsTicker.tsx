'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sponsor } from '@/types';
import { Handshake, ExternalLink, Phone, Globe } from 'lucide-react';

function formatWebsiteUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function cleanDisplayUrl(url?: string): string {
  if (!url) return '';
  return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
}

export default function SponsorsTicker() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSponsors() {
      try {
        const res = await fetch('/api/sponsors');
        if (res.ok) {
          const data = await res.json();
          setSponsors(data.sponsors || []);
        } else {
          setSponsors([]);
        }
      } catch (err) {
        console.error('Error cargando patrocinadores:', err);
        setSponsors([]);
      } finally {
        setLoading(false);
      }
    }
    loadSponsors();
  }, []);

  // Si no hay patrocinadores guardados en la BD o está cargando, no mostrar nada
  if (loading || sponsors.length === 0) {
    return null;
  }

  // ============================================================
  // CASO 1: HAY UN SOLO PATROCINADOR -> MOSTRAR EL LOGO EN GRANDE
  // SIN EL DISTINTIVO DE SI ES ORO / PLATA / BRONCE
  // CON EL NÚMERO DE TELÉFONO Y DIRECCIÓN WEB DEBAJO DE LA IMAGEN
  // AL DAR CLICK AL LOGO LLEVA AL SITIO WEB REGISTRADO
  // ============================================================
  if (sponsors.length === 1) {
    const sp = sponsors[0];
    const webUrl = formatWebsiteUrl(sp.websiteUrl);
    const displayWeb = cleanDisplayUrl(sp.websiteUrl);
    const phone = sp.phone?.trim() || '+506 2200-5000';

    return (
      <div
        style={{
          marginTop: '2.5rem',
          paddingTop: '1.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          width: '100%',
        }}
      >
        {/* Encabezado Superior de la Pasarela */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(212, 175, 55, 0.25)',
              }}
            >
              <Handshake size={13} color="#D4AF37" />
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#F5D77F',
              }}
            >
              Patrocinador Oficial
            </span>
          </div>

          <Link
            href="/contacto"
            style={{
              fontSize: '0.72rem',
              color: '#9FA6B8',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              transition: 'color 0.15s',
            }}
          >
            <span>Sé un patrocinador</span>
            <ExternalLink size={11} />
          </Link>
        </div>

        {/* Tarjeta de la Pasarela del Patrocinador */}
        <div
          className="sponsor-showcase-box"
          style={{
            background: 'linear-gradient(145deg, rgba(16, 18, 25, 0.95) 0%, rgba(8, 9, 12, 0.98) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(212, 175, 55, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Logo en Grande: Al dar click lleva al sitio web registrado en el admin */}
          {webUrl ? (
            <a
              href={webUrl}
              target="_blank"
              rel="noreferrer"
              title={`Hacer click para visitar el sitio web oficial de ${sp.name}`}
              className="sponsor-logo-link"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                cursor: 'pointer',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05) 0%, rgba(18, 21, 30, 0.3) 70%, transparent 100%)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                transition: 'all 0.25s ease',
              }}
            >
              <div
                style={{
                  height: 'clamp(65px, 9vw, 85px)',
                  maxWidth: 'clamp(180px, 30vw, 280px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={sp.logo}
                  alt={sp.name}
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.7))',
                    transition: 'transform 0.25s ease',
                  }}
                  className="sponsor-logo-img"
                />
              </div>
              <h3
                style={{
                  fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  marginTop: '0.65rem',
                  marginBottom: '0.15rem',
                  letterSpacing: '0.03em',
                  textAlign: 'center',
                }}
              >
                {sp.name}
              </h3>
              <span
                style={{
                  fontSize: '0.7rem',
                  color: '#F5D77F',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                Patrocinador Oficial del Dojo
                <ExternalLink size={11} color="#D4AF37" />
              </span>
            </a>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05) 0%, rgba(18, 21, 30, 0.3) 70%, transparent 100%)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div
                style={{
                  height: 'clamp(65px, 9vw, 85px)',
                  maxWidth: 'clamp(180px, 30vw, 280px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={sp.logo}
                  alt={sp.name}
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.7))',
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  marginTop: '0.65rem',
                  marginBottom: '0.15rem',
                  letterSpacing: '0.03em',
                  textAlign: 'center',
                }}
              >
                {sp.name}
              </h3>
              <span
                style={{
                  fontSize: '0.7rem',
                  color: '#F5D77F',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Patrocinador Oficial del Dojo
              </span>
            </div>
          )}

          {/* DEBAJO DE LA IMAGEN: NÚMERO DE TELÉFONO Y DIRECCIÓN WEB BIEN VISTOSOS Y DESOPILANTES */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.85rem',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* BOTÓN 1: TELÉFONO / WHATSAPP - NEON EMERALD GLOW */}
            <a
              href={`tel:${phone}`}
              className="dazzling-btn phone-btn"
              title={`Llamar a ${sp.name}: ${phone}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(5, 150, 105, 0.28) 100%)',
                border: '1.5px solid #10B981',
                borderRadius: '12px',
                boxShadow: '0 0 18px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                textDecoration: 'none',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.25)',
                  border: '1.5px solid #34D399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.45)',
                }}
              >
                <Phone size={18} color="#34D399" />
              </div>
              <div style={{ overflow: 'hidden', textAlign: 'left' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#6EE7B7',
                    marginBottom: '0.1rem',
                  }}
                >
                  Teléfono / WhatsApp
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.95rem',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: '0.04em',
                    textShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {phone}
                </span>
              </div>
            </a>

            {/* BOTÓN 2: DIRECCIÓN WEB - NEON ELECTRIC BLUE GLOW */}
            {webUrl && (
              <a
                href={webUrl}
                target="_blank"
                rel="noreferrer"
                className="dazzling-btn web-btn"
                title={`Visitar sitio web oficial: ${webUrl}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.16) 0%, rgba(37, 99, 235, 0.28) 100%)',
                  border: '1.5px solid #3B82F6',
                  borderRadius: '12px',
                  boxShadow: '0 0 18px rgba(59, 130, 246, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                  textDecoration: 'none',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(59, 130, 246, 0.25)',
                    border: '1.5px solid #60A5FA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.45)',
                  }}
                >
                  <Globe size={18} color="#60A5FA" />
                </div>
                <div style={{ overflow: 'hidden', textAlign: 'left', flex: 1 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#93C5FD',
                      marginBottom: '0.1rem',
                    }}
                  >
                    Dirección Web Oficial
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.92rem',
                        fontWeight: 900,
                        color: '#FFFFFF',
                        letterSpacing: '0.02em',
                        textShadow: '0 0 10px rgba(59, 130, 246, 0.6)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {displayWeb || 'Visitar Sitio'}
                    </span>
                    <ExternalLink size={13} color="#93C5FD" style={{ flexShrink: 0 }} />
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>

        <style jsx>{`
          .sponsor-logo-link:hover .sponsor-logo-img {
            transform: scale(1.04);
            filter: drop-shadow(0 8px 22px rgba(212, 175, 55, 0.45));
          }
          .sponsor-logo-link:hover {
            border-color: rgba(212, 175, 55, 0.4);
            background: radial-gradient(ellipse at center, rgba(212, 175, 55, 0.15) 0%, rgba(14, 15, 20, 0.6) 70%, transparent 100%);
          }
          .phone-btn:hover {
            transform: translateY(-3px) scale(1.02);
            border-color: #34D399 !important;
            box-shadow: 0 0 28px rgba(16, 185, 129, 0.6), inset 0 0 16px rgba(16, 185, 129, 0.2) !important;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.4) 100%) !important;
          }
          .web-btn:hover {
            transform: translateY(-3px) scale(1.02);
            border-color: #60A5FA !important;
            box-shadow: 0 0 28px rgba(59, 130, 246, 0.65), inset 0 0 16px rgba(59, 130, 246, 0.2) !important;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.26) 0%, rgba(37, 99, 235, 0.42) 100%) !important;
          }
        `}</style>
      </div>
    );
  }

  // ============================================================
  // CASO 2: HAY DOS O MÁS PATROCINADORES -> CINTILLO CONTINUO
  // DESPLAZÁNDOSE DE DERECHA A IZQUIERDA
  // AL DAR CLICK AL LOGO QUE PASA LLEVA AL SITIO WEB REGISTRADO
  // ============================================================
  const repeatCount = Math.max(4, Math.ceil(8 / sponsors.length));
  const displayItems = Array(repeatCount).fill(sponsors).flat();

  return (
    <div
      style={{
        marginTop: '2.5rem',
        paddingTop: '1.75rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Encabezado del Cintillo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(212, 175, 55, 0.25)',
            }}
          >
            <Handshake size={13} color="#D4AF37" />
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#F5D77F',
            }}
          >
            Patrocinadores & Alianzas Oficiales
          </span>
        </div>

        <Link
          href="/contacto"
          style={{
            fontSize: '0.72rem',
            color: '#9FA6B8',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            transition: 'color 0.15s',
          }}
        >
          <span>Sé un patrocinador</span>
          <ExternalLink size={11} />
        </Link>
      </div>

      {/* Contenedor del Ticker Marquee con Desvanecimiento Lateral */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          padding: '0.4rem 0',
          maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
        }}
      >
        <div className="marquee-track">
          {displayItems.map((sponsor, idx) => {
            const webUrl = formatWebsiteUrl(sponsor.websiteUrl);
            const displayWeb = cleanDisplayUrl(sponsor.websiteUrl);

            const cardContent = (
              <div
                className="ticker-sponsor-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem 1.35rem 0.75rem 0.85rem',
                  backgroundColor: 'rgba(14, 16, 22, 0.94)',
                  border: '1.5px solid rgba(212, 175, 55, 0.22)',
                  borderRadius: '12px',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.6)',
                  flexShrink: 0,
                  transition: 'all 0.25s ease',
                  cursor: webUrl ? 'pointer' : 'default',
                  textDecoration: 'none',
                }}
              >
                {/* Logo del Patrocinador */}
                <div
                  style={{
                    height: '52px',
                    maxWidth: '130px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.25rem',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.6))',
                    }}
                  />
                </div>

                {/* Información del Patrocinador: Nombre, Teléfono y Web debajo */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <p
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 900,
                        color: '#F7F8FA',
                        margin: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {sponsor.name}
                    </p>
                    {webUrl && <ExternalLink size={12} color="#D4AF37" />}
                  </div>

                  {/* Debajo del nombre: Teléfono y Dirección Web */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                    {sponsor.phone && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: '#34D399',
                          backgroundColor: 'rgba(16, 185, 129, 0.18)',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          boxShadow: '0 0 8px rgba(16, 185, 129, 0.25)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '6px',
                        }}
                      >
                        <Phone size={10} />
                        <span>{sponsor.phone}</span>
                      </span>
                    )}

                    {displayWeb && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          color: '#60A5FA',
                          backgroundColor: 'rgba(59, 130, 246, 0.18)',
                          border: '1px solid rgba(59, 130, 246, 0.4)',
                          boxShadow: '0 0 8px rgba(59, 130, 246, 0.25)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '6px',
                        }}
                      >
                        <Globe size={10} />
                        <span>{displayWeb}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );

            return webUrl ? (
              <a
                key={`sponsor-link-${sponsor.id || sponsor.name}-${idx}`}
                href={webUrl}
                target="_blank"
                rel="noreferrer"
                title={`Hacer click para visitar el sitio web de ${sponsor.name}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                {cardContent}
              </a>
            ) : (
              <div key={`sponsor-div-${sponsor.id || sponsor.name}-${idx}`}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>

      {/* Animación del Ticker de Derecha a Izquierda */}
      <style jsx>{`
        .marquee-track {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          width: max-content;
          animation: scrollRightToLeft 28s linear infinite;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        .ticker-sponsor-card:hover {
          transform: translateY(-3px) scale(1.02);
          border-color: rgba(212, 175, 55, 0.6);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.25);
        }

        @keyframes scrollRightToLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
