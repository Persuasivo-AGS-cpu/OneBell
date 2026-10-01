# Plan de Arquitectura y Navegación TV para Amazon Silk (Fire TV) en OneBell

Este documento analiza la problemática de navegación con el control remoto D-Pad de **Fire TV (navegador Amazon Silk)** en las pantallas de **Calendario, Progreso, Programas y Perfil**, y propone la estrategia de diseño y lógica de navegación espacial para hacer toda la aplicación 100% navegable sin mouse ni pantalla táctil.

---

## 1. Análisis del Problema en Amazon Silk & Fire TV

### A. Limitaciones del Navegador Amazon Silk y Control D-Pad
* **Ausencia de Puntero / Touch**: El navegador Silk en Fire TV funciona mediante eventos de teclado emitidos por el control remoto D-Pad (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Enter`, `Escape`/`Backspace`).
* **Columnas y Scroll Vertical Móvil**: Las pantallas de Calendario, Progreso, Programas y Perfil están diseñadas para celulares en orientación vertical con scroll continuo (`overflow-y-auto`). En la televisión a 3 metros de distancia:
  * El usuario no sabe qué elemento tiene el foco si no hay un indicador de alta visibilidad.
  * Los botones pequeños del calendario (11px de letra) son ilegibles e imposibles de seleccionar con precisión.
  * El scroll vertical falla si los elementos fuera de pantalla no reciben foco automático ni se desplazan al centro de la visión.

---

## 2. Estrategia de Solución y Lógica de Navegación

### A. Principios Universales para Modo TV
1. **Layouts de Pantalla Completa sin Scroll Vertical (16:9 Viewport 100vh)**:
   * Rediseñar cada pantalla en Modo TV para que quepa exactamente en `100vh` utilizando estructuras de 2 o 3 columnas y carruseles horizontales.
2. **Motor de Navegación Espacial Optimizado (`src/lib/spatial-nav.ts`)**:
   * Asegurar que **TODOS** los elementos interactivos tengan `tabIndex={0}` o tag `<button>`.
   * En cada pulsación de flecha, calcular vectorialmente el vecino más cercano en la dirección seleccionada.
   * Auto-scroll suave de elementos enfocados (`scrollIntoView({ block: 'nearest', inline: 'nearest' })`).
   * Manejo estandarizado de la tecla **Atrás** (Backspace/Escape) para regresar a la pantalla anterior o cerrar modales.
3. **Indicador de Foco Visual de Alta Visibilidad**:
   * Anillo resplandeciente en color naranja acento `#FF5A1F` con elevación (`scale-105` y sombra brillante).
4. **Regla de los 3 Metros (Tamaños Mínimos)**:
   * Títulos: 36px - 48px.
   * Texto de tarjetas y botones: 20px - 28px.
   * Botones de acción principal: mínimo 64px de alto.

---

## 3. Rediseño Pantalla por Pantalla para TV

### 📅 A. Calendario (`TvCalendar.tsx`)
* **Problema Actual**: Rejilla de 7 columnas por semana con botones diminutos (64x64px) y texto de 11px.
* **Solución TV (2 Columnas / Carrusel Semanal)**:
  * **Panel Izquierdo (Rejilla Semanal de TV)**: Muestra la semana actual en tarjetas cuadradas grandes (80x80px) con número de día grande (24px) y etiqueta de tipo (16px). Botones de "Semana Anterior" y "Semana Siguiente" accesibles con D-Pad.
  * **Panel Derecho (Detalle del Día Seleccionado)**: Al seleccionar un día con `Enter`, muestra la descripción completa, dosis de ejercicios y los botones de acción ("Ver Sesión de Hoy", "Marcar como Hecho") en fuente gigante de 24px+.

### 📈 B. Progreso (`TvProgress.tsx`)
* **Problema Actual**: Tarjeta vertical con gráfica estrecha y lista de sesiones pasadas.
* **Solución TV (2 Columnas)**:
  * **Columna Izquierda (Prueba OneBell & Estado)**: Muestra el peso de la prueba actual en número masivo (60px), estado de la prueba y botón gigante "Hacer la Prueba".
  * **Columna Derecho (Última Sesión & Biblioteca)**: Lista en tarjetas grandes de los ejercicios y calificaciones de la última sesión + botón directo a la Biblioteca de Ejercicios.

### 🏋️ C. Programas (`TvPrograms.tsx`)
* **Problema Actual**: Lista vertical de tarjetas de programas.
* **Solución TV (Carrusel Horizontal / 2 Columnas)**:
  * **Panel Izquierdo**: Carrusel horizontal o rejilla de tarjetas de programas navegables con `Left`/`Right`.
  * **Panel Derecho**: Vista detallada del programa seleccionado (días de fuerza, acondicionamiento, movilidad, meta) con selector de fecha de inicio y botón "Armar mi calendario".

### ⚙️ D. Perfil (`TvProfile.tsx`)
* **Problema Actual**: Formulario vertical largo con inputs y selecciones apiladas.
* **Solución TV (2 Columnas)**:
  * **Columna Izquierda**: Campo de nombre, selector de pesas en tarjetas grandes, nivel de experiencia.
  * **Columna Derecha**: Espacio de entrenamiento, zonas a cuidar, voz, interruptor de Modo TV y botón de Reinicio.

---

## 4. Plan de Desarrollo Propuesto

1. **Fase 1: Mejoras al Motor de Navegación Espacial (`spatial-nav.ts`)**
   - Asegurar soporte completo para Amazon Silk en Fire TV (mapeo de teclas y scroll automático al enfocar).
2. **Fase 2: Componentes TV para Calendario y Progreso (`TvCalendar.tsx`, `TvProgress.tsx`)**
   - Implementar vistas adaptativas de 2 columnas para Calendario y Progreso.
3. **Fase 3: Componentes TV para Programas y Perfil (`TvPrograms.tsx`, `TvProfile.tsx`)**
   - Adaptar las pantallas de selección de programa y ajustes de perfil a layout 16:9 estático.
4. **Fase 4: Pruebas y Compilación**
   - Ejecutar `npx tsc -p .` y `npm test`.
   - Probar la navegación espacial con teclado (D-Pad) en todas las pantallas.
