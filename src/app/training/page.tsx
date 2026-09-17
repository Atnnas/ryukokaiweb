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
          minHeight: '100vh',
          backgroundColor: '#050608',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          position: isFullscreen ? 'fixed' : 'relative',
          inset: isFullscreen ? 0 : 'auto',
          zIndex: isFullscreen ? 9999 : 40,
        }}
      >
        {/* Barra superior de control del entrenamiento */}
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#0A0B0F',
            borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={exitWorkoutRunner}
              style={{
                background: 'none',
                border: 'none',
                color: '#9FA6B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }}
              title="Salir del entrenamiento"
            >
              <ArrowLeft size={16} />
              <span className="hide-mobile">Salir</span>
            </button>

            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#F5D77F', margin: 0 }}>
                {activeWorkoutRoutine.title}
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#9FA6B8' }}>
                Paso {currentStepIndex + 1} de {workoutSteps.length}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Cronómetro Global de la Sesión */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#F5D77F',
                fontWeight: 800,
                fontSize: '0.9rem',
              }}
            >
              <Clock size={15} />
              <span>{formatTime(totalElapsedSeconds)}</span>
            </div>

            {/* Silenciar / Sonido */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                background: 'none',
                border: 'none',
                color: soundEnabled ? '#F5D77F' : '#64748B',
                cursor: 'pointer',
                padding: '0.4rem',
              }}
              title={soundEnabled ? 'Silenciar señales acústicas' : 'Activar sonido marcial'}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            {/* Pantalla completa */}
            <button
              onClick={toggleFullscreen}
              style={{
                background: 'none',
                border: 'none',
                color: '#9FA6B8',
                cursor: 'pointer',
                padding: '0.4rem',
              }}
              title="Pantalla Completa"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>

        {/* Barra de Progreso Superior */}
        <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
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
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: 800,
                letterSpacing: '0.2em',
                color: '#D4AF37',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Comienza en breve • Hajime! (はじめ)
            </span>

            {/* Contador Regresivo Gigante */}
            <div
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '3px solid #D4AF37',
                boxShadow: '0 0 50px rgba(212, 175, 55, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4.5rem',
                fontWeight: 900,
                color: '#F5D77F',
                marginBottom: '2rem',
                animation: 'pulse 1s infinite',
              }}
            >
              {secondsRemaining}
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
              Primer Ejercicio: {currentStep?.exerciseName}
            </h2>

            <p style={{ color: '#9FA6B8', fontSize: '1.1rem', marginBottom: '2rem' }}>
              Objetivo: <strong>{currentStep?.targetQuantity} {currentStep?.targetUnit}</strong>
            </p>

            <button
              onClick={() => beginWorkPhase(currentStep)}
              className="btn-martial-primary"
              style={{ padding: '0.9rem 2.2rem', fontSize: '1rem', fontWeight: 800 }}
            >
              <Play size={18} /> ¡Comenzar Ahora!
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* PANTALLA: FASE DE TRABAJO ACTIVO (ACTIVE WORKOUT)                 */}
        {/* ================================================================= */}
        {workoutPhase === 'work' && currentStep && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '2rem 1.5rem',
              maxWidth: '850px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            {/* Cabecera del paso: Distintivo de Súper Serie o Serie Normal */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {currentStep.isLoop ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem 1.1rem',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.45)',
                    color: '#F5D77F',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '1rem',
                    boxShadow: '0 0 15px rgba(212, 175, 55, 0.15)',
                  }}
                >
                  <Zap size={16} />
                  <span>
                    {currentStep.loopName || 'Súper Serie'} • Ronda {currentStep.currentRound} de {currentStep.totalRounds} • Paso {currentStep.stepInRound} de {currentStep.totalStepsInRound}
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.35rem 0.9rem',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#E2E8F0',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                  }}
                >
                  <Layers size={14} color="#D4AF37" />
                  <span>Serie {currentStep.currentSet} de {currentStep.totalSets}</span>
                </div>
              )}

              {/* Nombre Gigante del Ejercicio */}
              <h1
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  margin: '0.3rem 0',
                  lineHeight: 1.15,
                  textShadow: '0 4px 15px rgba(0,0,0,0.8)',
                }}
              >
                {currentStep.exerciseName}
              </h1>

              {currentStep.exerciseNotes && (
                <p
                  style={{
                    color: '#F5D77F',
                    fontSize: '0.95rem',
                    maxWidth: '550px',
                    margin: '0.6rem auto 0',
                    fontStyle: 'italic',
                  }}
                >
                  💡 {currentStep.exerciseNotes}
                </p>
              )}
            </div>

            {/* Display Central: Temporizador o Conteo de Repeticiones */}
            <div style={{ textAlign: 'center', margin: 'auto 0' }}>
              {currentStep.targetUnit === 'segundos' ? (
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#9FA6B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Tiempo Restante
                  </span>
                  <div
                    style={{
                      fontSize: 'clamp(4.5rem, 12vw, 7.5rem)',
                      fontWeight: 900,
                      color: secondsRemaining <= 5 ? '#EF4444' : '#10B981',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1,
                      margin: '0.5rem 0',
                      textShadow: '0 0 40px rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    {formatTime(secondsRemaining)}
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#9FA6B8' }}>
                    Meta: {currentStep.targetQuantity} segundos de trabajo
                  </span>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: '0.88rem', color: '#9FA6B8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    Meta de Ejecución Técnica
                  </span>
                  <div
                    style={{
                      fontSize: 'clamp(4rem, 11vw, 6.5rem)',
                      fontWeight: 900,
                      color: '#F5D77F',
                      lineHeight: 1,
                      margin: '0.5rem 0',
                      textShadow: '0 0 35px rgba(212, 175, 55, 0.3)',
                    }}
                  >
                    {currentStep.targetQuantity}{' '}
                    <span style={{ fontSize: '2rem', fontWeight: 600, color: '#FFFFFF' }}>reps</span>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#9FA6B8' }}>
                    Ejecuta a tu ritmo técnico y pulsa &quot;Completar Serie&quot; al terminar
                  </span>
                </div>
              )}
            </div>

            {/* Preview del Siguiente Paso */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '0.85rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.74rem', color: '#9FA6B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  A continuación:
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                  {currentStepIndex + 1 < workoutSteps.length
                    ? workoutSteps[currentStepIndex + 1].exerciseName
                    : '🏁 ¡Final de la rutina!'}
                </span>
              </div>

              <span style={{ fontSize: '0.78rem', color: '#F5D77F', fontWeight: 600 }}>
                {currentStep.isEndOfLoopRound
                  ? `⚡ Pausa fin de vuelta: ${currentStep.restSecondsAfter}s`
                  : currentStep.restSecondsAfter > 0
                  ? `Pausa: ${currentStep.restSecondsAfter}s`
                  : 'Paso continuo'}
              </span>
            </div>

            {/* Botón Principal de Acción para el Atleta */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={completeCurrentExercise}
                className="btn-martial-primary"
                style={{
                  flex: 1,
                  padding: '1.25rem 2rem',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(212, 175, 55, 0.25)',
                }}
              >
                <CheckCircle size={24} />
                <span>
                  {currentStepIndex === workoutSteps.length - 1
                    ? '¡Finalizar Rutina!'
                    : '✓ Completar Serie y Descansar'}
                </span>
              </button>
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
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.15em',
                color: '#10B981',
                textTransform: 'uppercase',
                marginBottom: '0.8rem',
              }}
            >
              {currentStep.isEndOfLoopRound
                ? '⚡ ¡Vuelta Completada! Recuperación del Circuito'
                : 'Recuperación • Respira y Mantén Zanshin'}
            </span>

            <div
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '4px solid #10B981',
                boxShadow: '0 0 45px rgba(16, 185, 129, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2rem',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: '#9FA6B8', textTransform: 'uppercase' }}>
                Pausa
              </span>
              <div
                style={{
                  fontSize: '3.6rem',
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
                borderRadius: '12px',
                padding: '1.25rem 2rem',
                maxWidth: '450px',
                width: '100%',
                marginBottom: '2rem',
              }}
            >
              <span style={{ display: 'block', fontSize: '0.74rem', color: '#F5D77F', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                Prepárate para:
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.3rem' }}>
                {workoutSteps[currentStepIndex + 1]?.exerciseName}
              </h3>
              <span style={{ fontSize: '0.88rem', color: '#9FA6B8' }}>
                Meta: {workoutSteps[currentStepIndex + 1]?.targetQuantity} {workoutSteps[currentStepIndex + 1]?.targetUnit}
              </span>
            </div>

            {/* Controles de descanso */}
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={addExtraRest}
                style={{
                  padding: '0.75rem 1.4rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                +15 segundos
              </button>

              <button
                onClick={skipRestAndProceed}
                className="btn-martial-primary"
                style={{
                  padding: '0.75rem 1.8rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <SkipForward size={16} />
                <span>Omitir Descanso y Continuar</span>
              </button>
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                backgroundColor: 'rgba(212, 175, 55, 0.2)',
                border: '3px solid #F5D77F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F5D77F',
                margin: '0 auto 1.5rem',
                boxShadow: '0 0 45px rgba(212, 175, 55, 0.4)',
              }}
            >
              <Award size={46} />
            </div>

            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#D4AF37',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              Mokuso • Rei (礼)
            </span>

            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '0.5rem' }}>
              ¡Entrenamiento Completado!
            </h1>

            <p style={{ color: '#9FA6B8', fontSize: '1rem', maxWidth: '480px', marginBottom: '2rem' }}>
              Has finalizado exitosamente la rutina <strong style={{ color: '#F5D77F' }}>{activeWorkoutRoutine.title}</strong>. La constancia diaria forja el espíritu del karateka.
            </p>

            {/* Tarjetas de métricas del entrenamiento realizado */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                maxWidth: '520px',
                width: '100%',
                marginBottom: '2.5rem',
              }}
            >
              <div style={{ backgroundColor: '#0E0F14', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                <span style={{ fontSize: '0.72rem', color: '#9FA6B8', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
                  Tiempo Total
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F5D77F' }}>
                  {formatTime(totalElapsedSeconds)}
                </span>
              </div>

              <div style={{ backgroundColor: '#0E0F14', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                <span style={{ fontSize: '0.72rem', color: '#9FA6B8', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
                  Pasos / Series
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF' }}>
                  {workoutSteps.length}
                </span>
              </div>

              <div style={{ backgroundColor: '#0E0F14', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                <span style={{ fontSize: '0.72rem', color: '#9FA6B8', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
                  Disciplina
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10B981' }}>
                  100%
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => startWorkout(activeWorkoutRoutine)}
                style={{
                  padding: '0.85rem 1.6rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
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
                  padding: '0.85rem 2rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                }}
              >
                <span>Volver al Catálogo de Rutinas</span>
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
        padding: '2.5rem 1rem 5rem',
      }}
    >
      <div className="container-dojo" style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
          <div>
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

            <p style={{ color: '#9FA6B8', fontSize: '0.95rem', maxWidth: '650px', margin: 0, lineHeight: 1.5 }}>
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
          <div style={{ position: 'relative', maxWidth: '380px', width: '100%' }}>
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredRoutines.map((routine) => {
              const exCount = routine.exercises?.length || 0;
              const loopSet = new Set((routine.exercises || []).map((e) => e.loopId).filter(Boolean));
              const loopCount = loopSet.size;

              return (
                <div
                  key={routine.id || routine._id}
                  className="card-sumi"
                  style={{
                    backgroundColor: '#0E0F14',
                    border: '1px solid rgba(212, 175, 55, 0.22)',
                    borderRadius: '14px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.6)',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.22)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div>
                    {/* Header de la tarjeta */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        marginBottom: '0.85rem',
                      }}
                    >
                      {/* Duración */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(212, 175, 55, 0.12)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          color: '#F5D77F',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                      >
                        <Clock size={13} />
                        <span>~{routine.durationMinutes} minutos</span>
                      </span>

                      {/* Loops o Ejercicios */}
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {loopCount > 0 && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#F87171',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                            }}
                          >
                            <Zap size={11} /> {loopCount} Súper Serie{loopCount > 1 ? 's' : ''}
                          </span>
                        )}

                        <span
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: '#9FA6B8',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                          }}
                        >
                          {exCount} ejercicios
                        </span>
                      </div>
                    </div>

                    {/* Título de la rutina */}
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                      {routine.title}
                    </h3>

                    {/* Descripción */}
                    {routine.description && (
                      <p style={{ color: '#9FA6B8', fontSize: '0.85rem', lineHeight: 1.45, marginBottom: '1.1rem' }}>
                        {routine.description}
                      </p>
                    )}

                    {/* Lista previa de ejercicios */}
                    <div
                      style={{
                        padding: '0.75rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#F5D77F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Secuencia Planificada
                      </span>

                      {(routine.exercises || []).slice(0, 3).map((ex, idx) => (
                        <div
                          key={ex.id || idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.78rem',
                            color: '#CBD5E1',
                          }}
                        >
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '210px' }}>
                            {idx + 1}. {ex.name}
                          </span>
                          <span style={{ color: '#F5D77F', fontWeight: 600, flexShrink: 0 }}>
                            {ex.loopId
                              ? `${ex.loopRounds || 4}x ${ex.repsOrDurationValue || 12} ${ex.repsOrDurationUnit === 'segundos' ? 's' : 'r'}`
                              : `${ex.sets || 3}×${ex.repsOrDurationValue || 12} ${ex.repsOrDurationUnit === 'segundos' ? 's' : 'r'}`}
                          </span>
                        </div>
                      ))}

                      {exCount > 3 && (
                        <span style={{ fontSize: '0.72rem', color: '#9FA6B8', fontStyle: 'italic', marginTop: '0.1rem' }}>
                          + {exCount - 3} ejercicio{exCount - 3 > 1 ? 's' : ''} adicional{exCount - 3 > 1 ? 'es' : ''}...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones de la Tarjeta */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                      onClick={() => setPreviewRoutine(routine)}
                      style={{
                        padding: '0.65rem 0.9rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#E2E8F0',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Layers size={14} />
                      <span>Ver Desglose</span>
                    </button>

                    <button
                      onClick={() => startWorkout(routine)}
                      className="btn-martial-primary"
                      style={{
                        flex: 1,
                        padding: '0.65rem 1rem',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                        borderRadius: '8px',
                      }}
                    >
                      <Play size={15} />
                      <span>Iniciar Rutina</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODAL: VER DESGLOSE COMPLETO ANTES DE INICIAR                         */}
      {/* ===================================================================== */}
      {previewRoutine && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="card-sumi"
            style={{
              backgroundColor: '#0E0F14',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '14px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#D4AF37', fontWeight: 800, textTransform: 'uppercase' }}>
                  Desglose Detallado
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: '0.2rem 0' }}>
                  {previewRoutine.title}
                </h2>
                <span style={{ fontSize: '0.82rem', color: '#9FA6B8' }}>
                  Duración estimada: ~{previewRoutine.durationMinutes} min • Creado por {previewRoutine.createdBy || 'Sensei'}
                </span>
              </div>

              <button
                onClick={() => setPreviewRoutine(null)}
                style={{ background: 'none', border: 'none', color: '#9FA6B8', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {previewRoutine.description && (
              <p style={{ color: '#CBD5E1', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: 1.45 }}>
                {previewRoutine.description}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {(previewRoutine.exercises || []).map((ex, idx) => (
                <div
                  key={ex.id || idx}
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                        }}
                      >
                        {idx + 1}
                      </span>
                      <strong style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>{ex.name}</strong>
                      {ex.loopId && (
                        <span style={{ fontSize: '0.68rem', backgroundColor: 'rgba(212, 175, 55, 0.15)', color: '#F5D77F', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          ⚡ Súper Serie
                        </span>
                      )}
                    </div>

                    {ex.notes && (
                      <span style={{ fontSize: '0.76rem', color: '#9FA6B8', fontStyle: 'italic', display: 'block', marginTop: '0.2rem', paddingLeft: '1.8rem' }}>
                        💡 {ex.notes}
                      </span>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', color: '#F5D77F', fontWeight: 800, fontSize: '0.88rem' }}>
                      {ex.loopId
                        ? `${ex.loopRounds || 4} vueltas × ${ex.repsOrDurationValue || 12} ${ex.repsOrDurationUnit || 'reps'}`
                        : `${ex.sets || 3} series × ${ex.repsOrDurationValue || 12} ${ex.repsOrDurationUnit || 'reps'}`}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#9FA6B8' }}>
                      Descanso: {ex.restSeconds || 45}s
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPreviewRoutine(null)}
                style={{
                  padding: '0.65rem 1.2rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#9FA6B8',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>

              <button
                onClick={() => startWorkout(previewRoutine)}
                className="btn-martial-primary"
                style={{
                  padding: '0.65rem 1.6rem',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Play size={16} />
                <span>Comenzar Entrenamiento</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
