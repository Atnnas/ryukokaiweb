'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import { Menu, X, LogIn, LogOut, Shield, Clock, ChevronRight } from 'lucide-react';

const StudentProfileModal = dynamic(
  () => import('@/components/auth/StudentProfileModal'),
  { ssr: false }
);

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isFichaModalOpen, setIsFichaModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, openAuthModal, logout } = useAuth();

  // Cerrar dropdown al hacer click fuera o presionar escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsUserDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserDropdownOpen]);

  const isSuperAdmin =
    user?.email?.toLowerCase().includes('david.artavia.rodriguez@gmail.com') ||
    user?.email?.toLowerCase().includes('davidartaviarodriguez@gmail.com');

  const isAdmin = !!user && (
    (user.role === 'administrator' && user.status === 'active') ||
    isSuperAdmin
  );

  const isApprovedUser = !!user && (user.status === 'active' || isAdmin);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Noticias & Redes', href: '/noticias' },
    { name: 'Contacto', href: '/contacto' },
    ...(isApprovedUser ? [{ name: 'Entrenamiento', href: '/training' }] : []),
  ];

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(10, 15, 29, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.22)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div
        className="container-dojo"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '76px',
        }}
      >
        {/* Marca / Logo */}
        <Link
          href="/"
          onClick={closeMobile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.18) 0%, transparent 80%)',
              border: '1.5px solid rgba(212, 175, 55, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.15)',
            }}
          >
            <Image
              src="/images/logos/LogoRyukukaiSinFondo.png"
              alt="Logo Oficial Ryūko Kai"
              width={44}
              height={44}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '1.25rem',
                fontWeight: 900,
                letterSpacing: '0.08em',
                lineHeight: 1.1,
                color: '#FFFFFF',
              }}
            >
              <span style={{ color: '#D4AF37' }}>RYŪKO</span> <span style={{ color: '#FFFFFF' }}>KAI</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.22em',
                color: '#C5A059',
                textTransform: 'uppercase',
              }}
            >
              Karate Do
            </span>
          </div>
        </Link>

        {/* Navegación Desktop */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.75rem',
          }}
          className="md-flex"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="group"
                style={{
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isActive ? '#F5D77F' : '#94A3B8',
                  textShadow: isActive ? '0 0 12px rgba(212, 175, 55, 0.4)' : 'none',
                  position: 'relative',
                  padding: '0.5rem 0',
                  transition: 'color 0.25s ease, text-shadow 0.25s ease',
                }}
              >
                <span className="group-hover:text-[#F5D77F] transition-colors duration-200">
                  {link.name}
                </span>
                {isActive && (
                  <span className="nav-tab-indicator" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Acciones de Usuario (Desktop) */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1rem',
          }}
          className="md-flex"
        >
          {user ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={isUserDropdownOpen}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.4rem 0.85rem 0.4rem 0.45rem',
                  backgroundColor: '#121318',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '30px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: isAdmin ? '#AA7C11' : '#1A1C24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1.5px solid rgba(212, 175, 55, 0.45)',
                  }}
                >
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={30}
                      height={30}
                      unoptimized
                      referrerPolicy="no-referrer"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span style={{ fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.45rem',
                    backgroundColor: 'rgba(212, 175, 55, 0.18)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#F5D77F',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                  }}
                >
                  {isAdmin ? 'ADMIN' : user.kyuDan}
                </span>
              </button>

              {/* Menú Desplegable Usuario */}
              {isUserDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    width: '260px',
                    backgroundColor: '#0E0F14',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    boxShadow: '0 10px 35px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.1)',
                    zIndex: 60,
                  }}
                >
                  <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: isAdmin ? '#AA7C11' : '#1A1C24',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '1.5px solid rgba(212, 175, 55, 0.4)',
                        }}
                      >
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={40}
                            height={40}
                            unoptimized
                            referrerPolicy="no-referrer"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.name}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: '#9FA6B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.email}
                        </p>
                      </div>
                    </div>



                    {user.status === 'pending' && (
                      <div
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.35rem 0.55rem',
                          backgroundColor: 'rgba(212, 175, 55, 0.12)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          color: '#F5D77F',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Clock size={12} /> Cuenta en espera de aprobación
                      </div>
                    )}
                  </div>


                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.65rem',
                        marginTop: '0.55rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(212, 175, 55, 0.18)',
                        borderRadius: '8px',
                        color: '#E2E8F0',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.38)';
                        e.currentTarget.style.color = '#F5D77F';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.18)';
                        e.currentTarget.style.color = '#E2E8F0';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(212, 175, 55, 0.12)',
                            border: '1px solid rgba(212, 175, 55, 0.22)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Shield size={13} color="#D4AF37" />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.01em' }}>
                          Panel Administrativo
                        </span>
                      </div>
                      <ChevronRight size={13} style={{ opacity: 0.45 }} />
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setIsUserDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      marginTop: '0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.4rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#E5E7EB',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      borderRadius: '4px',
                    }}
                  >
                    <LogOut size={14} /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 1.65rem',
                backgroundColor: 'rgba(212, 175, 55, 0.12)',
                border: '1.5px solid rgba(212, 175, 55, 0.45)',
                borderRadius: '9999px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.12)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {/* Google G icon */}
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              Acceso Alumnos
            </button>
          )}
        </div>

        {/* Botón Menú Móvil */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md-hidden"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '6px',
            color: '#F7F8FA',
            padding: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Abrir menú de navegación"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menú Drawer Móvil */}
      {isMobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#090A0E',
            borderTop: '1px solid rgba(212, 175, 55, 0.2)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            animation: 'fadeIn 0.2s ease',
            maxHeight: 'calc(100vh - 76px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
          className="md-hidden"
        >
          {/* Logo y Marca Oficial en Menú Móvil */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              paddingBottom: '0.85rem',
              borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 75%)',
                border: '1.5px solid rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px',
                flexShrink: 0,
              }}
            >
              <Image
                src="/images/logos/LogoRyukukaiSinFondo.png"
                alt="Logo Oficial Ryūko Kai"
                width={34}
                height={34}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '0.06em', color: '#FFFFFF' }}>
                <span style={{ color: '#D4AF37' }}>RYŪKO</span> KAI
              </span>
              <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', color: '#C5A059', textTransform: 'uppercase' }}>
                Karate Do
              </span>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMobile}
                  style={{
                    textDecoration: 'none',
                    fontSize: '1.1rem',
                    fontWeight: isActive ? 800 : 500,
                    color: isActive ? '#F5D77F' : '#D1D5DB',
                    padding: '0.6rem 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingTop: '0.5rem' }}>
            {user ? (
              <div
                style={{
                  padding: '0.85rem',
                  backgroundColor: '#121318',
                  borderRadius: '6px',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: isAdmin ? '#AA7C11' : '#1A1C24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1.5px solid rgba(212, 175, 55, 0.4)',
                    }}
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={38}
                        height={38}
                        unoptimized
                        referrerPolicy="no-referrer"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>{user.name}</p>
                  </div>
                </div>



                {user.status === 'pending' && (
                  <p style={{ fontSize: '0.72rem', color: '#F5D77F', marginTop: '0.3rem' }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> En espera de aprobación
                  </p>
                )}

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={closeMobile}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      marginTop: '0.65rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(212, 175, 55, 0.18)',
                      borderRadius: '8px',
                      color: '#E2E8F0',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(212, 175, 55, 0.12)',
                          border: '1px solid rgba(212, 175, 55, 0.22)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Shield size={13} color="#D4AF37" />
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Panel Administrativo</span>
                    </div>
                    <ChevronRight size={13} style={{ opacity: 0.45 }} />
                  </Link>
                )}

                <button
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                  style={{
                    marginTop: '0.65rem',
                    background: 'none',
                    border: 'none',
                    color: '#E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  closeMobile();
                  openAuthModal();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  padding: '0.9rem 1.5rem',
                  backgroundColor: '#121318',
                  border: '1.5px solid rgba(212, 175, 55, 0.45)',
                  borderRadius: '9999px',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(212, 175, 55, 0.12)',
                  whiteSpace: 'nowrap',
                }}
              >
                <LogIn size={18} color="#D4AF37" /> Iniciar Sesión con Google
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal Ficha Marcial & Pasaporte WKF (Desacoplado) */}
      {isFichaModalOpen && user && (
        <StudentProfileModal
          isOpen={isFichaModalOpen}
          onClose={() => setIsFichaModalOpen(false)}
          user={user}
        />
      )}
    </header>
  );
}
