// Pitidos y vibración para avisar sin mirar la pantalla.
let ctx: AudioContext | null = null;
export function beep(long = false) {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.value = long ? 660 : 880; o.connect(g); g.connect(ctx.destination);
    const t = ctx.currentTime; g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + (long ? 0.7 : 0.15));
    o.start(t); o.stop(t + (long ? 0.7 : 0.15));
  } catch { /* sin audio */ }
  try { navigator.vibrate?.(long ? 400 : 80); } catch { /* sin vibración */ }
}
/** Mantiene la pantalla encendida mientras haya una sesión o prueba en curso. */
export async function keepAwake(): Promise<() => void> {
  try {
    const lock = await (navigator as unknown as { wakeLock?: { request(t: "screen"): Promise<{ release(): Promise<void> }> } }).wakeLock?.request("screen");
    return () => { lock?.release().catch(() => {}); };
  } catch { return () => {}; }
}
