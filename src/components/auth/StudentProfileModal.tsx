'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { User } from '@/types';
import { X, Award, Shield } from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function StudentProfileModal({
  isOpen,
  onClose,
  user,
}: StudentProfileModalProps) {
  // Manejo de tecla Escape para accesibilidad
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-[560px] bg-[#0E0F14] border border-[#D4AF37]/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(212,175,55,0.15)] overflow-hidden">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/20 bg-gradient-to-r from-[#121318] to-[#0A0A0E]">
          <div className="flex items-center gap-2 text-[#F5D77F] font-black text-sm uppercase tracking-wider">
            <Award size={18} className="text-[#D4AF37]" />
            <span id="student-modal-title">Ficha Técnica del Atleta</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-md transition-colors"
            aria-label="Cerrar ficha del atleta"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo de la Ficha */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {/* Perfil del Estudiante */}
          <div className="flex items-center gap-4 p-4 bg-[#121318] border border-[#D4AF37]/20 rounded-xl">
            <div className="w-14 h-14 rounded-full bg-[#1A1C24] flex items-center justify-center text-xl font-black text-white shrink-0 border-2 border-[#D4AF37]/50 overflow-hidden">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={56}
                  height={56}
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-black text-white truncate m-0">
                {user.name}
              </h4>
              <p className="text-xs text-[#9FA6B8] truncate my-0.5">
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs px-2.5 py-0.5 bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#F5D77F] rounded font-bold">
                  {user.kyuDan || user.belt || 'Sin grado'}
                </span>
                <span className="text-xs text-[#D1D5DB]">
                  • {user.classesAttended || 0} clases asistidas
                </span>
              </div>
            </div>
          </div>

          {/* Ficha Física y Datos Biométricos */}
          <div>
            <h5 className="text-xs font-bold text-[#C5A059] uppercase tracking-wider mb-2">
              Datos Biométricos de Competición
            </h5>
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-[#121318] p-3 rounded-lg border border-white/10">
                <span className="block text-[11px] text-[#9FA6B8] mb-1">Fecha Nac.</span>
                <span className="text-xs font-bold text-white">
                  {user.birthDate || 'No reg.'}
                </span>
              </div>
              <div className="bg-[#121318] p-3 rounded-lg border border-[#D4AF37]/30">
                <span className="block text-[11px] text-[#C5A059] mb-1">Edad Oficial</span>
                <span className="text-sm font-black text-[#F5D77F]">
                  {user.age !== undefined ? `${user.age} años` : 'N/A'}
                </span>
              </div>
              <div className="bg-[#121318] p-3 rounded-lg border border-white/10">
                <span className="block text-[11px] text-[#9FA6B8] mb-1">Peso Báscula</span>
                <span className="text-sm font-black text-white">
                  {user.weight ? `${user.weight} kg` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Categorías Oficiales WKF */}
          <div>
            <h5 className="text-xs font-bold text-[#C5A059] uppercase tracking-wider mb-2">
              Categorías Oficiales WKF (Calculadas)
            </h5>
            <div className="space-y-2.5">
              {/* Kata */}
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🥋</span>
                  <div>
                    <span className="block text-[11px] text-[#F5D77F] font-bold uppercase tracking-wide">
                      División Kata (Formas)
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      {user.kataCategory || 'Pendiente (registra fecha de nacimiento)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kumite */}
              <div className="bg-white/5 border border-white/15 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🥊</span>
                  <div>
                    <span className="block text-[11px] text-[#D1D5DB] font-bold uppercase tracking-wide">
                      División Kumite (Combate)
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      {user.kumiteCategory || 'Pendiente (registra peso y fecha de nacimiento)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#9FA6B8] mt-3 leading-relaxed">
              ℹ️ Las categorías WKF son calculadas según la normativa oficial de la World Karate Federation basada en edad cumplida, rama y división de peso.
            </p>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="p-4 border-t border-[#D4AF37]/15 flex justify-end bg-[#08080C]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#15161D] border border-[#D4AF37]/35 hover:border-[#D4AF37] rounded-md text-white text-sm font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
