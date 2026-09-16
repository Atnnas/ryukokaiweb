/**
 * Motor oficial de cálculo de categorías WKF (World Karate Federation)
 * Determina la categoría de Kata y Kumite según la fecha de nacimiento (edad), peso y género.
 */

export interface WKFCategoryResult {
  age: number;
  kataCategory: string;
  kumiteCategory: string;
  beltColor: string;
  beltName: string;
}

// Opciones oficiales de Kyu (Grados de Aprendiz del 10° al 1°)
export const KYU_RANKS = [
  '10° Kyu',
  '9° Kyu',
  '8° Kyu',
  '7° Kyu',
  '6° Kyu',
  '5° Kyu',
  '4° Kyu',
  '3° Kyu',
  '2° Kyu',
  '1° Kyu',
] as const;

// Opciones oficiales de Dan (Cintas Negras del 1° al 10°)
export const DAN_RANKS = [
  '1° Dan',
  '2° Dan',
  '3° Dan',
  '4° Dan',
  '5° Dan',
  '6° Dan',
  '7° Dan',
  '8° Dan',
  '9° Dan',
  '10° Dan',
] as const;

export const ALL_RANKS = [...KYU_RANKS, ...DAN_RANKS];

/**
 * Deducción automática del color y nombre de cinta tradicional a partir del Kyu / Dan
 */
export function deriveBeltFromKyuDan(kyuDan?: string): { beltName: string; beltColor: string } {
  if (!kyuDan) return { beltName: 'Cinturón Blanco', beltColor: '#FFFFFF' };
  const lower = kyuDan.toLowerCase();

  if (lower.includes('dan')) {
    return { beltName: 'Cinturón Negro', beltColor: '#000000' };
  }
  if (lower.includes('10°') || lower.includes('10 ')) {
    return { beltName: 'Cinturón Blanco', beltColor: '#FFFFFF' };
  }
  if (lower.includes('9°') || lower.includes('9 ')) {
    return { beltName: 'Cinturón Blanco / Amarillo', beltColor: '#FEF08A' };
  }
  if (lower.includes('8°') || lower.includes('8 ')) {
    return { beltName: 'Cinturón Amarillo', beltColor: '#FACC15' };
  }
  if (lower.includes('7°') || lower.includes('7 ')) {
    return { beltName: 'Cinturón Naranja', beltColor: '#FB923C' };
  }
  if (lower.includes('6°') || lower.includes('6 ')) {
    return { beltName: 'Cinturón Verde', beltColor: '#22C55E' };
  }
  if (lower.includes('5°') || lower.includes('5 ')) {
    return { beltName: 'Cinturón Azul', beltColor: '#3B82F6' };
  }
  if (lower.includes('4°') || lower.includes('4 ')) {
    return { beltName: 'Cinturón Púrpura', beltColor: '#A855F7' };
  }
  if (lower.includes('3°') || lower.includes('2°') || lower.includes('1°')) {
    return { beltName: 'Cinturón Marrón', beltColor: '#854D0E' };
  }
  return { beltName: 'Cinturón Blanco', beltColor: '#FFFFFF' };
}

/**
 * Calcular edad exacta en años a partir de una fecha de nacimiento (YYYY-MM-DD)
 */
export function calculateAge(birthDateString?: string): number {
  if (!birthDateString) return 0;
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Calcular categorías oficiales de la WKF (World Karate Federation)
 */
export function calculateWKFCategories(params: {
  birthDate?: string;
  weight?: number;
  gender?: 'male' | 'female';
  kyuDan?: string;
}): WKFCategoryResult {
  const { birthDate, weight = 0, gender = 'male', kyuDan } = params;
  const age = calculateAge(birthDate);
  const isFemale = gender === 'female';
  const rama = isFemale ? 'Femenino' : 'Masculino';

  const { beltName, beltColor } = deriveBeltFromKyuDan(kyuDan);

  if (!birthDate || age === 0) {
    return {
      age: 0,
      kataCategory: 'Pendiente fecha de nacimiento',
      kumiteCategory: 'Pendiente datos WKF',
      beltName,
      beltColor,
    };
  }

  // 1. CÁLCULO DE CATEGORÍA DE KATA WKF POR EDAD
  let kataCategory = '';
  if (age < 10) {
    kataCategory = `Kata Infantil Menor (<10 años) ${rama}`;
  } else if (age >= 10 && age <= 11) {
    kataCategory = `Kata U12 (10 - 11 años) ${rama}`;
  } else if (age >= 12 && age <= 13) {
    kataCategory = `Kata U14 (12 - 13 años) ${rama}`;
  } else if (age >= 14 && age <= 15) {
    kataCategory = `Kata Cadete (14 - 15 años) ${rama}`;
  } else if (age >= 16 && age <= 17) {
    kataCategory = `Kata Junior (16 - 17 años) ${rama}`;
  } else if (age >= 18 && age <= 20) {
    kataCategory = `Kata Sub-21 (18 - 20 años) ${rama}`;
  } else if (age >= 35) {
    kataCategory = `Kata Master / Veteranos (+35 años) ${rama}`;
  } else {
    // 21 a 34 años
    kataCategory = `Kata Senior Oficial (+18 años) ${rama}`;
  }

  // 2. CÁLCULO DE CATEGORÍA DE KUMITE WKF POR EDAD, GÉNERO Y PESO
  let kumiteCategory = '';
  const w = Number(weight) || 0;

  if (w <= 0) {
    kumiteCategory = `Kumite WKF (${age} años ${rama}, peso pendiente)`;
  } else if (age < 10) {
    if (isFemale) {
      if (w <= 28) kumiteCategory = `Kumite Infantil Fem. -28 kg`;
      else if (w <= 32) kumiteCategory = `Kumite Infantil Fem. -32 kg`;
      else kumiteCategory = `Kumite Infantil Fem. +32 kg`;
    } else {
      if (w <= 30) kumiteCategory = `Kumite Infantil Masc. -30 kg`;
      else if (w <= 35) kumiteCategory = `Kumite Infantil Masc. -35 kg`;
      else kumiteCategory = `Kumite Infantil Masc. +35 kg`;
    }
  } else if (age >= 10 && age <= 11) {
    // U12
    if (isFemale) {
      if (w <= 32) kumiteCategory = `Kumite U12 Femenino -32 kg`;
      else if (w <= 37) kumiteCategory = `Kumite U12 Femenino -37 kg`;
      else if (w <= 42) kumiteCategory = `Kumite U12 Femenino -42 kg`;
      else kumiteCategory = `Kumite U12 Femenino +42 kg`;
    } else {
      if (w <= 35) kumiteCategory = `Kumite U12 Masculino -35 kg`;
      else if (w <= 40) kumiteCategory = `Kumite U12 Masculino -40 kg`;
      else if (w <= 45) kumiteCategory = `Kumite U12 Masculino -45 kg`;
      else kumiteCategory = `Kumite U12 Masculino +45 kg`;
    }
  } else if (age >= 12 && age <= 13) {
    // U14
    if (isFemale) {
      if (w <= 42) kumiteCategory = `Kumite U14 Femenino -42 kg`;
      else if (w <= 47) kumiteCategory = `Kumite U14 Femenino -47 kg`;
      else if (w <= 52) kumiteCategory = `Kumite U14 Femenino -52 kg`;
      else kumiteCategory = `Kumite U14 Femenino +52 kg`;
    } else {
      if (w <= 40) kumiteCategory = `Kumite U14 Masculino -40 kg`;
      else if (w <= 45) kumiteCategory = `Kumite U14 Masculino -45 kg`;
      else if (w <= 50) kumiteCategory = `Kumite U14 Masculino -50 kg`;
      else if (w <= 55) kumiteCategory = `Kumite U14 Masculino -55 kg`;
      else kumiteCategory = `Kumite U14 Masculino +55 kg`;
    }
  } else if (age >= 14 && age <= 15) {
    // Cadete WKF Oficial
    if (isFemale) {
      if (w <= 47) kumiteCategory = `Kumite Cadete Femenino -47 kg`;
      else if (w <= 54) kumiteCategory = `Kumite Cadete Femenino -54 kg`;
      else if (w <= 61) kumiteCategory = `Kumite Cadete Femenino -61 kg`;
      else kumiteCategory = `Kumite Cadete Femenino +61 kg`;
    } else {
      if (w <= 52) kumiteCategory = `Kumite Cadete Masculino -52 kg`;
      else if (w <= 57) kumiteCategory = `Kumite Cadete Masculino -57 kg`;
      else if (w <= 63) kumiteCategory = `Kumite Cadete Masculino -63 kg`;
      else if (w <= 70) kumiteCategory = `Kumite Cadete Masculino -70 kg`;
      else kumiteCategory = `Kumite Cadete Masculino +70 kg`;
    }
  } else if (age >= 16 && age <= 17) {
    // Junior WKF Oficial
    if (isFemale) {
      if (w <= 48) kumiteCategory = `Kumite Junior Femenino -48 kg`;
      else if (w <= 53) kumiteCategory = `Kumite Junior Femenino -53 kg`;
      else if (w <= 59) kumiteCategory = `Kumite Junior Femenino -59 kg`;
      else if (w <= 66) kumiteCategory = `Kumite Junior Femenino -66 kg`;
      else kumiteCategory = `Kumite Junior Femenino +66 kg`;
    } else {
      if (w <= 55) kumiteCategory = `Kumite Junior Masculino -55 kg`;
      else if (w <= 61) kumiteCategory = `Kumite Junior Masculino -61 kg`;
      else if (w <= 68) kumiteCategory = `Kumite Junior Masculino -68 kg`;
      else if (w <= 76) kumiteCategory = `Kumite Junior Masculino -76 kg`;
      else kumiteCategory = `Kumite Junior Masculino +76 kg`;
    }
  } else if (age >= 18 && age <= 20) {
    // Sub-21 WKF Oficial
    if (isFemale) {
      if (w <= 50) kumiteCategory = `Kumite Sub-21 Femenino -50 kg`;
      else if (w <= 55) kumiteCategory = `Kumite Sub-21 Femenino -55 kg`;
      else if (w <= 61) kumiteCategory = `Kumite Sub-21 Femenino -61 kg`;
      else if (w <= 68) kumiteCategory = `Kumite Sub-21 Femenino -68 kg`;
      else kumiteCategory = `Kumite Sub-21 Femenino +68 kg`;
    } else {
      if (w <= 60) kumiteCategory = `Kumite Sub-21 Masculino -60 kg`;
      else if (w <= 67) kumiteCategory = `Kumite Sub-21 Masculino -67 kg`;
      else if (w <= 75) kumiteCategory = `Kumite Sub-21 Masculino -75 kg`;
      else if (w <= 84) kumiteCategory = `Kumite Sub-21 Masculino -84 kg`;
      else kumiteCategory = `Kumite Sub-21 Masculino +84 kg`;
    }
  } else if (age >= 35) {
    // Master / Veteranos
    if (isFemale) {
      if (w <= 60) kumiteCategory = `Kumite Master Femenino -60 kg`;
      else kumiteCategory = `Kumite Master Femenino +60 kg`;
    } else {
      if (w <= 75) kumiteCategory = `Kumite Master Masculino -75 kg`;
      else kumiteCategory = `Kumite Master Masculino +75 kg`;
    }
  } else {
    // Senior Oficial (+18 / 21-34 años)
    if (isFemale) {
      if (w <= 50) kumiteCategory = `Kumite Senior Femenino -50 kg`;
      else if (w <= 55) kumiteCategory = `Kumite Senior Femenino -55 kg`;
      else if (w <= 61) kumiteCategory = `Kumite Senior Femenino -61 kg`;
      else if (w <= 68) kumiteCategory = `Kumite Senior Femenino -68 kg`;
      else kumiteCategory = `Kumite Senior Femenino +68 kg`;
    } else {
      if (w <= 60) kumiteCategory = `Kumite Senior Masculino -60 kg`;
      else if (w <= 67) kumiteCategory = `Kumite Senior Masculino -67 kg`;
      else if (w <= 75) kumiteCategory = `Kumite Senior Masculino -75 kg`;
      else if (w <= 84) kumiteCategory = `Kumite Senior Masculino -84 kg`;
      else kumiteCategory = `Kumite Senior Masculino +84 kg`;
    }
  }

  return {
    age,
    kataCategory,
    kumiteCategory,
    beltName,
    beltColor,
  };
}
