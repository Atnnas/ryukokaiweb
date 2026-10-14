# Rediseño Integral Minimalista y Animaciones del Sitio Ryūko Kai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar todo el sitio web de Ryūko Kai en una experiencia visual premium, minimalista y fluida: protagonismo cinematográfico al logo oficial, cero textos saturados, paddings y espaciados armonizados, y micro-animaciones marciales refinadas en cada página.

**Architecture:** Establecer el motor de animación y espaciado consistente en `globals.css` (keyframes marciales, efectos de brillo, respiración de halo y elevación). Luego refactorizar y pulir sistemáticamente la portada (`src/app/page.tsx`), la cabecera (`Header.tsx`), el pie (`Footer.tsx`), y las tres páginas interiores clave (`/nosotros`, `/noticias`, `/contacto`).

**Tech Stack:** Next.js 15, React 19, Tailwind CSS, Lucide React, Google Font *Zen Kaku Gothic New*, Impeccable Design System.

**Spec:** `PRODUCT.md` y `DESIGN.md`.

## Global Constraints

- **Minimalismo en contenido:** Ninguna página debe tener textos interminables o párrafos densos. Priorizar impacto visual y escaneabilidad en segundos.
- **Sin patrocinadores en la portada:** La página de inicio permanece 100% limpia de menciones a sponsors.
- **Alineación y Paddings:** Todos los contenedores deben usar espaciados consistentes (`px-4 sm:px-6 lg:px-8` y `py-10 lg:py-16`) sin márgenes pegados o elementos asimétricos.
- **Animaciones fluidas:** Usar keyframes CSS optimizados por hardware (`transform`, `opacity`, `filter: blur`) sin afectar el rendimiento ni causar saltos de diseño (CLS = 0).

## Review Focus

1. **Desborde en móvil:** Verificar que los nuevos efectos de aura y los contenedores no causen scroll horizontal indeseado (`overflow-x: hidden`).
2. **Contraste de texto:** Asegurar que los textos sobre fondos oscuros o translúcidos superen el ratio 4.5:1 exigido por accesibilidad.
3. **Escalado del Logo:** En pantallas pequeñas el logo central debe adaptarse suavemente sin ocupar toda la altura del viewport.
4. **Interactividad táctil:** Botones y enlaces deben tener un área mínima de toque de 44x44px en móviles.
5. **Consistencia de temas:** Mantener estrictamente la tríada de color: Oro (#D4AF37), Rojo Dragón (#EF4444) y Azul Tigre (#3B82F6).

---

## Tasks

### Task 1: Motor de Animaciones y Tokens de Espaciado en `src/app/globals.css`

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: Clases de utilidad CSS: `.animate-float`, `.animate-glow-pulse`, `.animate-shimmer`, `.card-martial-interactive`, `.badge-gold`.

- [ ] **Step 1: Agregar keyframes de animación y utilidades en `src/app/globals.css`**
  - `@keyframes float-subtle`: suave balanceo vertical de 6px.
  - `@keyframes glow-pulse`: respiración de sombra dorada (`rgba(212, 175, 55, 0.4)`).
  - `@keyframes shimmer-slide`: barrido de brillo sobre tarjetas al hacer hover.
  - Ajustar padding responsivo de `.container-dojo` a escala armonizada.

- [ ] **Step 2: Verificar compilación CSS**
  - Run: `npx tsc --noEmit`
  - Expected: PASS (código 0).

---

### Task 2: Portada Showstopper: Emblema Central Protagonista y Tarjetas Interactivas (`src/app/page.tsx`)

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: Clases de `globals.css` (`animate-float`, `animate-glow-pulse`, `card-martial-interactive`).
- Produces: Página de inicio con logo imponente, micro-animaciones, texto mínimo y cero scroll en escritorio.

- [ ] **Step 1: Implementar el Emblema Central con aura multicapa y animaciones**
  - Envolver el logo oficial en un pedestal de círculos concéntricos con respiración dorada, kanji de fondo animado y flotación suave.
  - Mantener titular minimalista y solo 2 botones principales centrados.

- [ ] **Step 2: Estilizar las 3 tarjetas de programas con micro-interacciones**
  - Efecto de iluminación en bordes según color (Oro, Azul, Rojo).
  - Kanjis flotantes con escala al hover.
  - Barra inferior de métricas y acceso rápido a WhatsApp con micro-paddings perfectos.

- [ ] **Step 3: Verificar con el detector de Impeccable y ESLint**
  - Run: `npx eslint src/app/page.tsx`
  - Run: `.\.agents\skills\impeccable\scripts\impeccable.cmd detect src/app/page.tsx`
  - Expected: 0 errores.

---

### Task 3: Navegación Global y Cabecera Refinada (`src/components/layout/Header.tsx`)

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Interfaces:**
- Produces: Header con altura armónica, animación de logo al hover, líneas indicadoras doradas y menú móvil fluido.

- [ ] **Step 1: Pulir paddings y estados hover del menú**
  - Reducir paddings innecesarios para mayor ligereza.
  - Añadir transición de resplandor al logo del header.
  - Mejorar enlaces de navegación con indicadores activos elegantes.

- [ ] **Step 2: Verificar linting**
  - Run: `npx eslint src/components/layout/Header.tsx`
  - Expected: PASS.

---

### Task 4: Refactorización y Pulido de `/contacto` con Tarjetas Espaciosas

**Files:**
- Modify: `src/app/contacto/page.tsx`

**Interfaces:**
- Produces: Pantalla de contacto minimalista, sin estilos inline desordenados, con botón WhatsApp palpitante y horarios claros.

- [ ] **Step 1: Migrar estilos inline a Tailwind y `card-sumi`**
  - Limpiar encabezado, centrar elementos con espaciado generoso.
  - Tarjeta de WhatsApp con indicador online animado (punto verde pulsante).
  - Bloque de mapa y horarios limpio y espaciado.

- [ ] **Step 2: Verificar compilación y linting**
  - Run: `npx eslint src/app/contacto/page.tsx`
  - Expected: PASS.

---

### Task 5: Refactorización de `/nosotros` con Tarjetas de Linaje y Filosofía Compacta

**Files:**
- Modify: `src/app/nosotros/page.tsx`

**Interfaces:**
- Produces: Página de historia con diseño de tarjetas sumi-e, citas marciales elegantes y paddings calibrados.

- [ ] **Step 1: Transformar la página en módulos limpios y animados**
  - Eliminar estilos inline rígidos.
  - Crear bloques de historia, senseis y valores con espaciado uniforme.

- [ ] **Step 2: Verificar compilación**
  - Run: `npx eslint src/app/nosotros/page.tsx`
  - Expected: PASS.

---

### Task 6: Refactorización de `/noticias` y Pie de Página (`Footer.tsx`)

**Files:**
- Modify: `src/app/noticias/page.tsx`
- Modify: `src/components/layout/Footer.tsx`

**Interfaces:**
- Produces: Feed de noticias con tarjetas dinámicas con hover y pie de página sobrio.

- [ ] **Step 1: Optimizar tarjetas de noticias y filtros**
  - Mejorar separación de grid, chips de categoría interactivos y animación sutil en el botón de me gusta.

- [ ] **Step 2: Pulir paddings y alineación en `Footer.tsx`**
  - Asegurar márgenes y bordes consistentes con el diseño de Impeccable.

- [ ] **Step 3: Verificación final de todo el proyecto**
  - Run: `npx tsc --noEmit`
  - Run: `npm run lint`
  - Run: `.\.agents\skills\impeccable\scripts\impeccable.cmd detect src/app/page.tsx`
  - Expected: Todo pasando en verde.
