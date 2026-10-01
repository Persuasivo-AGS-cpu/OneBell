# OneBell

App web personal de entrenamiento con una sola kettlebell. Piloto de uso propio. Toda la interfaz en español de México.

## Stack

React 19 + TypeScript + Vite + Tailwind v4. Se compila a un solo archivo (`dist/index.html`) con `vite-plugin-singlefile`. Sin back end: el estado vive en localStorage (`src/lib/storage.ts`, clave `onebell:state:v3`).

Nota: `storage.ts` también intenta una copia en la nube vía `window.claude` (db + user) cuando la app corre dentro de Claude. Fuera de ahí devuelve `null` y todo queda local. `App.tsx` resuelve conflictos por `updatedAt`.

## Comandos

- `npm run dev`: servidor de desarrollo
- `npx tsc -p .`: revisión de tipos (debe salir sin errores)
- `npm run build`: compila a `dist/` (debe salir sin errores)
- `npm test`: pruebas con `node --test` en `tests/` (importan de `src/lib`, así que la lógica pura va ahí, sin dependencias de React ni del alias `@`)

## Estructura

- `src/App.tsx`: estado global, navegación por `screen` (sin router), sincronización
- `src/screens/`: una pantalla por archivo (Setup, FitTest, Today, Preview, Workout, Summary, Calendar, Programs, Progress, Library, Profile)
- `src/components/`: componentes compartidos (Button, Sheet, Chrome, Exercise, TodayBlocks…)
- `src/lib/`
  - `catalog.ts`: carga y filtra el catálogo (`allowed(profile)`)
  - `session.ts`: `buildSession` arma la sesión según tipo de día, semana, minutos y energía
  - `session-config.ts`: `sessionMainLimit(minutes, energy)`
  - `workout.ts`: `expandWorkoutSteps` convierte bloques con series en pasos individuales
  - `program.ts`: programas (`PROGRAMS`), plan por semanas, dosis de swings, fechas
  - `fittest.ts`: Prueba OneBell (movimientos, resultados, próxima fecha)
  - `storage.ts`, `sound.ts` (beep y wake lock), `types.ts`, `utils.ts`
- `src/data/catalog.json`: 98 ejercicios con instrucciones, grupos musculares y errores comunes
- `src/assets/ex/`: fotos de ejercicios en webp
- `public/`: `manifest.webmanifest`, `icons/` y `sw.js`

`public/sw.js` solo limpia el service worker de la v1. No lo conviertas en caché. `index.html` también desregistra service workers y borra cachés al cargar.

## Estilo "Brasa"

Fondo `#0F0E0D`, tarjetas `#1C1A18`, bordes `#2E2A26`, texto `#F6F1EA`, secundario `#B3AAA0`, acento único `#FF5A1F`. Tokens en `src/styles.css`. Títulos en Anton mayúsculas, texto en Barlow. Botones táctiles de mínimo 48 px. Lo seleccionado se rellena de naranja. El modo entrenamiento debe leerse a 2 metros y caber sin scroll.

## Despliegue

Repo GitHub `Persuasivo-AGS-cpu/OneBell`. Push a `main` = Vercel publica solo en one-bell.vercel.app. La rama `v1` es respaldo de la versión anterior: no la toques. Nunca subas `node_modules` ni `dist` (ya están en `.gitignore`). No subas imágenes fuente pesadas (por ejemplo `onebell-icono-4k.png`, 21 MB).

## Flujo de trabajo

Para cada cambio: edita, corre `npx tsc -p .` y `npm run build` sin errores, haz commit con mensaje claro en español y push a `main`. Muestra un resumen corto de lo que cambiaste. Haz `git add` solo de los archivos del cambio, no de todo el árbol.

## Pendientes del plan (no empezar sin que se pidan)

1. ~~Generador fino~~ Hecho: minutos, energía y anti-repetición (`recent` en el estado, últimas 3 sesiones).
2. ~~Modo entrenamiento completo~~ Hecho: EMOM con descanso automático (`emom` en `SessionItem`), pitidos, voz `es-MX` (opción en Perfil) y wake lock. Falta probarlo en el celular.
3. ~~Programas restantes~~ Hecho: los 5 programas están listos (`ready: true`). Cada uno define en `program.ts` su prescripción semanal (`rx`), su métrica de meta y sus textos. Límites conocidos: la prueba final es siempre la Prueba OneBell (5 movimientos), así que el EMOM de 20 minutos del Motor y los 100 snatches en 5 minutos no se miden con una prueba propia; el avance se sigue con el volumen prescrito. Idea para después: pruebas finales específicas por programa.

## Programas (`src/lib/program.ts`)

- `PROGRAMS[].rx(semana, tipoDeDía)` devuelve el bloque clave (`Rx`) o `null`. `prescribe` agrega swings de acondicionamiento general en días de Acondicionamiento que el programa no usa.
- Las semanas 4, 8 y 12 son de descarga. Las pruebas caen el día 1, cada 14 días y el último día (`testDays`). Los programas deben durar semanas pares.
- El ejercicio clave ignora el nivel del perfil (el programa es la progresión) pero respeta zonas, techo bajo y ruido. Si no hay ninguno permitido, se usa uno lento del mismo patrón. `blockPossible` deshabilita el programa si ni eso existe.
- Solo los bloques `emom: true` avanzan solos en el modo entrenamiento.
