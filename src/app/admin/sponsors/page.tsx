'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Sponsor, SponsorTier, SponsorStatus } from '@/types';
import {
  Handshake,
  Plus,
  Search,
  RefreshCw,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Award,
  Sparkles,
  Building,
  Phone,
} from 'lucide-react';

export default function AdminSponsorsPage() {
  const { user } = useAuth();

  // Estados de lista y filtros
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | SponsorTier>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | SponsorStatus>('all');

  // Estados para modal (Crear / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);

  // Formulario
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [tier, setTier] = useState<SponsorTier>('oro');
  const [contractStart, setContractStart] = useState(() => new Date().toISOString().split('T')[0]);
  const [contractExpiry, setContractExpiry] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<SponsorStatus>('active');

  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar lista de patrocinadores desde la API
  const fetchSponsors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sponsors');
      if (res.ok) {
        const data = await res.json();
        setSponsors(data.sponsors || []);
      } else {
        console.error('Error al obtener patrocinadores');
      }
    } catch (err) {
      console.error('Error de red al cargar patrocinadores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'administrator') {
      fetchSponsors();
    }
  }, [user, fetchSponsors]);

  // Manejador de subida de imagen local desde el dispositivo
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tamaño (máx 3MB para base64)
    if (file.size > 3 * 1024 * 1024) {
      setActionMessage({ type: 'error', text: 'La imagen excede el límite de 3MB. Selecciona una más ligera.' });
      setTimeout(() => setActionMessage(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Abrir modal en modo Crear
  const openCreateModal = () => {
    setEditingSponsor(null);
    setName('');
    setLogo('');
    setTier('oro');
    setContractStart(new Date().toISOString().split('T')[0]);
    // Por defecto 1 año de contrato
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    setContractExpiry(oneYearLater.toISOString().split('T')[0]);
    setWebsiteUrl('');
    setPhone('');
    setNotes('');
    setStatus('active');
    setIsModalOpen(true);
  };

  // Abrir modal en modo Editar
  const openEditModal = (sp: Sponsor) => {
    setEditingSponsor(sp);
    setName(sp.name);
    setLogo(sp.logo);
    setTier(sp.tier);
    setContractStart(sp.contractStart || new Date().toISOString().split('T')[0]);
    setContractExpiry(sp.contractExpiry);
    setWebsiteUrl(sp.websiteUrl || '');
    setPhone(sp.phone || '');
    setNotes(sp.notes || '');
    setStatus(sp.status || 'active');
    setIsModalOpen(true);
  };

  // Guardar (Crear o Modificar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setActionMessage({ type: 'error', text: 'Por favor ingresa el nombre del patrocinador' });
      return;
    }
    if (!logo) {
      setActionMessage({ type: 'error', text: 'Debes seleccionar o cargar un logotipo desde tu dispositivo' });
      return;
    }
    if (!contractExpiry) {
      setActionMessage({ type: 'error', text: 'Ingresa la fecha de vigencia del contrato' });
      return;
    }

    setSubmitting(true);
    try {
      const isEditing = !!editingSponsor;
      const url = '/api/admin/sponsors';
      const method = isEditing ? 'PATCH' : 'POST';

      const payload = {
        ...(isEditing ? { id: editingSponsor.id || editingSponsor._id } : {}),
        name: name.trim(),
        logo,
        tier,
        contractStart,
        contractExpiry,
        websiteUrl: websiteUrl.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
        status,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          type: 'success',
          text: isEditing ? 'Patrocinador actualizado exitosamente' : 'Patrocinador registrado en la base de datos',
        });
        setIsModalOpen(false);
        fetchSponsors();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Error al procesar la solicitud' });
      }
    } catch (err) {
      console.error('Error al guardar patrocinador:', err);
      setActionMessage({ type: 'error', text: 'Error de red al guardar' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Eliminar patrocinador
  const handleDelete = async (id?: string, sponsorName?: string) => {
    if (!id) return;
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente al patrocinador "${sponsorName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/sponsors?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Patrocinador eliminado correctamente' });
        fetchSponsors();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'No se pudo eliminar el patrocinador' });
      }
    } catch (err) {
      console.error('Error eliminando patrocinador:', err);
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Filtrado
  const filteredSponsors = sponsors.filter((sp) => {
    const matchesSearch = sp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'all' || sp.tier === tierFilter;
    const matchesStatus = statusFilter === 'all' || sp.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  // Métricas
  const totalCount = sponsors.length;
  const oroCount = sponsors.filter((s) => s.tier === 'oro').length;
  const plataCount = sponsors.filter((s) => s.tier === 'plata').length;
  const bronceCount = sponsors.filter((s) => s.tier === 'bronce').length;
  const activeCount = sponsors.filter((s) => s.status === 'active').length;

  // Render de insignia de nivel
  const renderTierBadge = (t: SponsorTier) => {
    switch (t) {
      case 'oro':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              backgroundColor: 'rgba(234, 179, 8, 0.18)',
              border: '1px solid rgba(250, 204, 21, 0.5)',
              color: '#FACC15',
              boxShadow: '0 0 10px rgba(234, 179, 8, 0.15)',
            }}
          >
            <Sparkles size={12} /> Nivel Oro (Principal)
          </span>
        );
      case 'plata':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              backgroundColor: 'rgba(203, 213, 225, 0.15)',
              border: '1px solid rgba(203, 213, 225, 0.4)',
              color: '#E2E8F0',
            }}
          >
            <Award size={12} /> Nivel Plata (Oficial)
          </span>
        );
      case 'bronce':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              backgroundColor: 'rgba(217, 119, 6, 0.18)',
              border: '1px solid rgba(217, 119, 6, 0.45)',
              color: '#FDBA74',
            }}
          >
            <Building size={12} /> Nivel Bronce (Colaborador)
          </span>
        );
    }
  };

  // Cálculo de días restantes de contrato
  const getDaysRemaining = (expiryDate?: string) => {
    if (!expiryDate) return { text: 'Sin fecha', isExpired: false, isExpiringSoon: false };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Vencido hace ${Math.abs(diffDays)} d`, isExpired: true, isExpiringSoon: false };
    }
    if (diffDays === 0) {
      return { text: 'Vence hoy', isExpired: false, isExpiringSoon: true };
    }
    if (diffDays <= 30) {
      return { text: `${diffDays} días restantes`, isExpired: false, isExpiringSoon: true };
    }
    return { text: `${diffDays} días de vigencia`, isExpired: false, isExpiringSoon: false };
  };

  return (
    <div>
      {/* Toast Notificación */}
      {actionMessage && (
        <div
          style={{
            position: 'fixed',
            top: '90px',
            right: '20px',
            zIndex: 100,
            padding: '1rem 1.4rem',
            borderRadius: '8px',
            backgroundColor: actionMessage.type === 'success' ? '#143823' : '#3F1212',
            border: `1px solid ${actionMessage.type === 'success' ? '#22C55E' : '#EF4444'}`,
            color: '#F7F8FA',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.9rem',
          }}
        >
          {actionMessage.type === 'success' ? <CheckCircle size={18} color="#22C55E" /> : <XCircle size={18} color="#EF4444" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Encabezado Superior */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.6rem',
                backgroundColor: 'rgba(35, 52, 107, 0.3)',
                border: '1px solid rgba(140, 166, 248, 0.4)',
                borderRadius: '20px',
                color: '#8CA6F8',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <Handshake size={14} /> Módulo Comercial
            </span>
            <span style={{ fontSize: '0.8rem', color: '#9FA6B8' }}>
              Colección: <strong>Sponsors</strong>
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#F7F8FA', lineHeight: 1.15 }}>
            Gestión de Patrocinadores & Alianzas
          </h1>
          <p style={{ color: '#9FA6B8', fontSize: '0.92rem', marginTop: '0.35rem' }}>
            Administra los convenios de patrocinio, logotipos oficiales, niveles de visibilidad y vigencias de contrato del dojo.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={fetchSponsors}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1rem',
              backgroundColor: '#161922',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#F7F8FA',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={15} className={loading ? 'spin-animation' : ''} />
            Actualizar
          </button>

          <button
            onClick={openCreateModal}
            className="btn-martial-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              fontSize: '0.85rem',
            }}
          >
            <Plus size={16} /> Agregar Patrocinador
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas / KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card-sumi" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(35, 52, 107, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Handshake size={22} color="#8CA6F8" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#9FA6B8', fontWeight: 600, textTransform: 'uppercase' }}>Total Patrocinadores</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F7F8FA' }}>{totalCount}</p>
          </div>
        </div>

        <div className="card-sumi" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(234, 179, 8, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} color="#FACC15" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#FACC15', fontWeight: 700, textTransform: 'uppercase' }}>Nivel Oro</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F7F8FA' }}>{oroCount}</p>
          </div>
        </div>

        <div className="card-sumi" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(203, 213, 225, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={22} color="#E2E8F0" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#9FA6B8', fontWeight: 600, textTransform: 'uppercase' }}>Nivel Plata</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F7F8FA' }}>{plataCount}</p>
          </div>
        </div>

        <div className="card-sumi" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(217, 119, 6, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building size={22} color="#FDBA74" />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#9FA6B8', fontWeight: 600, textTransform: 'uppercase' }}>Nivel Bronce</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F7F8FA' }}>{bronceCount}</p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div
        className="card-sumi"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9FA6B8' }} />
          <input
            type="text"
            placeholder="Buscar por nombre de empresa o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.4rem',
              backgroundColor: '#12151E',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#F7F8FA',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#9FA6B8', marginRight: '0.2rem' }}>Nivel:</span>
          {(['all', 'oro', 'plata', 'bronce'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: tierFilter === t ? '#8CA6F8' : 'rgba(255, 255, 255, 0.08)',
                backgroundColor: tierFilter === t ? 'rgba(35, 52, 107, 0.35)' : '#161922',
                color: tierFilter === t ? '#F7F8FA' : '#9FA6B8',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {t === 'all' ? 'Todos' : t}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#9FA6B8', marginRight: '0.2rem' }}>Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | SponsorStatus)}
            style={{
              padding: '0.45rem 0.8rem',
              backgroundColor: '#12151E',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#F7F8FA',
              fontSize: '0.82rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Vigentes (Activos)</option>
            <option value="expired">Vencidos</option>
          </select>
        </div>
      </div>

      {/* Grid de Patrocinadores */}
      {filteredSponsors.length === 0 ? (
        <div
          className="card-sumi"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            color: '#9FA6B8',
          }}
        >
          <Handshake size={48} style={{ color: '#4A5568', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#F7F8FA', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            {loading ? 'Cargando patrocinadores...' : 'No hay patrocinadores registrados'}
          </h3>
          <p style={{ fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            {loading
              ? 'Conectando con la colección Sponsors de MongoDB...'
              : 'Registra los comercios, marcas y aliados que apoyan al Dojo Ying Yang con sus logotipos y vigencias.'}
          </p>
          {!loading && (
            <button onClick={openCreateModal} className="btn-martial-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
              <Plus size={16} /> Agregar el Primer Patrocinador
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredSponsors.map((sp) => {
            const expiryInfo = getDaysRemaining(sp.contractExpiry);

            return (
              <div
                key={sp.id || sp._id}
                className="card-sumi"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  position: 'relative',
                  border: sp.tier === 'oro' ? '1px solid rgba(234, 179, 8, 0.3)' : undefined,
                  boxShadow: sp.tier === 'oro' ? '0 10px 30px rgba(234, 179, 8, 0.08)' : undefined,
                }}
              >
                {/* Cabecera de la tarjeta: Logo + Nombre + Nivel */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    {/* Contenedor del Logo */}
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '12px',
                        backgroundColor: '#161922',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        padding: '0.5rem',
                        flexShrink: 0,
                      }}
                    >
                      {sp.logo ? (
                        <img
                          src={sp.logo}
                          alt={sp.name}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <Building size={32} color="#9FA6B8" />
                      )}
                    </div>

                    {/* Badge de Nivel */}
                    <div>{renderTierBadge(sp.tier)}</div>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                    {sp.name}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                    {sp.websiteUrl && (
                      <a
                        href={sp.websiteUrl.startsWith('http') ? sp.websiteUrl : `https://${sp.websiteUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.8rem',
                          color: '#8CA6F8',
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink size={12} />
                        <span>{sp.websiteUrl.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                    {sp.phone && (
                      <a
                        href={`tel:${sp.phone}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.8rem',
                          color: '#34D399',
                          textDecoration: 'none',
                        }}
                      >
                        <Phone size={12} />
                        <span>{sp.phone}</span>
                      </a>
                    )}
                  </div>

                  {sp.notes && (
                    <p style={{ fontSize: '0.82rem', color: '#9DA3B4', lineHeight: 1.5, margin: '0.5rem 0' }}>
                      {sp.notes}
                    </p>
                  )}
                </div>

                {/* Pie de la tarjeta: Vigencia + Acciones */}
                <div>
                  <div
                    style={{
                      paddingTop: '0.85rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9FA6B8' }}>
                      <Calendar size={14} />
                      <span>Vence: <strong style={{ color: '#F7F8FA' }}>{sp.contractExpiry}</strong></span>
                    </div>

                    {/* Badge de estado de vigencia */}
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.55rem',
                        borderRadius: '12px',
                        backgroundColor: expiryInfo.isExpired
                          ? 'rgba(239, 68, 68, 0.18)'
                          : expiryInfo.isExpiringSoon
                          ? 'rgba(234, 179, 8, 0.18)'
                          : 'rgba(34, 197, 94, 0.18)',
                        color: expiryInfo.isExpired
                          ? '#F87171'
                          : expiryInfo.isExpiringSoon
                          ? '#FACC15'
                          : '#4ADE80',
                        border: `1px solid ${
                          expiryInfo.isExpired
                            ? 'rgba(239, 68, 68, 0.3)'
                            : expiryInfo.isExpiringSoon
                            ? 'rgba(234, 179, 8, 0.4)'
                            : 'rgba(34, 197, 94, 0.3)'
                        }`,
                      }}
                    >
                      {expiryInfo.text}
                    </span>
                  </div>

                  {/* Botones de Acción */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                      onClick={() => openEditModal(sp)}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        padding: '0.55rem 0.85rem',
                        backgroundColor: '#161922',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '6px',
                        color: '#F7F8FA',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Edit2 size={14} color="#8CA6F8" /> Editar
                    </button>

                    <button
                      onClick={() => handleDelete(sp.id || sp._id, sp.name)}
                      style={{
                        padding: '0.55rem 0.75rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '6px',
                        color: '#F87171',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title="Eliminar patrocinador"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: Agregar / Editar Patrocinador                          */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <div
            className="card-sumi"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              position: 'relative',
              boxShadow: '0 25px 50px rgba(0,0,0,0.85)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: '#9FA6B8',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <Handshake size={24} color="#8CA6F8" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F7F8FA' }}>
                {editingSponsor ? 'Editar Patrocinador' : 'Nuevo Patrocinador'}
              </h2>
            </div>
            <p style={{ color: '#9FA6B8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Configura los datos del patrocinador, carga su logotipo y define la fecha límite de vigencia de su contrato.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Carga de Imagen / Logotipo desde dispositivo */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.4rem' }}>
                  Logotipo Oficial (Cargar desde dispositivo) *
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(140, 166, 248, 0.3)',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    backgroundColor: '#12151E',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.65rem',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />

                  {logo ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '8px',
                          backgroundColor: '#1A1E2B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.4rem',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                        }}
                      >
                        <img src={logo} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4ADE80', margin: 0 }}>
                          ✓ Imagen cargada
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#9FA6B8', margin: '0.2rem 0 0' }}>
                          Haz clic para cambiar el archivo
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(35, 52, 107, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Upload size={20} color="#8CA6F8" />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F7F8FA', margin: 0 }}>
                          Haz clic para buscar en tu dispositivo
                        </p>
                        <p style={{ fontSize: '0.72rem', color: '#9FA6B8', margin: '0.2rem 0 0' }}>
                          PNG, JPG, WEBP o SVG (Máximo 3MB)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Nombre del Patrocinador */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                  Nombre de la Empresa o Marca *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Banco Nacional, SportFit Nutrition, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#12151E',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#F7F8FA',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Selector de Nivel de Patrocinio (3 Niveles Recomendados) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                  Nivel de Patrocinio *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                  {/* Oro */}
                  <div
                    onClick={() => setTier('oro')}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: '6px',
                      border: tier === 'oro' ? '2px solid #FACC15' : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: tier === 'oro' ? 'rgba(234, 179, 8, 0.15)' : '#12151E',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <Sparkles size={18} color="#FACC15" style={{ margin: '0 auto 0.25rem' }} />
                    <p style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FACC15', margin: 0 }}>ORO</p>
                    <p style={{ fontSize: '0.68rem', color: '#9FA6B8', margin: '0.15rem 0 0' }}>Principal</p>
                  </div>

                  {/* Plata */}
                  <div
                    onClick={() => setTier('plata')}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: '6px',
                      border: tier === 'plata' ? '2px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: tier === 'plata' ? 'rgba(203, 213, 225, 0.15)' : '#12151E',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <Award size={18} color="#E2E8F0" style={{ margin: '0 auto 0.25rem' }} />
                    <p style={{ fontSize: '0.82rem', fontWeight: 800, color: '#E2E8F0', margin: 0 }}>PLATA</p>
                    <p style={{ fontSize: '0.68rem', color: '#9FA6B8', margin: '0.15rem 0 0' }}>Oficial</p>
                  </div>

                  {/* Bronce */}
                  <div
                    onClick={() => setTier('bronce')}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: '6px',
                      border: tier === 'bronce' ? '2px solid #FDBA74' : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: tier === 'bronce' ? 'rgba(217, 119, 6, 0.15)' : '#12151E',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <Building size={18} color="#FDBA74" style={{ margin: '0 auto 0.25rem' }} />
                    <p style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FDBA74', margin: 0 }}>BRONCE</p>
                    <p style={{ fontSize: '0.68rem', color: '#9FA6B8', margin: '0.15rem 0 0' }}>Colaborador</p>
                  </div>
                </div>
              </div>

              {/* Fechas de Contrato */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                    Inicio de Contrato
                  </label>
                  <input
                    type="date"
                    value={contractStart}
                    onChange={(e) => setContractStart(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#12151E',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      color: '#F7F8FA',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                    Vigencia de Contrato *
                  </label>
                  <input
                    type="date"
                    required
                    value={contractExpiry}
                    onChange={(e) => setContractExpiry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#12151E',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      color: '#F7F8FA',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Sitio Web Oficial */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                  Enlace Web o Red Social (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="https://marca.com o instagram.com/marca"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#12151E',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#F7F8FA',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Teléfono de Contacto / WhatsApp */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                  Teléfono de Contacto o WhatsApp (Opcional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Ej: +506 8888-0000 o 2222-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                      backgroundColor: '#12151E',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      color: '#F7F8FA',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                  <Phone size={14} color="#9FA6B8" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Notas / Descripción */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                  Notas del Convenio (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Aporte de hidratación en torneos, descuento para alumnos, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#12151E',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#F7F8FA',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Botones del Formulario */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#9FA6B8',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-martial-primary"
                  style={{ padding: '0.65rem 1.5rem', fontSize: '0.88rem' }}
                >
                  {submitting ? 'Guardando en BD...' : editingSponsor ? 'Actualizar Patrocinador' : 'Registrar Patrocinador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animación Spin */}
      <style jsx>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
