# OneBell — App de Notificaciones

SPA de React con animaciones fluidas para gestión de notificaciones. Tiene una carpeta `/legacy` con una versión anterior desplegada en Vercel.

## Qué hace en el ecosistema

App de notificaciones de Persuasivo. La versión principal es la SPA en la raíz; la carpeta `/legacy` contiene una versión anterior que puede seguir desplegada. App standalone sin dependencias en runtime con otros servicios del ecosistema.

## Stack tecnológico

| Tecnología | Versión |
|---|---|
| React | 19.2.4 |
| React DOM | 19.2.4 |
| React Router DOM | 7.14.1 |
| Framer Motion | 12.38.0 |
| Vite | 8.0.4 |
| lucide-react | — |
| ESLint | con configuración React |

**Bundler:** Vite  
**Lenguaje:** JavaScript (sin TypeScript)  
**Animaciones:** Framer Motion

**Estructura:**
```
OneBell/
├── src/          código fuente principal
├── index.html    entry point
├── vite.config.js
├── eslint.config.js
└── legacy/       versión anterior
    └── vercel.json
```

## Cómo levantar localmente

```bash
cd OneBell
npm install
npm run dev              # vite — dev server en puerto default (5173)
```

### Otros comandos
```bash
npm run build            # vite build
npm run preview          # sirve el build de producción localmente
npm run lint             # eslint
```

### Versión legacy
La carpeta `/legacy` tiene su propio `vercel.json`. Para trabajar con ella, revisar su configuración por separado antes de cualquier cambio.

## Variables de entorno necesarias

No se han detectado variables de entorno documentadas. Verificar `src/` para confirmar si hay llamadas a APIs que requieran configuración.

## Llamadas a otros servicios en runtime

- **Sin llamadas detectadas** a otros servicios del ecosistema Antigravity.
- App standalone centrada en UI de notificaciones.

## NO tocar sin revisar con el equipo

- **`legacy/vercel.json`** — si la versión legacy está desplegada en Vercel y en uso, modificar su configuración puede interrumpir el servicio en producción.
- **`legacy/`** en general — puede tener usuarios activos. No eliminar ni modificar sin confirmar que el deploy está retirado.
- El repositorio tiene `.git` propio (git independiente del monorepo raíz) — hacer push desde aquí afecta su remote propio, no el monorepo.
