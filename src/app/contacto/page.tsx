import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto | Dojo de Karate Ying Yang',
  description: 'Contáctanos directamente por WhatsApp o visita nuestras instalaciones del Dojo Ying Yang.',
};

export default function ContactoPage() {
  const whatsappMessage = encodeURIComponent(
    'Hola Sensei! Me gustaría solicitar información sobre las clases y horarios en el Dojo Ying Yang.'
  );

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* ================= HEADER SECCIÓN CONTACTO ================= */}
      <section
        style={{
          padding: 'clamp(3rem, 6vw, 5rem) 0 3rem',
          backgroundColor: '#0C0E14',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="container-dojo">
          <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
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
              Atención Inmediata
            </span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', marginBottom: '1.25rem' }}>
              Contacto & Ubicación
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#9DA3B4', lineHeight: 1.7 }}>
              Te esperamos en el tatami. Escríbenos directamente por WhatsApp para atención inmediata o consulta los canales y ubicación oficial de nuestro dojo.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <section style={{ padding: 'clamp(3.5rem, 6vw, 5.5rem) 0' }}>
        <div className="container-dojo" style={{ maxWidth: '1080px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
              gap: '2.5rem',
              alignItems: 'stretch',
            }}
          >
            {/* WhatsApp Directo y Chatear de Inmediato */}
            <div
              style={{
                backgroundColor: '#0F1A14',
                border: '1px solid rgba(37, 211, 102, 0.35)',
                borderRadius: '16px',
                padding: 'clamp(2rem, 5vw, 2.75rem)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4), 0 0 25px rgba(37, 211, 102, 0.08)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      backgroundColor: '#25D366',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#062B16',
                      boxShadow: '0 0 20px rgba(37, 211, 102, 0.4)',
                      flexShrink: 0,
                    }}
                  >
                    <MessageSquare size={28} />
                  </div>
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#86EFAC',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '0.2rem',
                      }}
                    >
                      Canal Preferido
                    </span>
                    <h2 style={{ fontSize: '1.5rem', color: '#FFFFFF', margin: 0, fontWeight: 800 }}>
                      Chatear de Inmediato
                    </h2>
                  </div>
                </div>

                <p style={{ fontSize: '1rem', color: '#CBD5E1', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Escríbenos directamente a nuestro WhatsApp oficial para resolver cualquier duda al instante sobre horarios, categorías, uniformes o requisitos de ingreso con el Sensei de guardia.
                </p>

                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'rgba(37, 211, 102, 0.08)',
                    border: '1px solid rgba(37, 211, 102, 0.2)',
                    borderRadius: '10px',
                    marginBottom: '2rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#86EFAC' }}>
                      Respuesta Rápida y Personalizada
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#A7F3D0', margin: 0, lineHeight: 1.5 }}>
                    Atención directa a practicantes, padres de familia y competidores.
                  </p>
                </div>
              </div>

              <a
                href={`https://wa.me/525512345678?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '1.1rem 1.75rem',
                  backgroundColor: '#25D366',
                  color: '#062B16',
                  borderRadius: '8px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 8px 25px rgba(37, 211, 102, 0.35)',
                  transition: 'all 0.2s ease',
                }}
              >
                <MessageSquare size={22} />
                <span>Abrir WhatsApp & Chatear</span>
              </a>
            </div>

            {/* Tarjeta de Información del Dojo */}
            <div
              className="glass-panel"
              style={{
                padding: 'clamp(2rem, 5vw, 2.75rem)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#F7F8FA', marginBottom: '1.5rem', fontWeight: 800 }}>
                  Información del Dojo
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.92rem', color: '#9DA3B4' }}>
                  {/* Dirección */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <MapPin size={22} color="#E55353" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: '#F7F8FA', display: 'block', fontSize: '0.95rem' }}>
                        Dirección Central
                      </strong>
                      <span style={{ color: '#CBD5E1' }}>Av. de las Artes Marciales #108, Col. Tradición, Zona Centro</span>
                      <p style={{ fontSize: '0.8rem', color: '#687187', margin: '0.25rem 0 0' }}>
                        Estacionamiento privado para alumnos y familiares.
                      </p>
                    </div>
                  </div>

                  {/* Horario */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <Clock size={22} color="#8CA6F8" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: '#F7F8FA', display: 'block', fontSize: '0.95rem' }}>
                        Horario de Atención en Recepción
                      </strong>
                      <span style={{ color: '#CBD5E1' }}>Lunes a Viernes: 15:30 - 21:30 hrs</span>
                      <br />
                      <span style={{ color: '#CBD5E1' }}>Sábados: 08:00 - 13:30 hrs</span>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <Phone size={22} color="#48BB78" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: '#F7F8FA', display: 'block', fontSize: '0.95rem' }}>
                        Línea Telefónica Directa
                      </strong>
                      <span style={{ color: '#CBD5E1' }}>+52 (55) 1234-5678</span>
                    </div>
                  </div>

                  {/* Correo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <Mail size={22} color="#ECC94B" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: '#F7F8FA', display: 'block', fontSize: '0.95rem' }}>
                        Correo Electrónico
                      </strong>
                      <span style={{ color: '#CBD5E1' }}>contacto@dojoyingyang.com</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recuadro Tatami y Google Maps */}
              <div
                style={{
                  marginTop: '2rem',
                  padding: '1.35rem',
                  backgroundColor: '#161922',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F7F8FA', margin: 0 }}>
                    Tatami Principal Dojo Ying Yang
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#9FA6B8', margin: '0.2rem 0 0' }}>
                    180 m² de tatami reglamentario y zona de entrenamiento
                  </p>
                </div>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#8CA6F8',
                    textDecoration: 'none',
                    padding: '0.4rem 0.8rem',
                    backgroundColor: 'rgba(140, 166, 248, 0.1)',
                    border: '1px solid rgba(140, 166, 248, 0.25)',
                    borderRadius: '6px',
                  }}
                >
                  <span>Google Maps</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
