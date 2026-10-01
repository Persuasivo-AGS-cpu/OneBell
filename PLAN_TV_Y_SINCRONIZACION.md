# Plan de Implementación: Adaptación TV (16:9, D-Pad) y Sincronización Celular-TV en OneBell

Este documento detalla la arquitectura y especificaciones para la adaptación de **OneBell** para su uso en la televisión de Home GYM (URL: `https://one-bell.vercel.app/`) con control remoto D-Pad, y la sincronización continua de sesiones entre el teléfono celular y la TV.

---

## 1. Formato Visual TV (CSS, Layout 16:9 y Regla de los 3 Metros)

### A. Detección y Modo TV
* **Detección Automática & Selector Manual**:
  * Detección por User Agent (Tizen OS, webOS, Android TV, Google TV, Apple TV, Fire TV).
  * Selector manual en el menú de Perfil para forzar la vista de televisión en cualquier navegador.

### B. Layout 16:9 Estático sin Scroll Vertical
* **Contenedor 100vh Estático**:
  * La pantalla principal se fija a un alto del viewport de `100vh` sin desplazamientos verticales descontrolados.
  * Distribución horizontal limpia optimizada para relación de aspecto 16:9.

### C. Regla de los 3 Metros (Legibilidad a Distancia)
* **Multimedia (Visores de Ejercicio)**:
  * Las animaciones o imágenes de los ejercicios ocupan entre el **40% y 50%** del espacio visual de la pantalla.
* **Tipografía Masiva**:
  * Textos descriptivos e instrucciones: mínimo **32px** (`text-2xl` / `text-3xl`).
  * Títulos principales: **48px+** (`text-4xl` / `text-5xl`).
  * Números del temporizador y descansos: masivo **72px a 120px+** (`text-7xl` a `text-9xl`).

---

## 2. Control de Navegación Espacial con D-Pad (Sin Mouse / Touch)

### A. Navegación por Teclado (`src/lib/spatial-nav.ts`)
* Intercepción de eventos `keydown` del control remoto D-Pad:
  * `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`: Navegación espacial entre elementos interactivos.
  * `Enter` / `Space`: Selección y ejecución de la acción.
  * `Escape` / `Backspace` / `GoBack`: Regresar a la pantalla anterior o pausar el entrenamiento.

### B. Indicador de Foco Visual de Alta Visibilidad
* Anillo de enfoque resplandeciente en color naranja acento `#FF5A1F` con elevación:
  ```css
  button:focus-visible, a:focus-visible, input:focus-visible {
    outline: none !important;
    box-shadow: 0 0 0 4px #FF5A1F, 0 0 30px rgba(255, 90, 31, 0.8) !important;
    transform: scale(1.04);
    z-index: 30;
  }
  ```

---

## 3. Sincronización de Sesión en Tiempo Real (Celular ↔ TV)

### A. Emparejamiento por Código de 6 Dígitos & QR (`src/components/TVSyncModal.tsx` & `src/lib/sync.ts`)
* **Código de 6 Dígitos & Código QR**:
  * Al presionar **"TV Sync"** en la TV, esta genera un código de 6 dígitos (ej. `849-102`) y un código QR.
  * En el celular se presiona **"Estoy en Celular"** (o se escanea el QR) e ingresas el código.
* **Sincronización Continua**:
  * El perfil completo (`profile`, `program`, `stats`, `tests`, `notes`) se transfiere al instante del celular a la televisión sin requerir configuración ni nombre inicial en la TV.
