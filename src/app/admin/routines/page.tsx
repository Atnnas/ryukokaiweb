'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Routine, ExerciseItem, ExerciseCatalogItem, ExerciseMeasureUnit } from '@/types';
import { calculateRoutineDuration } from '@/lib/routineUtils';
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
  Database,
  Check,
  Repeat,
  Zap,
  Unlink,
} from 'lucide-react';

export default function AdminRoutinesPage() {
  const { user } = useAuth();

  // Estados de rutinas y búsqueda
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Catálogo de ejercicios de la base de datos para predicción y combo
  const [catalogExercises, setCatalogExercises] = useState<ExerciseCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Control de dropdown predictivo por fila de ejercicio
  const [activeComboIndex, setActiveComboIndex] = useState<number | null>(null);
  const comboContainerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Estado para expandir ejercicios en las tarjetas
  const [expandedRoutineIds, setExpandedRoutineIds] = useState<Record<string, boolean>>({});

  // Estados de modal (Crear / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  // Campos del formulario de rutina
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [isAutoDuration, setIsAutoDuration] = useState(true);
  const [exercises, setExercises] = useState<ExerciseItem[]>([
    {
      id: '1',
      name: '',
      sets: 4,
      repsOrDurationValue: 15,
      repsOrDurationUnit: 'repeticiones',
      restSeconds: 45,
      notes: '',
    },
  ]);

  // Cálculo en tiempo real de la duración estimada a partir de los ejercicios
  const calculatedDuration = calculateRoutineDuration(exercises);

  useEffect(() => {
    if (isAutoDuration && exercises && exercises.length > 0) {
      const calc = calculateRoutineDuration(exercises);
      if (calc.totalMinutes > 0) {
        setDurationMinutes(calc.totalMinutes);
      }
    }
  }, [exercises, isAutoDuration]);

  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [savedExerciseIndices, setSavedExerciseIndices] = useState<Record<number, boolean>>({});

  // Cargar catálogo de ejercicios desde la base de datos
  const fetchCatalogExercises = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const res = await fetch('/api/admin/exercises');
      if (res.ok) {
        const data = await res.json();
        setCatalogExercises(data.exercises || []);
      }
    } catch (err) {
      console.error('Error al cargar catálogo de ejercicios:', err);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

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
      fetchCatalogExercises();
    }
  }, [user, fetchRoutines, fetchCatalogExercises]);

  // Cerrar combo si se hace clic afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeComboIndex !== null) {
        const container = comboContainerRefs.current[activeComboIndex];
        if (container && !container.contains(e.target as Node)) {
          setActiveComboIndex(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeComboIndex]);

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
    const defaultEx: ExerciseItem[] = [
      {
        id: `ex-${Date.now()}-1`,
        name: '',
        sets: 4,
        repsOrDurationValue: 15,
        repsOrDurationUnit: 'repeticiones',
        restSeconds: 45,
        notes: '',
      },
    ];
    const initialCalc = calculateRoutineDuration(defaultEx);
    setDurationMinutes(initialCalc.totalMinutes || 12);
    setIsAutoDuration(true);
    setExercises(defaultEx);
    setActiveComboIndex(null);
    setSavedExerciseIndices({});
    setIsModalOpen(true);
  };

  // Abrir modal en modo edición
  const openEditModal = (routine: Routine) => {
    setEditingRoutine(routine);
    setTitle(routine.title || '');
    setDescription(routine.description || '');
    const mappedExercises: ExerciseItem[] =
      routine.exercises && routine.exercises.length > 0
        ? routine.exercises.map((ex) => ({
            ...ex,
            repsOrDurationValue:
              ex.repsOrDurationValue !== undefined
                ? ex.repsOrDurationValue
                : ex.reps
                ? parseInt(ex.reps, 10) || 12
                : 12,
            repsOrDurationUnit:
              ex.repsOrDurationUnit ||
              (ex.reps?.toLowerCase().includes('seg') ? 'segundos' : 'repeticiones'),
          }))
        : [
            {
              id: `ex-${Date.now()}-1`,
              name: '',
              sets: 4,
              repsOrDurationValue: 15,
              repsOrDurationUnit: 'repeticiones',
              restSeconds: 45,
              notes: '',
            },
          ];

    const calc = calculateRoutineDuration(mappedExercises);
    if (routine.durationMinutes && routine.durationMinutes > 0) {
      setDurationMinutes(routine.durationMinutes);
      setIsAutoDuration(false);
    } else {
      setDurationMinutes(calc.totalMinutes > 0 ? calc.totalMinutes : 30);
      setIsAutoDuration(true);
    }
    setExercises(mappedExercises);
    setActiveComboIndex(null);
    setSavedExerciseIndices({});
    setIsModalOpen(true);
  };

  // Agregar fila de ejercicio individual
  const addExerciseRow = () => {
    setExercises((prev) => [
      ...prev,
      {
        id: `ex-${Date.now()}-${prev.length + 1}`,
        name: '',
        sets: 3,
        repsOrDurationValue: 12,
        repsOrDurationUnit: 'repeticiones',
        restSeconds: 45,
        notes: '',
      },
    ]);
  };

  // Agregar bloque nuevo de Súper Serie (Loop) con un par de ejercicios iniciales
  const addLoopBlock = () => {
    const newLoopId = `loop-${Date.now()}`;
    const existingLoopIds = new Set(exercises.map((e) => e.loopId).filter(Boolean));
    const loopName = `Súper Serie ${existingLoopIds.size + 1}`;

    setExercises((prev) => [
      ...prev,
      {
        id: `ex-${Date.now()}-1`,
        name: '',
        sets: 1,
        repsOrDurationValue: 12,
        repsOrDurationUnit: 'repeticiones',
        restSeconds: 15,
        notes: '',
        loopId: newLoopId,
        loopName,
        loopRounds: 4,
        loopRestBetweenRounds: 60,
      },
      {
        id: `ex-${Date.now()}-2`,
        name: '',
        sets: 1,
        repsOrDurationValue: 12,
        repsOrDurationUnit: 'repeticiones',
        restSeconds: 0,
        notes: '',
        loopId: newLoopId,
        loopName,
        loopRounds: 4,
        loopRestBetweenRounds: 60,
      },
    ]);
  };

  // Agregar otro ejercicio dentro de un loop existente
  const addExerciseToLoop = (targetLoopId: string) => {
    const template = exercises.find((e) => e.loopId === targetLoopId);
    const newEx: ExerciseItem = {
      id: `ex-${Date.now()}-${exercises.length + 1}`,
      name: '',
      sets: 1,
      repsOrDurationValue: 12,
      repsOrDurationUnit: 'repeticiones',
      restSeconds: 15,
      notes: '',
      loopId: targetLoopId,
      loopName: template?.loopName || 'Súper Serie',
      loopRounds: template?.loopRounds || 4,
      loopRestBetweenRounds: template?.loopRestBetweenRounds !== undefined ? template.loopRestBetweenRounds : 60,
    };

    setExercises((prev) => {
      const lastIdx = prev.map((e) => e.loopId).lastIndexOf(targetLoopId);
      if (lastIdx === -1) return [...prev, newEx];
      const next = [...prev];
      next.splice(lastIdx + 1, 0, newEx);
      return next;
    });
  };

  // Convertir un ejercicio existente en Súper Serie (si tiene un siguiente ejercicio individual, los agrupa juntos)
  const convertExerciseToLoop = (index: number) => {
    const newLoopId = `loop-${Date.now()}`;
    const existingLoopIds = new Set(exercises.map((e) => e.loopId).filter(Boolean));
    const loopName = `Súper Serie ${existingLoopIds.size + 1}`;

    setExercises((prev) => {
      const next = [...prev];
      const current = next[index];
      if (!current) return prev;

      const hasNextSingle = index + 1 < next.length && !next[index + 1].loopId;
      const initialRounds = current.sets && current.sets > 1 ? current.sets : 4;

      next[index] = {
        ...current,
        sets: 1,
        restSeconds: current.restSeconds !== undefined ? current.restSeconds : 15,
        loopId: newLoopId,
        loopName,
        loopRounds: initialRounds,
        loopRestBetweenRounds: 60,
      };

      if (hasNextSingle) {
        next[index + 1] = {
          ...next[index + 1],
          sets: 1,
          restSeconds: next[index + 1].restSeconds !== undefined ? next[index + 1].restSeconds : 0,
          loopId: newLoopId,
          loopName,
          loopRounds: initialRounds,
          loopRestBetweenRounds: 60,
        };
      } else {
        const companionEx: ExerciseItem = {
          id: `ex-${Date.now()}-companion`,
          name: '',
          sets: 1,
          repsOrDurationValue: 12,
          repsOrDurationUnit: 'repeticiones',
          restSeconds: 0,
          notes: '',
          loopId: newLoopId,
          loopName,
          loopRounds: initialRounds,
          loopRestBetweenRounds: 60,
        };
        next.splice(index + 1, 0, companionEx);
      }

      return next;
    });
  };

  // Desagrupar un loop completo y volver los ejercicios a individuales
  const ungroupLoop = (targetLoopId: string) => {
    setExercises((prev) =>
      prev.map((e) =>
        e.loopId === targetLoopId
          ? {
              ...e,
              loopId: undefined,
              loopName: undefined,
              loopRounds: undefined,
              loopRestBetweenRounds: undefined,
              sets: e.loopRounds || 3,
            }
          : e
      )
    );
  };

  // Actualizar metadatos de un loop (rondas, descanso fin de ronda, nombre) para todos sus miembros
  const updateLoopMeta = (
    targetLoopId: string,
    field: 'loopName' | 'loopRounds' | 'loopRestBetweenRounds',
    value: unknown
  ) => {
    setExercises((prev) =>
      prev.map((e) => (e.loopId === targetLoopId ? { ...e, [field]: value } : e))
    );
  };

  // Actualizar campo de un ejercicio
  const updateExerciseField = (index: number, field: keyof ExerciseItem, value: unknown) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Seleccionar ejercicio de la predicción o catálogo
  const handleSelectFromCatalog = (index: number, item: ExerciseCatalogItem) => {
    setExercises((prev) => {
      const next = [...prev];
      const current = next[index];
      const val = item.defaultRepsOrDurationValue || 12;
      const unit: ExerciseMeasureUnit = item.defaultRepsOrDurationUnit || 'repeticiones';

      next[index] = {
        ...current,
        name: item.name,
        sets: current.sets || item.defaultSets || 3,
        repsOrDurationValue: val,
        repsOrDurationUnit: unit,
        reps: `${val} ${unit}`,
        restSeconds: current.restSeconds !== undefined ? current.restSeconds : (item.defaultRestSeconds || 45),
        notes: current.notes || item.defaultNotes || '',
      };
      return next;
    });
    setActiveComboIndex(null);
  };

  // Guardar un ejercicio individual directamente en la base de datos
  const handleSaveExerciseDirectlyToDB = async (index: number) => {
    const ex = exercises[index];
    if (!ex || !ex.name.trim()) {
      setActionMessage({ type: 'error', text: 'Escribe el nombre del ejercicio antes de guardarlo en la base de datos.' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    try {
      const res = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ex.name.trim(),
          sets: ex.sets,
          repsOrDurationValue: ex.repsOrDurationValue,
          repsOrDurationUnit: ex.repsOrDurationUnit,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSavedExerciseIndices((prev) => ({ ...prev, [index]: true }));
        setActionMessage({
          type: 'success',
          text: `"${ex.name.trim()}" guardado directamente en la base de datos.`,
        });
        await fetchCatalogExercises();
        setTimeout(() => {
          setSavedExerciseIndices((prev) => ({ ...prev, [index]: false }));
        }, 3500);
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Error al guardar ejercicio' });
      }
    } catch (err) {
      console.error('Error al guardar ejercicio en DB:', err);
      setActionMessage({ type: 'error', text: 'Error de conexión con la base de datos' });
    } finally {
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  // Eliminar un ejercicio
  const removeExerciseRow = (index: number) => {
    if (exercises.length <= 1) {
      setActionMessage({ type: 'error', text: 'La rutina debe contener al menos un ejercicio.' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }
    setExercises((prev) => prev.filter((_, idx) => idx !== index));
    if (activeComboIndex === index) {
      setActiveComboIndex(null);
    }
  };

  // Guardar rutina completa en Base de Datos
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
      const calc = calculateRoutineDuration(validExercises);
      const userDurationNum = Number(durationMinutes);
      const finalDuration = userDurationNum > 0 ? userDurationNum : (calc.totalMinutes > 0 ? calc.totalMinutes : 30);

      const bodyPayload = {
        ...(editingRoutine ? { id: editingRoutine.id || editingRoutine._id } : {}),
        title: title.trim(),
        description: description.trim(),
        durationMinutes: finalDuration,
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
          text: editingRoutine
            ? 'Rutina y ejercicios actualizados en la base de datos'
            : 'Rutina y ejercicios guardados en la base de datos',
        });
        setIsModalOpen(false);
        await fetchRoutines();
        await fetchCatalogExercises();
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

  // Filtrar rutinas por búsqueda
  const filteredRoutines = routines.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.exercises?.some((e) => e.name.toLowerCase().includes(term))
    );
  });

  // Estadísticas
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
            Describe o selecciona ejercicios con combo numérico (repeticiones o segundos) y guarda directo en la base de datos.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => {
              fetchRoutines();
              fetchCatalogExercises();
            }}
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
            title="Refrescar datos"
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
              backgroundColor: 'rgba(74, 222, 128, 0.12)',
              border: '1px solid rgba(74, 222, 128, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#86EFAC',
            }}
          >
            <Database size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#9FA6B8', fontWeight: 600 }}>Catálogo de Ejercicios</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>{catalogExercises.length}</div>
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
              : 'Comienza creando la primera rutina de entrenamiento con el combo de ejercicios.'}
          </p>
          <button onClick={openCreateModal} className="btn-martial-primary">
            <Plus size={16} /> Crear Rutina Ahora
          </button>
        </div>
      ) : (
        <div className="card-sumi" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '12px' }}>
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
                    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                    backgroundColor: 'rgba(212, 175, 55, 0.04)',
                  }}
                >
                  <th style={{ padding: '1rem 1.25rem', color: '#F5D77F', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Rutina / Enfoque
                  </th>
                  <th style={{ padding: '1rem 1rem', color: '#F5D77F', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Duración Estimada
                  </th>
                  <th style={{ padding: '1rem 1rem', color: '#F5D77F', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Ejercicios
                  </th>
                  <th style={{ padding: '1rem 1rem', color: '#F5D77F', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Registrado Por
                  </th>
                  <th style={{ padding: '1rem 1.25rem', color: '#F5D77F', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutines.map((routine) => {
                  const routineId = routine.id || routine._id || '';
                  const isExpanded = !!expandedRoutineIds[routineId];
                  const exerciseCount = routine.exercises?.length || 0;

                  return (
                    <React.Fragment key={routineId}>
                      <tr
                        style={{
                          borderBottom: isExpanded ? 'none' : '1px solid rgba(255, 255, 255, 0.07)',
                          backgroundColor: isExpanded ? 'rgba(212, 175, 55, 0.03)' : 'transparent',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {/* Rutina / Nombre & Descripción */}
                        <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(212, 175, 55, 0.12)',
                                border: '1px solid rgba(212, 175, 55, 0.25)',
                                color: '#F5D77F',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginTop: '0.1rem',
                              }}
                            >
                              <Dumbbell size={18} />
                            </div>
                            <div>
                              <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.2rem' }}>
                                {routine.title}
                              </div>
                              {routine.description ? (
                                <p style={{ color: '#9FA6B8', fontSize: '0.8rem', margin: 0, lineHeight: 1.4, maxWidth: '380px' }}>
                                  {routine.description}
                                </p>
                              ) : (
                                <span style={{ color: '#64748B', fontSize: '0.75rem', fontStyle: 'italic' }}>
                                  Sin descripción
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Duración Estimada */}
                        <td style={{ padding: '1rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.35rem 0.7rem',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(212, 175, 55, 0.1)',
                              border: '1px solid rgba(212, 175, 55, 0.25)',
                              color: '#F5D77F',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                            }}
                          >
                            <Clock size={13} />
                            <span>{routine.durationMinutes} minutos</span>
                          </div>
                        </td>

                        {/* Ejercicios y botón para desplegar */}
                        <td style={{ padding: '1rem 1rem', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <button
                              onClick={() => toggleExpanded(routineId)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '6px',
                                backgroundColor: isExpanded ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                border: isExpanded ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                                color: isExpanded ? '#F5D77F' : '#E2E8F0',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              title="Ver u ocultar secuencia de ejercicios"
                            >
                              <Layers size={13} />
                              <span>
                                {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
                                {(() => {
                                  const loopSet = new Set((routine.exercises || []).map((e) => e.loopId).filter(Boolean));
                                  return loopSet.size > 0 ? ` (${loopSet.size} súper ${loopSet.size === 1 ? 'serie' : 'series'})` : '';
                                })()}
                              </span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            {/* Vista rápida compacta de los primeros 2 nombres */}
                            {!isExpanded && routine.exercises && routine.exercises.length > 0 && (
                              <span style={{ fontSize: '0.78rem', color: '#9FA6B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                                {routine.exercises.slice(0, 2).map((e) => e.name).join(', ')}
                                {routine.exercises.length > 2 ? '...' : ''}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Registrado Por */}
                        <td style={{ padding: '1rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '0.8rem', color: '#9FA6B8', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '0.25rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                            {routine.createdBy || 'Sensei'}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => openEditModal(routine)}
                              style={{
                                padding: '0.45rem 0.8rem',
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
                              title="Editar rutina"
                            >
                              <Edit2 size={13} />
                              <span>Editar</span>
                            </button>

                            {deleteConfirmId === routineId ? (
                              <div style={{ display: 'inline-flex', gap: '0.3rem' }}>
                                <button
                                  onClick={() => handleDeleteRoutine(routineId)}
                                  disabled={submitting}
                                  style={{
                                    padding: '0.45rem 0.65rem',
                                    borderRadius: '6px',
                                    backgroundColor: '#DC2626',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  style={{
                                    padding: '0.45rem 0.55rem',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    border: 'none',
                                    color: '#9FA6B8',
                                    fontSize: '0.78rem',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Cancelar
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
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                }}
                                title="Eliminar rutina"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Fila expandible con el desglose completo de ejercicios */}
                      {isExpanded && (
                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
                          <td colSpan={5} style={{ padding: '1rem 1.25rem 1.5rem 1.25rem' }}>
                            <div
                              style={{
                                padding: '1.25rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                borderRadius: '8px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F5D77F', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  Secuencia Detallada ({exerciseCount} ejercicios)
                                </span>
                                <span style={{ fontSize: '0.76rem', color: '#9FA6B8' }}>
                                  Duración estimada: <strong style={{ color: '#F5D77F' }}>{routine.durationMinutes} min</strong>
                                </span>
                              </div>

                              {/* Desglose de ejercicios individuales y bloques de súper series */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                {(() => {
                                  interface RoutineRowBlock {
                                    type: 'single' | 'loop';
                                    loopId?: string;
                                    loopName?: string;
                                    loopRounds?: number;
                                    loopRestBetweenRounds?: number;
                                    items: ExerciseItem[];
                                  }

                                  const rBlocks: RoutineRowBlock[] = [];
                                  let currentBlock: RoutineRowBlock | null = null;

                                  (routine.exercises || []).forEach((ex) => {
                                    if (ex.loopId) {
                                      if (currentBlock && currentBlock.loopId === ex.loopId) {
                                        currentBlock.items.push(ex);
                                      } else {
                                        currentBlock = {
                                          type: 'loop',
                                          loopId: ex.loopId,
                                          loopName: ex.loopName || 'Súper Serie',
                                          loopRounds: ex.loopRounds || 4,
                                          loopRestBetweenRounds: ex.loopRestBetweenRounds !== undefined ? ex.loopRestBetweenRounds : 60,
                                          items: [ex],
                                        };
                                        rBlocks.push(currentBlock);
                                      }
                                    } else {
                                      currentBlock = null;
                                      rBlocks.push({
                                        type: 'single',
                                        items: [ex],
                                      });
                                    }
                                  });

                                  return rBlocks.map((blk, blkIdx) => {
                                    if (blk.type === 'single') {
                                      const ex = blk.items[0];
                                      const quantity =
                                        ex.repsOrDurationValue !== undefined
                                          ? ex.repsOrDurationValue
                                          : ex.reps
                                          ? parseInt(ex.reps, 10) || 12
                                          : 12;
                                      const unit =
                                        ex.repsOrDurationUnit ||
                                        (ex.reps?.toLowerCase().includes('seg') ? 'segundos' : 'repeticiones');

                                      return (
                                        <div
                                          key={ex.id || blkIdx}
                                          style={{
                                            padding: '0.75rem 0.9rem',
                                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '6px',
                                          }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                              <span
                                                style={{
                                                  width: '20px',
                                                  height: '20px',
                                                  borderRadius: '50%',
                                                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                                                  color: '#F5D77F',
                                                  fontSize: '0.72rem',
                                                  fontWeight: 700,
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  flexShrink: 0,
                                                }}
                                              >
                                                {blkIdx + 1}
                                              </span>
                                              <span style={{ color: '#FFFFFF', fontSize: '0.88rem', fontWeight: 600 }}>
                                                {ex.name}
                                              </span>
                                            </div>

                                            <span style={{ color: '#F5D77F', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                                              {ex.sets ? `${ex.sets} × ` : ''}{quantity} {unit}
                                            </span>
                                          </div>

                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', paddingLeft: '1.7rem', fontSize: '0.74rem', color: '#9FA6B8' }}>
                                            {ex.restSeconds !== undefined && (
                                              <span>⏱ Descanso: <strong style={{ color: '#E2E8F0' }}>{ex.restSeconds}s</strong></span>
                                            )}
                                            {ex.notes && (
                                              <span style={{ fontStyle: 'italic', color: '#CBD5E1' }}>💡 {ex.notes}</span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    } else {
                                      // Bloque Loop / Súper Serie
                                      return (
                                        <div
                                          key={blk.loopId || blkIdx}
                                          style={{
                                            padding: '0.85rem 1rem',
                                            backgroundColor: 'rgba(212, 175, 55, 0.04)',
                                            border: '1px solid rgba(212, 175, 55, 0.35)',
                                            borderRadius: '8px',
                                          }}
                                        >
                                          {/* Cabecera del bloque súper serie */}
                                          <div
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              marginBottom: '0.6rem',
                                              paddingBottom: '0.4rem',
                                              borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
                                              flexWrap: 'wrap',
                                              gap: '0.5rem',
                                            }}
                                          >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                              <Zap size={14} color="#F5D77F" />
                                              <span style={{ color: '#F5D77F', fontWeight: 800, fontSize: '0.84rem' }}>
                                                {blk.loopName || 'SÚPER SERIE'}
                                              </span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.74rem' }}>
                                              <span
                                                style={{
                                                  color: '#10B981',
                                                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                                  padding: '0.15rem 0.45rem',
                                                  borderRadius: '4px',
                                                  fontWeight: 700,
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '0.25rem',
                                                }}
                                              >
                                                <Repeat size={11} /> {blk.loopRounds} RONDAS
                                              </span>
                                              <span style={{ color: '#9FA6B8' }}>
                                                Pausa entre rondas: <strong style={{ color: '#F5D77F' }}>{blk.loopRestBetweenRounds}s</strong>
                                              </span>
                                            </div>
                                          </div>

                                          {/* Lista de ejercicios dentro de la súper serie */}
                                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.6rem' }}>
                                            {blk.items.map((ex, stepIdx) => {
                                              const quantity =
                                                ex.repsOrDurationValue !== undefined
                                                  ? ex.repsOrDurationValue
                                                  : ex.reps
                                                  ? parseInt(ex.reps, 10) || 12
                                                  : 12;
                                              const unit =
                                                ex.repsOrDurationUnit ||
                                                (ex.reps?.toLowerCase().includes('seg') ? 'segundos' : 'repeticiones');

                                              return (
                                                <div
                                                  key={ex.id || stepIdx}
                                                  style={{
                                                    padding: '0.6rem 0.75rem',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                                    border: '1px solid rgba(255, 255, 255, 0.07)',
                                                    borderRadius: '5px',
                                                  }}
                                                >
                                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.25rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                      <span
                                                        style={{
                                                          width: '18px',
                                                          height: '18px',
                                                          borderRadius: '50%',
                                                          backgroundColor: 'rgba(212, 175, 55, 0.3)',
                                                          color: '#F5D77F',
                                                          fontSize: '0.68rem',
                                                          fontWeight: 800,
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'center',
                                                        }}
                                                      >
                                                        {stepIdx + 1}
                                                      </span>
                                                      <span style={{ color: '#FFFFFF', fontSize: '0.84rem', fontWeight: 600 }}>
                                                        {ex.name}
                                                      </span>
                                                    </div>

                                                    <span style={{ color: '#F5D77F', fontSize: '0.78rem', fontWeight: 700 }}>
                                                      {quantity} {unit}
                                                    </span>
                                                  </div>

                                                  <div style={{ fontSize: '0.72rem', color: '#9FA6B8', paddingLeft: '1.4rem' }}>
                                                    {stepIdx < blk.items.length - 1 && ex.restSeconds !== undefined && ex.restSeconds > 0 ? (
                                                      <span>⏱ Pausa al siguiente: <strong style={{ color: '#E2E8F0' }}>{ex.restSeconds}s</strong></span>
                                                    ) : (
                                                      <span>⚡ Pasa continuo al siguiente</span>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    }
                                  });
                                })()}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL CREAR / EDITAR RUTINA CON COMBOBOX PREDICTIVO          */}
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
              maxWidth: '760px',
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
                    Describe ejercicios o selecciónalos del combo con predicción. Se guardan directo en la base de datos.
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#F5D77F' }}>
                      Duración Estimada
                    </label>
                    {isAutoDuration ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.72rem',
                          color: '#10B981',
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          fontWeight: 600,
                        }}
                        title="Calculada automáticamente según series, repeticiones/segundos y descansos"
                      >
                        <Sparkles size={11} /> Auto: {calculatedDuration.formatted}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAutoDuration(true);
                          if (calculatedDuration.totalMinutes > 0) {
                            setDurationMinutes(calculatedDuration.totalMinutes);
                          }
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.72rem',
                          color: '#F5D77F',
                          backgroundColor: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid rgba(212, 175, 55, 0.35)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        title="Hacer clic para restablecer al cálculo automático"
                      >
                        <Sparkles size={11} /> Usar auto ({calculatedDuration.formatted})
                      </button>
                    )}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#D4AF37',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Clock size={16} />
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={360}
                      value={durationMinutes || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        setDurationMinutes(val);
                        setIsAutoDuration(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 5.5rem 0.75rem 2.5rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                      title="Duración estimada en minutos"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        right: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9FA6B8',
                        fontSize: '0.82rem',
                        pointerEvents: 'none',
                        fontWeight: 600,
                      }}
                    >
                      minutos
                    </div>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#9FA6B8', marginTop: '0.35rem', marginBottom: 0 }}>
                    ⚡ Estimado: 4s/rep + descansos + transiciones (~{calculatedDuration.formatted} total). {isAutoDuration ? 'Calculando automáticamente.' : 'Personalizado a mano.'}
                  </p>
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

              {/* Constructor de Ejercicios con Combobox Predictivo y Unidad Numérica */}
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={addExerciseRow}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        color: '#FFFFFF',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Plus size={14} />
                      <span>+ Ejercicio Individual</span>
                    </button>

                    <button
                      type="button"
                      onClick={addLoopBlock}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(212, 175, 55, 0.18)',
                        border: '1px solid rgba(212, 175, 55, 0.45)',
                        color: '#F5D77F',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        boxShadow: '0 0 12px rgba(212, 175, 55, 0.12)',
                      }}
                      title="Crear un bloque de Súper Serie / Circuito que se repite por rondas"
                    >
                      <Zap size={14} />
                      <span>⚡ Súper Serie (Loop)</span>
                    </button>
                  </div>
                </div>

                {/* Agrupación en Bloques (Individuales vs Súper Series / Loops) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {(() => {
                    interface RenderBlock {
                      type: 'single' | 'loop';
                      loopId?: string;
                      loopName?: string;
                      loopRounds?: number;
                      loopRestBetweenRounds?: number;
                      items: { exercise: ExerciseItem; originalIndex: number }[];
                    }

                    const blocks: RenderBlock[] = [];
                    let currentLoopBlock: RenderBlock | null = null;

                    exercises.forEach((ex, idx) => {
                      if (ex.loopId) {
                        if (currentLoopBlock && currentLoopBlock.loopId === ex.loopId) {
                          currentLoopBlock.items.push({ exercise: ex, originalIndex: idx });
                        } else {
                          currentLoopBlock = {
                            type: 'loop',
                            loopId: ex.loopId,
                            loopName: ex.loopName || 'Súper Serie',
                            loopRounds: ex.loopRounds || 4,
                            loopRestBetweenRounds: ex.loopRestBetweenRounds !== undefined ? ex.loopRestBetweenRounds : 60,
                            items: [{ exercise: ex, originalIndex: idx }],
                          };
                          blocks.push(currentLoopBlock);
                        }
                      } else {
                        currentLoopBlock = null;
                        blocks.push({
                          type: 'single',
                          items: [{ exercise: ex, originalIndex: idx }],
                        });
                      }
                    });

                    return blocks.map((block, blockIdx) => {
                      if (block.type === 'single') {
                        const { exercise: ex, originalIndex: idx } = block.items[0];
                        const searchWord = (ex.name || '').toLowerCase().trim();
                        const filteredPredictions = catalogExercises.filter((item) =>
                          searchWord === '' || item.name.toLowerCase().includes(searchWord)
                        );
                        const isDropdownOpen = activeComboIndex === idx;
                        const isSavedDirectly = !!savedExerciseIndices[idx];

                        return (
                          <div
                            key={ex.id || idx}
                            style={{
                              padding: '1rem',
                              backgroundColor: '#070709',
                              border: '1px solid rgba(212, 175, 55, 0.18)',
                              borderRadius: '8px',
                              position: 'relative',
                            }}
                          >
                            {/* Cabecera del ejercicio individual con botón de Convertir en Súper Serie */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '0.75rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F5D77F' }}>
                                  Ejercicio #{idx + 1}
                                </span>
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    color: '#9FA6B8',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '4px',
                                  }}
                                >
                                  Individual
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {/* Botón Convertir en Súper Serie */}
                                <button
                                  type="button"
                                  onClick={() => convertExerciseToLoop(idx)}
                                  style={{
                                    padding: '0.28rem 0.55rem',
                                    borderRadius: '5px',
                                    backgroundColor: 'rgba(212, 175, 55, 0.12)',
                                    border: '1px solid rgba(212, 175, 55, 0.3)',
                                    color: '#F5D77F',
                                    fontSize: '0.74rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                  }}
                                  title="Agrupar en una Súper Serie (Loop) que se repite por rondas"
                                >
                                  <Zap size={12} />
                                  <span>Crear Súper Serie</span>
                                </button>

                                {/* Botón Guardar directo en Base de Datos */}
                                {ex.name.trim() && (
                                  <button
                                    type="button"
                                    onClick={() => handleSaveExerciseDirectlyToDB(idx)}
                                    title="Guarda este ejercicio de inmediato en la base de datos para recordarlo en el combo"
                                    style={{
                                      padding: '0.28rem 0.55rem',
                                      borderRadius: '5px',
                                      backgroundColor: isSavedDirectly ? 'rgba(34, 197, 94, 0.2)' : 'rgba(212, 175, 55, 0.12)',
                                      border: `1px solid ${isSavedDirectly ? '#22C55E' : 'rgba(212, 175, 55, 0.3)'}`,
                                      color: isSavedDirectly ? '#4ADE80' : '#F5D77F',
                                      fontSize: '0.74rem',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                      transition: 'all 0.15s ease',
                                    }}
                                  >
                                    {isSavedDirectly ? <Check size={12} /> : <Database size={12} />}
                                    <span>{isSavedDirectly ? 'Guardado en BD' : 'Guardar en BD'}</span>
                                  </button>
                                )}

                                {/* Botón Quitar */}
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
                            </div>

                            {/* COMBOBOX PREDICTIVO */}
                            <div
                              ref={(el) => {
                                comboContainerRefs.current[idx] = el;
                              }}
                              style={{ position: 'relative', marginBottom: '0.75rem' }}
                            >
                              <label style={{ display: 'block', fontSize: '0.76rem', color: '#9FA6B8', marginBottom: '0.3rem' }}>
                                Nombre del Ejercicio (escribe para predecir o haz clic en la flecha para elegir del combo)
                              </label>

                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  required
                                  placeholder="Escribe o describe el ejercicio (ej: Burpees, Flexiones, Sentadillas...)"
                                  value={ex.name}
                                  onChange={(e) => {
                                    updateExerciseField(idx, 'name', e.target.value);
                                    setActiveComboIndex(idx);
                                  }}
                                  onFocus={() => setActiveComboIndex(idx)}
                                  style={{
                                    width: '100%',
                                    padding: '0.65rem 2.4rem 0.65rem 0.85rem',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: isDropdownOpen
                                      ? '1px solid #D4AF37'
                                      : '1px solid rgba(212, 175, 55, 0.25)',
                                    color: '#FFFFFF',
                                    fontSize: '0.88rem',
                                    outline: 'none',
                                  }}
                                />

                                <button
                                  type="button"
                                  onClick={() => setActiveComboIndex(isDropdownOpen ? null : idx)}
                                  title="Ver listado de ejercicios de la base de datos"
                                  style={{
                                    position: 'absolute',
                                    right: '6px',
                                    background: 'none',
                                    border: 'none',
                                    color: '#D4AF37',
                                    cursor: 'pointer',
                                    padding: '0.35rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <ChevronDown
                                    size={18}
                                    style={{
                                      transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                                      transition: 'transform 0.15s ease',
                                    }}
                                  />
                                </button>
                              </div>

                              {/* MENÚ DESPLEGABLE PREDICTIVO */}
                              {isDropdownOpen && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 4px)',
                                    left: 0,
                                    right: 0,
                                    zIndex: 60,
                                    backgroundColor: '#0E0F14',
                                    border: '1px solid rgba(212, 175, 55, 0.4)',
                                    borderRadius: '8px',
                                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.9), 0 0 15px rgba(212, 175, 55, 0.15)',
                                    maxHeight: '220px',
                                    overflowY: 'auto',
                                  }}
                                >
                                  <div
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      fontSize: '0.72rem',
                                      color: '#D4AF37',
                                      fontWeight: 700,
                                      borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <span>Catálogo Guardado en Base de Datos</span>
                                    {catalogLoading && <span style={{ color: '#9FA6B8' }}>Cargando...</span>}
                                  </div>

                                  {filteredPredictions.length === 0 ? (
                                    <div style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#9FA6B8', textAlign: 'center' }}>
                                      {ex.name.trim() ? (
                                        <>
                                          No hay coincidencias para &quot;{ex.name}&quot;.
                                          <br />
                                          <span style={{ color: '#F5D77F', fontSize: '0.76rem' }}>
                                            Puedes guardarlo haciendo clic en &quot;Guardar en BD&quot;.
                                          </span>
                                        </>
                                      ) : (
                                        'No hay ejercicios registrados en el catálogo aún.'
                                      )}
                                    </div>
                                  ) : (
                                    filteredPredictions.map((catItem) => (
                                      <div
                                        key={catItem.id || catItem._id || catItem.name}
                                        onClick={() => handleSelectFromCatalog(idx, catItem)}
                                        style={{
                                          padding: '0.6rem 0.85rem',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                          transition: 'background-color 0.15s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.12)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <Dumbbell size={13} color="#F5D77F" />
                                          <span style={{ fontSize: '0.86rem', color: '#FFFFFF', fontWeight: 600 }}>
                                            {catItem.name}
                                          </span>
                                        </div>

                                        {(catItem.defaultRepsOrDurationValue || catItem.defaultSets) && (
                                          <span
                                            style={{
                                              fontSize: '0.74rem',
                                              color: '#F5D77F',
                                              backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                              padding: '0.15rem 0.45rem',
                                              borderRadius: '4px',
                                            }}
                                          >
                                            {catItem.defaultSets ? `${catItem.defaultSets}x ` : ''}
                                            {catItem.defaultRepsOrDurationValue || 12}{' '}
                                            {catItem.defaultRepsOrDurationUnit || 'reps'}
                                          </span>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Series, Número, Tipo y Descanso */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                                gap: '0.65rem',
                                marginBottom: '0.65rem',
                              }}
                            >
                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#9FA6B8', marginBottom: '0.2rem' }}>
                                  Series
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  placeholder="4"
                                  value={ex.sets || ''}
                                  onChange={(e) => updateExerciseField(idx, 'sets', Number(e.target.value))}
                                  style={{
                                    width: '100%',
                                    padding: '0.55rem 0.65rem',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#FFFFFF',
                                    fontSize: '0.86rem',
                                    outline: 'none',
                                  }}
                                  title="Número de series"
                                />
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#9FA6B8', marginBottom: '0.2rem' }}>
                                  Cantidad (número)
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  placeholder="15"
                                  value={ex.repsOrDurationValue !== undefined ? ex.repsOrDurationValue : ''}
                                  onChange={(e) => updateExerciseField(idx, 'repsOrDurationValue', Number(e.target.value))}
                                  style={{
                                    width: '100%',
                                    padding: '0.55rem 0.65rem',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#FFFFFF',
                                    fontSize: '0.86rem',
                                    outline: 'none',
                                  }}
                                  title="Cantidad numérica de repeticiones o segundos"
                                />
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#9FA6B8', marginBottom: '0.2rem' }}>
                                  Tipo / Unidad
                                </label>
                                <select
                                  value={ex.repsOrDurationUnit || 'repeticiones'}
                                  onChange={(e) => updateExerciseField(idx, 'repsOrDurationUnit', e.target.value as ExerciseMeasureUnit)}
                                  style={{
                                    width: '100%',
                                    padding: '0.55rem 0.65rem',
                                    borderRadius: '6px',
                                    backgroundColor: '#0E0F14',
                                    border: '1px solid rgba(212, 175, 55, 0.3)',
                                    color: '#F5D77F',
                                    fontSize: '0.86rem',
                                    fontWeight: 600,
                                    outline: 'none',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <option value="repeticiones">Repeticiones</option>
                                  <option value="segundos">Segundos</option>
                                </select>
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#9FA6B8', marginBottom: '0.2rem' }}>
                                  Descanso (seg)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  placeholder="45"
                                  value={ex.restSeconds !== undefined ? ex.restSeconds : ''}
                                  onChange={(e) => updateExerciseField(idx, 'restSeconds', Number(e.target.value))}
                                  style={{
                                    width: '100%',
                                    padding: '0.55rem 0.65rem',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#FFFFFF',
                                    fontSize: '0.86rem',
                                    outline: 'none',
                                  }}
                                  title="Descanso en segundos"
                                />
                              </div>
                            </div>

                            {/* Notas técnicas */}
                            <div>
                              <label style={{ display: 'block', fontSize: '0.72rem', color: '#9FA6B8', marginBottom: '0.2rem' }}>
                                Indicaciones o notas técnicas (opcional)
                              </label>
                              <input
                                type="text"
                                placeholder="Ej: Cuidar alineación de espalda y control respiratorio"
                                value={ex.notes || ''}
                                onChange={(e) => updateExerciseField(idx, 'notes', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem 0.65rem',
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  color: '#CBD5E1',
                                  fontSize: '0.82rem',
                                  outline: 'none',
                                  fontStyle: 'italic',
                                }}
                              />
                            </div>
                          </div>
                        );
                      } else {
                        // BLOQUE SÚPER SERIE / CIRCUITO (LOOP)
                        return (
                          <div
                            key={block.loopId || blockIdx}
                            style={{
                              padding: '1.15rem',
                              backgroundColor: 'rgba(212, 175, 55, 0.03)',
                              border: '1px solid rgba(212, 175, 55, 0.45)',
                              borderRadius: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1rem',
                              boxShadow: '0 4px 25px rgba(0, 0, 0, 0.45), inset 0 0 15px rgba(212, 175, 55, 0.06)',
                            }}
                          >
                            {/* Cabecera de la Súper Serie */}
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.75rem',
                                paddingBottom: '0.75rem',
                                borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(212, 175, 55, 0.22)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#F5D77F',
                                  }}
                                >
                                  <Zap size={16} />
                                </span>
                                <input
                                  type="text"
                                  value={block.loopName || 'Súper Serie'}
                                  onChange={(e) => updateLoopMeta(block.loopId!, 'loopName', e.target.value)}
                                  placeholder="Nombre de la Súper Serie..."
                                  style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px dashed rgba(212, 175, 55, 0.5)',
                                    color: '#F5D77F',
                                    fontWeight: 800,
                                    fontSize: '0.98rem',
                                    outline: 'none',
                                    padding: '0.15rem 0.35rem',
                                    minWidth: '150px',
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    color: '#9FA6B8',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                  }}
                                >
                                  Loop: {block.items.length} ejercicios
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                                {/* Selector de Rondas / Vueltas */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#F5D77F', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Repeat size={13} /> Rondas / Vueltas:
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={30}
                                    value={block.loopRounds || 4}
                                    onChange={(e) => updateLoopMeta(block.loopId!, 'loopRounds', Math.max(1, Number(e.target.value)))}
                                    style={{
                                      width: '54px',
                                      padding: '0.25rem 0.35rem',
                                      borderRadius: '6px',
                                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                      border: '1px solid rgba(212, 175, 55, 0.35)',
                                      color: '#FFFFFF',
                                      fontWeight: 700,
                                      fontSize: '0.85rem',
                                      textAlign: 'center',
                                      outline: 'none',
                                    }}
                                    title="Número de vueltas completas de la súper serie"
                                  />
                                </div>

                                {/* Pausa entre rondas */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#9FA6B8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={13} /> Pausa entre vueltas:
                                  </label>
                                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                      type="number"
                                      min={0}
                                      max={600}
                                      value={block.loopRestBetweenRounds !== undefined ? block.loopRestBetweenRounds : 60}
                                      onChange={(e) => updateLoopMeta(block.loopId!, 'loopRestBetweenRounds', Math.max(0, Number(e.target.value)))}
                                      style={{
                                        width: '64px',
                                        padding: '0.25rem 1.3rem 0.25rem 0.35rem',
                                        borderRadius: '6px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: '#FFFFFF',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        textAlign: 'center',
                                        outline: 'none',
                                      }}
                                      title="Segundos de recuperación al terminar toda la vuelta del bucle"
                                    />
                                    <span style={{ position: 'absolute', right: '5px', fontSize: '0.7rem', color: '#9FA6B8', pointerEvents: 'none' }}>
                                      s
                                    </span>
                                  </div>
                                </div>

                                {/* Desagrupar Súper Serie */}
                                <button
                                  type="button"
                                  onClick={() => ungroupLoop(block.loopId!)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '5px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#CBD5E1',
                                    fontSize: '0.74rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                  title="Separar los ejercicios de este loop en ejercicios individuales"
                                >
                                  <Unlink size={12} />
                                  <span>Desagrupar</span>
                                </button>
                              </div>
                            </div>

                            {/* Ejercicios dentro del loop */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                              {block.items.map(({ exercise: ex, originalIndex: idx }, itemIdx) => {
                                const isDropdownOpen = activeComboIndex === idx;
                                const isSavedDirectly = !!savedExerciseIndices[idx];
                                const searchWord = (ex.name || '').toLowerCase().trim();
                                const filteredPredictions = catalogExercises.filter((item) =>
                                  searchWord === '' || item.name.toLowerCase().includes(searchWord)
                                );
                                const isLastInLoop = itemIdx === block.items.length - 1;

                                return (
                                  <div
                                    key={ex.id || idx}
                                    style={{
                                      padding: '0.9rem',
                                      backgroundColor: '#070709',
                                      border: '1px solid rgba(212, 175, 55, 0.22)',
                                      borderRadius: '8px',
                                      position: 'relative',
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.7rem',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span
                                          style={{
                                            width: '22px',
                                            height: '22px',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(212, 175, 55, 0.25)',
                                            color: '#F5D77F',
                                            fontSize: '0.74rem',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          }}
                                        >
                                          {itemIdx + 1}
                                        </span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                                          Paso #{itemIdx + 1} de la Súper Serie
                                        </span>
                                        <span
                                          style={{
                                            fontSize: '0.7rem',
                                            color: '#F5D77F',
                                            backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                            padding: '0.1rem 0.45rem',
                                            borderRadius: '4px',
                                          }}
                                        >
                                          1 serie por vuelta (× {block.loopRounds} rondas)
                                        </span>
                                      </div>

                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {ex.name.trim() && (
                                          <button
                                            type="button"
                                            onClick={() => handleSaveExerciseDirectlyToDB(idx)}
                                            style={{
                                              padding: '0.28rem 0.55rem',
                                              borderRadius: '5px',
                                              backgroundColor: isSavedDirectly ? 'rgba(34, 197, 94, 0.2)' : 'rgba(212, 175, 55, 0.12)',
                                              border: `1px solid ${isSavedDirectly ? '#22C55E' : 'rgba(212, 175, 55, 0.3)'}`,
                                              color: isSavedDirectly ? '#4ADE80' : '#F5D77F',
                                              fontSize: '0.74rem',
                                              fontWeight: 600,
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '0.3rem',
                                            }}
                                          >
                                            {isSavedDirectly ? <Check size={12} /> : <Database size={12} />}
                                            <span>{isSavedDirectly ? 'Guardado' : 'Guardar en BD'}</span>
                                          </button>
                                        )}

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
                                          title="Quitar este ejercicio del loop"
                                        >
                                          <Trash2 size={13} />
                                          <span>Quitar</span>
                                        </button>
                                      </div>
                                    </div>

                                    {/* Combobox predictivo para ejercicio del loop */}
                                    <div
                                      ref={(el) => {
                                        comboContainerRefs.current[idx] = el;
                                      }}
                                      style={{ position: 'relative', marginBottom: '0.75rem' }}
                                    >
                                      <label style={{ display: 'block', fontSize: '0.76rem', color: '#9FA6B8', marginBottom: '0.3rem' }}>
                                        Nombre del Ejercicio
                                      </label>

                                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <input
                                          type="text"
                                          required
                                          placeholder="Escribe o selecciona del catálogo..."
                                          value={ex.name}
                                          onChange={(e) => {
                                            updateExerciseField(idx, 'name', e.target.value);
                                            setActiveComboIndex(idx);
                                          }}
                                          onFocus={() => setActiveComboIndex(idx)}
                                          style={{
                                            width: '100%',
                                            padding: '0.65rem 2.4rem 0.65rem 0.85rem',
                                            borderRadius: '6px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            border: isDropdownOpen
                                              ? '1px solid #D4AF37'
                                              : '1px solid rgba(212, 175, 55, 0.25)',
                                            color: '#FFFFFF',
                                            fontSize: '0.88rem',
                                            outline: 'none',
                                          }}
                                        />

                                        <button
                                          type="button"
                                          onClick={() => setActiveComboIndex(isDropdownOpen ? null : idx)}
                                          title="Ver listado del catálogo"
                                          style={{
                                            position: 'absolute',
                                            right: '6px',
                                            background: 'none',
                                            border: 'none',
                                            color: '#D4AF37',
                                            cursor: 'pointer',
                                            padding: '0.35rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          }}
                                        >
                                          <ChevronDown
                                            size={18}
                                            style={{
                                              transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                                              transition: 'transform 0.15s ease',
                                            }}
                                          />
                                        </button>
                                      </div>

                                      {/* Menú Desplegable predictivo */}
                                      {isDropdownOpen && (
                                        <div
                                          style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 4px)',
                                            left: 0,
                                            right: 0,
                                            zIndex: 60,
                                            backgroundColor: '#0E0F14',
                                            border: '1px solid rgba(212, 175, 55, 0.4)',
                                            borderRadius: '8px',
                                            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.9), 0 0 15px rgba(212, 175, 55, 0.15)',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                          }}
                                        >
                                          {filteredPredictions.length === 0 ? (
                                            <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#9FA6B8', textAlign: 'center' }}>
                                              No hay coincidencias en el catálogo.
                                            </div>
                                          ) : (
                                            filteredPredictions.map((catItem) => (
                                              <div
                                                key={catItem.id || catItem._id || catItem.name}
                                                onClick={() => handleSelectFromCatalog(idx, catItem)}
                                                style={{
                                                  padding: '0.55rem 0.85rem',
                                                  cursor: 'pointer',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'space-between',
                                                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                }}
                                                onMouseEnter={(e) => {
                                                  e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.12)';
                                                }}
                                                onMouseLeave={(e) => {
                                                  e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                              >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                                  <Dumbbell size={13} color="#F5D77F" />
                                                  <span style={{ fontSize: '0.84rem', color: '#FFFFFF', fontWeight: 600 }}>
                                                    {catItem.name}
                                                  </span>
                                                </div>
                                                <span
                                                  style={{
                                                    fontSize: '0.72rem',
                                                    color: '#F5D77F',
                                                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                                    padding: '0.1rem 0.4rem',
                                                    borderRadius: '4px',
                                                  }}
                                                >
                                                  {catItem.defaultRepsOrDurationValue || 12}{' '}
                                                  {catItem.defaultRepsOrDurationUnit || 'reps'}
                                                </span>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Cantidad, Tipo y Pausa hacia el siguiente */}
                                    <div
                                      style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                        gap: '0.65rem',
                                        marginBottom: '0.65rem',
                                      }}
                                    >
                                      <div>
                                        <label style={{ display: 'block', fontSize: '0.72rem', color: '#9FA6B8', marginBottom: '0.2rem' }}>
                                          Cantidad (número)
                                        </label>
                                        <input
                                          type="number"
                                          min={1}
                                          placeholder="12"
                                          value={ex.repsOrDurationValue !== undefined ? ex.repsOrDurationValue : ''}
                                          onChange={(e) => updateExerciseField(idx, 'repsOrDurationValue', Number(e.target.value))}
                                          style={{
                                            width: '100%',
                                            padding: '0.55rem 0.65rem',
                                            borderRadius: '6px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            color: '#FFFFFF',
                                            fontSize: '0.86rem',
                                            outline: 'none',
                                          }}
                                        />
                                      </div>

                                      <div>
                                        <label style={{ display: 'block', fontSize: '0.72rem', color: '#9FA6B8', marginBottom: '0.2rem' }}>
                                          Tipo / Unidad
                                        </label>
                                        <select
                                          value={ex.repsOrDurationUnit || 'repeticiones'}
                                          onChange={(e) => updateExerciseField(idx, 'repsOrDurationUnit', e.target.value as ExerciseMeasureUnit)}
                                          style={{
                                            width: '100%',
                                            padding: '0.55rem 0.65rem',
                                            borderRadius: '6px',
                                            backgroundColor: '#0E0F14',
                                            border: '1px solid rgba(212, 175, 55, 0.3)',
                                            color: '#F5D77F',
                                            fontSize: '0.86rem',
                                            fontWeight: 600,
                                            outline: 'none',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <option value="repeticiones">Repeticiones</option>
                                          <option value="segundos">Segundos</option>
                                        </select>
                                      </div>

                                      <div>
                                        <label style={{ display: 'block', fontSize: '0.72rem', color: '#9FA6B8', marginBottom: '0.2rem' }}>
                                          {isLastInLoop ? 'Pausa fin de vuelta' : 'Pausa al sig. ejercicio (seg)'}
                                        </label>
                                        <input
                                          type="number"
                                          min={0}
                                          disabled={isLastInLoop}
                                          placeholder={isLastInLoop ? `${block.loopRestBetweenRounds || 60}s (en cabecera)` : '15'}
                                          value={isLastInLoop ? '' : (ex.restSeconds !== undefined ? ex.restSeconds : '')}
                                          onChange={(e) => updateExerciseField(idx, 'restSeconds', Number(e.target.value))}
                                          style={{
                                            width: '100%',
                                            padding: '0.55rem 0.65rem',
                                            borderRadius: '6px',
                                            backgroundColor: isLastInLoop ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            color: isLastInLoop ? '#9FA6B8' : '#FFFFFF',
                                            fontSize: '0.86rem',
                                            outline: 'none',
                                            cursor: isLastInLoop ? 'not-allowed' : 'text',
                                          }}
                                          title={isLastInLoop ? `Se usa el descanso de fin de ronda configurado en la cabecera (${block.loopRestBetweenRounds}s)` : 'Descanso entre ejercicios del bucle'}
                                        />
                                      </div>
                                    </div>

                                    {/* Notas técnicas */}
                                    <div>
                                      <input
                                        type="text"
                                        placeholder="Indicaciones o notas técnicas de este paso..."
                                        value={ex.notes || ''}
                                        onChange={(e) => updateExerciseField(idx, 'notes', e.target.value)}
                                        style={{
                                          width: '100%',
                                          padding: '0.45rem 0.65rem',
                                          borderRadius: '6px',
                                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                          border: '1px solid rgba(255, 255, 255, 0.12)',
                                          color: '#CBD5E1',
                                          fontSize: '0.8rem',
                                          outline: 'none',
                                          fontStyle: 'italic',
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Botón para añadir ejercicio a esta Súper Serie */}
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                              <button
                                type="button"
                                onClick={() => addExerciseToLoop(block.loopId!)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(212, 175, 55, 0.12)',
                                  border: '1px dashed rgba(212, 175, 55, 0.45)',
                                  color: '#F5D77F',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <Plus size={13} />
                                <span>+ Añadir ejercicio a esta {block.loopName || 'Súper Serie'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      }
                    });
                  })()}
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
