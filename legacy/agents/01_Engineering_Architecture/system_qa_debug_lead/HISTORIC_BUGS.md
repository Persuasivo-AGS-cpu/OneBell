# 📖 LA MINUTA (Historic Logs of Persuasivo OS)

Este documento contiene el historial sagrado de las catástrofes arquitectónicas sufridas por Persuasivo OS y cómo remediarlas. Si te encuentras con un "White Screen", el bug PROBABLEMENTE se derivó de uno de estos.

### E-001: El Infame `store.render()` vs Custom Events
**El Síntoma:** `TypeError: store.render is not a function`. La pantalla principal (`app-canvas`) se queda totalmente blanca.
**La Razón:** En la arquitectura primitiva de Vanilla JS, los Vistas llamaban a `store.render()` directamente al actualizar datos. Sin embargo, la plataforma migró a un Event Bus global.
**El Parche:**
_Borrando:_ `store.render();`
_Insertando:_ `document.dispatchEvent(new CustomEvent('project-changed'));`

### E-002: Reventón por Template Literals de JavaScript Vanilla
**El Síntoma:** `SyntaxError: Unexpected ...`. Las vistas Vanilla arrojan error y la pantalla se queda congelada.
**La Razón:** Los componentes de la UI exportan una propiedad `render(store)` que devuelve un gran *Template Literal* (\`). Cuando inyectamos URLs o scripts complejos, accidentalmente agregamos `\${}` dentro de comillas que confunden el compilador JS al evaluar.
**El Parche:** Revisa que cada template literal (`\` \``) no contenga comillas que cierren prematuramente el string (especialmente en atributos CSS transformados o `onclick`). Y no escapar las variables innecesariamente `\\${}`.

### E-003: Visualización de "Undefined" en UI (Falta de Mapeo)
**El Síntoma:** En The Cinematic Grid y The Aesthetic Editor, el usuario veía la palabra string literal `undefined` volando en el DOM o empalmando el diseño. 
**La Razón:** Cuando el motor Gemini empezó a escupir JSONS mucho más directos de Direct Response, cambiamos los nombres de variables (e.g. `post.caption` vs `post.content` o `post.hook` vs `post.title`). Como no existían Fallbacks lógicos `(post.hook || post.title || 'Draft')`, el Frontend crasheaba elegantemente renderizando "undefined".
**El Parche:** Siempre inyectar OR fallbacks `||` en `\${}` cuando trabajamos con el array variable de `client.posts`.

### E-004: La Falla de la "Carpeta Fantasma" (Duplicate Accounts Bug)
**El Síntoma:** En el Dropdown del Command Center, aparecen 2 clientes casi iguales: `RENTERS_MX` y `RENTERS.MX`. 
**La Razón:** Fallo crítico en el mapeo Back-end / Front-end. El sistema de Node.js saneará strings (borra \`.\` para hacer carpetas de finder válidas: \`RENTERS_MX\`). El frontend persistía \`store.currentProject.name\` (que era "RENTERS.MX") a varios POST requests, o guardaba el "Nombre" en `localStorage`. Resultó en crear múltiples ramificaciones, unas usando IDs técnicos `renters_mx_7685` y otras `RENTERS_MX` (mock).
**El Parche:** 
- En memoria y React/Vanilla Store, **TODO** se asocia usando `project.id`, NUNCA `project.name`. 
- En `backend/clients/clientStorage.js`: No empujar elementos al array `clients` si no se localiza explícitamente el archivo semántico `client_state.json`.

---
### E-005: La Trampa de Caché de ES Modules (White Screen + Raya Vertical)
**El Síntoma:** Tras corregir un "White Screen" mortal en `StrategyBuilder.js` o `store.js` y hacer un "Hard Refresh" (Cmd+Shift+R), el usuario sigue viendo una pantalla blanca y solo la raya vertical del sidebar. El console.log muestra errores que ya habíamos erradicado (e.g. `TypeError: store.render is not a function`).
**La Razón:** Aunque `app.js` es forzado a recargarse por el framework, sus imports explican versiones exactas como `import StrategyBuilderView from './views/StrategyBuilder.js?v=7';`. El navegador recarga el HTML y el `app.js`, pero como el Query String de los imports nativos `?v=7` no cambia, usa la versión almacenada en caché profundo.
**El Parche:**
- Actualizar TODAS las versiones de import en `app.js` (e.g. `v=7` a `v=8`).
- Actualizar el script `v=XX` en `index.html`.

*QA Agent Protocol: Agrega nuevos cráteres documentados a esta lista.*
