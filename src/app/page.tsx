'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Flame,
  Shield,
  Award,
  Users,
  ChevronRight,
  Zap,
  Target,
  Sparkles,
  CheckCircle2,
  Swords,
  Heart,
  Droplets,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import SponsorsTicker from '@/components/sponsors/SponsorsTicker';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { openAuthModal } = useAuth();
  const [activePath, setActivePath] = useState<'dragon' | 'tiger' | 'dojo'>('dragon');

  const martialPaths = {
    dragon: {
      id: 'dragon',
      kanji: '龍',
      title: 'Senda del Dragón',
      subtitle: 'Kumite Deportivo WKF & Velocidad de Combate',
      color: '#EF4444',
      glow: 'rgba(239, 68, 68, 0.28)',
      bgSoft: 'rgba(239, 68, 68, 0.08)',
      borderColor: 'rgba(239, 68, 68, 0.4)',
      badgeBg: 'rgba(239, 68, 68, 0.15)',
      description:
        'El dragón domina los cielos con agilidad, visión periférica y ataques fulgurantes. Nuestro programa de Kumite deportivo entrena el timing milimétrico, la distancia (Ma-ai) y el repertorio de puntuación oficial bajo reglamento WKF.',
      quote: '«La victoria sonríe a quien anticipa el movimiento del adversario en la calma antes de la tormenta.»',
      features: [
        'Velocidad de reacción, fintas y combinaciones explosivas',
        'Táctica de combate de alto rendimiento olímpico WKF',
        'Acondicionamiento físico específico y resistencia anaeróbica',
        'Arbitraje deportivo reglamentario y control estricto de impacto'
      ],
      stats: [
        { label: 'Velocidad de Respuesta', value: '< 0.2s' },
        { label: 'Enfoque', value: 'WKF Olímpico' },
        { label: 'Nivel', value: 'Inicial a Competitivo' }
      ]
    },
    tiger: {
      id: 'tiger',
      kanji: '虎',
      title: 'Senda del Tigre',
      subtitle: 'Kata Tradicional & Bunkai Marcial',
      color: '#3B82F6',
      glow: 'rgba(59, 130, 246, 0.28)',
      bgSoft: 'rgba(59, 130, 246, 0.08)',
      borderColor: 'rgba(59, 130, 246, 0.4)',
      badgeBg: 'rgba(59, 130, 246, 0.15)',
      description:
        'El tigre encarna la fuerza implacable, el enraizamiento al suelo y la contundencia de cada golpe. En el Kata tradicional perfeccionamos la respiración diafragmática (Ibuki), la geometría corporal y el Bunkai de defensa personal real.',
      quote: '«Cada paso es una raíz profunda en la tierra; cada técnica, una tempestad contenida con serenidad.»',
      features: [
        'Perfeccionamiento técnico milimétrico de formas ancestrales',
        'Kime (foco de potencia máxima y transferencia biomecánica)',
        'Bunkai marcial: aplicaciones prácticas de defensa y desarme',
        'Respiración, postura y equilibrio cinético inquebrantable'
      ],
      stats: [
        { label: 'Precisión Técnica', value: '100% Rigor' },
        { label: 'Enfoque', value: 'Defensa & Kata' },
        { label: 'Nivel', value: 'Todos los Grados' }
      ]
    },
    dojo: {
      id: 'dojo',
      kanji: '会',
      title: 'Senda del Dojo',
      subtitle: 'Guerreros Infantiles & Formación de Carácter',
      color: '#D4AF37',
      glow: 'rgba(212, 175, 55, 0.28)',
      bgSoft: 'rgba(212, 175, 55, 0.08)',
      borderColor: 'rgba(212, 175, 55, 0.4)',
      badgeBg: 'rgba(212, 175, 55, 0.15)',
      description:
        'El Dojo es la hermandad y la fragua del carácter. Formamos a niños, jóvenes y adultos en los valores del Bushido: disciplina escolar, respeto a los padres, prevención del acoso escolar (anti-bullying) y autoconfianza inquebrantable.',
      quote: '«El fin supremo del Karate Do no radica en la victoria sobre otros, sino en la conquista de uno mismo.»',
      features: [
        'Desarrollo psicomotriz, coordinación y concentración',
        'Educación en valores: respeto (Reigi), esfuerzo y rectitud',
        'Metodología anti-bullying basada en firmeza y autocontrol',
        'Ambiente familiar sano, seguro e incluyente para todas las edades'
      ],
      stats: [
        { label: 'Edad de Inicio', value: 'Desde 4 años' },
        { label: 'Valores', value: 'Bushido Integral' },
        { label: 'Comunidad', value: '+450 Alumnos' }
      ]
    }
  };

  const dojoKunRules = [
    {
      num: '一',
      title: 'Hitotsu! Jinkaku kansei ni tsutomuru koto',
      meaning: 'Perfeccionar el carácter personal',
      detail: 'El entrenamiento marcial es ante todo una vía de pulido moral y superación ética diaria.',
      color: '#D4AF37'
    },
    {
      num: '一',
      title: 'Hitotsu! Makoto no michi o mamoru koto',
      meaning: 'Defender la verdad y la lealtad',
      detail: 'Ser fiel a la propia palabra, leal al Sensei, a la familia y a los principios de justicia.',
      color: '#EF4444'
    },
    {
      num: '一',
      title: 'Hitotsu! Doryoku no seishin o yashinau koto',
      meaning: 'Cultivar el espíritu del esfuerzo constante',
      detail: 'La constancia vence al talento. Caer siete veces y levantarse ocho con mayor determinación.',
      color: '#3B82F6'
    },
    {
      num: '一',
      title: 'Hitotsu! Reigi o omonzuru koto',
      meaning: 'Respetar las reglas de cortesía y etiqueta',
      detail: 'El Karate comienza con un saludo de respeto (Rei) y termina con un saludo de gratitud.',
      color: '#D4AF37'
    },
    {
      num: '一',
      title: 'Hitotsu! Kekki no yū o imashimuru koto',
      meaning: 'Abstenerse de la conducta violenta',
      detail: 'Quien domina el arte marcial posee el poder para hacer daño, pero la sabiduría para evitar el conflicto.',
      color: '#EF4444'
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-76px)] overflow-hidden">
      {/* ============================================================ */}
      {/* 1. HERO SECTION DINÁMICO & RADIANTE                          */}
      {/* ============================================================ */}
      <section className="w-full flex items-center py-10 lg:py-20 relative z-10">
        <div className="container-dojo w-full">
          <div className="hero-grid grid items-center justify-between gap-12 lg:gap-16 w-full">
            {/* Columna Izquierda: Mensaje Central & CTAs */}
            <div className="max-w-[780px]">
              {/* Badge de Estado del Dojo */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.35)] mb-6 shadow-[0_0_20px_rgba(212,175,55,0.18)]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4AF37]"></span>
                </span>
                <span className="text-xs font-black tracking-widest uppercase text-[#F5D77F]">
                  Dojo Oficial • WKF & FNK • Matrículas Abiertas
                </span>
              </div>

              {/* Título Principal con Gradiente Marcial Dragón-Oro-Tigre */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-6 text-white">
                Camino a la Grandeza Marcial en{' '}
                <span className="bg-gradient-to-r from-[#EF4444] via-[#F5D77F] to-[#3B82F6] bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(212,175,55,0.25)]">
                  Ryūko Kai
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#CBD5E1] leading-relaxed mb-8 max-w-[660px]">
                Donde la sabiduría del Dragón y el poderío del Tigre se fusionan. Forjamos carácter, rectitud, disciplina y excelencia física y mental a través del camino del Karate Do tradicional y competitivo.
              </p>

              {/* Botonera Interactiva de Llamados a la Acción */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <a
                  href="#disciplinas"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-sm tracking-wider uppercase text-[#0A0F1D] bg-gradient-to-r from-[#F5D77F] via-[#D4AF37] to-[#C5A059] shadow-[0_10px_25px_-5px_rgba(212,175,55,0.4),0_0_20px_rgba(212,175,55,0.2)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  <Swords size={18} className="text-[#0A0F1D]" />
                  <span>Explorar Disciplinas</span>
                </a>

                <Link
                  href="/nosotros"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase text-white bg-[rgba(15,23,42,0.8)] border border-[rgba(59,130,246,0.35)] shadow-[0_10px_25px_-5px_rgba(59,130,246,0.2)] hover:border-[#3B82F6] hover:bg-[rgba(59,130,246,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <Shield size={18} className="text-[#60A5FA]" />
                  <span>Conocer Linaje</span>
                </Link>

                <button
                  onClick={openAuthModal}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase text-[#F5D77F] bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.25)] hover:bg-[rgba(212,175,55,0.18)] hover:border-[rgba(212,175,55,0.5)] transition-all duration-200 cursor-pointer"
                >
                  <Users size={16} className="text-[#D4AF37]" />
                  <span>Portal Alumnos</span>
                </button>
              </div>

              {/* Cintillo / Pasarela de Patrocinadores (Isla Interactiva Cliente) */}
              <div className="pt-2">
                <SponsorsTicker />
              </div>
            </div>

            {/* Columna Derecha: Tarjeta Insignia con el Logo Oficial Intacto */}
            <div className="flex justify-center lg:justify-end items-center relative w-full">
              {/* Halos de Resonancia de Fondo */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[rgba(239,68,68,0.2)] via-[rgba(212,175,55,0.15)] to-[rgba(59,130,246,0.2)] rounded-3xl blur-2xl pointer-events-none opacity-80" />

              <div className="w-full max-w-[500px] bg-gradient-to-br from-[rgba(15,23,42,0.92)] via-[rgba(17,24,39,0.96)] to-[rgba(10,15,29,0.98)] border border-[rgba(212,175,55,0.3)] rounded-3xl p-6 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_40px_rgba(212,175,55,0.18)] relative overflow-hidden text-center backdrop-blur-xl">
                {/* Kanji Decorativo de Fondo */}
                <div className="absolute top-2 right-4 text-7xl font-black text-[rgba(255,255,255,0.03)] select-none pointer-events-none">
                  武道
                </div>

                {/* Símbolo Central: Logo Oficial con LCP optimizado y estrictamente tal cual */}
                <div className="w-48 sm:w-60 h-48 sm:h-60 mx-auto mb-6 relative drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)]">
                  <Image
                    src="/images/logos/LogoRyukukaiSinFondo.png"
                    alt="Logo Insignia Oficial Ryūko Kai"
                    fill
                    sizes="(max-width: 640px) 192px, 240px"
                    className="object-contain"
                    priority
                  />
                </div>

                <h2 className="text-2xl font-black tracking-widest mb-1 text-white">
                  <span className="text-[#EF4444]">RYŪ</span>
                  <span className="text-[#3B82F6]">KO</span>{' '}
                  <span className="text-[#D4AF37]">KAI</span>
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-[#F5D77F] mb-4">
                  Karate Do Tradicional & Deportivo
                </p>

                <p className="text-xs text-[#94A3B8] mx-auto mb-6 max-w-[360px] leading-relaxed">
                  El arte de vencer sin luchar y la firmeza del golpe que nace de la serenidad interior.
                </p>

                {/* Pilares Marciales Dragón y Tigre con Acentos Auténticos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="p-3.5 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.28)] hover:border-[#EF4444] transition-colors">
                    <div className="flex items-center gap-2 text-[#F87171] font-black text-xs sm:text-sm">
                      <Droplets size={16} className="text-[#EF4444] shrink-0" />
                      <span>RYŪ • DRAGÓN</span>
                    </div>
                    <p className="text-xs text-[#CBD5E1] mt-1 leading-normal">
                      Sabiduría táctica, velocidad fulgurante y control.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.28)] hover:border-[#3B82F6] transition-colors">
                    <div className="flex items-center gap-2 text-[#60A5FA] font-black text-xs sm:text-sm">
                      <Flame size={16} className="text-[#3B82F6] shrink-0" />
                      <span>KO • TIGRE</span>
                    </div>
                    <p className="text-xs text-[#CBD5E1] mt-1 leading-normal">
                      Impacto contundente, espíritu indomable y resolución.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. EXPLORADOR INTERACTIVO DE DISCIPLINAS ("TRES SENDAS")     */}
      {/* ============================================================ */}
      <section id="disciplinas" className="py-16 lg:py-24 relative z-10 border-t border-[rgba(212,175,55,0.15)] bg-gradient-to-b from-[rgba(15,23,42,0.5)] to-[rgba(10,15,29,0.85)]">
        <div className="container-dojo">
          {/* Encabezado de Sección */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-[#F5D77F] mb-3 block">
              Formación Integral
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              Las Tres Sendas Marciales
            </h2>
            <p className="text-base text-[#94A3B8]">
              Cada practicante descubre su propio ritmo a través de tres pilares diseñados para el desarrollo armónico del cuerpo, la técnica y el carácter.
            </p>
          </div>

          {/* Selector de Pestañas Interactivas */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 rounded-2xl bg-[rgba(15,23,42,0.9)] border border-[rgba(255,255,255,0.12)] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              {(['dragon', 'tiger', 'dojo'] as const).map((key) => {
                const path = martialPaths[key];
                const isActive = activePath === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActivePath(key)}
                    className={`flex items-center gap-2.5 px-5 sm:px-7 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'text-white shadow-lg'
                        : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                    }`}
                    style={{
                      backgroundColor: isActive ? path.badgeBg : 'transparent',
                      border: isActive ? `1.5px solid ${path.color}` : '1.5px solid transparent',
                      boxShadow: isActive ? `0 0 20px ${path.glow}` : 'none'
                    }}
                  >
                    <span
                      className="text-base font-serif"
                      style={{ color: isActive ? path.color : '#94A3B8' }}
                    >
                      {path.kanji}
                    </span>
                    <span>{path.title.replace('Senda del ', '')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenido Dinámico de la Senda Seleccionada */}
          <div className="max-w-5xl mx-auto">
            {(() => {
              const current = martialPaths[activePath];
              return (
                <div
                  className="rounded-3xl p-7 sm:p-11 transition-all duration-500 relative overflow-hidden backdrop-blur-xl"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    border: `1.5px solid ${current.borderColor}`,
                    boxShadow: `0 20px 50px -10px rgba(0,0,0,0.8), 0 0 40px ${current.glow}`
                  }}
                >
                  {/* Marca de Agua Kanji Gigante */}
                  <div
                    className="absolute -right-6 -bottom-10 text-[180px] font-black opacity-[0.04] pointer-events-none select-none"
                    style={{ color: current.color }}
                  >
                    {current.kanji}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                    <div className="lg:col-span-7">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4" style={{ backgroundColor: current.badgeBg, color: current.color, border: `1px solid ${current.borderColor}` }}>
                        <Sparkles size={14} />
                        <span>{current.subtitle}</span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">
                        {current.title}
                      </h3>

                      <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed mb-6">
                        {current.description}
                      </p>

                      <blockquote
                        className="text-xs sm:text-sm italic pl-4 py-1.5 mb-7 text-[#E2E8F0] border-l-2"
                        style={{ borderColor: current.color }}
                      >
                        {current.quote}
                      </blockquote>

                      {/* Lista de Características */}
                      <div className="space-y-2.5">
                        {current.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#E2E8F0]">
                            <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: current.color }} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Columna Derecha: Tarjeta de Métricas Rápidas y CTA */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      <div
                        className="rounded-2xl p-6 border bg-[rgba(10,15,29,0.8)]"
                        style={{ borderColor: current.borderColor }}
                      >
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#94A3B8] mb-4">
                          Parámetros del Programa
                        </h4>
                        <div className="space-y-4">
                          {current.stats.map((st, i) => (
                            <div key={i} className="flex justify-between items-center pb-3 border-b border-[rgba(255,255,255,0.06)] last:border-b-0 last:pb-0">
                              <span className="text-xs text-[#94A3B8]">{st.label}</span>
                              <span className="text-xs font-black text-white px-2.5 py-1 rounded-md" style={{ backgroundColor: current.badgeBg, color: current.color }}>
                                {st.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Link
                        href="/contacto"
                        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          backgroundColor: current.color,
                          boxShadow: `0 8px 25px ${current.glow}`
                        }}
                      >
                        <span>Solicitar Clase de Prueba</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. METRICAS & HONOR DEL DOJO ("EXCELENCIA EN NÚMEROS")       */}
      {/* ============================================================ */}
      <section className="py-16 lg:py-20 relative z-10 border-t border-[rgba(212,175,55,0.15)]">
        <div className="container-dojo">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tarjeta 1: Años de Linaje */}
            <div className="card-sumi p-7 text-center group hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.35)] flex items-center justify-center text-[#F5D77F] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
                <Award size={26} className="text-[#D4AF37]" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:text-[#F5D77F] transition-colors">
                +25 Años
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#F5D77F] mb-1">
                Linaje & Tradición
              </p>
              <p className="text-xs text-[#94A3B8]">
                Enseñanza ininterrumpida basada en el respeto y la rectitud marcial.
              </p>
            </div>

            {/* Tarjeta 2: Cinturones Negros */}
            <div className="card-sumi p-7 text-center group hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.35)] flex items-center justify-center text-[#EF4444] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all">
                <Shield size={26} className="text-[#EF4444]" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:text-[#F87171] transition-colors">
                100%
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#F87171] mb-1">
                Grados Certificados
              </p>
              <p className="text-xs text-[#94A3B8]">
                Exámenes rigurosos avalados ante federaciones oficiales de Karate Do.
              </p>
            </div>

            {/* Tarjeta 3: Alumnos Formados */}
            <div className="card-sumi p-7 text-center group hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[rgba(59,130,246,0.12)] border border-[rgba(59,130,246,0.35)] flex items-center justify-center text-[#3B82F6] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
                <Users size={26} className="text-[#3B82F6]" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:text-[#60A5FA] transition-colors">
                +450
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#60A5FA] mb-1">
                Vidas Transformadas
              </p>
              <p className="text-xs text-[#94A3B8]">
                Niños, jóvenes y adultos que forjaron su autoconfianza y salud integral.
              </p>
            </div>

            {/* Tarjeta 4: Podio Deportivo WKF */}
            <div className="card-sumi p-7 text-center group hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.35)] flex items-center justify-center text-[#F5D77F] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all">
                <Zap size={26} className="text-[#D4AF37]" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:text-[#F5D77F] transition-colors">
                Podio WKF
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#F5D77F] mb-1">
                Alta Competencia
              </p>
              <p className="text-xs text-[#94A3B8]">
                Medallistas en campeonatos regionales y nacionales de Kata y Kumite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. DOJO KUN: LOS 5 PRECEPTOS SAGRADOS                        */}
      {/* ============================================================ */}
      <section className="py-16 lg:py-24 relative z-10 border-t border-[rgba(212,175,55,0.15)] bg-gradient-to-b from-[rgba(10,15,29,0.9)] to-[rgba(15,23,42,0.6)]">
        <div className="container-dojo">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-[#F5D77F] mb-3 block">
              Filosofía Ancestral
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              Dojo Kun: El Código del Guerrero
            </h2>
            <p className="text-base text-[#94A3B8]">
              Los 5 principios eternos que se recitan al finalizar cada sesión de entrenamiento y que rigen la conducta del karateka dentro y fuera del tatami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {dojoKunRules.map((rule, idx) => (
              <div
                key={idx}
                className="card-sumi p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
              >
                {/* Kanji Número Marcial de Fondo */}
                <div className="absolute top-2 right-4 text-5xl font-serif text-[rgba(255,255,255,0.04)] group-hover:text-[rgba(212,175,55,0.15)] transition-colors select-none">
                  {rule.num}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: rule.color, boxShadow: `0 0 8px ${rule.color}` }}
                  />
                  <span className="text-xs font-black tracking-widest uppercase text-[#94A3B8]">
                    Principio #{idx + 1}
                  </span>
                </div>

                <h3 className="text-base font-black text-white mb-2 leading-snug group-hover:text-[#F5D77F] transition-colors">
                  {rule.meaning}
                </h3>

                <p className="text-xs font-mono text-[#D4AF37] opacity-80 mb-3">
                  {rule.title}
                </p>

                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  {rule.detail}
                </p>
              </div>
            ))}

            {/* Tarjeta 6: El Juramento del Karateka */}
            <div className="card-sumi p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between border-[rgba(212,175,55,0.35)] bg-gradient-to-br from-[rgba(212,175,55,0.1)] to-[rgba(15,23,42,0.9)]">
              <div>
                <div className="flex items-center gap-2 mb-3 text-[#F5D77F]">
                  <Heart size={16} />
                  <span className="text-xs font-black tracking-widest uppercase">
                    Espíritu del Dojo
                  </span>
                </div>
                <h3 className="text-base font-black text-white mb-3">
                  Rei Ni Hajimari, Rei Ni Owaru
                </h3>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  «El Karate Do comienza con el saludo de respeto y concluye con el saludo de respeto.» La humildad es la armadura del verdadero maestro.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[rgba(212,175,55,0.2)] flex items-center justify-between">
                <span className="text-xs font-bold text-[#F5D77F]">Senseis Ryūko Kai</span>
                <span className="text-xs text-[#94A3B8]">空手道</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. BANNER FINAL CTA CON AURA DRAGÓN & TIGRE                  */}
      {/* ============================================================ */}
      <section className="py-16 lg:py-24 relative z-10 border-t border-[rgba(212,175,55,0.2)]">
        <div className="container-dojo">
          <div className="rounded-3xl p-8 sm:p-14 relative overflow-hidden bg-gradient-to-r from-[rgba(239,68,68,0.18)] via-[rgba(15,23,42,0.95)] to-[rgba(59,130,246,0.18)] border border-[rgba(212,175,55,0.35)] shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(212,175,55,0.15)] text-center max-w-4xl mx-auto backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.4)] text-[#F5D77F] text-xs font-black uppercase tracking-wider mb-5">
              <Sparkles size={14} />
              <span>Tu Primera Clase es Gratuita</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 leading-tight">
              ¿Listo para dar tu primer paso en el Tatami?
            </h2>

            <p className="text-sm sm:text-base text-[#CBD5E1] max-w-2xl mx-auto mb-8 leading-relaxed">
              No se requiere experiencia previa ni condición física especial para comenzar. Ven a conocer nuestras instalaciones, conversa con nuestros Senseis y experimenta el poder transformador de Ryūko Kai.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider text-[#0A0F1D] bg-gradient-to-r from-[#F5D77F] via-[#D4AF37] to-[#C5A059] shadow-[0_10px_25px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <MessageSquare size={18} />
                <span>Agendar Clase de Prueba</span>
              </Link>

              <Link
                href="/nosotros"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-wider text-white bg-[rgba(15,23,42,0.8)] border border-[rgba(255,255,255,0.2)] hover:border-[#D4AF37] hover:text-[#F5D77F] transition-all duration-200"
              >
                <span>Conoce Nuestra Historia</span>
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
