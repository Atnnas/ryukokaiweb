import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto | Ryūko Kai - Escuela de Karate Do',
  description: 'Contáctanos directamente por WhatsApp para solicitar información, clases de prueba o resolver dudas.',
};

export default function ContactoPage() {
  return (
    <div className="relative min-h-[calc(100vh-76px)] flex flex-col justify-center items-center px-4 sm:px-8 py-8 overflow-hidden">
      {/* Título accesible para SEO y lectores de pantalla (oculto visualmente) */}
      <h1 className="sr-only">Contacto Oficial • Ryūko Kai</h1>

      {/* Halo de luz ambiental sutil de fondo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full pointer-events-none blur-3xl opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(37,211,102,0.35) 0%, rgba(212,175,55,0.2) 40%, transparent 70%)'
        }}
      />

      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center relative z-10">
        {/* Contenedor del Logo de WhatsApp Flotante & Magnético */}
        <div className="relative flex items-center justify-center">
          {/* Halo de respiración suave */}
          <div
            className="absolute w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full blur-2xl animate-glow-pulse pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(37,211,102,0.5) 0%, transparent 70%)'
            }}
          />

          {/* Logo Flotante Interactivo al estilo de Noticias (sin texto) */}
          <a
            href="https://wa.me/525512345678?text=Hola%20Sensei%2C%20tengo%20preguntas%20sobre%20las%20clases%20en%20Ry%C5%ABko%20Kai"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp a Ryūko Kai"
            className="group relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 flex items-center justify-center animate-float hover:scale-120 hover:brightness-125 active:scale-90 transition-all duration-300 cursor-pointer z-10"
          >
            {/* Resplandor dinámico reactivo en hover */}
            <div className="absolute -inset-4 rounded-[36px] bg-[radial-gradient(circle,rgba(37,211,102,0.65)_0%,transparent_75%)] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 pointer-events-none" />

            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_25px_50px_rgba(37,211,102,0.55)] transition-transform duration-300 group-hover:-rotate-3 group-hover:-translate-y-1">
              <defs>
                <linearGradient id="waGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2fe476" />
                  <stop offset="100%" stopColor="#20ba59" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="96" height="96" rx="26" fill="url(#waGradient)" />
              <path
                d="M50 18c-17.7 0-32 14.3-32 32 0 5.7 1.5 11.1 4.3 16L18 82l16.4-4.3c4.7 2.6 10 4 15.6 4 17.7 0 32-14.3 32-32s-14.3-32-32-32zm0 58.5c-4.9 0-9.8-1.3-14-3.8l-1-.6-10.4 2.7 2.8-10.1-.6-1C24.1 59.4 22.7 54.8 22.7 50c0-15.1 12.3-27.3 27.3-27.3s27.3 12.3 27.3 27.3-12.2 27.5-27.3 27.5zm15-20.6c-.8-.4-4.9-2.4-5.6-2.7-.8-.3-1.3-.4-1.9.4-.6.8-2.2 2.7-2.7 3.3-.5.5-1 .6-1.8.2-.8-.4-3.5-1.3-6.7-4.1-2.5-2.2-4.2-5-4.7-5.8-.5-.8-.1-1.3.4-1.7.4-.4.8-1 1.2-1.5.4-.5.6-.8.8-1.4.3-.6.1-1-.1-1.5-.2-.4-1.9-4.5-2.6-6.2-.7-1.6-1.4-1.4-1.9-1.4h-1.6c-.6 0-1.5.2-2.2 1-0.8.8-3 2.9-3 7 0 4.1 3 8.1 3.4 8.7.4.6 5.9 9 14.3 12.6 2 .9 3.6 1.4 4.8 1.8 2 .6 3.8.5 5.3.3 1.6-.2 4.9-2 5.6-3.9.7-1.9.7-3.6.5-3.9-.2-.5-.7-.7-1.5-1.1z"
                fill="#FFFFFF"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
