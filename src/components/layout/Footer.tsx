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

  // El footer se oculta en administración (/admin) y en la zona de entrenamiento (/training)
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/training')) {
    return null;
  }

  return (
    <footer className="relative z-10 mt-auto pt-14 pb-8 bg-[rgba(10,15,29,0.96)] border-t border-[rgba(212,175,55,0.25)] shadow-[0_-20px_40px_rgba(0,0,0,0.45)]">
      <div className="container-dojo max-w-6xl mx-auto">
        {/* Cuadrícula Principal del Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-12">
          {/* Columna 1: Marca & Identidad */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.18)_0%,transparent_80%)] border border-[rgba(212,175,55,0.35)] flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                <Image
                  src="/images/logos/LogoRyukukaiSinFondo.png"
                  alt="Logo Oficial Ryūko Kai"
                  width={38}
                  height={38}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="block text-lg font-black tracking-wider text-white leading-tight">
                  <span className="text-[#D4AF37]">RYŪKO</span> KAI
                </span>
                <span className="text-[11px] font-bold text-[#C5A059] uppercase tracking-widest block">
                  Karate Do Tradicional
                </span>
              </div>
            </div>

            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              Forjamos carácter, rectitud moral, autocontrol y fortaleza física y mental a través del camino del Karate Do tradicional y formativo.
            </p>

            {/* Redes Sociales con efecto hover */}
            <div className="flex gap-2.5 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[rgba(17,24,39,0.85)] border border-[rgba(212,175,55,0.25)] flex items-center justify-center text-[#F5D77F] hover:bg-[rgba(212,175,55,0.2)] hover:border-[#D4AF37] hover:scale-105 transition-all"
                aria-label="Instagram Ryūko Kai"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[rgba(17,24,39,0.85)] border border-[rgba(212,175,55,0.25)] flex items-center justify-center text-[#F5D77F] hover:bg-[rgba(212,175,55,0.2)] hover:border-[#D4AF37] hover:scale-105 transition-all"
                aria-label="Facebook Ryūko Kai"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[rgba(17,24,39,0.85)] border border-[rgba(212,175,55,0.25)] flex items-center justify-center text-[#F5D77F] hover:bg-[rgba(212,175,55,0.2)] hover:border-[#D4AF37] hover:scale-105 transition-all"
                aria-label="YouTube Ryūko Kai"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                  <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#F5D77F]">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-[#CBD5E1] hover:text-[#F5D77F] transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-[#CBD5E1] hover:text-[#F5D77F] transition-colors">
                  Nosotros & Senseis
                </Link>
              </li>
              <li>
                <Link href="/noticias" className="text-[#CBD5E1] hover:text-[#F5D77F] transition-colors">
                  Noticias & Redes
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-[#CBD5E1] hover:text-[#F5D77F] transition-colors">
                  Ubicación & Contacto
                </Link>
              </li>
              <li>
                <button
                  onClick={openAuthModal}
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5D77F] hover:text-white transition-colors cursor-pointer"
                >
                  <Users size={13} className="text-[#D4AF37]" />
                  <span>Portal Alumnos</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 3: Principios del Dojo (Dojo Kun) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#F5D77F]">
              Dojo Kun (Código)
            </h4>
            <div className="space-y-1.5 text-xs text-[#94A3B8] leading-relaxed">
              <p>• Perfeccionar el carácter personal.</p>
              <p>• Ser leal y mantener el camino de la verdad.</p>
              <p>• Cultivar el espíritu del esfuerzo constante.</p>
              <p>• Honrar las reglas de cortesía y respeto.</p>
              <p>• Abstenerse de la conducta violenta.</p>
            </div>
          </div>

          {/* Columna 4: Contacto Directo */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#F5D77F]">
              Horarios & Contacto
            </h4>
            <div className="space-y-2.5 text-xs text-[#CBD5E1]">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Instalaciones Centrales del Dojo, Tatami Oficial</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-[#D4AF37] shrink-0" />
                <span>Lun a Vie: 16:00 - 21:30 | Sáb: 08:00 - 13:00</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-[#D4AF37] shrink-0" />
                <span>Informes & WhatsApp Directo</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-[#D4AF37] shrink-0" />
                <span>contacto@ryukokai.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fila Intermedia: Copyright y Seguridad */}
        <div className="pt-6 border-t border-[rgba(255,255,255,0.08)] flex flex-wrap justify-between items-center gap-4 text-xs text-[#64748B]">
          <p>
            © {new Date().getFullYear()} Ryūko Kai - Escuela de Karate Do. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#94A3B8]">
              <Shield size={14} className="text-[#D4AF37]" />
              <span>Autenticación Segura</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#94A3B8]">
              <Award size={14} className="text-[#D4AF37]" />
              <span>Grados Federados</span>
            </span>
          </div>
        </div>

        {/* Créditos del Desarrollador */}
        <div className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider text-[#64748B]">
          <span>developed by</span>
          <span className="font-extrabold text-[#F5D77F] tracking-widest bg-[rgba(212,175,55,0.1)] px-2.5 py-0.5 rounded border border-[rgba(212,175,55,0.3)] shadow-[0_0_10px_rgba(212,175,55,0.12)]">
            Kumadev.inc
          </span>
        </div>
      </div>
    </footer>
  );
}
