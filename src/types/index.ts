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

export interface ExerciseItem {
  id: string;
  name: string;
  sets?: number;
  reps?: string; // Ej: "15 reps", "45 seg", "Al fallo", "3 vueltas"
  restSeconds?: number; // Descanso en segundos
  notes?: string;
}

export interface ExerciseCatalogItem {
  id?: string;
  _id?: string;
  name: string;
  defaultSets?: number;
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
