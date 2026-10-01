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
