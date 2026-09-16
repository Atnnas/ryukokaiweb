'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { User, UserRole, UserStatus } from '@/types';
import {
  Users,
  UserPlus,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Award,
  Trash2,
  X,
  UserCheck,
  Edit2,
  Scale,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  calculateWKFCategories,
  calculateAge,
  KYU_RANKS,
  DAN_RANKS,
  deriveBeltFromKyuDan,
} from '@/lib/wkf-categories';

export default function AdminUsersPage() {
  const { user } = useAuth();

  // Estados de Usuarios
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  // Modal para agregar usuario
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newStatus, setNewStatus] = useState<UserStatus>('active');
  const [newRankType, setNewRankType] = useState<'kyu' | 'dan'>('kyu');
  const [newKyuDan, setNewKyuDan] = useState('9° Kyu');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newWeightUnit, setNewWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [newGender, setNewGender] = useState<'male' | 'female'>('male');

  // Modal para editar usuario
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('student');
  const [editStatus, setEditStatus] = useState<UserStatus>('active');
  const [editRankType, setEditRankType] = useState<'kyu' | 'dan'>('kyu');
  const [editKyuDan, setEditKyuDan] = useState('9° Kyu');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editWeightUnit, setEditWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [editGender, setEditGender] = useState<'male' | 'female'>('male');

  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const isSuperAdmin =
    user?.email?.toLowerCase().includes('david.artavia.rodriguez@gmail.com') ||
    user?.email?.toLowerCase().includes('davidartaviarodriguez@gmail.com');

  // Cargar usuarios desde MongoDB
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        console.error('Error al obtener usuarios:', await res.text());
      }
    } catch (err) {
      console.error('Error de red al cargar usuarios:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (user && ((user.role === 'administrator' && user.status === 'active') || isSuperAdmin)) {
      fetchUsers();
    }
  }, [user, fetchUsers, isSuperAdmin]);

  // Actualizar rol o estado rápido de un usuario
  const handleUpdateUser = async (
    id: string,
    email: string,
    updates: Partial<User>
  ) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, email, ...updates }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          type: 'success',
          text: data.message || 'Usuario actualizado correctamente',
        });
        fetchUsers();
      } else {
        setActionMessage({
          type: 'error',
          text: data.error || 'No se pudo actualizar el usuario',
        });
      }
    } catch (err) {
      console.error('Error al actualizar:', err);
      setActionMessage({ type: 'error', text: 'Error de conexión' });
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Eliminar usuario permanentemente
  const handleDeleteUser = async (id: string, email: string, name: string) => {
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar permanentemente a ${name} (${email})?`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(
        `/api/admin/users?id=${encodeURIComponent(id)}&email=${encodeURIComponent(
          email
        )}`,
        {
          method: 'DELETE',
        }
      );
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          type: 'success',
          text: 'Usuario eliminado de la base de datos',
        });
        fetchUsers();
      } else {
        setActionMessage({
          type: 'error',
          text: data.error || 'No se pudo eliminar el usuario',
        });
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Crear usuario manualmente con Kyu / Dan y datos WKF
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setActionMessage({ type: 'error', text: 'Por favor ingresa un correo electrónico' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim(),
          name: newName.trim() || 'Estudiante',
          role: newRole,
          status: newStatus,
          kyuDan: newKyuDan,
          birthDate: newBirthDate,
          weight: newWeight ? Number(newWeight) : null,
          weightUnit: newWeightUnit,
          gender: newGender,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          type: 'success',
          text: 'Estudiante registrado con categorías WKF calculadas',
        });
        setIsAddModalOpen(false);
        setNewEmail('');
        setNewName('');
        setNewBirthDate('');
        setNewWeight('');
        setNewWeightUnit('kg');
        setNewKyuDan('9° Kyu');
        setNewRankType('kyu');
        setNewGender('male');
        fetchUsers();
      } else {
        setActionMessage({
          type: 'error',
          text: data.error || 'Error al crear usuario',
        });
      }
    } catch (err) {
      console.error('Error al crear usuario:', err);
      setActionMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Abrir modal de edición
  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditName(u.name || '');
    setEditRole(u.role || 'student');
    setEditStatus(u.status || 'active');
    const isDan = u.kyuDan?.toLowerCase().includes('dan');
    setEditRankType(isDan ? 'dan' : 'kyu');
    setEditKyuDan(u.kyuDan || (isDan ? '1° Dan' : '9° Kyu'));
    setEditBirthDate(u.birthDate || '');
    const numWeight = u.weight !== undefined && u.weight !== null ? Number(u.weight) : null;
    setEditWeight(numWeight !== null ? String(numWeight) : '');
    // Si el valor guardado es mayor a 120, inferir que se ingresó en libras
    setEditWeightUnit(numWeight && numWeight > 120 ? 'lbs' : 'kg');
    setEditGender(u.gender || 'male');
    setIsEditModalOpen(true);
  };

  // Guardar edición de usuario
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id || editingUser._id,
          email: editingUser.email,
          name: editName.trim(),
          role: editRole,
          status: editStatus,
          kyuDan: editKyuDan,
          birthDate: editBirthDate,
          weight: editWeight ? Number(editWeight) : null,
          weightUnit: editWeightUnit,
          gender: editGender,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          type: 'success',
          text: 'Ficha marcial y categorías WKF actualizadas correctamente',
        });
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        setActionMessage({
          type: 'error',
          text: data.error || 'Error al actualizar estudiante',
        });
      }
    } catch (err) {
      console.error('Error al actualizar estudiante:', err);
      setActionMessage({ type: 'error', text: 'Error de red' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Filtrado de usuarios
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalUsers = users.length;
  const pendingUsersCount = users.filter((u) => u.status === 'pending').length;
  const adminUsersCount = users.filter((u) => u.role === 'administrator').length;
  const activeStudentsCount = users.filter(
    (u) => u.status === 'active' && u.role !== 'administrator'
  ).length;

  // Cálculo en vivo para el modal de creación
  const addWkfPreview = calculateWKFCategories({
    birthDate: newBirthDate,
    weight: newWeight ? Number(newWeight) : undefined,
    weightUnit: newWeightUnit,
    gender: newGender,
    kyuDan: newKyuDan,
  });

  // Cálculo en vivo para el modal de edición
  const editWkfPreview = calculateWKFCategories({
    birthDate: editBirthDate,
    weight: editWeight ? Number(editWeight) : undefined,
    weightUnit: editWeightUnit,
    gender: editGender,
    kyuDan: editKyuDan,
  });

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
            backgroundColor:
              actionMessage.type === 'success' ? '#143823' : '#3F1212',
            border: `1px solid ${
              actionMessage.type === 'success' ? '#22C55E' : '#EF4444'
            }`,
            color: '#F7F8FA',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.9rem',
          }}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle size={18} color="#22C55E" />
          ) : (
            <XCircle size={18} color="#EF4444" />
          )}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '0.4rem',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                color: '#F5D77F',
              }}
            >
              <Shield size={12} /> Gestión del Dojo & WKF
            </span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#F7F8FA',
              margin: 0,
            }}
          >
            Registro de Estudiantes & Categorías WKF
          </h1>
          <p
            style={{
              color: '#9FA6B8',
              fontSize: '0.95rem',
              marginTop: '0.4rem',
              marginBottom: 0,
            }}
          >
            Administra grados Kyu (10 a 1) y Dan (1 a 10). Las categorías oficiales de Kata y divisiones de peso de Kumite WKF se calculan automáticamente según fecha de nacimiento y peso.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchUsers}
            disabled={loadingUsers}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#161922',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: '#F7F8FA',
              cursor: loadingUsers ? 'not-allowed' : 'pointer',
              fontSize: '0.88rem',
              fontWeight: 600,
              transition: 'background-color 0.2s ease',
            }}
          >
            <RefreshCw
              size={15}
              className={loadingUsers ? 'spin-animation' : ''}
            />
            <span>Refrescar</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-martial-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              fontSize: '0.88rem',
            }}
          >
            <UserPlus size={16} />
            <span>Registrar Estudiante</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div
          className="card-sumi"
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={22} color="#F5D77F" />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#9FA6B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Total Usuarios
            </span>
            <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#F7F8FA', margin: '0.2rem 0 0' }}>
              {totalUsers}
            </p>
          </div>
        </div>

        <div
          className="card-sumi"
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserCheck size={22} color="#4ADE80" />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#9FA6B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Estudiantes Activos
            </span>
            <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#4ADE80', margin: '0.2rem 0 0' }}>
              {activeStudentsCount}
            </p>
          </div>
        </div>

        <div
          className="card-sumi"
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={22} color="#FACC15" />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#9FA6B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              En Espera de Aprobación
            </span>
            <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FACC15', margin: '0.2rem 0 0' }}>
              {pendingUsersCount}
            </p>
          </div>
        </div>

        <div
          className="card-sumi"
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: 'rgba(147, 51, 234, 0.15)',
              border: '1px solid rgba(192, 132, 252, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={22} color="#C084FC" />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#9FA6B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Administradores
            </span>
            <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#C084FC', margin: '0.2rem 0 0' }}>
              {adminUsersCount}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div
        className="card-sumi"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div
          style={{
            position: 'relative',
            flex: '1',
            minWidth: '240px',
            maxWidth: '420px',
          }}
        >
          <Search
            size={16}
            color="#9FA6B8"
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem 0.65rem 2.4rem',
              backgroundColor: '#12151E',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#F7F8FA',
              fontSize: '0.88rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | UserStatus)}
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: '#12151E',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#F7F8FA',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Solo Activos</option>
            <option value="pending">Solo Pendientes</option>
            <option value="blocked">Solo Bloqueados</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: '#12151E',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#F7F8FA',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          >
            <option value="all">Todos los Roles</option>
            <option value="student">Estudiantes</option>
            <option value="administrator">Administradores</option>
            <option value="editor">Editores</option>
            <option value="viewer">Invitados / Viewers</option>
          </select>
        </div>
      </div>

      {/* Tabla de Usuarios y Estudiantes WKF */}
      <div className="card-sumi" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.88rem',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <th style={{ padding: '0.9rem 1.25rem', color: '#9FA6B8', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Estudiante / Usuario
                </th>
                <th style={{ padding: '0.9rem 1rem', color: '#9FA6B8', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Rol
                </th>
                <th style={{ padding: '0.9rem 1rem', color: '#9FA6B8', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Estado
                </th>
                <th style={{ padding: '0.9rem 1rem', color: '#9FA6B8', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Grado (Kyu / Dan)
                </th>
                <th style={{ padding: '0.9rem 1rem', color: '#9FA6B8', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Físico (Edad & Peso)
                </th>
                <th style={{ padding: '0.9rem 1rem', color: '#9FA6B8', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Categorías WKF Oficiales
                </th>
                <th style={{ padding: '0.9rem 1.25rem', color: '#9FA6B8', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: '3rem 1rem',
                      textAlign: 'center',
                      color: '#9FA6B8',
                    }}
                  >
                    {loadingUsers
                      ? 'Cargando usuarios desde MongoDB Atlas...'
                      : 'No se encontraron usuarios con los filtros aplicados.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.email.toLowerCase() === user?.email?.toLowerCase();
                  const isMainAdmin =
                    u.email.toLowerCase().includes('david.artavia.rodriguez@gmail.com') ||
                    u.email.toLowerCase().includes('davidartaviarodriguez@gmail.com');

                  const calculatedAge = u.birthDate ? calculateAge(u.birthDate) : (u.age || null);
                  const isDan = u.kyuDan?.toLowerCase().includes('dan');

                  return (
                    <tr
                      key={u.id || u.email}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        backgroundColor:
                          u.status === 'pending'
                            ? 'rgba(234, 179, 8, 0.03)'
                            : 'transparent',
                      }}
                    >
                      {/* Usuario */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              backgroundColor: isMainAdmin ? '#8E2323' : '#23346B',
                              color: '#FFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            {u.avatar ? (
                              <Image
                                src={u.avatar}
                                alt={u.name}
                                width={38}
                                height={38}
                                unoptimized
                                referrerPolicy="no-referrer"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              u.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span style={{ fontWeight: 700, color: '#F7F8FA' }}>
                                {u.name}
                              </span>
                              {isMainAdmin && (
                                <span
                                  style={{
                                    fontSize: '0.62rem',
                                    padding: '0.1rem 0.4rem',
                                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                                    border: '1px solid rgba(212, 175, 55, 0.5)',
                                    color: '#F5D77F',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                  }}
                                >
                                  SUPER ADMIN
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#9FA6B8' }}>
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rol */}
                      <td style={{ padding: '1rem' }}>
                        <select
                          disabled={isMainAdmin}
                          value={u.role}
                          onChange={(e) =>
                            handleUpdateUser(u.id, u.email, {
                              role: e.target.value as UserRole,
                            })
                          }
                          style={{
                            padding: '0.35rem 0.6rem',
                            backgroundColor: '#12151E',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '4px',
                            color:
                              u.role === 'administrator'
                                ? '#C084FC'
                                : u.role === 'editor'
                                ? '#60A5FA'
                                : u.role === 'student'
                                ? '#F87171'
                                : '#9FA6B8',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: isMainAdmin ? 'not-allowed' : 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="administrator">administrator</option>
                          <option value="editor">editor</option>
                          <option value="viewer">viewer</option>
                          <option value="student">student</option>
                        </select>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor:
                              u.status === 'active'
                                ? 'rgba(34, 197, 94, 0.15)'
                                : u.status === 'pending'
                                ? 'rgba(234, 179, 8, 0.18)'
                                : 'rgba(239, 68, 68, 0.15)',
                            color:
                              u.status === 'active'
                                ? '#4ADE80'
                                : u.status === 'pending'
                                ? '#FACC15'
                                : '#F87171',
                            border: `1px solid ${
                              u.status === 'active'
                                ? 'rgba(34, 197, 94, 0.3)'
                                : u.status === 'pending'
                                ? 'rgba(234, 179, 8, 0.4)'
                                : 'rgba(239, 68, 68, 0.3)'
                            }`,
                          }}
                        >
                          {u.status === 'active' && <CheckCircle size={12} />}
                          {u.status === 'pending' && <Clock size={12} />}
                          {u.status === 'blocked' && <XCircle size={12} />}
                          {u.status}
                        </span>
                      </td>

                      {/* Grado Marcial (Kyu / Dan) */}
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '4px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            backgroundColor: isDan ? 'rgba(0, 0, 0, 0.6)' : 'rgba(212, 175, 55, 0.15)',
                            border: `1px solid ${isDan ? '#D4AF37' : 'rgba(212, 175, 55, 0.35)'}`,
                            color: isDan ? '#F5D77F' : '#FFFFFF',
                          }}
                        >
                          <Award size={13} color={isDan ? '#F5D77F' : '#D4AF37'} />
                          {u.kyuDan || '9° Kyu'}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#9FA6B8', marginTop: '0.2rem' }}>
                          {u.belt || deriveBeltFromKyuDan(u.kyuDan).beltName}
                        </span>
                      </td>

                      {/* Físico (Edad & Peso) */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#F7F8FA', fontWeight: 600 }}>
                            {calculatedAge ? `${calculatedAge} años` : 'Sin fecha'}
                            {u.birthDate ? ` (${u.birthDate})` : ''}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#9FA6B8' }}>
                            {u.weight ? `${u.weight} kg` : 'Sin peso'} • {u.gender === 'female' ? 'Rama Fem.' : 'Rama Masc.'}
                          </span>
                        </div>
                      </td>

                      {/* Categorías WKF Oficiales */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {/* Kata WKF */}
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(59, 130, 246, 0.15)',
                              border: '1px solid rgba(59, 130, 246, 0.35)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#93C5FD',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span>🥋</span>
                            <span>{u.kataCategory || 'Kata WKF pendiente'}</span>
                          </div>

                          {/* Kumite WKF */}
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.35)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#FCA5A5',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span>🥊</span>
                            <span>{u.kumiteCategory || 'Kumite WKF pendiente'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '0.5rem',
                          }}
                        >
                          {/* Botón Editar Ficha Marcial / WKF */}
                          <button
                            onClick={() => openEditModal(u)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.35rem 0.65rem',
                              backgroundColor: 'rgba(212, 175, 55, 0.15)',
                              border: '1px solid rgba(212, 175, 55, 0.35)',
                              borderRadius: '4px',
                              color: '#F5D77F',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                            title="Editar Datos de Competencia WKF"
                          >
                            <Edit2 size={13} />
                            <span>Editar</span>
                          </button>

                          {u.status === 'pending' && (
                            <button
                              onClick={() =>
                                handleUpdateUser(u.id, u.email, {
                                  status: 'active',
                                })
                              }
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.35rem 0.75rem',
                                backgroundColor: '#15803D',
                                border: '1px solid #22C55E',
                                borderRadius: '4px',
                                color: '#FFF',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              <CheckCircle size={13} /> Aprobar
                            </button>
                          )}

                          {u.status === 'active' && !isMainAdmin && (
                            <button
                              onClick={() =>
                                handleUpdateUser(u.id, u.email, {
                                  status: 'blocked',
                                })
                              }
                              style={{
                                padding: '0.35rem 0.6rem',
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '4px',
                                color: '#F87171',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                              }}
                            >
                              Suspender
                            </button>
                          )}

                          {u.status === 'blocked' && !isMainAdmin && (
                            <button
                              onClick={() =>
                                handleUpdateUser(u.id, u.email, {
                                  status: 'active',
                                })
                              }
                              style={{
                                padding: '0.35rem 0.6rem',
                                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                borderRadius: '4px',
                                color: '#4ADE80',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                              }}
                            >
                              Reactivar
                            </button>
                          )}

                          {!isMainAdmin && !isSelf && (
                            <button
                              onClick={() =>
                                handleDeleteUser(u.id, u.email, u.name)
                              }
                              style={{
                                padding: '0.4rem',
                                background: 'transparent',
                                border: 'none',
                                color: '#9FA6B8',
                                cursor: 'pointer',
                                borderRadius: '4px',
                              }}
                              title="Eliminar usuario"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: REGISTRAR NUEVO ESTUDIANTE / USUARIO            */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
        >
          <div
            className="card-sumi"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '1.75rem 2rem',
              position: 'relative',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserPlus size={16} color="#F5D77F" />
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F7F8FA', margin: 0 }}>
                  Registrar Nuevo Estudiante
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9FA6B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Correo y Nombre */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alumno@ejemplo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
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
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Daniel LaRusso"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
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
              </div>

              {/* Rol y Estado */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                    Rol del Sistema
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
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
                  >
                    <option value="student">student (Estudiante del Dojo)</option>
                    <option value="viewer">viewer (Invitado)</option>
                    <option value="editor">editor (Gestor de Contenido)</option>
                    <option value="administrator">administrator (Admin)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                    Estado Inicial
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as UserStatus)}
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
                  >
                    <option value="active">active (Habilitado)</option>
                    <option value="pending">pending (Pendiente)</option>
                  </select>
                </div>
              </div>

              {/* SELECCIÓN DE GRADO: KYU (10 a 1) o DAN (1 a 10) - SIN CINTURÓN MANUAL */}
              <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#F5D77F', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Grado Marcial Oficial (Kyu o Dan)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setNewRankType('kyu');
                      setNewKyuDan('9° Kyu');
                    }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: newRankType === 'kyu' ? 'rgba(212, 175, 55, 0.25)' : '#0E0F14',
                      border: `1.5px solid ${newRankType === 'kyu' ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.12)'}`,
                      borderRadius: '6px',
                      color: newRankType === 'kyu' ? '#FFF' : '#9FA6B8',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    Kyu (10° al 1°)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewRankType('dan');
                      setNewKyuDan('1° Dan');
                    }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: newRankType === 'dan' ? 'rgba(234, 179, 8, 0.2)' : '#12151E',
                      border: `1.5px solid ${newRankType === 'dan' ? '#FACC15' : 'rgba(255, 255, 255, 0.12)'}`,
                      borderRadius: '6px',
                      color: newRankType === 'dan' ? '#FACC15' : '#9FA6B8',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    Dan (1° al 10° Dan)
                  </button>
                </div>

                <select
                  value={newKyuDan}
                  onChange={(e) => setNewKyuDan(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#12151E',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#F7F8FA',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                >
                  {newRankType === 'kyu'
                    ? KYU_RANKS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))
                    : DAN_RANKS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                </select>
              </div>

              {/* DATOS FÍSICOS WKF: FECHA DE NACIMIENTO, PESO Y GÉNERO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                    <Calendar size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.65rem',
                      backgroundColor: '#12151E',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      color: '#F7F8FA',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  {newBirthDate && (
                    <div style={{ marginTop: '0.35rem', fontSize: '0.72rem' }}>
                      {addWkfPreview.age > 0 ? (
                        <span style={{ color: '#86EFAC', fontWeight: 700 }}>
                          ✓ Edad: {addWkfPreview.age} años
                        </span>
                      ) : (
                        <span style={{ color: '#FCA5A5', fontWeight: 700 }}>
                          ⚠️ Año {newBirthDate.split('-')[0]} (Edad: 0). Revisa el año.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA' }}>
                      <Scale size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      Peso ({newWeightUnit})
                    </label>
                    <div style={{ display: 'flex', gap: '2px', backgroundColor: '#0B0D14', padding: '2px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <button
                        type="button"
                        onClick={() => setNewWeightUnit('kg')}
                        style={{
                          padding: '0.1rem 0.35rem',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          backgroundColor: newWeightUnit === 'kg' ? 'var(--color-gold)' : 'transparent',
                          color: newWeightUnit === 'kg' ? '#000' : '#9FA6B8',
                        }}
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewWeightUnit('lbs')}
                        style={{
                          padding: '0.1rem 0.35rem',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          backgroundColor: newWeightUnit === 'lbs' ? 'var(--color-gold)' : 'transparent',
                          color: newWeightUnit === 'lbs' ? '#000' : '#9FA6B8',
                        }}
                      >
                        lbs
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={newWeightUnit === 'lbs' ? 'Ej: 182' : 'Ej: 64.5'}
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.65rem',
                      backgroundColor: '#12151E',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      color: '#F7F8FA',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  {newWeight && newWeightUnit === 'lbs' && (
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
                      ≈ {(Number(newWeight) * 0.453592).toFixed(1)} kg para WKF
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                    Rama WKF
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'male' | 'female')}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.65rem',
                      backgroundColor: '#12151E',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      color: '#F7F8FA',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                  </select>
                </div>
              </div>

              {/* VISTA PREVIA DEL CÁLCULO WKF EN TIEMPO REAL */}
              <div
                style={{
                  padding: '0.9rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(14, 15, 20, 0.9) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem' }}>
                  <Sparkles size={14} color="#F5D77F" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F5D77F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Cálculo Automático WKF (World Karate Federation)
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem' }}>
                  <div>
                    <strong style={{ color: '#93C5FD' }}>🥋 Kata WKF:</strong>{' '}
                    <span style={{ color: '#F7F8FA' }}>{addWkfPreview.kataCategory}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#FCA5A5' }}>🥊 Kumite WKF:</strong>{' '}
                    <span style={{ color: '#F7F8FA' }}>{addWkfPreview.kumiteCategory}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#9FA6B8', marginTop: '0.2rem' }}>
                    Edad calculada: <strong>{addWkfPreview.age > 0 ? `${addWkfPreview.age} años` : 'Requiere fecha'}</strong> • Cinturón sugerido: <strong>{addWkfPreview.beltName}</strong>
                  </div>
                </div>
              </div>

              {/* Botones del Formulario */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  {submitting ? 'Guardando...' : 'Guardar Estudiante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EDITAR ESTUDIANTE Y FICHA MARCIAL WKF            */}
      {/* ========================================================= */}
      {isEditModalOpen && editingUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto',
          }}
        >
          <div
            className="card-sumi"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '1.75rem 2rem',
              position: 'relative',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Edit2 size={16} color="#F5D77F" />
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F7F8FA', margin: 0 }}>
                  Editar Ficha Marcial & WKF
                </h2>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9FA6B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                    Correo Electrónico (No editable)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={editingUser.email}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#0D0F15',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      color: '#9FA6B8',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                    Nombre del Estudiante
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                    Rol del Sistema
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
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
                  >
                    <option value="student">student (Estudiante del Dojo)</option>
                    <option value="viewer">viewer (Invitado)</option>
                    <option value="editor">editor (Gestor)</option>
                    <option value="administrator">administrator (Admin)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                    Estado de la Cuenta
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as UserStatus)}
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
                  >
                    <option value="active">active (Habilitado)</option>
                    <option value="pending">pending (Pendiente)</option>
                    <option value="blocked">blocked (Suspendido)</option>
                  </select>
                </div>
              </div>

              {/* SELECCIÓN DE GRADO: KYU O DAN */}
              <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#F5D77F', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Grado Marcial Oficial (Kyu o Dan)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditRankType('kyu');
                      setEditKyuDan('9° Kyu');
                    }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: editRankType === 'kyu' ? 'rgba(212, 175, 55, 0.25)' : '#0E0F14',
                      border: `1.5px solid ${editRankType === 'kyu' ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.12)'}`,
                      borderRadius: '6px',
                      color: editRankType === 'kyu' ? '#FFF' : '#9FA6B8',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    Kyu (10° al 1°)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditRankType('dan');
                      setEditKyuDan('1° Dan');
                    }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: editRankType === 'dan' ? 'rgba(234, 179, 8, 0.2)' : '#12151E',
                      border: `1.5px solid ${editRankType === 'dan' ? '#FACC15' : 'rgba(255, 255, 255, 0.12)'}`,
                      borderRadius: '6px',
                      color: editRankType === 'dan' ? '#FACC15' : '#9FA6B8',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    Dan (1° al 10° Dan)
                  </button>
                </div>

                <select
                  value={editKyuDan}
                  onChange={(e) => setEditKyuDan(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#12151E',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#F7F8FA',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                >
                  {editRankType === 'kyu'
                    ? KYU_RANKS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))
                    : DAN_RANKS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                </select>
              </div>

              {/* DATOS FÍSICOS WKF: FECHA DE NACIMIENTO, PESO Y GÉNERO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                    <Calendar size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.65rem',
                      backgroundColor: '#12151E',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      color: '#F7F8FA',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  {editBirthDate && (
                    <div style={{ marginTop: '0.35rem', fontSize: '0.72rem' }}>
                      {editWkfPreview.age > 0 ? (
                        <span style={{ color: '#86EFAC', fontWeight: 700 }}>
                          ✓ Edad: {editWkfPreview.age} años
                        </span>
                      ) : (
                        <span style={{ color: '#FCA5A5', fontWeight: 700 }}>
                          ⚠️ Año {editBirthDate.split('-')[0]} (Edad: 0). Revisa el año.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA' }}>
                      <Scale size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      Peso ({editWeightUnit})
                    </label>
                    <div style={{ display: 'flex', gap: '2px', backgroundColor: '#0B0D14', padding: '2px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <button
                        type="button"
                        onClick={() => setEditWeightUnit('kg')}
                        style={{
                          padding: '0.1rem 0.35rem',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          backgroundColor: editWeightUnit === 'kg' ? 'var(--color-gold)' : 'transparent',
                          color: editWeightUnit === 'kg' ? '#000' : '#9FA6B8',
                        }}
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditWeightUnit('lbs')}
                        style={{
                          padding: '0.1rem 0.35rem',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          backgroundColor: editWeightUnit === 'lbs' ? 'var(--color-gold)' : 'transparent',
                          color: editWeightUnit === 'lbs' ? '#000' : '#9FA6B8',
                        }}
                      >
                        lbs
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={editWeightUnit === 'lbs' ? 'Ej: 182' : 'Ej: 64.5'}
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.65rem',
                      backgroundColor: '#12151E',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      color: '#F7F8FA',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  {editWeight && editWeightUnit === 'lbs' && (
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
                      ≈ {(Number(editWeight) * 0.453592).toFixed(1)} kg para WKF
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#F7F8FA', marginBottom: '0.35rem' }}>
                    Rama WKF
                  </label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as 'male' | 'female')}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.65rem',
                      backgroundColor: '#12151E',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      color: '#F7F8FA',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                  </select>
                </div>
              </div>

              {/* VISTA PREVIA WKF */}
              <div
                style={{
                  padding: '0.9rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(14, 15, 20, 0.9) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem' }}>
                  <Sparkles size={14} color="#F5D77F" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F5D77F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Categorías WKF Actualizadas
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem' }}>
                  <div>
                    <strong style={{ color: '#93C5FD' }}>🥋 Kata WKF:</strong>{' '}
                    <span style={{ color: '#F7F8FA' }}>{editWkfPreview.kataCategory}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#FCA5A5' }}>🥊 Kumite WKF:</strong>{' '}
                    <span style={{ color: '#F7F8FA' }}>{editWkfPreview.kumiteCategory}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#9FA6B8', marginTop: '0.2rem' }}>
                    Edad: <strong>{editWkfPreview.age > 0 ? `${editWkfPreview.age} años` : 'Requiere fecha'}</strong> • Cinturón: <strong>{editWkfPreview.beltName}</strong>
                  </div>
                </div>
              </div>

              {/* Botones del Formulario */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
                  {submitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Estilos para animación de carga */}
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
