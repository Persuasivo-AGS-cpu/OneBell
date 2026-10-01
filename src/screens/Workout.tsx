import { useEffect, useRef, useState } from "react";
import { Info, Pause, Play } from "lucide-react";
import { Button } from "@/components/Button";
import { ExerciseDetail } from "@/components/Exercise";
import { Sheet } from "@/components/Sheet";
import { sessionBell } from "@/lib/catalog";
import { alternativesFor } from "@/lib/session";
import { imageFor } from "@/lib/images";
import { beep, keepAwake } from "@/lib/sound";
import { mirrorChanged, type WorkoutMirror } from "@/lib/sync";
import { speak, stopSpeaking } from "@/lib/voice";
import { advancesAlone, expandWorkoutSteps, stepSeconds, voiceLine } from "@/lib/workout";
import type { Profile, SessionItem } from "@/lib/types";
import { cn, formatClock } from "@/lib/utils";

// Modo entrenamiento con pasos expandidos para que cada serie sea accionable.
export function Workout({ profile, session, setSession, onFinish, onQuit, onMirror, tvMode = false }: { profile: Profile; session: SessionItem[]; setSession: (s: SessionItem[]) => void; onFinish: (seconds: number) => void; onQuit: (seconds: number) => void; onMirror?: (m: WorkoutMirror) => void; tvMode?: boolean }) {
  const steps = expandWorkoutSteps(session);
  const [i, setI] = useState(0);
  const bell = sessionBell(profile);
  const [paused, setPaused] = useState(false);
  const [menu, setMenu] = useState(false);
  const [detail, setDetail] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const step = steps[i] ?? steps[steps.length - 1];
  const it = step.item;
  const ex = it.exercise;
  const emom = !!it.emom;
  const auto = advancesAlone(it);
  const last = i === steps.length - 1;
  const [left, setLeft] = useState(() => stepSeconds(steps[0].item));
  const [worked, setWorked] = useState(false);
  const go = (n: number) => { setI(n); setWorked(false); setLeft(stepSeconds(steps[n].item)); };
  useEffect(() => { if (steps.length > 0 && i > steps.length - 1) setI(steps.length - 1); }, [i, steps.length]);
  useEffect(() => {
    if (paused || menu) return;
    const t = window.setInterval(() => { setLeft((v) => Math.max(0, v - 1)); setElapsed((v) => v + 1); }, 1000);
    return () => window.clearInterval(t);
  }, [paused, menu]);
  // Pantalla siempre encendida mientras dura el entrenamiento; se vuelve a pedir al regresar a la app.
  useEffect(() => {
    let live = true; let release = () => {};
    const take = () => keepAwake().then((r) => { if (!live) r(); else { release(); release = r; } });
    const visible = () => { if (document.visibilityState === "visible") take(); };
    take(); document.addEventListener("visibilitychange", visible);
    return () => { live = false; document.removeEventListener("visibilitychange", visible); release(); stopSpeaking(); };
  }, []);
  // Pitidos en los últimos 3 segundos; en EMOM y ejercicios por tiempo el paso avanza solo.
  useEffect(() => {
    if (paused || menu || !auto) return;
    if (left > 0 && left <= 3) beep();
    if (left === 0) { beep(true); if (!last) next(); }
  }, [left]);
  useEffect(() => { if (profile.voice) speak(voiceLine(step)); }, [i]);
  useEffect(() => { if (profile.voice && worked) speak("Descansa"); }, [worked]);
  useEffect(() => {
    const pause = () => setMenu(true);
    window.addEventListener("onebell:pause", pause);
    return () => window.removeEventListener("onebell:pause", pause);
  }, []);
  const onMirrorRef = useRef(onMirror);
  onMirrorRef.current = onMirror;
  const sentMirror = useRef<WorkoutMirror | null>(null);
  const mirrorNow = (): WorkoutMirror => ({
    active: true,
    exerciseId: ex.id,
    exerciseName: ex.name,
    cue: it.note ?? ex.cue,
    left,
    paused: paused || menu,
    set: step.set,
    totalSets: step.totalSets,
    amount: String(ex.mode === "reps" ? (it.reps ?? ex.amount) : ex.amount),
    mode: ex.mode,
    section: it.section,
    label: emom ? (worked ? "Descansa · sigue la siguiente serie" : "Haz tus repeticiones") : left === 0 ? "Tiempo cumplido" : ex.mode === "time" ? "Sostén" : "Tiempo restante",
  });
  useEffect(() => {
    const send = onMirrorRef.current;
    if (!send) return;
    const next = mirrorNow();
    if (!mirrorChanged(sentMirror.current, next)) return;
    sentMirror.current = next;
    send(next);
  });
  useEffect(() => () => {
    onMirrorRef.current?.({ active: false, exerciseId: "", exerciseName: "", cue: "", left: 0, paused: true, set: 0, totalSets: 0, amount: "", mode: "", section: "", label: "" });
  }, []);
  const sectionItems = steps.filter((s) => s.item.section === it.section);
  const pos = sectionItems.indexOf(step) + 1;
  const next = () => (i < steps.length - 1 ? go(i + 1) : onFinish(elapsed));
  const press = () => (emom && !worked && !last ? setWorked(true) : next());
  const swap = () => {
    const alt = alternativesFor(profile, ex, session.map((s) => s.exercise))[0];
    const sourceIndex = session.indexOf(it);
    if (!alt || sourceIndex < 0) return;
    const swapped: SessionItem = it.section === "Programa" || it.sets ? { section: "Bloque principal", exercise: alt } : { ...it, exercise: alt };
    setSession(session.map((item, n) => (n === sourceIndex ? swapped : item)));
    setI(steps.findIndex((s) => s.item === it)); setWorked(false); setLeft(stepSeconds(swapped));
  };
  const long = ex.name.length > 16;
  const photo = imageFor(ex);
  const action = last ? "Terminar sesión" : emom ? (worked ? "Saltar descanso" : "Serie hecha") : ex.mode === "time" ? "Siguiente" : "Serie hecha";
  const sheets = (
    <>
      {menu && (
        <Sheet title="En pausa" onClose={() => setMenu(false)}>
          <div className="space-y-2">
            <Button variant="ember" size="hero" onClick={() => setMenu(false)}><Play /> Reanudar</Button>
            <Button className="h-14 w-full" onClick={() => onFinish(elapsed)}>Terminar sesión</Button>
            <Button variant="text" className="h-12 w-full" onClick={() => onQuit(elapsed)}>Salir sin guardar</Button>
          </div>
        </Sheet>
      )}
      {detail && <Sheet title={ex.name} onClose={() => setDetail(false)}><ExerciseDetail exercise={ex} /></Sheet>}
    </>
  );
  if (tvMode) return (
    <div className="flex h-full flex-col overflow-hidden px-8 py-6">
      <div className="tv-stage min-h-0 flex-1">
        <div className="tv-stage-photo">
          {photo ? <img src={photo} alt="" /> : <p className="px-6 text-center font-display text-[48px] uppercase leading-none">{ex.name}</p>}
        </div>
        <div className="flex min-h-0 flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[32px] font-semibold text-muted-foreground">{it.section} · {pos} de {sectionItems.length}</p>
            <Button variant="subtle" size="icon" aria-label="Pausar" onClick={() => setMenu(true)}><Pause /></Button>
          </div>
          <h1 className="mt-3 font-display text-[48px] uppercase leading-none">{ex.name}</h1>
          <p className="mt-4 font-display text-[120px] leading-none tabular-nums text-primary">{formatClock(left)}</p>
          <p className="text-[32px] font-semibold leading-snug">{it.note ?? ex.cue}</p>
          <p className="mt-2 text-[32px]">Siguiente: <span className="font-semibold">{steps[i + 1]?.item.exercise.name ?? "Resumen"}</span></p>
          <div className="mt-auto pt-4">
            <Button variant="ember" size="hero" className="h-[68px] text-[24px]" onClick={press}>{action}</Button>
            <Button variant="text" className="mt-1 h-12 w-full" onClick={swap}>No puedo hacer este hoy</Button>
          </div>
        </div>
      </div>
      {sheets}
    </div>
  );
  return (
    <div className="flex h-full flex-col px-6 pt-5 pb-5">
      <div className="grid shrink-0 grid-cols-[48px_1fr_48px] items-center">
        <Button variant="subtle" size="icon" aria-label="Pausar" onClick={() => setMenu(true)}><Pause /></Button>
        <span className="text-center text-sm font-semibold text-muted-foreground">{it.section} · {pos} de {sectionItems.length}</span>
        <span className="text-right font-display text-lg tabular-nums text-muted-foreground">{formatClock(elapsed)}</span>
      </div>
      <div className="mt-3 flex shrink-0 gap-1">{steps.map((_, n) => <div key={n} className={cn("h-1.5 flex-1 rounded-full", n <= i ? "bg-primary" : "bg-secondary")} />)}</div>
      <div className="flex min-h-0 flex-1 flex-col pt-5">
        <h1 className={cn("font-display uppercase leading-[0.98]", long ? "text-[44px]" : "text-[60px]")}>{ex.name}</h1>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {ex.mode === "reps" ? (
            <div className="rounded-[16px] border border-border bg-card px-4 py-3"><p className="font-display text-[40px] leading-none">{it.reps ?? ex.amount}</p><p className="mt-1 text-sm text-muted-foreground">{it.sets ? `${it.sets} series` : ex.perSide ? "por lado" : "repeticiones"}</p></div>
          ) : (
            <div className="rounded-[16px] border border-border bg-card px-4 py-3"><p className="font-display text-[40px] leading-none">{ex.amount}</p><p className="mt-1 text-sm text-muted-foreground">segundos{ex.perSide ? " por lado" : ""}</p></div>
          )}
          <div className="rounded-[16px] border border-border bg-card px-4 py-3"><p className="font-display text-[40px] leading-none">{ex.sides === "Sin pesa" || bell == null ? "—" : bell}</p><p className="mt-1 text-sm text-muted-foreground">{ex.sides === "Sin pesa" ? "sin pesa" : bell == null ? "elige una pesa" : "kg"}</p></div>
        </div>
        <div className="my-auto text-center">
          <p className="text-sm font-semibold text-muted-foreground">{emom ? (worked ? "Descansa · sigue la siguiente serie" : "Haz tus repeticiones") : left === 0 ? "Tiempo cumplido" : ex.mode === "time" ? "Sostén" : "Tiempo restante"}</p>
          <p className="font-display text-[118px] leading-none tabular-nums text-primary">{formatClock(left)}</p>
        </div>
        <div className="border-t border-border pt-3">
          <p className="text-[18px] font-semibold leading-snug">{it.note ?? ex.cue}</p>
          {step.totalSets > 1 && <p className="mt-1 text-sm font-semibold text-primary">Serie {step.set} de {step.totalSets}</p>}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Siguiente: <span className="font-semibold text-foreground">{steps[i + 1]?.item.exercise.name ?? "Resumen"}</span></p>
            <button type="button" className="flex items-center gap-1 text-sm font-semibold text-primary" onClick={() => setDetail(true)}><Info size={16} /> ¿Cómo se hace?</button>
          </div>
        </div>
      </div>
      <div className="shrink-0 pt-4">
        <Button variant="ember" size="hero" className="h-[68px] text-[24px]" onClick={press}>{action}</Button>
        <Button variant="text" className="mt-1 w-full" onClick={swap}>No puedo hacer este hoy</Button>
      </div>
      {sheets}
    </div>
  );
}
