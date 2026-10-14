'use client';

import React from 'react';
import Image from 'next/image';
export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-76px)] flex flex-col justify-center items-center px-4 sm:px-8 py-8 overflow-hidden">
      {/* Título accesible para SEO y lectores de pantalla (oculto visualmente) */}
      <h1 className="sr-only">Ryūko Kai • Escuela de Karate Do</h1>

      {/* Halo de luz ambiental sutil de fondo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[750px] h-[600px] sm:h-[750px] rounded-full pointer-events-none blur-3xl opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.4) 0%, rgba(239,68,68,0.15) 35%, rgba(59,130,246,0.15) 65%, transparent 100%)'
        }}
      />

      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center relative z-20">
        {/* Logo Insignia Oficial Central y Protagonista Único */}
        <div className="relative flex items-center justify-center">
          {/* Halo de respiración dorada suave */}
          <div className="absolute w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.35)_0%,transparent_70%)] blur-2xl animate-glow-pulse pointer-events-none" />

          {/* Logo Oficial limpio */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 flex items-center justify-center animate-float">
            <Image
              src="/images/logos/LogoRyukukaiSinFondo.png"
              alt="Emblema Oficial Ryūko Kai"
              width={384}
              height={384}
              className="object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] filter hover:brightness-110 transition-all duration-300"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
