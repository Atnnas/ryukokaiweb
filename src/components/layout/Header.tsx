'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, LogIn, LogOut, Award, Shield, Clock, User as UserIcon } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isFichaModalOpen, setIsFichaModalOpen] = useState(false);
  const pathname = usePathname();
  const { user, openAuthModal, logout } = useAuth();

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
        backgroundColor: 'rgba(7, 7, 9, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.18)',
        transition: 'all 0.3s ease',
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
              <span style={{ color: '#D4AF37' }}>RYOKU</span> <span style={{ color: '#FFFFFF' }}>KAI</span>
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
              Karate Do • Tradición & Poder
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
                style={{
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 800 : 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: isActive ? '#F5D77F' : '#A0A5B5',
                  position: 'relative',
                  padding: '0.5rem 0',
                  transition: 'color 0.2s ease',
                }}
              >
                {link.name}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      background: 'linear-gradient(90deg, #D4AF37 0%, #F5D77F 100%)',
                      borderRadius: '2px',
                      boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)',
                    }}
                  />
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
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
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

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.76rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#E2E8F0', fontWeight: 600 }}>
                        <Award size={14} color="#D4AF37" />
                        <span style={{ color: '#F5D77F', fontWeight: 700 }}>{user.kyuDan || user.belt || 'Sin grado'}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#9FA6B8' }}>{user.classesAttended || 0} clases</span>
                    </div>

                    {(user.kataCategory || user.kumiteCategory) && (
                      <div
                        style={{
                          marginTop: '0.6rem',
                          padding: '0.55rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          border: '1px solid rgba(212, 175, 55, 0.15)',
                          borderRadius: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.06em', color: '#D4AF37', textTransform: 'uppercase' }}>
                            Categorías WKF
                          </span>
                          {user.age && (
                            <span style={{ fontSize: '0.68rem', color: '#CBD5E1', fontWeight: 600 }}>
                              {user.age} años {user.weight ? `• ${user.weight}kg` : ''}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          {user.kataCategory && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                              <span style={{ color: '#F5D77F', fontWeight: 600 }}>🥋 Kata:</span>
                              <span style={{ color: '#FFFFFF', fontWeight: 700, backgroundColor: 'rgba(212, 175, 55, 0.15)', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                                {user.kataCategory}
                              </span>
                            </div>
                          )}
                          {user.kumiteCategory && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                              <span style={{ color: '#E2E8F0', fontWeight: 600 }}>🥊 Kumite:</span>
                              <span style={{ color: '#FFFFFF', fontWeight: 700, backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                                {user.kumiteCategory}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}


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
                        gap: '0.6rem',
                        padding: '0.65rem 0.6rem',
                        marginTop: '0.5rem',
                        backgroundColor: 'rgba(212, 175, 55, 0.14)',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        borderRadius: '6px',
                        color: '#F5D77F',
                        textDecoration: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <Shield size={16} color="#D4AF37" />
                      <span>Panel de Administración (/admin)</span>
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
                gap: '0.55rem',
                padding: '0.6rem 1.15rem',
                backgroundColor: 'rgba(212, 175, 55, 0.12)',
                border: '1.5px solid rgba(212, 175, 55, 0.45)',
                borderRadius: '4px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.12)',
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
                <span style={{ color: '#D4AF37' }}>RYOKU</span> KAI
              </span>
              <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', color: '#C5A059', textTransform: 'uppercase' }}>
                Escuela de Karate Do
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
                    <p style={{ fontSize: '0.78rem', color: '#F5D77F', fontWeight: 700 }}>{user.kyuDan || user.belt}</p>
                  </div>
                </div>

                {(user.kataCategory || user.kumiteCategory) && (
                  <div
                    style={{
                      marginTop: '0.65rem',
                      padding: '0.55rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(212, 175, 55, 0.15)',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.06em', color: '#D4AF37', textTransform: 'uppercase' }}>
                        Categorías WKF
                      </span>
                      {user.age && (
                        <span style={{ fontSize: '0.68rem', color: '#CBD5E1', fontWeight: 600 }}>
                          {user.age} años {user.weight ? `• ${user.weight}kg` : ''}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {user.kataCategory && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                          <span style={{ color: '#F5D77F', fontWeight: 600 }}>🥋 Kata:</span>
                          <span style={{ color: '#FFFFFF', fontWeight: 700, backgroundColor: 'rgba(212, 175, 55, 0.15)', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                            {user.kataCategory}
                          </span>
                        </div>
                      )}
                      {user.kumiteCategory && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                          <span style={{ color: '#E2E8F0', fontWeight: 600 }}>🥊 Kumite:</span>
                          <span style={{ color: '#FFFFFF', fontWeight: 700, backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                            {user.kumiteCategory}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}


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
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      marginTop: '0.65rem',
                      backgroundColor: 'rgba(212, 175, 55, 0.14)',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      borderRadius: '4px',
                      color: '#F5D77F',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                    }}
                  >
                    <Shield size={14} color="#D4AF37" /> Panel Administrativo (/admin)
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
                  gap: '0.5rem',
                  padding: '0.85rem',
                  backgroundColor: '#121318',
                  border: '1.5px solid rgba(212, 175, 55, 0.45)',
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(212, 175, 55, 0.12)',
                }}
              >
                <LogIn size={18} color="#D4AF37" /> Iniciar Sesión con Google
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal Ficha Marcial & Pasaporte WKF */}
      {isFichaModalOpen && user && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(5, 5, 8, 0.88)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsFichaModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#0E0F14',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(212, 175, 55, 0.15)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* Header del Modal */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(14, 15, 20, 0.95) 100%)',
                borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#16171E',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Award size={20} color="#D4AF37" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '0.02em' }}>
                    Ficha Marcial WKF
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#C5A059', margin: 0 }}>
                    Federación Mundial de Karate • Ryoku Kai
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFichaModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9FA6B8',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo de la Ficha */}
            <div style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
              {/* Perfil del Estudiante */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: '#121318',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '10px',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#1A1C24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '2px solid rgba(212, 175, 55, 0.5)',
                  }}
                >
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={56}
                      height={56}
                      unoptimized
                      referrerPolicy="no-referrer"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#9FA6B8', margin: '0.15rem 0' }}>
                    {user.email}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.6rem',
                        backgroundColor: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        color: '#F5D77F',
                        borderRadius: '4px',
                        fontWeight: 700,
                      }}
                    >
                      {user.kyuDan || user.belt || 'Sin grado'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#D1D5DB' }}>
                      • {user.classesAttended || 0} clases asistidas
                    </span>
                  </div>
                </div>
              </div>

              {/* Ficha Física y Datos Biométricos */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#C5A059', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                  Datos Biométricos de Competición
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.65rem' }}>
                  <div style={{ backgroundColor: '#121318', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#9FA6B8', marginBottom: '0.2rem' }}>Fecha Nac.</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {user.birthDate || 'No reg.'}
                    </span>
                  </div>
                  <div style={{ backgroundColor: '#121318', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.25)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#C5A059', marginBottom: '0.2rem' }}>Edad Oficial</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F5D77F' }}>
                      {user.age !== undefined ? `${user.age} años` : 'N/A'}
                    </span>
                  </div>
                  <div style={{ backgroundColor: '#121318', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#9FA6B8', marginBottom: '0.2rem' }}>Peso Báscula</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {user.weight ? `${user.weight} kg` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Categorías Oficiales WKF */}
              <div>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#C5A059', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                  Categorías Oficiales WKF (Calculadas)
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Kata */}
                  <div
                    style={{
                      backgroundColor: 'rgba(212, 175, 55, 0.08)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>🥋</span>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#F5D77F', fontWeight: 700, textTransform: 'uppercase' }}>
                          División Kata (Formas)
                        </span>
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF' }}>
                          {user.kataCategory || 'Pendiente de cálculo (registra fecha de nacimiento)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Kumite */}
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>🥊</span>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#D1D5DB', fontWeight: 700, textTransform: 'uppercase' }}>
                          División Kumite (Combate)
                        </span>
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF' }}>
                          {user.kumiteCategory || 'Pendiente de cálculo (registra peso y fecha de nacimiento)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.72rem', color: '#9FA6B8', marginTop: '0.85rem', lineHeight: 1.4 }}>
                  ℹ️ Las categorías WKF son calculadas de acuerdo a la normativa oficial de la World Karate Federation (WKF) basada en edad cumplida, rama y división de peso corporal.
                </p>
              </div>
            </div>

            {/* Footer del Modal */}
            <div
              style={{
                padding: '0.85rem 1.5rem',
                borderTop: '1px solid rgba(212, 175, 55, 0.15)',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: '#08080C',
              }}
            >
              <button
                type="button"
                onClick={() => setIsFichaModalOpen(false)}
                style={{
                  padding: '0.55rem 1.25rem',
                  backgroundColor: '#15161D',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Queries de soporte */}
      <style jsx global>{`
        @media (min-width: 768px) {
          .md-flex {
            display: flex !important;
          }
          .md-hidden {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .md-flex {
            display: none !important;
          }
          .md-hidden {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
