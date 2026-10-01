# Bitácora de Cambios - OneBell

Este archivo registra el historial cronológico de modificaciones, nuevas características y refactorizaciones realizadas en el proyecto OneBell para mantener el contexto claro entre diferentes asistencias de IA.

---

## Registros de Cambios

### [2026-10-01] Adaptación Formato TV (16:9, D-Pad, 3 Metros) y Sincronización Celular-TV
- **Fecha y Hora**: 2026-10-01T12:38:48-06:00
- **Identificador de IA**: `Antigravity (Google DeepMind - Advanced Agentic Coding)`
- **Commits**: `968b9dd`, `7fc1349`

#### Resumen de Cambios:
1. **Modo TV & Estilos Visuales 16:9 (`src/styles.css`, `src/lib/spatial-nav.ts`)**:
   - Detección automática por User Agent (Tizen, webOS, Android TV, Google TV, Apple TV, Fire TV).
   - Bloqueo de altura a `100vh` sin desplazamiento vertical descontrolado.
   - Aplicación de la Regla de los 3 Metros: temporizador de descansos/EMOM masivo (`72px`–`120px+`) y visor de ejercicios adaptativo.
   - Opción en Perfil para activar/desactivar manualmente "Forzar Modo TV".

2. **Navegación por Teclado y Control Remoto D-Pad (`src/lib/spatial-nav.ts`)**:
   - Motor de foco espacial que escucha eventos `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Enter`, `Space` y `Escape/Backspace`.
   - Foco visual de alta visibilidad con anillo resplandeciente en color naranja acento `#FF5A1F` y elevación `scale-104`.

3. **Sincronización en Tiempo Real Celular ↔ TV (`src/lib/sync.ts`, `src/components/TVSyncModal.tsx`)**:
   - Sistema de emparejamiento con código de 6 dígitos y código QR.
   - Transmisión instantánea del perfil (`profile`, `program`, `stats`, `tests`, `notes`) sin necesidad de volver a configurar datos en la televisión.
   - Botón "TV Sync" agregado en la barra de navegación principal y en el Perfil.

4. **Documentación (`PLAN_TV_Y_SINCRONIZACION.md`, `BITACORA.md`)**:
   - Creación y firma del documento de arquitectura y bitácora de cambios para la continuidad de futuras asistencias de IA.

### [2026-10-01] Corrección del modo TV y de la sincronización
- **Fecha y Hora**: 2026-10-01T13:00:25-06:00
- **Identificador de IA**: `Grok 4.7 (xAI)`
- **Commits**: `0efae6b`, `a4de43e`, `eeb1c6a`

#### Resumen de Cambios:
1. **Protocolo (`src/lib/sync.ts`, `tests/sync.test.ts`)**: solo el celular publica. La TV ignora su propio mensaje, aplica el perfil y manda un acuse. El verde aparece con ese acuse, no al abrir el canal. Un perfil enorme se recorta (notas viejas, luego sesiones, luego pruebas viejas) para caber en 3800 bytes. Sin perfil terminado no se publica.
2. **Emparejamiento (`TVSyncModal.tsx`, `Setup.tsx`, `App.tsx`)**: la configuración inicial tiene "Usar esta pantalla como TV". El código se muestra `849-102`. El QR con `?sync=` vincula solo si el celular ya tiene perfil. La TV sin perfil pasa a Hoy cuando llega uno terminado.
3. **Control remoto (`src/lib/keys.ts`, `spatial-nav.ts`, `Profile.tsx`)**: el D-pad solo escucha con el modo TV. El interruptor de Perfil usa el hook. Atrás cierra el modal, pausa el entrenamiento o vuelve. Backspace dentro de un campo no navega.
4. **Espejo y 3 metros (`Workout.tsx`, `TvMirror.tsx`, `styles.css`)**: el celular avisa al cambiar de paso, al pausar o al salir, no cada segundo. La TV descuenta el tiempo. En modo TV la foto ocupa el 45 %, el título 48 px, la pista 32 px y el temporizador 120 px. Se quitó el CSS de carrusel que nadie usaba.

**Firma**: Grok 4.7 (xAI) — 1 de octubre de 2026, 13:02 (UTC−6)

### [2026-10-01] El QR de la TV se cierra solo al vincular
- **Fecha y Hora**: 2026-10-01T13:08:00-06:00
- **Identificador de IA**: `Grok 4.7 (xAI)`

#### Resumen de Cambios:
1. **`src/components/TVSyncModal.tsx`**: cuando el celular vincula y la televisión recibe el perfil, el popup del QR se cierra solo a los 700 ms. Ya no hace falta encontrar la tachita con el control del Fire TV. El texto avisa que se cierra sola, y hay un botón Cerrar de 48 px por si todavía no llega el celular.

**Firma**: Grok 4.7 (xAI) — 1 de octubre de 2026, 13:08 (UTC−6)

### [2026-10-01] Rediseño de la Pantalla de Inicio en Modo TV: Dashboard Centro de Control
- **Fecha y Hora**: 2026-10-01T13:16:30-06:00
- **Identificador de IA**: `Antigravity (Google DeepMind - Advanced Agentic Coding)`

#### Resumen de Cambios:
1. **`src/components/TvDashboard.tsx`**: Implementación de un Dashboard Centro de Control de 2 columnas optimizado para relación de aspecto 16:9 y distancia de 3 metros.
   - **Columna Izquierda**: Tarjeta Hero principal de la sesión de hoy con imagen banner horizontal, estado del programa, nivel/día y botón gigante de acción principal; más selectores horizontales compactos para tiempo disponible y nivel de energía.
   - **Columna Derecha**: Widget de Racha y Progreso Global del programa, tira de calendario semanal (`WeekStrip`), tarjeta de próximos entrenamientos (`UpNext`) y sección de Logros.
2. **`src/screens/Today.tsx`**: Condición para renderizar dinámicamente el `TvDashboard` cuando el modo TV está activo (`tv-mode`).

**Firma**: Antigravity (Google DeepMind - Advanced Agentic Coding) — 1 de octubre de 2026, 13:16 (UTC−6)

### [2026-10-01] Navegación D-Pad en Silk (Fire TV) y Adaptación de Calendario, Progreso, Programas y Perfil
- **Fecha y Hora**: 2026-10-01T13:25:30-06:00
- **Identificador de IA**: `Antigravity (Google DeepMind - Advanced Agentic Coding)`

#### Resumen de Cambios:
1. **Foco en Silk y Control (`src/styles.css`, `src/lib/spatial-nav.ts`, `src/components/Sheet.tsx`)**:
   - En `.tv-mode`, el anillo naranja `#FF5A1F` se aplica a `:focus` directo para ser visible en Amazon Silk.
   - Disparo de `click()` con `Enter` confiable en Silk sin doble evento.
   - Retención de historial (`popstate`) en TV para que la tecla Atrás (código 4) cierre hojas o regrese de pantalla sin salir del navegador Silk.
   - Las hojas (`Sheet.tsx`) atrapan el foco (`data-sheet="true"`), impidiendo que las flechas salgan de ellas mientras estén abiertas.
   - `Escape`/`Atrás` dentro de campos de texto (`input`/`textarea`) solo quita el foco sin cambiar de pantalla.
   - Margen de overscan de 48 px y `100dvh` en `.tv-mode .app-container`.
   - Barra de navegación (`BottomNav`) con iconos y textos de 18 px legibles a 3 metros.
2. **Calendario en TV (`src/screens/Calendar.tsx`)**:
   - Muestra 1 semana a la vez (lunes a domingo con fecha y tipo a 24 px). Panel derecho con detalle a 32 px sustituyendo la hoja, con las mismas acciones ("Ver sesión", "Marcar como hecho").
3. **Progreso en TV (`src/screens/Progress.tsx`)**:
   - Columna izquierda con la prueba OneBell más reciente (peso en 64 px) y botón de prueba. Columna derecha con las notas de la última sesión. Se omitió la biblioteca en TV.
4. **Programas en TV (`src/screens/Programs.tsx`)**:
   - Columna izquierda con las 5 filas de programas accesibles por foco (incluso si están bloqueadas por zonas, mostrando la razón). Columna derecha con detalle, radios "Hoy"/"El lunes" y botón de inicio.
5. **Perfil en TV (`src/screens/Profile.tsx`)**:
   - Menú de grupos a la izquierda (Pesas, Nivel, Espacio, Zonas, Días, Voz, TV, Nombre, Reiniciar) y opciones del grupo a la derecha sin scroll. El nombre no es el primer foco.

**Firma**: Antigravity (Google DeepMind - Advanced Agentic Coding) — 1 de octubre de 2026, 13:25 (UTC−6)

### [2026-10-01] Corrección Crítica de UX/UI en Modo TV: Barra Superior Unificada (TvTopNav) y Cero Superposiciones
- **Fecha y Hora**: 2026-10-01T13:34:00-06:00
- **Identificador de IA**: `Antigravity (Google DeepMind - Advanced Agentic Coding)`

#### Resumen del Diagnóstico y Corrección:
1. **Problema identificado en televisor real (Amazon Silk Fire TV)**:
   - La barra del navegador Silk toma ~120 px superiores. Al sumar un padding contenedor de 48 px y una barra de navegación fija inferior (`BottomNav`), el espacio vertical se reducía a menos de 450 px.
   - La barra inferior flotaba y se superponía directamente sobre los botones de pesas en Perfil, las tarjetas de Hoy, la tabla de Progreso y los días del Calendario, bloqueando la interacción y arruinando la vista.
   - Existían encabezados duplicados (`Brand` + títulos repetidos) dentro de cada pantalla que desperdiciaban espacio vertical.

2. **Solución Implementada**:
   - **Navegación Superior Unificada para TV (`TvTopNav` en `src/components/Chrome.tsx` y `src/App.tsx`)**: Se reemplazó la barra inferior en modo TV por una barra superior horizontal moderna (estilo Netflix / Android TV) que integra el logotipo `OneBell`, las 5 pestañas enfocables con D-Pad (`[Hoy]`, `[Calendario]`, `[Progreso]`, `[Perfil]`, `[TV Sync]`), el contador de racha con flama y el nombre del atleta. En modo TV se suprime por completo `BottomNav`.
   - **Eliminación de Encabezados Duplicados**: Se retiraron los bloques `<header>` internos de `Profile.tsx`, `Calendar.tsx`, `Progress.tsx` y `Programs.tsx`, recuperando más de 80 px de altura útil por pantalla.
   - **Ajuste de Padding y Viewport (`src/styles.css`)**: Se optimizó `.tv-mode .app-container` a `padding: 16px 32px` y `height: 100dvh; max-height: 100dvh; overflow: hidden`, permitiendo que las dos columnas y sus controles quepan holgadamente sin cortes ni desplazamientos indeseados.

**Firma**: Antigravity (Google DeepMind - Advanced Agentic Coding) — 1 de octubre de 2026, 13:34 (UTC−6)


