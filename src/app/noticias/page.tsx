'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar,
  Heart,
  MessageSquare,
  Share2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { NewsItem, SocialPlatform } from '@/types';

export default function NoticiasPage() {
  const { user, openAuthModal } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'all' | SocialPlatform>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState(6);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const initialNews: NewsItem[] = [
    {
      id: 'news-1',
      title: 'Convocatoria Oficial: Exámenes de Grado (Kyu & Dan) Otoño 2026',
      content: 'Se abre el periodo de inscripción para los exámenes de ascenso de grado. Los aspirantes desde 8° Kyu (Amarillo) hasta 1er Dan (Cinturón Negro) deben contar con el 85% de asistencia mínima y el aval de su Sensei titular.',
      excerpt: 'Evaluación técnica de Kihon, Katas reglamentarias y Bunkai ante el tribunal evaluador. Conoce las fechas y requisitos aquí.',
      platform: 'official',
      category: 'examen',
      date: '14 de Septiembre, 2026',
      author: 'Tribunal Técnico Ryoku Kai',
      socialHandle: '@ryokukai',
      url: 'https://instagram.com',
      likes: 124,
      commentsCount: 18,
      featured: true,
      tags: ['Exámenes', 'Kyu', 'Cinturón Negro', 'Graduación']
    },
    {
      id: 'news-2',
      title: 'Oro y Plata en el Campeonato Nacional WKF',
      content: 'Felicitamos a nuestros atletas del equipo de Kumite de alta competencia por su destacada actuación este fin de semana en el Torneo Nacional. Tres medallas de oro en categorías juvenil y dos de plata en senior.',
      excerpt: '¡Orgullo Ryoku Kai! Nuestros alumnos demostraron temple, respeto y precisión en cada combate.',
      platform: 'instagram',
      category: 'torneo',
      date: '12 de Septiembre, 2026',
      author: 'Instagram Feed • @ryokukai',
      socialHandle: '@ryokukai_karate',
      url: 'https://instagram.com',
      likes: 289,
      commentsCount: 34,
      tags: ['Torneo', 'Kumite', 'Medallistas', 'OrgulloMarcial']
    },
    {
      id: 'news-3',
      title: 'Seminario Magistral de Katas Superiores con Shihan Takahashi',
      content: 'El próximo sábado 26 de septiembre tendremos una jornada intensiva de 4 horas analizando la dinámica del cuerpo, la respiración profunda y los puntos de presión en las formas Kanku Dai y Bassai Dai.',
      excerpt: 'Abierto a practicantes desde cinta verde en adelante. Cupos limitados para preservar la calidad del tatami.',
      platform: 'facebook',
      category: 'seminario',
      date: '10 de Septiembre, 2026',
      author: 'Facebook Page • Ryoku Kai',
      socialHandle: 'facebook.com/ryokukai',
      url: 'https://facebook.com',
      likes: 95,
      commentsCount: 12,
      tags: ['Seminario', 'Katas', 'Maestría', 'Okinawa']
    },
    {
      id: 'news-4',
      title: 'Nueva Serie Técnica: Los 5 Preceptos del Dojo Kun en Video',
      content: 'Estrenamos en nuestro canal oficial una serie de videos cortos donde el Shihan explica la aplicación práctica de cada principio del Dojo Kun en la vida cotidiana y laboral moderna.',
      excerpt: 'Aprende cómo la disciplina marcial transforma tus decisiones diarias fuera del dojo.',
      platform: 'youtube',
      category: 'comunidad',
      date: '8 de Septiembre, 2026',
      author: 'YouTube Channel • Ryoku Kai TV',
      socialHandle: 'youtube.com/@ryokukai',
      url: 'https://youtube.com',
      likes: 340,
      commentsCount: 42,
      tags: ['YouTube', 'Filosofía', 'DojoKun', 'Bushido']
    },
    {
      id: 'news-5',
      title: 'Taller Especial: Defensa Personal Femenina y Manejo del Pánico',
      content: 'Una clase de inmersión práctica de 2 horas donde compartimos estrategias preventivas de escape ante situaciones de agresión física, técnicas de palanca y uso de la voz como primer escudo.',
      excerpt: 'No se requiere ningún tipo de experiencia marcial previa. Entrada libre para alumnas y familiares.',
      platform: 'instagram',
      category: 'seminario',
      date: '5 de Septiembre, 2026',
      author: 'Instagram Reel • Sensei Laura S.',
      socialHandle: '@ryokukai_karate',
      url: 'https://instagram.com',
      likes: 182,
      commentsCount: 19,
      tags: ['DefensaPersonal', 'MujeresFuertes', 'Comunidad']
    },
    {
      id: 'news-6',
      title: 'Apertura de Nuevos Horarios para Little Warriors (4 a 6 años)',
      content: 'Debido a la alta demanda hemos abierto un nuevo horario formativo los martes y jueves a las 16:00 hrs, enfocado en juego psicomotriz, orden y valores marciales.',
      excerpt: 'Inscripciones abiertas con clase de diagnóstico sin costo para evaluar la integración de los pequeños.',
      platform: 'official',
      category: 'comunidad',
      date: '1 de Septiembre, 2026',
      author: 'Dirección Administrativa',
      socialHandle: '@ryokukai',
      url: 'https://instagram.com',
      likes: 78,
      commentsCount: 7,
      tags: ['Infantil', 'Horarios', 'Formación']
    }
  ];

  const filteredNews = selectedFilter === 'all'
    ? initialNews
    : initialNews.filter((item) => item.platform === selectedFilter);

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSyncSocial = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncedCount(filteredNews.length);
    }, 1200);
  };

  const getPlatformBadge = (platform: SocialPlatform) => {
    switch (platform) {
      case 'instagram':
        return {
          name: 'Instagram',
          bg: 'linear-gradient(45deg, #833AB4, #FD1D1D, #FCB045)',
          color: '#ffffff',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          )
        };
      case 'facebook':
        return {
          name: 'Facebook',
          bg: '#1877F2',
          color: '#ffffff',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          )
        };
      case 'youtube':
        return {
          name: 'YouTube',
          bg: '#FF0000',
          color: '#ffffff',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="10 15 15 12 10 9 10 15" />
            </svg>
          )
        };
      default:
        return {
          name: 'Oficial Dojo',
          bg: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
          color: '#08080A',
          icon: <ShieldCheck size={14} />
        };
    }
  };

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* ================= HEADER SECCIÓN NOTICIAS ================= */}
      <section
        style={{
          padding: 'clamp(3rem, 6vw, 5rem) 0 3rem',
          backgroundColor: '#0A0B0E',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        }}
      >
        <div className="container-dojo">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                width: '74px',
                height: '74px',
                margin: '0 auto 1.25rem',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, transparent 75%)',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(212, 175, 55, 0.25)',
                padding: '8px',
              }}
            >
              <Image
                src="/images/logos/LogoRyukukaiSinFondo.png"
                alt="Logo Oficial Ryūko Kai"
                width={58}
                height={58}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
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
              Comunidad, Eventos & Redes
            </span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', marginBottom: '1.25rem' }}>
              Noticias de Ryoku Kai
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#9DA3B4', lineHeight: 1.7 }}>
              Mantente al día con los eventos, torneos, ascensos de grado y las publicaciones más recientes conectadas directamente desde nuestras redes sociales.
            </p>
          </div>
        </div>
      </section>

      {/* ================= PANEL DE SINCRONIZACIÓN Y PREVISTA ================= */}
      <section style={{ padding: '2rem 0', backgroundColor: '#070709', borderBottom: '1px solid rgba(212, 175, 55, 0.12)' }}>
        <div className="container-dojo">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
              backgroundColor: '#0E0F14',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '8px',
              padding: '1rem 1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(212, 175, 55, 0.15)',
                  color: '#F5D77F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  Prevista de Sincronización Social Activa
                </p>
                <p style={{ fontSize: '0.78rem', color: '#9DA3B4', margin: '0.15rem 0 0' }}>
                  Conectada a Instagram Graph API, Facebook Pages y YouTube RSS Feed ({syncedCount} publicaciones sincronizadas).
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={handleSyncSocial}
                disabled={isSyncing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '6px',
                  color: '#F5D77F',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Sincronizando...' : 'Actualizar Feed'}</span>
              </button>

              {!user && (
                <button
                  onClick={openAuthModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(212, 175, 55, 0.18)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    borderRadius: '6px',
                    color: '#F5D77F',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Acceso Alumnos para Notificaciones
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTENIDO Y FILTROS ================= */}
      <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 0' }}>
        <div className="container-dojo">
          {/* Botones de Filtro */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.65rem',
              alignItems: 'center',
              marginBottom: '2.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9FA6B8', fontSize: '0.85rem', marginRight: '0.5rem' }}>
              <Filter size={16} />
              <span>Filtrar por canal:</span>
            </div>

            <button
              onClick={() => setSelectedFilter('all')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: selectedFilter === 'all' ? '1px solid var(--color-gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: selectedFilter === 'all' ? 'rgba(212, 175, 55, 0.2)' : '#0E0F14',
                color: selectedFilter === 'all' ? '#FFFFFF' : '#9DA3B4',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Todas las Fuentes
            </button>

            <button
              onClick={() => setSelectedFilter('instagram')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: selectedFilter === 'instagram' ? '1px solid #E1306C' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: selectedFilter === 'instagram' ? 'rgba(225, 48, 108, 0.25)' : '#0E0F14',
                color: selectedFilter === 'instagram' ? '#FFFFFF' : '#9DA3B4',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Instagram
            </button>

            <button
              onClick={() => setSelectedFilter('facebook')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: selectedFilter === 'facebook' ? '1px solid #1877F2' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: selectedFilter === 'facebook' ? 'rgba(24, 119, 242, 0.25)' : '#0E0F14',
                color: selectedFilter === 'facebook' ? '#FFFFFF' : '#9DA3B4',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Facebook
            </button>

            <button
              onClick={() => setSelectedFilter('youtube')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: selectedFilter === 'youtube' ? '1px solid #FF0000' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: selectedFilter === 'youtube' ? 'rgba(255, 0, 0, 0.25)' : '#0E0F14',
                color: selectedFilter === 'youtube' ? '#FFFFFF' : '#9DA3B4',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              YouTube
            </button>

            <button
              onClick={() => setSelectedFilter('official')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: selectedFilter === 'official' ? '1px solid var(--color-gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: selectedFilter === 'official' ? 'rgba(212, 175, 55, 0.25)' : '#0E0F14',
                color: selectedFilter === 'official' ? '#FFFFFF' : '#9DA3B4',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Anuncios Oficiales
            </button>
          </div>

          {/* Grid de Noticias / Feed de Redes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: '2rem',
            }}
          >
            {filteredNews.map((item) => {
              const badge = getPlatformBadge(item.platform);
              const isLiked = likedPosts[item.id];
              const totalLikes = item.likes + (isLiked ? 1 : 0);

              return (
                <article
                  key={item.id}
                  className="glass-panel"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '2rem',
                    borderRadius: '12px',
                    position: 'relative',
                  }}
                >
                  <div>
                    {/* Cabecera del Post con Canal y Fecha */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.35rem 0.75rem',
                          background: badge.bg,
                          color: badge.color,
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {badge.icon}
                        <span>{badge.name}</span>
                      </div>

                      <span style={{ fontSize: '0.78rem', color: '#9FA6B8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} />
                        {item.date}
                      </span>
                    </div>

                    {/* Título y Contenido */}
                    <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', lineHeight: 1.35, marginBottom: '0.75rem' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                      {item.content}
                    </p>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(212, 175, 55, 0.08)',
                            color: '#F5D77F',
                            border: '1px solid rgba(212, 175, 55, 0.2)',
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pie de la Tarjeta con Acciones Sociales */}
                  <div
                    style={{
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button
                        onClick={() => toggleLike(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: isLiked ? '#F5D77F' : '#9DA3B4',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'color 0.2s',
                        }}
                      >
                        <Heart size={16} fill={isLiked ? '#F5D77F' : 'none'} />
                        <span>{totalLikes}</span>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#9DA3B4', fontSize: '0.85rem' }}>
                        <MessageSquare size={16} />
                        <span>{item.commentsCount}</span>
                      </div>
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#F5D77F',
                        textDecoration: 'none',
                      }}
                    >
                      <span>Ver original</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
