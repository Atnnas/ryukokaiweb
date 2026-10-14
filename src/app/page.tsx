import React from 'react';
import Image from 'next/image';
import { Droplets, Flame } from 'lucide-react';
import SponsorsTicker from '@/components/sponsors/SponsorsTicker';

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-76px)] flex items-center overflow-hidden">
      {/* ================= HERO SECTION (PANTALLA COMPLETA) ================= */}
      <section className="w-full flex items-center py-8 lg:py-14 relative z-10">
        <div className="container-dojo w-full">
          <div className="hero-grid grid items-center justify-between gap-10 lg:gap-16 w-full">
            {/* Columna Izquierda: Texto y Pasarela de Patrocinadores */}
            <div className="max-w-[780px]">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.35)] mb-5 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                <div className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                <span className="text-xs font-extrabold tracking-widest uppercase text-[#F5D77F]">
                  Dojo Tradicional & Kumite Deportivo
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-5 text-white">
                Camino a la Excelencia Marcial en{' '}
                <span className="bg-gradient-to-r from-white via-[#F5D77F] to-[#D4AF37] bg-clip-text text-transparent">
                  Ryoku Kai
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#D1D5DB] leading-relaxed mb-7 max-w-[640px]">
                Forjamos mente, cuerpo y espíritu a través del Karate Do tradicional y formativo. Forja tu carácter con disciplina, poder, honor y excelencia marcial.
              </p>

              {/* Cintillo / Pasarela de Patrocinadores (Isla Interactiva Cliente) */}
              <SponsorsTicker />
            </div>

            {/* Columna Derecha: Tarjeta Glassmorphic con el Logo Oficial */}
            <div className="flex justify-center lg:justify-end items-center relative w-full">
              <div className="w-full max-w-[520px] bg-gradient-to-br from-[rgba(16,18,24,0.85)] to-[rgba(8,9,12,0.98)] border border-[rgba(212,175,55,0.25)] rounded-2xl p-6 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden text-center backdrop-blur-md">
                {/* Símbolo Central: Logo Oficial con LCP optimizado */}
                <div className="w-48 sm:w-60 h-48 sm:h-60 mx-auto mb-6 relative drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
                  <Image
                    src="/images/logos/LogoRyukukaiSinFondo.png"
                    alt="Logo Insignia Oficial Ryūko Kai"
                    fill
                    sizes="(max-width: 640px) 192px, 240px"
                    className="object-contain"
                    priority
                  />
                </div>

                <h2 className="text-2xl font-black tracking-widest mb-2 text-white">
                  <span className="text-[#D4AF37]">RYOKU</span> KAI
                </h2>
                <p className="text-sm text-[#9FA6B8] mx-auto mb-6 max-w-[360px] leading-relaxed">
                  El arte de vencer sin luchar y la firmeza del golpe que nace de la calma interior.
                </p>

                {/* Pilares Marciales Dragón y Tigre */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="p-3.5 rounded-lg bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.35)]">
                    <div className="flex items-center gap-1.5 text-[#F5D77F] font-extrabold text-xs sm:text-sm">
                      <Droplets size={16} className="text-[#D4AF37] shrink-0" />
                      <span>RYŪ • DRAGÓN</span>
                    </div>
                    <p className="text-xs text-[#CBD5E1] mt-1 leading-normal">
                      Sabiduría, fluidez técnica, concentración y autocontrol.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.18)]">
                    <div className="flex items-center gap-1.5 text-white font-extrabold text-xs sm:text-sm">
                      <Flame size={16} className="text-white shrink-0" />
                      <span>KO • TIGRE</span>
                    </div>
                    <p className="text-xs text-[#CBD5E1] mt-1 leading-normal">
                      Potencia de impacto, espíritu indomable y resolución.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

