'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Routine, ExerciseItem } from '@/types';
import {
  Dumbbell,
  Plus,
  Search,
  RefreshCw,
  Clock,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  FileText,
} from 'lucide-react';

export default function AdminRoutinesPage() {
  const { user } = useAuth();

  // Estados de lista y búsqueda
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para expandir ejercicios en las tarjetas
  const [expandedRoutineIds, setExpandedRoutineIds] = useState<Record<string, boolean>>({});

  // Estados de modal (Crear / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  // Campos del formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [exercises, setExercises] = useState<ExerciseItem[]>([
    { id: '1', name: '', sets: 3, reps: '12 reps', restSeconds: 45, notes: '' },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Cargar rutinas desde la base de datos
  const fetchRoutines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/routines');
      if (res.ok) {
        const data = await res.json();
        setRoutines(data.routines || []);
      } else {
        console.error('Error al obtener rutinas:', await res.text());
      }
    } catch (err) {
      console.error('Error de red al cargar rutinas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'administrator') {
      fetchRoutines();
    }
  }, [user, fetchRoutines]);

  // Alternar vista expandida de ejercicios
  const toggleExpanded = (id: string) => {
    setExpandedRoutineIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Abrir modal en modo creación
  const openCreateModal = () => {
    setEditingRoutine(null);
    setTitle('');
    setDescription('');
    setDurationMinutes(45);
    setExercises([
      { id: `ex-${Date.now()}-1`, name: '', sets: 4, reps: '15 repeticiones', restSeconds: 45, notes: '' },
    ]);
    setIsModalOpen(true);
  };

  // Abrir modal en modo edición
  const openEditModal = (routine: Routine) => {
    setEditingRoutine(routine);
    setTitle(routine.title || '');
    setDescription(routine.description || '');
    setDurationMinutes(routine.durationMinutes || 45);
    setExercises(
      routine.exercises && routine.exercises.length > 0
        ? routine.exercises.map((ex) => ({ ...ex }))
        : [{ id: `ex-${Date.now()}-1`, name: '', sets: 3, reps: '12 reps', restSeconds: 45, notes: '' }]
    );
    setIsModalOpen(true);
  };

  // Agregar fila de ejercicio
  const addExerciseRow = () => {
    setExercises((prev) => [
      ...prev,
      {
        id: `ex-${Date.now()}-${prev.length + 1}`,
        name: '',
        sets: 3,
        reps: '12 reps',
        restSeconds: 45,
        notes: '',
      },
    ]);
  };

  // Actualizar campo de un ejercicio
  const updateExerciseField = (index: number, field: keyof ExerciseItem, value: unknown) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Eliminar un ejercicio
  const removeExerciseRow = (index: number) => {
    if (exercises.length <= 1) {
      setActionMessage({ type: 'error', text: 'La rutina debe contener al menos un ejercicio.' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }
    setExercises((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Guardar rutina en Base de Datos (Crear o Actualizar)
  const handleSubmitRoutine = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setActionMessage({ type: 'error', text: 'Por favor ingresa un nombre para la rutina.' });
      setTimeout(() => setActionMessage(null), 3500);
      return;
    }

    const validExercises = exercises.filter((ex) => ex.name.trim().length > 0);
    if (validExercises.length === 0) {
      setActionMessage({ type: 'error', text: 'Debes añadir al menos un ejercicio con nombre válido.' });
      setTimeout(() => setActionMessage(null), 3500);
      return;
    }

    setSubmitting(true);
    setActionMessage(null);

    try {
      const method = editingRoutine ? 'PATCH' : 'POST';
      const bodyPayload = {
        ...(editingRoutine ? { id: editingRoutine.id || editingRoutine._id } : {}),
        title: title.trim(),
        description: description.trim(),
        durationMinutes: Number(durationMinutes) || 45,
        exercises: validExercises,
      };

      const res = await fetch('/api/admin/routines', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setActionMessage({
          type: 'success',
          text: editingRoutine ? 'Rutina actualizada en la base de datos' : 'Rutina guardada en la base de datos',
        });
        setIsModalOpen(false);
        await fetchRoutines();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Ocurrió un error al procesar la rutina' });
      }
    } catch (err) {
      console.error('Error al guardar rutina:', err);
      setActionMessage({ type: 'error', text: 'Error de conexión con el servidor' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Eliminar rutina de la base de datos
  const handleDeleteRoutine = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/routines?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: 'success', text: 'Rutina eliminada de la base de datos' });
        setDeleteConfirmId(null);
        await fetchRoutines();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'No se pudo eliminar la rutina' });
      }
    } catch (err) {
      console.error('Error de red al eliminar rutina:', err);
      setActionMessage({ type: 'error', text: 'Error al conectar con el servidor' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Filtrar rutinas por término de búsqueda
  const filteredRoutines = routines.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.exercises?.some((e) => e.name.toLowerCase().includes(term))
    );
  });

  // Estadísticas generales
  const totalRoutines = routines.length;
  const totalExercises = routines.reduce((acc, r) => acc + (r.exercises?.length || 0), 0);
  const avgDuration =
    totalRoutines > 0
      ? Math.round(routines.reduce((acc, r) => acc + (r.durationMinutes || 0), 0) / totalRoutines)
      : 0;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Notificación flotante de estado */}
      {actionMessage && (
        <div
          style={{
            position: 'fixed',
            top: '90px',
            right: '24px',
            zIndex: 100,
            padding: '1rem 1.4rem',
            borderRadius: '10px',
            backgroundColor: actionMessage.type === 'success' ? '#0E2918' : '#2C0E11',
            border: `1px solid ${actionMessage.type === 'success' ? '#22C55E' : '#EF4444'}`,
            color: '#FFFFFF',
            boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle size={20} color="#4ADE80" />
          ) : (
            <AlertTriangle size={20} color="#F87171" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Encabezado principal */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.75rem',
              backgroundColor: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '20px',
              marginBottom: '0.6rem',
            }}
          >
            <Sparkles size={14} color="#F5D77F" />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#F5D77F',
              }}
            >
              Base de Datos Ryoku Kai
            </span>
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              margin: '0 0 0.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Dumbbell size={32} color="#D4AF37" />
            Rutinas de Ejercicio
          </h1>
          <p style={{ color: '#9FA6B8', fontSize: '0.95rem', margin: 0 }}>
            Crea, almacena y administra sesiones de entrenamiento físico y técnico para el dojo.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={fetchRoutines}
            disabled={loading}
            className="btn-martial-ghost"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              fontSize: '0.88rem',
              borderRadius: '8px',
            }}
            title="Refrescar listado"
          >
            <RefreshCw size={16} className={loading ? 'spin-animation' : ''} />
            <span className="hide-mobile">Actualizar</span>
          </button>

          <button
            onClick={openCreateModal}
            className="btn-martial-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.4rem',
              fontSize: '0.92rem',
              fontWeight: 700,
              borderRadius: '8px',
            }}
          >
            <Plus size={18} />
            <span>Nueva Rutina</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          className="card-sumi"
          style={{
            padding: '1.25rem',
            backgroundColor: '#0E0F14',
            border: '1px solid rgba(212, 175, 55, 0.15)',
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
              backgroundColor: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F5D77F',
            }}
          >
            <Layers size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9FA6B8', fontWeight: 600 }}>Total Rutinas</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>{totalRoutines}</div>
          </div>
        </div>

        <div
          className="card-sumi"
          style={{
            padding: '1.25rem',
            backgroundColor: '#0E0F14',
            border: '1px solid rgba(212, 175, 55, 0.15)',
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
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7BE1FF',
            }}
          >
            <Target size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9FA6B8', fontWeight: 600 }}>Ejercicios Totales</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>{totalExercises}</div>
          </div>
        </div>

        <div
          className="card-sumi"
          style={{
            padding: '1.25rem',
            backgroundColor: '#0E0F14',
            border: '1px solid rgba(212, 175, 55, 0.15)',
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
              backgroundColor: 'rgba(250, 204, 21, 0.12)',
              border: '1px solid rgba(250, 204, 21, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FDE047',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9FA6B8', fontWeight: 600 }}>Duración Promedio</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>{avgDuration} min</div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div
        className="card-sumi"
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#0E0F14',
          border: '1px solid rgba(212, 175, 55, 0.18)',
          marginBottom: '2rem',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
          <Search
            size={18}
            color="#9FA6B8"
            style={{ position: 'absolute', left: '12px' }}
          />
          <input
            type="text"
            placeholder="Buscar rutina por nombre o ejercicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.4rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                color: '#9FA6B8',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Grid de Rutinas */}
      {loading && routines.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#9FA6B8' }}>
          <RefreshCw size={36} className="spin-animation" style={{ color: '#F5D77F', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>Cargando rutinas de ejercicio...</p>
        </div>
      ) : filteredRoutines.length === 0 ? (
        <div
          className="card-sumi"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: '#0E0F14',
            border: '1px dashed rgba(212, 175, 55, 0.3)',
          }}
        >
          <Dumbbell size={48} color="#9FA6B8" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No hay rutinas registradas en la base de datos
          </h3>
          <p style={{ color: '#9FA6B8', fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
            {searchTerm
              ? 'No se encontraron resultados para tu búsqueda.'
              : 'Comienza creando la primera rutina de entrenamiento para tus atletas.'}
          </p>
          <button onClick={openCreateModal} className="btn-martial-primary">
            <Plus size={16} /> Crear Rutina Ahora
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredRoutines.map((routine) => {
            const routineId = routine.id || routine._id || '';
            const isExpanded = !!expandedRoutineIds[routineId];

            return (
              <div
                key={routineId}
                className="card-sumi"
                style={{
                  backgroundColor: '#0E0F14',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Acento superior en dorado marcial */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    backgroundColor: '#D4AF37',
                  }}
                />

                <div>
                  {/* Fila superior: Duración y conteo */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        color: '#F5D77F',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        fontWeight: 600,
                      }}
                    >
                      <Clock size={13} />
                      <span>{routine.durationMinutes} minutos</span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.74rem',
                        color: '#9FA6B8',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      {routine.exercises?.length || 0} ejercicios
                    </span>
                  </div>

                  {/* Título de la rutina */}
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      marginBottom: '0.6rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {routine.title}
                  </h3>

                  {/* Descripción */}
                  {routine.description && (
                    <p
                      style={{
                        color: '#9FA6B8',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                        marginBottom: '1.25rem',
                      }}
                    >
                      {routine.description}
                    </p>
                  )}

                  {/* Lista de Ejercicios */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.6rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#F5D77F',
                        }}
                      >
                        Secuencia de Ejercicios ({routine.exercises?.length || 0})
                      </span>

                      {routine.exercises && routine.exercises.length > 2 && (
                        <button
                          onClick={() => toggleExpanded(routineId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#9FA6B8',
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          {isExpanded ? (
                            <>
                              <span>Ver menos</span>
                              <ChevronUp size={14} />
                            </>
                          ) : (
                            <>
                              <span>Ver todos</span>
                              <ChevronDown size={14} />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(routine.exercises || [])
                        .slice(0, isExpanded ? undefined : 2)
                        .map((ex, idx) => (
                          <div
                            key={ex.id || idx}
                            style={{
                              padding: '0.65rem 0.75rem',
                              backgroundColor: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '6px',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.5rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(212, 175, 55, 0.18)',
                                    color: '#F5D77F',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  {idx + 1}
                                </span>
                                <span style={{ color: '#FFFFFF', fontSize: '0.86rem', fontWeight: 600 }}>
                                  {ex.name}
                                </span>
                              </div>

                              <span
                                style={{
                                  color: '#F5D77F',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  flexShrink: 0,
                                }}
                              >
                                {ex.sets ? `${ex.sets} x ` : ''}
                                {ex.reps || '1 serie'}
                              </span>
                            </div>

                            {(ex.notes || ex.restSeconds) && (
                              <div
                                style={{
                                  marginTop: '0.35rem',
                                  paddingLeft: '1.75rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.2rem',
                                }}
                              >
                                {ex.restSeconds && (
                                  <span style={{ fontSize: '0.72rem', color: '#9FA6B8' }}>
                                    ⏱ Descanso: {ex.restSeconds}s
                                  </span>
                                )}
                                {ex.notes && (
                                  <span style={{ fontSize: '0.74rem', color: '#A0AEC0', fontStyle: 'italic' }}>
                                    💡 {ex.notes}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                      {!isExpanded && routine.exercises && routine.exercises.length > 2 && (
                        <div
                          onClick={() => toggleExpanded(routineId)}
                          style={{
                            textAlign: 'center',
                            fontSize: '0.78rem',
                            color: '#F5D77F',
                            cursor: 'pointer',
                            padding: '0.35rem',
                            backgroundColor: 'rgba(212, 175, 55, 0.05)',
                            borderRadius: '4px',
                          }}
                        >
                          + {routine.exercises.length - 2} ejercicios más (clic para ver todos)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer de Tarjeta y Botones de Acción */}
                <div
                  style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    Por: {routine.createdBy || 'Sensei'}
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => openEditModal(routine)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(212, 175, 55, 0.12)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: '#F5D77F',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Editar</span>
                    </button>

                    {deleteConfirmId === routineId ? (
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button
                          onClick={() => handleDeleteRoutine(routineId)}
                          disabled={submitting}
                          style={{
                            padding: '0.45rem 0.6rem',
                            borderRadius: '6px',
                            backgroundColor: '#DC2626',
                            border: 'none',
                            color: '#FFFFFF',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          style={{
                            padding: '0.45rem 0.5rem',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            color: '#FFFFFF',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(routineId)}
                        style={{
                          padding: '0.45rem 0.65rem',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#F87171',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                        title="Eliminar rutina"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL CREAR / EDITAR RUTINA DE EJERCICIO                     */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
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
              backgroundColor: '#0E0F14',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.12)',
              borderRadius: '14px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Cabecera del modal */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F5D77F',
                  }}
                >
                  <Dumbbell size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    {editingRoutine ? 'Editar Rutina de Ejercicio' : 'Nueva Rutina de Ejercicio'}
                  </h2>
                  <span style={{ fontSize: '0.76rem', color: '#9FA6B8' }}>
                    Al guardar, la rutina se registrará de inmediato en la base de datos.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9FA6B8',
                  cursor: 'pointer',
                  padding: '0.4rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <form
              onSubmit={handleSubmitRoutine}
              style={{
                padding: '1.5rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {/* Nombre y Duración en 2 columnas */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#F5D77F', marginBottom: '0.4rem' }}>
                    Nombre de la Rutina *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Acondicionamiento Físico y Coordinación"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      color: '#FFFFFF',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#F5D77F', marginBottom: '0.4rem' }}>
                    Duración Estimada (Min)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      color: '#FFFFFF',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#F5D77F', marginBottom: '0.4rem' }}>
                  Descripción u Objetivo de la Sesión
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre el enfoque de la rutina..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Constructor de Ejercicios */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={18} color="#F5D77F" />
                    <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.92rem' }}>
                      Ejercicios de la Rutina ({exercises.length})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={addExerciseRow}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#F5D77F',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Plus size={14} />
                    <span>Añadir Ejercicio</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {exercises.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      style={{
                        padding: '0.9rem',
                        backgroundColor: '#070709',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.6rem',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F5D77F' }}>
                          Ejercicio #{idx + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeExerciseRow(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#F87171',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Quitar</span>
                        </button>
                      </div>

                      {/* Nombre del Ejercicio */}
                      <div style={{ marginBottom: '0.6rem' }}>
                        <input
                          type="text"
                          required
                          placeholder="Nombre del ejercicio (Ej: Saltos pliométricos, flexiones, etc.)"
                          value={ex.name}
                          onChange={(e) => updateExerciseField(idx, 'name', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.8rem',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#FFFFFF',
                            fontSize: '0.86rem',
                            outline: 'none',
                          }}
                        />
                      </div>

                      {/* Series, Repeticiones y Descanso */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                        <div>
                          <input
                            type="number"
                            min={1}
                            placeholder="Series"
                            value={ex.sets || ''}
                            onChange={(e) => updateExerciseField(idx, 'sets', Number(e.target.value))}
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.6rem',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: '#FFFFFF',
                              fontSize: '0.82rem',
                              outline: 'none',
                            }}
                            title="Número de series"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Reps/Tiempo (Ej: 15 reps, 45s)"
                            value={ex.reps || ''}
                            onChange={(e) => updateExerciseField(idx, 'reps', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.6rem',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: '#FFFFFF',
                              fontSize: '0.82rem',
                              outline: 'none',
                            }}
                          />
                        </div>

                        <div>
                          <input
                            type="number"
                            min={0}
                            placeholder="Descanso (seg)"
                            value={ex.restSeconds || ''}
                            onChange={(e) => updateExerciseField(idx, 'restSeconds', Number(e.target.value))}
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.6rem',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: '#FFFFFF',
                              fontSize: '0.82rem',
                              outline: 'none',
                            }}
                            title="Descanso en segundos"
                          />
                        </div>
                      </div>

                      {/* Notas técnicas */}
                      <div>
                        <input
                          type="text"
                          placeholder="Indicaciones o notas adicionales (opcional)"
                          value={ex.notes || ''}
                          onChange={(e) => updateExerciseField(idx, 'notes', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.6rem',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#CBD5E1',
                            fontSize: '0.8rem',
                            outline: 'none',
                            fontStyle: 'italic',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de acción del modal */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#9FA6B8',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-martial-primary"
                  style={{
                    padding: '0.75rem 1.6rem',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {submitting && <RefreshCw size={16} className="spin-animation" />}
                  <span>{editingRoutine ? 'Guardar Cambios' : 'Guardar en Base de Datos'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Estilos CSS scoped */}
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
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 640px) {
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
