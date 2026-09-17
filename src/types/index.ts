export type UserRole = 'administrator' | 'editor' | 'viewer' | 'student';
export type UserStatus = 'active' | 'pending' | 'blocked';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  belt?: string;
  beltColor?: string;
  kyuDan: string; // Ej: '9° Kyu' o '1° Dan'
  birthDate?: string; // Fecha de nacimiento YYYY-MM-DD
  weight?: number; // Peso corporal en kilogramos (kg)
  gender?: 'male' | 'female'; // Rama deportiva WKF (Masculino / Femenino)
  age?: number; // Edad calculada
  kataCategory?: string; // Categoría oficial WKF Kata
  kumiteCategory?: string; // Categoría oficial WKF Kumite
  role: UserRole;
  status: UserStatus;
  joinedDate: string;
  classesAttended: number;
  approvedAt?: string;
  approvedBy?: string;
  lastLogin?: string | Date;
}

export type SocialPlatform = 'instagram' | 'facebook' | 'youtube' | 'official';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  platform: SocialPlatform;
  category: 'torneo' | 'examen' | 'seminario' | 'comunidad';
  date: string;
  author: string;
  socialHandle: string;
  url: string;
  likes: number;
  commentsCount: number;
  featured?: boolean;
  tags: string[];
}

export interface Discipline {
  id: string;
  title: string;
  subtitle: string;
  kanji: string;
  description: string;
  ageRange: string;
  intensity: 'Media' | 'Media - Alta' | 'Alta' | 'Competición';
  features: string[];
  scheduleSnippet: string;
  badgeColor: 'ying' | 'yang' | 'neutral';
}

export interface ScheduleClass {
  id: string;
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';
  time: string;
  title: string;
  level: 'Todos los niveles' | 'Infantil' | 'Principiantes' | 'Avanzados / Cintas Negras' | 'Kumite Deportivo';
  instructor: string;
  tag: 'ying' | 'yang' | 'neutral';
}

export type SponsorTier = 'oro' | 'plata' | 'bronce';
export type SponsorStatus = 'active' | 'expired' | 'pending';

export interface Sponsor {
  id?: string;
  _id?: string;
  name: string;
  logo: string; // URL o Base64 Data URI cargado directamente desde el dispositivo
  contractStart?: string;
  contractExpiry: string; // Fecha de vigencia de contrato (YYYY-MM-DD)
  tier: SponsorTier; // oro | plata | bronce
  websiteUrl?: string;
  phone?: string; // Número de teléfono o WhatsApp de contacto
  notes?: string;
  status?: SponsorStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type ExerciseMeasureUnit = 'repeticiones' | 'segundos';

export interface ExerciseItem {
  id: string;
  name: string;
  sets?: number;
  repsOrDurationValue?: number; // Solo el número (ej: 15, 30, 45)
  repsOrDurationUnit?: ExerciseMeasureUnit; // 'repeticiones' | 'segundos'
  reps?: string; // Campo auxiliar
  restSeconds?: number; // Descanso en segundos
  notes?: string;

  // Control de Súper Serie / Circuito (Loop)
  loopId?: string; // ID único del loop al que pertenece (ej: "loop-1726512345-1")
  loopName?: string; // Nombre descriptivo (ej: "Súper Serie 1", "Circuito A")
  loopRounds?: number; // Cantidad de rondas/vueltas del loop completo (ej: 3, 4)
  loopRestBetweenRounds?: number; // Descanso en segundos al terminar toda la vuelta del loop (ej: 60s)
}

export interface ExerciseCatalogItem {
  id?: string;
  _id?: string;
  name: string;
  defaultSets?: number;
  defaultRepsOrDurationValue?: number;
  defaultRepsOrDurationUnit?: ExerciseMeasureUnit;
  defaultReps?: string;
  defaultRestSeconds?: number;
  defaultNotes?: string;
  createdAt?: string | Date;
}

export interface Routine {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  durationMinutes: number; // Duración estimada en minutos
  exercises: ExerciseItem[];
  createdBy?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface WorkoutLog {
  id?: string;
  _id?: string;
  userEmail: string;
  userName?: string;
  routineId: string;
  routineTitle: string;
  durationSeconds: number;
  stepsCompleted: number;
  totalSteps: number;
  completedAt: string | Date;
}

export interface WorkoutStats {
  streak: number;
  consecutiveDays: number;
  isStreakActive: boolean;
  daysNeededForStreak: number;
  restDaysAvailable: number;
  restDaysUsed: number;
  daysUntilNextRestDay: number;
  statusMessage: string;
  totalWorkouts: number;
  totalMinutes: number;
  monthWorkouts: number;
}
