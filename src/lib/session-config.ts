export function sessionMainLimit(minutes: number, energy: string) {
  const base = minutes <= 10 ? 1 : minutes <= 20 ? 2 : minutes <= 30 ? 3 : 4;
  const adjustment = energy === "Con energía" ? 1 : energy === "Cansado" ? -1 : 0;
  return Math.max(1, Math.min(5, base + adjustment));
}

/** Minutos del EMOM que caben en la sesión. Cada serie dura un minuto. */
export function emomMinutes(prescribed: number, sessionMinutes: number) {
  const cap = Math.max(3, Math.round(sessionMinutes * 0.5));
  return Math.max(1, Math.min(prescribed, cap));
}

function rotate<T>(items: T[], week: number) {
  if (!items.length) return items;
  const n = ((week - 1) % items.length + items.length) % items.length;
  return [...items.slice(n), ...items.slice(0, n)];
}

function spread<T>(items: T[], limit: number) {
  if (limit <= 0 || !items.length) return [];
  if (limit >= items.length) return items;
  if (limit === 1) return [items[0]];
  const picked: T[] = [];
  const seen = new Set<number>();
  for (let i = 0; i < limit; i++) {
    let idx = Math.round((i * (items.length - 1)) / (limit - 1));
    while (seen.has(idx) && idx < items.length - 1) idx += 1;
    if (seen.has(idx)) break;
    seen.add(idx);
    picked.push(items[idx]);
  }
  return picked;
}

/** Elige bloques que quepan en el tiempo. Con poco tiempo reparte patrones; el bloque clave se queda. */
export function selectMain<T>(items: T[], limit: number, week: number, pinFirst: boolean) {
  if (limit <= 0 || !items.length) return [];
  if (items.length <= limit) return items;
  if (pinFirst) return [items[0], ...spread(rotate(items.slice(1), week), limit - 1)];
  return spread(rotate(items, week), limit);
}
