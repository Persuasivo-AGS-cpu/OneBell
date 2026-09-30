import { useEffect, useState } from "react";
import { Info, Pause, Play } from "lucide-react";
import { Button } from "@/components/Button";
import { ExerciseDetail } from "@/components/Exercise";
import { Sheet } from "@/components/Sheet";
import { alternativesFor } from "@/lib/session";
import type { Profile, SessionItem } from "@/lib/types";
import { cn, formatClock } from "@/lib/utils";

// Etapa 1-2: modo entrenamiento portado del prototipo, con formato por bloque y ejercicios por tiempo.
// La lógica completa de EMOM con descanso, sonidos, vibración y pantalla encendida llega en la etapa 4.
export function Workout({ profile, session, setSession, onFinish, onQuit }: { profile: Profile; session: SessionItem[]; setSession: (s: SessionItem[]) => void; onFinish: (seconds: number) => void; onQuit: (seconds: number) => void }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [menu, setMenu] = useState(false);
  const [detail, setDetail] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const it = session[i];
  const ex = it.exercise;
  const duration = ex.mode === "time" ? ex.amount : 60;
  const [left, setLeft] = useState(duration);
  useEffect(() => setLeft(ex.mode === "time" ? ex.amount : 60), [i, ex.id]);
  useEffect(() => {
    if (paused || menu) return;
    const t = window.setInterval(() => { setLeft((v) => Math.max(0, v - 1)); setElapsed((v) => v + 1); }, 1000);
    return () => window.clearInterval(t);
  }, [paused, menu]);
  const sectionItems = session.filter((s) => s.section === it.section);
  const pos = sectionItems.indexOf(it) + 1;
  const next = () => (i < session.length - 1 ? setI(i + 1) : onFinish(elapsed));
  const swap = () => { const alt = alternativesFor(profile, ex, session.map((s) => s.exercise))[0]; if (alt) setSession(session.map((s, n) => (n === i ? { ...s, exercise: alt } : s))); };
  const long = ex.name.length > 16;
  return (
    <div className="flex h-full flex-col px-6 pt-5 pb-5">
      <div className="grid shrink-0 grid-cols-[48px_1fr_48px] items-center">
        <Button variant="subtle" size="icon" aria-label="Pausar" onClick={() => setMenu(true)}><Pause /></Button>
        <span className="text-center text-sm font-semibold text-muted-foreground">{it.section} · {pos} de {sectionItems.length}</span>
        <span className="text-right font-display text-lg tabular-nums text-muted-foreground">{formatClock(elapsed)}</span>
      </div>
      <div className="mt-3 flex shrink-0 gap-1">{session.map((_, n) => <div key={n} className={cn("h-1.5 flex-1 rounded-full", n <= i ? "bg-primary" : "bg-secondary")} />)}</div>
      <div className="flex min-h-0 flex-1 flex-col pt-5">
        <h1 className={cn("font-display uppercase leading-[0.98]", long ? "text-[44px]" : "text-[60px]")}>{ex.name}</h1>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {ex.mode === "reps" ? (
            <div className="rounded-[16px] border border-border bg-card px-4 py-3"><p className="font-display text-[40px] leading-none">{it.reps ?? ex.amount}</p><p className="mt-1 text-sm text-muted-foreground">{it.sets ? `swings × ${it.sets} series` : ex.perSide ? "por lado" : "repeticiones"}</p></div>
          ) : (
            <div className="rounded-[16px] border border-border bg-card px-4 py-3"><p className="font-display text-[40px] leading-none">{ex.amount}</p><p className="mt-1 text-sm text-muted-foreground">segundos{ex.perSide ? " por lado" : ""}</p></div>
          )}
          <div className="rounded-[16px] border border-border bg-card px-4 py-3"><p className="font-display text-[40px] leading-none">{ex.sides === "Sin pesa" ? "—" : profile.weights[0] ?? 10}</p><p className="mt-1 text-sm text-muted-foreground">{ex.sides === "Sin pesa" ? "sin pesa" : "kg"}</p></div>
        </div>
        <div className="my-auto text-center">
          <p className="text-sm font-semibold text-muted-foreground">{left === 0 ? "Tiempo cumplido" : ex.mode === "time" ? "Sostén" : "Tiempo restante"}</p>
          <p className="font-display text-[118px] leading-none tabular-nums text-primary">{formatClock(left)}</p>
        </div>
        <div className="border-t border-border pt-3">
          <p className="text-[18px] font-semibold leading-snug">{it.note ?? ex.cue}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Siguiente: <span className="font-semibold text-foreground">{session[i + 1]?.exercise.name ?? "Resumen"}</span></p>
            <button type="button" className="flex items-center gap-1 text-sm font-semibold text-primary" onClick={() => setDetail(true)}><Info size={16} /> ¿Cómo se hace?</button>
          </div>
        </div>
      </div>
      <div className="shrink-0 pt-4">
        <Button variant="ember" size="hero" className="h-[68px] text-[24px]" onClick={next}>{i === session.length - 1 ? "Terminar sesión" : ex.mode === "time" ? "Siguiente" : "Serie hecha"}</Button>
        <Button variant="text" className="mt-1 w-full" onClick={swap}>No puedo hacer este hoy</Button>
      </div>
      {menu && (
        <Sheet title="En pausa" onClose={() => setMenu(false)}>
          <div className="space-y-2">
            <Button variant="ember" size="hero" onClick={() => setMenu(false)}><Play /> Reanudar</Button>
            <Button className="h-14 w-full" onClick={() => onQuit(elapsed)}>Terminar sesión</Button>
          </div>
        </Sheet>
      )}
      {detail && <Sheet title={ex.name} onClose={() => setDetail(false)}><ExerciseDetail exercise={ex} /></Sheet>}
    </div>
  );
}
