import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redes Sociales Oficiales | Ryūko Kai',
  description: 'Conéctate a los canales oficiales de Ryūko Kai: Instagram, YouTube, TikTok y Facebook.',
};

export default function NoticiasPage() {
  const socialNetworks = [
    {
      id: 'instagram',
      name: 'Instagram',
      url: 'https://instagram.com/ryukokai',
      glow: 'rgba(225, 48, 108, 0.45)',
      hoverGlow: 'rgba(225, 48, 108, 0.7)',
      borderColor: 'rgba(225, 48, 108, 0.55)',
      shapeClass: 'rounded-[26px] sm:rounded-[32px]',
      pingDuration: '2.6s',
      pingDelay: '0.2s',
      floatDelay: '0s',
      tiltClass: 'group-hover:-rotate-3',
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_20px_40px_rgba(225,48,108,0.5)]">
          <defs>
            <radialGradient id="igGradient" cx="20%" cy="110%" r="130%">
              <stop offset="0%" stopColor="#ffdb7d" />
              <stop offset="20%" stopColor="#f46f30" />
              <stop offset="40%" stopColor="#e1306c" />
              <stop offset="65%" stopColor="#c13584" />
              <stop offset="100%" stopColor="#833ab4" />
            </radialGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="26" fill="url(#igGradient)" />
          <rect x="18" y="18" width="64" height="64" rx="18" fill="none" stroke="#FFFFFF" strokeWidth="7" />
          <circle cx="50" cy="50" r="16" fill="none" stroke="#FFFFFF" strokeWidth="7" />
          <circle cx="71" cy="29" r="4.5" fill="#FFFFFF" />
        </svg>
      )
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: 'https://youtube.com/@ryukokai',
      glow: 'rgba(255, 0, 0, 0.45)',
      hoverGlow: 'rgba(255, 0, 0, 0.7)',
      borderColor: 'rgba(255, 0, 0, 0.55)',
      shapeClass: 'rounded-[24px] sm:rounded-[28px]',
      pingDuration: '3.3s',
      pingDelay: '1.1s',
      floatDelay: '0.7s',
      tiltClass: 'group-hover:rotate-3',
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_20px_40px_rgba(255,0,0,0.5)]">
          <rect x="2" y="14" width="96" height="72" rx="22" fill="#FF0000" />
          <polygon points="41,35 69,50 41,65" fill="#FFFFFF" />
        </svg>
      )
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      url: 'https://tiktok.com/@ryukokai',
      glow: 'rgba(37, 244, 238, 0.45)',
      hoverGlow: 'rgba(37, 244, 238, 0.7)',
      borderColor: 'rgba(37, 244, 238, 0.55)',
      shapeClass: 'rounded-[26px] sm:rounded-[32px]',
      pingDuration: '2.3s',
      pingDelay: '0.6s',
      floatDelay: '1.4s',
      tiltClass: 'group-hover:-rotate-3',
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_20px_40px_rgba(37,244,238,0.4)]">
          <rect x="2" y="2" width="96" height="96" rx="26" fill="#010101" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          <g transform="translate(18, 14) scale(2.8)">
            {/* Cyan displacement */}
            <path
              d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.13v-3.5a6.37 6.37 0 0 0-.86-.06A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 10.82 4.47V10.8a8.16 8.16 0 0 0 5.77 2.14V9.5a4.83 4.83 0 0 1 0-2.81z"
              fill="#25F4EE"
              transform="translate(-0.35, -0.35)"
              opacity="0.9"
            />
            {/* Magenta/Red displacement */}
            <path
              d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.13v-3.5a6.37 6.37 0 0 0-.86-.06A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 10.82 4.47V10.8a8.16 8.16 0 0 0 5.77 2.14V9.5a4.83 4.83 0 0 1 0-2.81z"
              fill="#FE2C55"
              transform="translate(0.35, 0.35)"
              opacity="0.9"
            />
            {/* White core */}
            <path
              d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.13v-3.5a6.37 6.37 0 0 0-.86-.06A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 10.82 4.47V10.8a8.16 8.16 0 0 0 5.77 2.14V9.5a4.83 4.83 0 0 1 0-2.81z"
              fill="#FFFFFF"
            />
          </g>
        </svg>
      )
    },
    {
      id: 'facebook',
      name: 'Facebook',
      url: 'https://facebook.com/ryukokai',
      glow: 'rgba(24, 119, 242, 0.45)',
      hoverGlow: 'rgba(24, 119, 242, 0.7)',
      borderColor: 'rgba(24, 119, 242, 0.55)',
      shapeClass: 'rounded-full',
      pingDuration: '3.0s',
      pingDelay: '1.7s',
      floatDelay: '0.4s',
      tiltClass: 'group-hover:rotate-3',
      icon: (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_20px_40px_rgba(24,119,242,0.5)]">
          <circle cx="50" cy="50" r="48" fill="#1877F2" />
          <path
            d="M63 53.5l1.8-11.8h-11.3V34c0-3.2 1.6-6.4 6.7-6.4h5.2V17.5s-4.7-.8-9.2-.8c-9.4 0-15.5 5.7-15.5 16v8.9H30.5v11.9h10.2V88.8c2.1.3 4.2.5 6.4.5 2.2 0 4.3-.2 6.4-.5V53.5H63z"
            fill="#FFFFFF"
          />
        </svg>
      )
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-76px)] flex flex-col justify-center items-center px-4 sm:px-8 py-8 overflow-hidden">
      {/* Título accesible para SEO y lectores de pantalla (oculto visualmente) */}
      <h1 className="sr-only">Redes Sociales Oficiales • Ryūko Kai</h1>

      {/* Halo de luz ambiental sutil de fondo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[600px] sm:h-[850px] rounded-full pointer-events-none blur-3xl opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.4) 0%, rgba(225,48,108,0.2) 30%, rgba(24,119,242,0.2) 65%, transparent 100%)'
        }}
      />

      <div className="w-full max-w-5xl mx-auto flex items-center justify-center relative z-10">
        {/* Logos Oficiales Ordenados con Animación Asincrónica de Radar y Auras de Marca */}
        <div className="flex flex-row flex-wrap sm:flex-nowrap items-center justify-center gap-7 sm:gap-11 md:gap-14 lg:gap-18">
          {socialNetworks.map((item) => (
            <div key={item.id} className="relative flex items-center justify-center">
              {/* Halo de respiración suave en el color característico de la red */}
              <div
                className="absolute w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full blur-2xl animate-glow-pulse pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${item.glow} 0%, transparent 70%)`,
                  animationDelay: item.floatDelay
                }}
              />

              {/* Logo con animación flotante e interactividad magnética que incita a dar clic */}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.name}
                style={{ animationDelay: item.floatDelay }}
                className="group relative w-20 h-20 sm:w-26 sm:h-26 md:w-30 md:h-30 lg:w-34 lg:h-34 flex items-center justify-center animate-float hover:scale-120 hover:brightness-125 active:scale-90 transition-all duration-300 cursor-pointer z-10"
              >
                {/* Resplandor reactivo en hover con su propio color de marca */}
                <div
                  className={`absolute -inset-3 ${item.shapeClass} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 pointer-events-none`}
                  style={{
                    background: `radial-gradient(circle, ${item.hoverGlow} 0%, transparent 75%)`
                  }}
                />

                <div className={`w-full h-full transition-transform duration-300 ${item.tiltClass} group-hover:-translate-y-1`}>
                  {item.icon}
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
