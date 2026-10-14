---
name: Ryūko Kai Design System
description: Sistema de diseño marcial japonés para la escuela de Karate Do Ryūko Kai
colors:
  primary: "#D4AF37"
  primary-light: "#F5D77F"
  dragon: "#EF4444"
  dragon-light: "#F87171"
  tiger: "#3B82F6"
  tiger-light: "#60A5FA"
  neutral-bg: "#0A0F1D"
  surface: "#111827"
  surface-card: "rgba(17, 24, 39, 0.88)"
  text-primary: "#FFFFFF"
  text-secondary: "#CBD5E1"
  text-muted: "#94A3B8"
typography:
  display:
    fontFamily: "var(--font-zen-kaku), system-ui, sans-serif"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "0.04em"
  body:
    fontFamily: "var(--font-zen-kaku), system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#08080A"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "rgba(212, 175, 55, 0.08)"
    textColor: "{colors.primary-light}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
---

## Overview

Ryūko Kai encarna la sobriedad, disciplina y poder del Karate Do tradicional y la alta competencia olímpica WKF. La estética visual se basa en el **Midnight Bushido** (fondos oscuros profundos inspirados en la noche japonesa y tinta Sumi-e), acentuado con oro marcial (`#D4AF37`), rojo dragón (`#EF4444`) y azul tigre (`#3B82F6`).

## Colors

- **Oro Marcial (Kogane - #D4AF37 / #F5D77F):** Representa honor, linaje y los grados de cinturón negro. Usado para botones principales, badges oficiales y focos de atención.
- **Rojo Dragón (Ryū - #EF4444):** Simboliza la velocidad, audacia táctica y el Kumite deportivo WKF.
- **Azul Tigre (Ko - #3B82F6):** Simboliza la fuerza enraizada, estabilidad y el Kata tradicional con su bunkai.
- **Midnight Bushido (#0A0F1D / #111827):** Superficies oscuras con atmósfera de tatami nocturno, nunca fondos negros planos sin profundidad.
- **Texto Primario (#FFFFFF) y Secundario (#CBD5E1):** Máximo contraste y legibilidad accesible.

## Typography

- **Fuente Principal:** *Zen Kaku Gothic New* (Google Fonts), tipografía japonesa moderna y geométrica con pesos desde 300 hasta 900.
- **Titulares:** Todo en mayúsculas (`uppercase`), peso 900 (*Black*), con espaciado entre letras sobrio (`tracking-tight` a `tracking-wider`).
- **Cuerpo de texto:** 400 (*Regular*), equilibrado, conciso y de fácil lectura.

## Layout

- **Filosofía de Pantalla Única:** La portada minimiza el scroll vertical. Todos los puntos clave de decisión se encuentran disponibles de inmediato.
- **Alineación:** Estructura centrada con paddings cuidados (`clamp(1.5rem, 5vw, 4.5rem)`).
- **Cuadrículas:** Grids de 3 columnas para los programas marciales y filas horizontales de 4 métricas para evitar pilas interminables.

## Elevation & Depth

- **Superficies Sumi-e:** Fondos translúcidos `rgba(15, 23, 42, 0.7)` a `rgba(17, 24, 39, 0.88)` con `backdrop-filter: blur(16px)`.
- **Bordes de Lujo:** Bordes de 1px con acentos de color (`rgba(212, 175, 55, 0.3)` o `rgba(255, 255, 255, 0.08)`).
- **Halos de Respiración:** Resplandores desenfocados (`blur-3xl`) que aportan vida y profundidad sin saturar.

## Shapes

- Radios redondeados suaves y contemporáneos (`12px` a `16px` para tarjetas, `9999px` para pills y badges de estado).
- Cero bordes puntiagudos agresivos; las formas transmiten precisión y control marcial.

## Components

- **Botón Primario:** Gradiente oro sutil, texto negro azabache, micro-elevación al hover.
- **Botón Secundario:** Fondo sutil translúcido, borde dorado y texto dorado claro.
- **Tarjetas de Programa:** Contenedores interactivos con kanjis de fondo a baja opacidad (10%) y acentos de color según la senda (Oro, Azul, Rojo).
- **Métricas:** Cifras en tipografía gigante con etiquetas en mayúsculas pequeñas.

## Do's and Don'ts

### Do's
- Mantener la portada directa y orientada a la acción rápida (probar clase / portal).
- Respetar el contraste accesible (mínimo 4.5:1).
- Utilizar iconos consistentes de `lucide-react` con trazo regular.
- Cuidar los paddings y la simetría central.

### Don'ts
- **No colocar patrocinadores en la página de inicio.**
- **No añadir muros de texto filosófico largo en la portada.**
- No usar sombras duras estilo cómic/neobrutalismo sin difuminado.
- No utilizar tipografías genéricas del sistema (Arial, Impact).
