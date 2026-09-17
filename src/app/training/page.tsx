'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Routine, ExerciseItem } from '@/types';
import { calculateRoutineDuration } from '@/lib/routineUtils';
import {
  Dumbbell,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  Zap,
  CheckCircle,
  ArrowLeft,
  Search,
  Award,
  Shield,
  Layers,
  Repeat,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Lock,
} from 'lucide-react';

// Paso individual desempaquetado para el ejecutor interactivo de entrenamiento
interface WorkoutStep {
  stepIndex: number;
  exerciseName: string;
  exerciseNotes?: string;
  isLoop: boolean;
  loopName?: string;
  currentRound?: number;
  totalRounds?: number;
  stepInRound?: number;
  totalStepsInRound?: number;
  currentSet?: number;
  totalSets?: number;
  targetQuantity: number;
  targetUnit: 'repeticiones' | 'segundos';
  restSecondsAfter: number;
  isEndOfLoopRound?: boolean;
}

// Desempaquetar una rutina completa en pasos ejecutables ordenados
function unrollRoutineSteps(routine: Routine): WorkoutStep[] {
  if (!routine.exercises || routine.exercises.length === 0) return [];

  interface LoopGroup {
    loopId: string;
    loopName: string;
    loopRounds: number;
    loopRestBetweenRounds: number;
    items: ExerciseItem[];
  }

  type RoutineBlock =
    | { type: 'single'; exercise: ExerciseItem }
    | { type: 'loop'; group: LoopGroup };

  const blocks: RoutineBlock[] = [];
  let currentGroup: LoopGroup | null = null;

  routine.exercises.forEach((ex) => {
    if (ex.loopId) {
      if (currentGroup && currentGroup.loopId === ex.loopId) {
        currentGroup.items.push(ex);
      } else {
        currentGroup = {
          loopId: ex.loopId,
          loopName: ex.loopName || 'Súper Serie',
          loopRounds: Math.max(1, Number(ex.loopRounds) || 4),
          loopRestBetweenRounds:
            ex.loopRestBetweenRounds !== undefined ? Number(ex.loopRestBetweenRounds) : 60,
          items: [ex],
        };
        blocks.push({ type: 'loop', group: currentGroup });
      }
    } else {
      currentGroup = null;
      blocks.push({ type: 'single', exercise: ex });
    }
  });

  const steps: WorkoutStep[] = [];
  let stepCounter = 0;

  for (const block of blocks) {
    if (block.type === 'single') {
      const ex = block.exercise;
      const totalSets = Math.max(1, Number(ex.sets) || 1);
      const quantity =
        ex.repsOrDurationValue !== undefined && !isNaN(Number(ex.repsOrDurationValue))
          ? Number(ex.repsOrDurationValue)
          : 12;
      const unit =
        ex.repsOrDurationUnit ||
        (ex.reps?.toLowerCase().includes('seg') ? 'segundos' : 'repeticiones');
      const rest = ex.restSeconds !== undefined ? Number(ex.restSeconds) : 45;

      for (let s = 1; s <= totalSets; s++) {
        stepCounter++;
        steps.push({
          stepIndex: stepCounter,
          exerciseName: ex.name,
          exerciseNotes: ex.notes,
          isLoop: false,
          currentSet: s,
          totalSets,
          targetQuantity: quantity,
          targetUnit: unit,
          restSecondsAfter: rest,
        });
      }
    } else {
      // Bloque Loop / Súper Serie
      const group = block.group;
      const totalRounds = group.loopRounds;
      const itemsInLoop = group.items;

      for (let r = 1; r <= totalRounds; r++) {
        for (let i = 0; i < itemsInLoop.length; i++) {
          const ex = itemsInLoop[i];
          const isLastInLoop = i === itemsInLoop.length - 1;
          const quantity =
            ex.repsOrDurationValue !== undefined && !isNaN(Number(ex.repsOrDurationValue))
              ? Number(ex.repsOrDurationValue)
              : 12;
          const unit =
            ex.repsOrDurationUnit ||
            (ex.reps?.toLowerCase().includes('seg') ? 'segundos' : 'repeticiones');
          const rest = isLastInLoop
            ? group.loopRestBetweenRounds
            : ex.restSeconds !== undefined
            ? Number(ex.restSeconds)
            : 15;

          stepCounter++;
          steps.push({
            stepIndex: stepCounter,
            exerciseName: ex.name,
            exerciseNotes: ex.notes,
            isLoop: true,
            loopName: group.loopName,
            currentRound: r,
            totalRounds,
            stepInRound: i + 1,
            totalStepsInRound: itemsInLoop.length,
            targetQuantity: quantity,
            targetUnit: unit,
            restSecondsAfter: rest,
            isEndOfLoopRound: isLastInLoop,
          });
        }
      }
    }
  }

  return steps;
}

// Reproductor de sonido sintético marcial (Web Audio API) sin dependencias externas
function playAudioTone(type: 'beep' | 'gong' | 'victory' | 'rest') {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'gong') {
      // Tono ceremonial grave y resonante estilo gong de dojo
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(146.83, ctx.currentTime); // D3
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } else if (type === 'rest') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'victory') {
      // Acorde triunfal marcial
      const freqs = [440, 554.37, 659.25, 880];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.8);
      });
    }
  } catch {
    // Si el navegador bloquea audio por falta de interacción, no arroja error
  }
}

export default function TrainingPage() {
  const { user, isLoading: authLoading, openAuthModal } = useAuth();

  // Estados de catálogo de rutinas
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loadingRoutines, setLoadingRoutines] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'loops' | 'short' | 'long'>('all');
  const [previewRoutine, setPreviewRoutine] = useState<Routine | null>(null);
  const [expandedRoutineIds, setExpandedRoutineIds] = useState<Record<string, boolean>>({});

  const toggleExpanded = (id: string) => {
    setExpandedRoutineIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Estados del Ejecutor Interactivo de Entrenamiento (Workout Runner)
  const [activeWorkoutRoutine, setActiveWorkoutRoutine] = useState<Routine | null>(null);
  const [workoutSteps, setWorkoutSteps] = useState<WorkoutStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [workoutPhase, setWorkoutPhase] = useState<'idle' | 'prep' | 'work' | 'rest' | 'finished'>('idle');
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const runnerRef = useRef<HTMLDivElement | null>(null);

  const isSuperAdmin =
    user?.email?.toLowerCase().includes('david.artavia.rodriguez@gmail.com') ||
    user?.email?.toLowerCase().includes('davidartaviarodriguez@gmail.com');

  const isAdmin = !!user && (user.role === 'administrator' || isSuperAdmin);
  const isApprovedUser = !!user && (user.status === 'active' || isAdmin);

  // Cargar rutinas disponibles desde la API
  const fetchRoutines = useCallback(async () => {
    setLoadingRoutines(true);
    try {
      const res = await fetch('/api/training/routines');
      if (res.ok) {
        const data = await res.json();
        setRoutines(data.routines || []);
      }
    } catch (err) {
      console.error('Error al cargar rutinas de entrenamiento:', err);
    } finally {
      setLoadingRoutines(false);
    }
  }, []);

  useEffect(() => {
    if (isApprovedUser) {
      fetchRoutines();
    }
  }, [isApprovedUser, fetchRoutines]);

  // Iniciar ejecución de una rutina seleccionada
  const startWorkout = (routine: Routine) => {
    const steps = unrollRoutineSteps(routine);
    if (steps.length === 0) return;

    setActiveWorkoutRoutine(routine);
    setWorkoutSteps(steps);
    setCurrentStepIndex(0);
    setTotalElapsedSeconds(0);
    setPreviewRoutine(null);

    // Comenzar con 5 segundos de cuenta regresiva de preparación (Hajime)
    setWorkoutPhase('prep');
    setSecondsRemaining(5);
    setIsTimerRunning(true);

    if (soundEnabled) {
      playAudioTone('beep');
    }
  };

  // Pasar de la fase de preparación al primer ejercicio
  const beginWorkPhase = useCallback((step: WorkoutStep) => {
    setWorkoutPhase('work');
    if (step.targetUnit === 'segundos') {
      setSecondsRemaining(step.targetQuantity);
      setIsTimerRunning(true);
    } else {
      // Para repeticiones, el cronómetro cuenta hacia arriba o espera confirmación manual
      setSecondsRemaining(0);
      setIsTimerRunning(true);
    }
    if (soundEnabled) {
      playAudioTone('gong');
    }
  }, [soundEnabled]);

  // Completar el ejercicio actual e iniciar el descanso correspondiente
  const completeCurrentExercise = useCallback(() => {
    const currentStep = workoutSteps[currentStepIndex];
    if (!currentStep) return;

    const isLastStep = currentStepIndex === workoutSteps.length - 1;

    if (isLastStep) {
      // ¡Entrenamiento completado con éxito!
      setWorkoutPhase('finished');
      setIsTimerRunning(false);
      if (soundEnabled) {
        playAudioTone('victory');
      }
      return;
    }

    // Pasar a fase de descanso
    const restSeconds = currentStep.restSecondsAfter || 15;
    if (restSeconds > 0) {
      setWorkoutPhase('rest');
      setSecondsRemaining(restSeconds);
      setIsTimerRunning(true);
      if (soundEnabled) {
        playAudioTone('rest');
      }
    } else {
      // Transición continua directa al siguiente ejercicio
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      beginWorkPhase(workoutSteps[nextIdx]);
    }
  }, [workoutSteps, currentStepIndex, soundEnabled, beginWorkPhase]);

  // Terminar el descanso antes de tiempo (Omitir descanso)
  const skipRestAndProceed = useCallback(() => {
    const nextIdx = currentStepIndex + 1;
    if (nextIdx < workoutSteps.length) {
      setCurrentStepIndex(nextIdx);
      beginWorkPhase(workoutSteps[nextIdx]);
    } else {
      setWorkoutPhase('finished');
      setIsTimerRunning(false);
      if (soundEnabled) {
        playAudioTone('victory');
      }
    }
  }, [currentStepIndex, workoutSteps, soundEnabled, beginWorkPhase]);

  // Añadir +15 segundos al descanso
  const addExtraRest = () => {
    setSecondsRemaining((prev) => prev + 15);
  };

  // Salir de la pantalla de ejecución y volver a la lista
  const exitWorkoutRunner = () => {
    if (workoutPhase !== 'finished' && workoutPhase !== 'idle') {
      if (!window.confirm('¿Deseas pausar y salir del entrenamiento actual?')) {
        return;
      }
    }
    setActiveWorkoutRoutine(null);
    setWorkoutSteps([]);
    setWorkoutPhase('idle');
    setIsTimerRunning(false);
  };

  // Timer Tick (manejador de temporizador cada segundo)
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTotalElapsedSeconds((prev) => prev + 1);

      if (workoutPhase === 'prep') {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            beginWorkPhase(workoutSteps[currentStepIndex]);
            return 0;
          }
          if (soundEnabled && prev <= 4) {
            playAudioTone('beep');
          }
          return prev - 1;
        });
      } else if (workoutPhase === 'work') {
        const step = workoutSteps[currentStepIndex];
        if (step && step.targetUnit === 'segundos') {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              completeCurrentExercise();
              return 0;
            }
            if (soundEnabled && prev <= 4) {
              playAudioTone('beep');
            }
            return prev - 1;
          });
        }
      } else if (workoutPhase === 'rest') {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            skipRestAndProceed();
            return 0;
          }
          if (soundEnabled && prev <= 4) {
            playAudioTone('beep');
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isTimerRunning,
    workoutPhase,
    currentStepIndex,
    workoutSteps,
    soundEnabled,
    beginWorkPhase,
    completeCurrentExercise,
    skipRestAndProceed,
  ]);

  // Formatear segundos a MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Alternar pantalla completa
  const toggleFullscreen = () => {
    if (!runnerRef.current) return;
    if (!document.fullscreenElement) {
      runnerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Filtrado de rutinas
  const filteredRoutines = routines.filter((r) => {
    const matchesSearch =
      searchTerm === '' ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.exercises?.some((ex) => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'loops') {
      return r.exercises?.some((ex) => !!ex.loopId);
    }
    if (activeFilter === 'short') {
      return (r.durationMinutes || 30) <= 30;
    }
    if (activeFilter === 'long') {
      return (r.durationMinutes || 30) > 45;
    }
    return true;
  });

  // Estadísticas globales del dojo
  const totalRoutines = routines.length;
  const totalExercisesCatalog = routines.reduce(
    (acc, r) => acc + (r.exercises?.length || 0),
    0
  );
  const avgDuration =
    totalRoutines > 0
      ? Math.round(
          routines.reduce((acc, r) => acc + (r.durationMinutes || 30), 0) / totalRoutines
        )
      : 30;

  // =========================================================================
  // CASO 1: USUARIO NO LOGUEADO O EN ESPERA DE APROBACIÓN (GATEKEEPER)
  // =========================================================================
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#070709',
        }}
      >
        <div style={{ textAlign: 'center', color: '#F5D77F' }}>
          <Dumbbell size={40} className="spin-animation" style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>
            Accediendo a la Zona de Entrenamiento Ryūko Kai...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          backgroundColor: '#070709',
        }}
      >
        <div
          className="card-sumi"
          style={{
            maxWidth: '520px',
            width: '100%',
            textAlign: 'center',
            padding: '3rem 2rem',
            backgroundColor: '#0E0F14',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.1)',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: 'rgba(212, 175, 55, 0.12)',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#F5D77F',
              boxShadow: '0 0 25px rgba(212, 175, 55, 0.2)',
            }}
          >
            <Lock size={32} />
          </div>

          <span
            style={{
              display: 'inline-block',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#D4AF37',
              marginBottom: '0.6rem',
            }}
          >
            Dōjō Ryūko Kai • Área Restringida
          </span>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.85rem' }}>
            Zona Oficial de Entrenamiento
          </h2>

          <p style={{ color: '#9FA6B8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Para acceder y ejecutar las rutinas de acondicionamiento físico, kata y kumite creadas por el Sensei, debes iniciar sesión con tu cuenta de alumno aprobada.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <button
              onClick={openAuthModal}
              className="btn-martial-primary"
              style={{
                width: '100%',
                padding: '0.85rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
              }}
            >
              <Dumbbell size={18} />
              <span>Iniciar Sesión de Alumno</span>
            </button>

            <Link
              href="/"
              className="btn-martial-secondary"
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                fontSize: '0.88rem',
                textAlign: 'center',
              }}
            >
              Volver a la Página Principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.status !== 'active' && !isAdmin) {
    return (
      <div
        style={{
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          backgroundColor: '#070709',
        }}
      >
        <div
          className="card-sumi"
          style={{
            maxWidth: '520px',
            width: '100%',
            textAlign: 'center',
            padding: '3rem 2rem',
            backgroundColor: '#0E0F14',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#F5D77F',
            }}
          >
            <Clock size={30} />
          </div>

          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Estado de Membresía
          </span>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', margin: '0.5rem 0 1rem' }}>
            Cuenta en Espera de Aprobación
          </h2>

          <p style={{ color: '#9FA6B8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.8rem' }}>
            Hola, <strong style={{ color: '#FFFFFF' }}>{user.name}</strong>. Tu registro en Ryūko Kai fue recibido correctamente. El Sensei debe autorizar tu membresía para habilitar la ejecución de rutinas oficiales.
          </p>

          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.8rem', fontSize: '0.82rem', color: '#CBD5E1' }}>
            🥋 <strong>Consejo del Dojo:</strong> Notifica al Sensei en tu próxima clase para la validación inmediata de tu grado marcial ({user.kyuDan || 'Kyu'}).
          </div>

          <Link href="/" className="btn-martial-secondary" style={{ display: 'inline-block', width: '100%' }}>
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASO 2: EJECUTOR INTERACTIVO DE ENTRENAMIENTO ACTIVO (WORKOUT RUNNER)
  // =========================================================================
  if (activeWorkoutRoutine && workoutSteps.length > 0) {
    const currentStep = workoutSteps[currentStepIndex];
    const progressPercent = Math.round(
      ((currentStepIndex + (workoutPhase === 'rest' ? 1 : 0)) / workoutSteps.length) * 100
    );

    return (
      <div
        ref={runnerRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          height: '100dvh',
          width: '100vw',
          backgroundColor: '#050608',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        {/* Barra superior de control del entrenamiento (Compacta y responsive) */}
        <div
          style={{
            padding: '0.6rem 0.85rem',
            backgroundColor: '#0A0B0F',
            borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            flexShrink: 0,
          }}
        >
          {/* Botón Salir y Título con Truncado Elegante */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0, flex: 1 }}>
            <button
              onClick={exitWorkoutRunner}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#CBD5E1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              title="Salir del entrenamiento"
            >
              <ArrowLeft size={18} />
            </button>

            <div style={{ minWidth: 0, flex: 1 }}>
              <h3
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: '#F5D77F',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                }}
              >
                {activeWorkoutRoutine.title}
              </h3>
              <span style={{ fontSize: '0.68rem', color: '#9FA6B8', display: 'block' }}>
                Paso {currentStepIndex + 1} de {workoutSteps.length}
              </span>
            </div>
          </div>

          {/* Controles: Cronómetro Global, Sonido, Pantalla Completa */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
            {/* Cronómetro Global de la Sesión */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.55rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.28)',
                color: '#F5D77F',
                fontWeight: 800,
                fontSize: '0.78rem',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <Clock size={12} />
              <span>{formatTime(totalElapsedSeconds)}</span>
            </div>

            {/* Silenciar / Sonido */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: soundEnabled ? '#F5D77F' : '#64748B',
                cursor: 'pointer',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              title={soundEnabled ? 'Silenciar señales acústicas' : 'Activar sonido marcial'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Pantalla completa nativa */}
            <button
              onClick={toggleFullscreen}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#CBD5E1',
                cursor: 'pointer',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              title="Pantalla Completa"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>

        {/* Barra de Progreso Superior */}
        <div style={{ width: '100%', height: '3px', backgroundColor: 'rgba(255, 255, 255, 0.08)', flexShrink: 0 }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #D4AF37 0%, #10B981 100%)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        {/* ================================================================= */}
        {/* PANTALLA: FASE PREPARACIÓN (HAJIME!)                              */}
        {/* ================================================================= */}
        {workoutPhase === 'prep' && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              overflowY: 'auto',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.15em',
                color: '#D4AF37',
                textTransform: 'uppercase',
                marginBottom: '0.8rem',
              }}
            >
              Comienza en breve • Hajime! (はじめ)
            </span>

            {/* Contador Regresivo Gigante Responsivo */}
            <div
              style={{
                width: 'min(130px, 35vw)',
                height: 'min(130px, 35vw)',
                borderRadius: '50%',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '3px solid #D4AF37',
                boxShadow: '0 0 40px rgba(212, 175, 55, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(3.5rem, 12vw, 4.5rem)',
                fontWeight: 900,
                color: '#F5D77F',
                marginBottom: '1.5rem',
              }}
            >
              {secondsRemaining}
            </div>

            <div style={{ maxWidth: '450px', width: '100%', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#9FA6B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Primer Ejercicio:
              </span>
              <h2 style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 800, color: '#FFFFFF', margin: '0.2rem 0 0.5rem' }}>
                {currentStep?.exerciseName}
              </h2>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#F5D77F',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                <span>Objetivo: <strong>{currentStep?.targetQuantity} {currentStep?.targetUnit}</strong></span>
              </div>
            </div>

            <button
              onClick={() => beginWorkPhase(currentStep)}
              className="btn-martial-primary"
              style={{ padding: '0.85rem 2rem', fontSize: '0.95rem', fontWeight: 800 }}
            >
              <Play size={17} /> ¡Comenzar Ahora!
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* PANTALLA: FASE DE TRABAJO ACTIVO (ACTIVE WORKOUT RUNNER)          */}
        {/* ================================================================= */}
        {workoutPhase === 'work' && currentStep && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            {/* Scrollable Center Content Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1rem 1rem 0.5rem 1rem',
                maxWidth: '750px',
                width: '100%',
                margin: '0 auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* Cabecera del paso: Distintivo Súper Serie o Serie Normal */}
              <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                {currentStep.isLoop ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#F87171',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      <Zap size={11} /> {currentStep.loopName || 'Súper Serie'}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(212, 175, 55, 0.14)',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        color: '#F5D77F',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}
                    >
                      <Repeat size={11} /> Vuelta {currentStep.currentRound}/{currentStep.totalRounds} • Paso {currentStep.stepInRound}/{currentStep.totalStepsInRound}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.2rem 0.75rem',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        color: '#E2E8F0',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      <Layers size={12} color="#D4AF37" /> Serie {currentStep.currentSet} de {currentStep.totalSets}
                    </span>
                  </div>
                )}

                {/* Nombre Principal del Ejercicio */}
                <h1
                  style={{
                    fontSize: 'clamp(1.5rem, 5.5vw, 2.5rem)',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    margin: '0.1rem 0',
                    lineHeight: 1.18,
                    wordBreak: 'break-word',
                  }}
                >
                  {currentStep.exerciseName}
                </h1>

                {/* Notas / Coaching Tip */}
                {currentStep.exerciseNotes && (
                  <div
                    style={{
                      display: 'inline-block',
                      margin: '0.4rem auto 0',
                      padding: '0.3rem 0.75rem',
                      backgroundColor: 'rgba(212, 175, 55, 0.08)',
                      border: '1px solid rgba(212, 175, 55, 0.22)',
                      borderRadius: '6px',
                      color: '#F5D77F',
                      fontSize: '0.78rem',
                      fontStyle: 'italic',
                      maxWidth: '450px',
                    }}
                  >
                    💡 {currentStep.exerciseNotes}
                  </div>
                )}
              </div>

              {/* Display Central: Temporizador o Conteo de Repeticiones */}
              <div style={{ textAlign: 'center', margin: 'auto 0', padding: '0.75rem 0' }}>
                {currentStep.targetUnit === 'segundos' ? (
                  <div>
                    <span style={{ fontSize: '0.76rem', color: '#9FA6B8', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                      Tiempo Restante
                    </span>
                    <div
                      style={{
                        fontSize: 'clamp(3.8rem, 16vw, 6.8rem)',
                        fontWeight: 900,
                        color: secondsRemaining <= 5 ? '#EF4444' : '#10B981',
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1,
                        margin: '0.3rem 0',
                        textShadow: secondsRemaining <= 5
                          ? '0 0 35px rgba(239, 68, 68, 0.45)'
                          : '0 0 35px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      {formatTime(secondsRemaining)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.82rem', color: '#9FA6B8' }}>
                        Meta: <strong style={{ color: '#FFFFFF' }}>{currentStep.targetQuantity}s</strong> de trabajo
                      </span>

                      {/* Botón de Pausa / Reanudar en tiempo real */}
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          color: '#F5D77F',
                          padding: '0.25rem 0.6rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        {isTimerRunning ? <Pause size={12} /> : <Play size={12} />}
                        <span>{isTimerRunning ? 'Pausar' : 'Reanudar'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#9FA6B8', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                      Meta de Ejecución Técnica
                    </span>
                    <div
                      style={{
                        fontSize: 'clamp(3.8rem, 15vw, 6.2rem)',
                        fontWeight: 900,
                        color: '#F5D77F',
                        lineHeight: 1,
                        margin: '0.3rem 0',
                        textShadow: '0 0 30px rgba(212, 175, 55, 0.35)',
                      }}
                    >
                      {currentStep.targetQuantity}{' '}
                      <span style={{ fontSize: 'clamp(1.3rem, 5vw, 1.8rem)', fontWeight: 700, color: '#FFFFFF' }}>reps</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#9FA6B8' }}>
                      Ejecuta a tu ritmo técnico y pulsa &quot;Completar Serie&quot;
                    </span>
                  </div>
                )}
              </div>

              {/* Preview del Siguiente Paso (Compacto y responsivo) */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '0.65rem 0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginTop: 'auto',
                  marginBottom: '0.4rem',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: '0.66rem', color: '#9FA6B8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                    A continuación:
                  </span>
                  <span
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                    }}
                  >
                    {currentStepIndex + 1 < workoutSteps.length
                      ? workoutSteps[currentStepIndex + 1].exerciseName
                      : '🏁 ¡Final de la rutina!'}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.74rem',
                    color: '#F5D77F',
                    fontWeight: 700,
                    flexShrink: 0,
                    padding: '0.2rem 0.5rem',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    borderRadius: '6px',
                  }}
                >
                  {currentStep.isEndOfLoopRound
                    ? `⚡ Fin vuelta: ${currentStep.restSecondsAfter}s`
                    : currentStep.restSecondsAfter > 0
                    ? `Pausa: ${currentStep.restSecondsAfter}s`
                    : 'Continuo'}
                </span>
              </div>
            </div>

            {/* BARRA INFERIOR DE ACCIÓN (Pinned al fondo con Safe-Area) */}
            <div
              style={{
                padding: '0.75rem 1rem calc(0.85rem + env(safe-area-inset-bottom, 0px)) 1rem',
                backgroundColor: '#0A0B0F',
                borderTop: '1px solid rgba(212, 175, 55, 0.2)',
                flexShrink: 0,
                width: '100%',
              }}
            >
              <div style={{ maxWidth: '750px', margin: '0 auto', width: '100%' }}>
                <button
                  onClick={completeCurrentExercise}
                  className="btn-martial-primary"
                  style={{
                    width: '100%',
                    padding: '1.05rem 1.5rem',
                    fontSize: 'clamp(1rem, 4vw, 1.15rem)',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.65rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 25px rgba(212, 175, 55, 0.35)',
                    touchAction: 'manipulation',
                    cursor: 'pointer',
                  }}
                >
                  <CheckCircle size={22} />
                  <span>
                    {currentStepIndex === workoutSteps.length - 1
                      ? '¡Finalizar Rutina!'
                      : '✓ Completar Serie y Descansar'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PANTALLA: FASE DE DESCANSO / RECUPERACIÓN (REST PHASE)            */}
        {/* ================================================================= */}
        {workoutPhase === 'rest' && currentStep && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            {/* Scrollable Center Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem 1rem 0.5rem 1rem',
                textAlign: 'center',
                maxWidth: '600px',
                width: '100%',
                margin: '0 auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#10B981',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                }}
              >
                {currentStep.isEndOfLoopRound
                  ? '⚡ ¡Vuelta Completada! Recuperación del Circuito'
                  : 'Recuperación • Respira y Mantén Zanshin'}
              </span>

              {/* Círculo de Descanso Responsivo */}
              <div
                style={{
                  width: 'min(150px, 38vw)',
                  height: 'min(150px, 38vw)',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '3px solid #10B981',
                  boxShadow: '0 0 35px rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <span style={{ fontSize: '0.72rem', color: '#9FA6B8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Pausa
                </span>
                <div
                  style={{
                    fontSize: 'clamp(2.5rem, 9vw, 3.4rem)',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatTime(secondsRemaining)}
                </div>
              </div>

              {/* Siguiente ejercicio en turno */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '10px',
                  padding: '0.85rem 1.25rem',
                  maxWidth: '450px',
                  width: '100%',
                  marginBottom: '1rem',
                }}
              >
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#F5D77F', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  Prepárate para:
                </span>
                <h3 style={{ fontSize: 'clamp(1.05rem, 4vw, 1.25rem)', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.25rem' }}>
                  {workoutSteps[currentStepIndex + 1]?.exerciseName}
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#9FA6B8' }}>
                  Meta: <strong style={{ color: '#F5D77F' }}>{workoutSteps[currentStepIndex + 1]?.targetQuantity} {workoutSteps[currentStepIndex + 1]?.targetUnit}</strong>
                </span>
              </div>
            </div>

            {/* Botones de Descanso Pinned al fondo */}
            <div
              style={{
                padding: '0.75rem 1rem calc(0.85rem + env(safe-area-inset-bottom, 0px)) 1rem',
                backgroundColor: '#0A0B0F',
                borderTop: '1px solid rgba(212, 175, 55, 0.2)',
                flexShrink: 0,
                width: '100%',
              }}
            >
              <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', display: 'flex', gap: '0.65rem' }}>
                <button
                  onClick={addExtraRest}
                  style={{
                    flex: 1,
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                  }}
                >
                  +15s Descanso
                </button>

                <button
                  onClick={skipRestAndProceed}
                  className="btn-martial-primary"
                  style={{
                    flex: 1.4,
                    padding: '0.85rem 1.2rem',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    borderRadius: '10px',
                    touchAction: 'manipulation',
                  }}
                >
                  <SkipForward size={16} />
                  <span>¡Continuar!</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PANTALLA: ENTRENAMIENTO COMPLETADO (VICTORY / REI)                */}
        {/* ================================================================= */}
        {workoutPhase === 'finished' && (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom, 0px))',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '75px',
                height: '75px',
                borderRadius: '50%',
                backgroundColor: 'rgba(212, 175, 55, 0.2)',
                border: '3px solid #F5D77F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F5D77F',
                margin: '0 auto 1.25rem',
                boxShadow: '0 0 35px rgba(212, 175, 55, 0.4)',
              }}
            >
              <Award size={38} />
            </div>

            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#D4AF37',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
              }}
            >
              Mokuso • Rei (礼)
            </span>

            <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontWeight: 900, color: '#FFFFFF', marginBottom: '0.4rem' }}>
              ¡Entrenamiento Completado!
            </h1>

            <p style={{ color: '#9FA6B8', fontSize: '0.9rem', maxWidth: '420px', marginBottom: '1.5rem' }}>
              Has finalizado la rutina <strong style={{ color: '#F5D77F' }}>{activeWorkoutRoutine.title}</strong>.
            </p>

            {/* Métricas Responsivas */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                maxWidth: '480px',
                width: '100%',
                marginBottom: '1.8rem',
              }}
            >
              <div style={{ backgroundColor: '#0E0F14', padding: '0.75rem 0.4rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                <span style={{ fontSize: '0.68rem', color: '#9FA6B8', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                  Tiempo Total
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#F5D77F' }}>
                  {formatTime(totalElapsedSeconds)}
                </span>
              </div>

              <div style={{ backgroundColor: '#0E0F14', padding: '0.75rem 0.4rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                <span style={{ fontSize: '0.68rem', color: '#9FA6B8', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                  Pasos
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFFFFF' }}>
                  {workoutSteps.length}
                </span>
              </div>

              <div style={{ backgroundColor: '#0E0F14', padding: '0.75rem 0.4rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                <span style={{ fontSize: '0.68rem', color: '#9FA6B8', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                  Disciplina
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10B981' }}>
                  100%
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '380px' }}>
              <button
                onClick={() => startWorkout(activeWorkoutRoutine)}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <RotateCcw size={16} />
                <span>Repetir Rutina</span>
              </button>

              <button
                onClick={exitWorkoutRunner}
                className="btn-martial-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                }}
              >
                <span>Volver al Catálogo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // CASO 3: CATÁLOGO DE RUTINAS PARA EJECUTAR (DASHBOARD PRINCIPAL)
  // =========================================================================
  return (
    <div
      style={{
        minHeight: '90vh',
        backgroundColor: '#070709',
        padding: '2.5rem 0 5rem',
      }}
    >
      <div className="container-dojo" style={{ width: '100%' }}>
        {/* Cabecera Principal con Kanji y Atmósfera Marcial */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1.5rem',
            marginBottom: '2.5rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          }}
        >
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#D4AF37',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                }}
              >
                鍛錬 • TANREN (ENTRENAMIENTO MARCIAL)
              </span>

              {isAdmin && (
                <Link
                  href="/admin/routines"
                  style={{
                    fontSize: '0.72rem',
                    color: '#9FA6B8',
                    textDecoration: 'underline',
                  }}
                >
                  Gestionar Rutinas (/admin/routines)
                </Link>
              )}
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: '0.3rem 0',
              }}
            >
              Rutinas de Entrenamiento
            </h1>

            <p style={{ color: '#9FA6B8', fontSize: '0.95rem', maxWidth: '850px', margin: 0, lineHeight: 1.5 }}>
              Selecciona una rutina creada por el Sensei para iniciar tu sesión guiada. El sistema controlará tus tiempos activos y las pausas entre series y súper series en tiempo real.
            </p>
          </div>

          {/* Tarjetas de Métricas de Repertorio */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '0.85rem 1.25rem',
                backgroundColor: '#0E0F14',
                borderRadius: '10px',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                textAlign: 'center',
                minWidth: '110px',
              }}
            >
              <span style={{ display: 'block', fontSize: '0.72rem', color: '#9FA6B8', textTransform: 'uppercase', fontWeight: 600 }}>
                Rutinas
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF' }}>
                {totalRoutines}
              </span>
            </div>

            <div
              style={{
                padding: '0.85rem 1.25rem',
                backgroundColor: '#0E0F14',
                borderRadius: '10px',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                textAlign: 'center',
                minWidth: '110px',
              }}
            >
              <span style={{ display: 'block', fontSize: '0.72rem', color: '#9FA6B8', textTransform: 'uppercase', fontWeight: 600 }}>
                Duración Promedio
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F5D77F' }}>
                ~{avgDuration}m
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros Rápidos */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {/* Input de Búsqueda */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '480px', minWidth: '240px' }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9FA6B8',
              }}
            />
            <input
              type="text"
              placeholder="Buscar por nombre de rutina o ejercicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                borderRadius: '8px',
                backgroundColor: '#0E0F14',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                color: '#FFFFFF',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'Todas' },
              { id: 'loops', label: '⚡ Con Súper Series' },
              { id: 'short', label: 'Rápidas (≤ 30 min)' },
              { id: 'long', label: 'Avanzadas (> 45 min)' },
            ].map((f) => {
              const active = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id as typeof activeFilter)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: active ? 800 : 500,
                    backgroundColor: active ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: active ? '1px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: active ? '#F5D77F' : '#9FA6B8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid de Rutinas */}
        {loadingRoutines ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9FA6B8' }}>
            <Dumbbell size={36} className="spin-animation" style={{ color: '#F5D77F', margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '0.95rem' }}>Cargando repertorio de rutinas del dojo...</p>
          </div>
        ) : filteredRoutines.length === 0 ? (
          <div
            className="card-sumi"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              backgroundColor: '#0E0F14',
              border: '1px dashed rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
            }}
          >
            <Dumbbell size={42} color="#64748B" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              No se encontraron rutinas
            </h3>
            <p style={{ color: '#9FA6B8', fontSize: '0.88rem', margin: 0 }}>
              {searchTerm
                ? 'Intenta con otros términos de búsqueda.'
                : 'Aún no hay rutinas creadas en la base de datos.'}
            </p>
          </div>
        ) : (
          <>
            {/* VISTA ESCRITORIO / TABLET: TABLA MARCIAL */}
            <div
              className="desktop-routine-table card-sumi"
              style={{
                padding: 0,
                overflow: 'hidden',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '12px',
                backgroundColor: '#0E0F14',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
              }}
            >
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
                      <th style={{ padding: '1rem 1rem', color: '#F5D77F', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        Duración Estimada
                      </th>
                      <th style={{ padding: '1rem 1rem', color: '#F5D77F', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Ejercicios
                      </th>
                      <th style={{ padding: '1rem 1.25rem', color: '#F5D77F', fontWeight: 700, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                        Acción / Ejecución
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoutines.map((routine) => {
                      const routineId = routine.id || routine._id || '';
                      const isExpanded = !!expandedRoutineIds[routineId];
                      const exerciseCount = routine.exercises?.length || 0;
                      const loopSet = new Set((routine.exercises || []).map((e) => e.loopId).filter(Boolean));
                      const loopCount = loopSet.size;

                      return (
                        <React.Fragment key={routineId}>
                          <tr
                            style={{
                              borderBottom: isExpanded ? 'none' : '1px solid rgba(255, 255, 255, 0.07)',
                              backgroundColor: isExpanded ? 'rgba(212, 175, 55, 0.03)' : 'transparent',
                              transition: 'background-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (!isExpanded) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isExpanded) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {/* Nombre y Descripción */}
                            <td style={{ padding: '1.1rem 1.25rem', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                                <div
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(212, 175, 55, 0.12)',
                                    border: '1px solid rgba(212, 175, 55, 0.28)',
                                    color: '#F5D77F',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '0.1rem',
                                  }}
                                >
                                  <Dumbbell size={19} />
                                </div>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                                    <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1rem' }}>
                                      {routine.title}
                                    </span>
                                    {loopCount > 0 && (
                                      <span
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.25rem',
                                          padding: '0.15rem 0.5rem',
                                          borderRadius: '4px',
                                          backgroundColor: 'rgba(239, 68, 68, 0.14)',
                                          border: '1px solid rgba(239, 68, 68, 0.35)',
                                          color: '#F87171',
                                          fontSize: '0.7rem',
                                          fontWeight: 700,
                                        }}
                                      >
                                        <Zap size={11} /> {loopCount} Súper Serie{loopCount > 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>
                                  {routine.description ? (
                                    <p style={{ color: '#9FA6B8', fontSize: '0.82rem', margin: 0, lineHeight: 1.45, maxWidth: '650px' }}>
                                      {routine.description}
                                    </p>
                                  ) : (
                                    <span style={{ color: '#64748B', fontSize: '0.76rem', fontStyle: 'italic' }}>
                                      Rutina técnica guiada de karate
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Duración Estimada */}
                            <td style={{ padding: '1.1rem 1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '999px',
                                  backgroundColor: 'rgba(212, 175, 55, 0.12)',
                                  border: '1px solid rgba(212, 175, 55, 0.3)',
                                  color: '#F5D77F',
                                  fontWeight: 700,
                                  fontSize: '0.82rem',
                                }}
                              >
                                <Clock size={14} />
                                <span>~{routine.durationMinutes} minutos</span>
                              </div>
                            </td>

                            {/* Ejercicios y Botón Desplegar */}
                            <td style={{ padding: '1.1rem 1rem', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <button
                                  onClick={() => toggleExpanded(routineId)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '6px',
                                    backgroundColor: isExpanded ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                    border: isExpanded ? '1px solid rgba(212, 175, 55, 0.45)' : '1px solid rgba(255, 255, 255, 0.12)',
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
                                  </span>
                                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                {!isExpanded && routine.exercises && routine.exercises.length > 0 && (
                                  <span style={{ fontSize: '0.78rem', color: '#9FA6B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '450px' }}>
                                    {routine.exercises.slice(0, 4).map((e) => e.name).join(', ')}
                                    {routine.exercises.length > 4 ? '...' : ''}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Acciones */}
                            <td style={{ padding: '1.1rem 1.25rem', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => setPreviewRoutine(routine)}
                                  style={{
                                    padding: '0.5rem 0.85rem',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#E2E8F0',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    transition: 'all 0.15s ease',
                                  }}
                                  title="Ver detalles y notas"
                                >
                                  <Layers size={13} />
                                  <span>Ver Desglose</span>
                                </button>

                                <button
                                  onClick={() => startWorkout(routine)}
                                  className="btn-martial-primary"
                                  style={{
                                    padding: '0.5rem 1.1rem',
                                    fontSize: '0.84rem',
                                    fontWeight: 800,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.45rem',
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 10px rgba(212, 175, 55, 0.25)',
                                  }}
                                  title="Iniciar ejecución interactiva de la rutina"
                                >
                                  <Play size={14} />
                                  <span>Iniciar Rutina</span>
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Fila expandible con el desglose detallado */}
                          {isExpanded && (
                            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(0, 0, 0, 0.35)' }}>
                              <td colSpan={4} style={{ padding: '1.25rem 1.5rem 1.75rem' }}>
                                <div
                                  style={{
                                    padding: '1.25rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(212, 175, 55, 0.25)',
                                    borderRadius: '10px',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#F5D77F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Secuencia Planificada ({exerciseCount} ejercicios)
                                      </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                      <span style={{ fontSize: '0.78rem', color: '#9FA6B8' }}>
                                        Duración estimada: <strong style={{ color: '#F5D77F' }}>~{routine.durationMinutes} min</strong>
                                      </span>
                                      <button
                                        onClick={() => startWorkout(routine)}
                                        className="btn-martial-primary"
                                        style={{
                                          padding: '0.4rem 0.9rem',
                                          fontSize: '0.78rem',
                                          fontWeight: 800,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.35rem',
                                          borderRadius: '6px',
                                        }}
                                      >
                                        <Play size={13} />
                                        <span>Iniciar Esta Rutina</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Desglose agrupando individuales y bloques súper series */}
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
                                          const quantity = ex.repsOrDurationValue !== undefined ? ex.repsOrDurationValue : 12;
                                          const unit = ex.repsOrDurationUnit || 'repeticiones';

                                          return (
                                            <div
                                              key={ex.id || blkIdx}
                                              style={{
                                                padding: '0.75rem 0.9rem',
                                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.07)',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.35rem',
                                              }}
                                            >
                                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                                  <span
                                                    style={{
                                                      width: '22px',
                                                      height: '22px',
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

                                                <span style={{ color: '#F5D77F', fontSize: '0.82rem', fontWeight: 700 }}>
                                                  {ex.sets ? `${ex.sets} × ` : ''}{quantity} {unit}
                                                </span>
                                              </div>

                                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', paddingLeft: '1.7rem', fontSize: '0.75rem', color: '#9FA6B8' }}>
                                                {ex.restSeconds !== undefined && (
                                                  <span>⏱ Descanso entre series: <strong style={{ color: '#E2E8F0' }}>{ex.restSeconds}s</strong></span>
                                                )}
                                                {ex.notes && (
                                                  <span style={{ fontStyle: 'italic', color: '#CBD5E1' }}>💡 {ex.notes}</span>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        } else {
                                          return (
                                            <div
                                              key={blk.loopId || blkIdx}
                                              style={{
                                                padding: '0.85rem 1rem',
                                                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.6rem',
                                              }}
                                            >
                                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                  <Zap size={14} color="#F87171" />
                                                  <span style={{ color: '#FCA5A5', fontWeight: 800, fontSize: '0.84rem' }}>
                                                    {blk.loopName}
                                                  </span>
                                                  <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                                                    {blk.loopRounds} vueltas continuas
                                                  </span>
                                                </div>

                                                <span style={{ fontSize: '0.74rem', color: '#9FA6B8' }}>
                                                  Pausa fin de vuelta: <strong style={{ color: '#F5D77F' }}>{blk.loopRestBetweenRounds}s</strong>
                                                </span>
                                              </div>

                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingLeft: '0.5rem' }}>
                                                {blk.items.map((ex, stepIdx) => {
                                                  const quantity = ex.repsOrDurationValue !== undefined ? ex.repsOrDurationValue : 12;
                                                  const unit = ex.repsOrDurationUnit || 'repeticiones';

                                                  return (
                                                    <div
                                                      key={ex.id || stepIdx}
                                                      style={{
                                                        padding: '0.5rem 0.75rem',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                                        borderRadius: '4px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '0.2rem',
                                                      }}
                                                    >
                                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
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

            {/* VISTA MÓVIL: CARDS NATIVAS TIPO APP (ESTILO SAMSUNG GALAXY S26 ULTRA / SMARTPHONE) */}
            <div className="mobile-routine-cards">
              {filteredRoutines.map((routine) => {
                const routineId = routine.id || routine._id || '';
                const isExpanded = !!expandedRoutineIds[routineId];
                const exerciseCount = routine.exercises?.length || 0;
                const loopSet = new Set((routine.exercises || []).map((e) => e.loopId).filter(Boolean));
                const loopCount = loopSet.size;

                return (
                  <div
                    key={`mob-card-${routineId}`}
                    className="card-sumi"
                    style={{
                      backgroundColor: '#0E0F14',
                      border: '1px solid rgba(212, 175, 55, 0.28)',
                      borderRadius: '14px',
                      padding: '1.15rem',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                    }}
                  >
                    {/* Header de la tarjeta */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                          <h3 style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.12rem', margin: 0, lineHeight: 1.25 }}>
                            {routine.title}
                          </h3>
                          {loopCount > 0 && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                color: '#F87171',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                              }}
                            >
                              <Zap size={11} /> {loopCount} Súper Serie{loopCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {routine.description ? (
                          <p style={{ color: '#9FA6B8', fontSize: '0.82rem', margin: 0, lineHeight: 1.4 }}>
                            {routine.description}
                          </p>
                        ) : (
                          <span style={{ color: '#64748B', fontSize: '0.76rem', fontStyle: 'italic' }}>
                            Rutina técnica guiada de karate
                          </span>
                        )}
                      </div>

                      {/* Pill de Duración en la esquina */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(212, 175, 55, 0.14)',
                          border: '1px solid rgba(212, 175, 55, 0.35)',
                          color: '#F5D77F',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        <Clock size={13} />
                        <span>~{routine.durationMinutes}m</span>
                      </div>
                    </div>

                    {/* Fila de Insignias: Cantidad de ejercicios + Tags de muestra */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: '#CBD5E1',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <Layers size={12} color="#D4AF37" />
                        {exerciseCount} ejercicios
                      </span>

                      {(routine.exercises || []).slice(0, 3).map((ex, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.72rem',
                            color: '#9FA6B8',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            padding: '0.2rem 0.45rem',
                            borderRadius: '6px',
                            maxWidth: '120px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {ex.name}
                        </span>
                      ))}

                      {(routine.exercises || []).length > 3 && (
                        <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                          +{ (routine.exercises || []).length - 3 } más
                        </span>
                      )}
                    </div>

                    {/* Desplegable rápido de ejercicios */}
                    <div>
                      <button
                        onClick={() => toggleExpanded(routineId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isExpanded ? '#F5D77F' : '#9FA6B8',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0',
                          touchAction: 'manipulation',
                        }}
                      >
                        <span>{isExpanded ? 'Ocultar ejercicios' : 'Ver lista de ejercicios'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isExpanded && (
                        <div
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.75rem',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(212, 175, 55, 0.2)',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.45rem',
                          }}
                        >
                          {(routine.exercises || []).map((ex, exIdx) => (
                            <div
                              key={exIdx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.78rem',
                                padding: '0.35rem 0',
                                borderBottom: exIdx < (routine.exercises || []).length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden', paddingRight: '0.5rem' }}>
                                <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.72rem', flexShrink: 0 }}>{exIdx + 1}.</span>
                                <span style={{ color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</span>
                              </div>
                              <span style={{ color: '#F5D77F', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                                {ex.loopId ? `${ex.loopRounds || 4}v × ` : ex.sets ? `${ex.sets} × ` : ''}
                                {ex.repsOrDurationValue || 12} {ex.repsOrDurationUnit || 'reps'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Botones de acción táctiles para Móvil */}
                    <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.15rem' }}>
                      <button
                        onClick={() => setPreviewRoutine(routine)}
                        style={{
                          flex: 1,
                          minHeight: '46px',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.18)',
                          color: '#E2E8F0',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          touchAction: 'manipulation',
                        }}
                      >
                        <Layers size={14} />
                        <span>Desglose</span>
                      </button>

                      <button
                        onClick={() => startWorkout(routine)}
                        className="btn-martial-primary"
                        style={{
                          flex: 1.8,
                          minHeight: '46px',
                          padding: '0.65rem 1rem',
                          fontSize: '0.92rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.45rem',
                          borderRadius: '8px',
                          touchAction: 'manipulation',
                          boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)',
                        }}
                      >
                        <Play size={16} />
                        <span>Iniciar Rutina</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODAL: VER DESGLOSE COMPLETO ANTES DE INICIAR (BOTTOM SHEET EN MÓVIL) */}
      {/* ===================================================================== */}
      {previewRoutine && (
        <div
          className="bottom-sheet-modal"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            className="card-sumi bottom-sheet-content"
            style={{
              backgroundColor: '#0E0F14',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              maxWidth: '650px',
              width: '100%',
              overflowY: 'auto',
              padding: '1.5rem 1.25rem',
            }}
          >
            {/* Tirador táctil para móvil (Drag Handle) */}
            <div className="bottom-sheet-drag-handle">
              <div
                style={{
                  width: '42px',
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  margin: '0 auto 0.75rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#D4AF37', fontWeight: 800, textTransform: 'uppercase' }}>
                  Desglose Detallado
                </span>
                <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.35rem)', fontWeight: 800, color: '#FFFFFF', margin: '0.2rem 0' }}>
                  {previewRoutine.title}
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#9FA6B8' }}>
                  Duración estimada: ~{previewRoutine.durationMinutes} min • Creado por {previewRoutine.createdBy || 'Sensei'}
                </span>
              </div>

              <button
                onClick={() => setPreviewRoutine(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#CBD5E1',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  touchAction: 'manipulation',
                }}
              >
                ✕
              </button>
            </div>

            {previewRoutine.description && (
              <p style={{ color: '#CBD5E1', fontSize: '0.86rem', marginBottom: '1.25rem', lineHeight: 1.45 }}>
                {previewRoutine.description}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {(previewRoutine.exercises || []).map((ex, idx) => (
                <div
                  key={ex.id || idx}
                  style={{
                    padding: '0.75rem 0.85rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
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
                        {idx + 1}
                      </span>
                      <strong style={{ color: '#FFFFFF', fontSize: '0.88rem' }}>{ex.name}</strong>
                      {ex.loopId && (
                        <span style={{ fontSize: '0.66rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                          ⚡ Súper Serie
                        </span>
                      )}
                    </div>

                    {ex.notes && (
                      <span style={{ fontSize: '0.74rem', color: '#9FA6B8', fontStyle: 'italic', display: 'block', marginTop: '0.2rem', paddingLeft: '1.6rem' }}>
                        💡 {ex.notes}
                      </span>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ display: 'block', color: '#F5D77F', fontWeight: 800, fontSize: '0.84rem' }}>
                      {ex.loopId
                        ? `${ex.loopRounds || 4}v × ${ex.repsOrDurationValue || 12} ${ex.repsOrDurationUnit || 'reps'}`
                        : `${ex.sets || 3} × ${ex.repsOrDurationValue || 12} ${ex.repsOrDurationUnit || 'reps'}`}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#9FA6B8' }}>
                      Descanso: {ex.restSeconds || 45}s
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={() => setPreviewRoutine(null)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#9FA6B8',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                }}
              >
                Cerrar
              </button>

              <button
                onClick={() => startWorkout(previewRoutine)}
                className="btn-martial-primary"
                style={{
                  flex: 1.8,
                  padding: '0.75rem 1.4rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  borderRadius: '8px',
                  touchAction: 'manipulation',
                }}
              >
                <Play size={16} />
                <span>Comenzar Entrenamiento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reglas CSS específicas para alternancia Responsiva Desktop vs Móvil */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-routine-table { display: block !important; }
          .mobile-routine-cards { display: none !important; }
          .bottom-sheet-modal {
            align-items: center !important;
            padding: 1rem !important;
          }
          .bottom-sheet-content {
            border-radius: 14px !important;
            max-height: 90vh !important;
          }
          .bottom-sheet-drag-handle {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-routine-table { display: none !important; }
          .mobile-routine-cards { display: flex !important; flex-direction: column !important; gap: 1rem !important; }
          .bottom-sheet-modal {
            align-items: flex-end !important;
            padding: 0 !important;
          }
          .bottom-sheet-content {
            border-radius: 20px 20px 0 0 !important;
            max-height: 85vh !important;
            padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px)) !important;
          }
          .bottom-sheet-drag-handle {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
