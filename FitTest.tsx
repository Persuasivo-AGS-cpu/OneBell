import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Info, X } from "lucide-react";
import { Button } from "@/components/Button";
import { Frame } from "@/components/Chrome";
import { ExerciseDetail, Thumb } from "@/components/Exercise";
import { Sheet } from "@/components/Sheet";
import { Stepper } from "@/components/Stepper";
import { TestSheet } from "@/components/TestSheet";
import { REST_SECONDS, TEST_MOVES, exerciseFor, type TestResult } from "@/lib/fittest";
import { beep, keepAwake } from "@/lib/sound";
import { todayKey } from "@/lib/storage";
import type { Profile } from "@/lib/types";
import { cn, formatClock } from "@/lib/utils";

// Cada ejercicio se hace una vez; los de un brazo, dos veces (izquierdo y derecho).
type Slot = { move: (typeof TEST_MOVES)[number]; side: "izq" | "der" | null };
const SLOTS: Slot[] = TEST_MOVES.flatMap((move): Slot[] => (move.perSide ? [{ move, side: "izq" }, { move, side: "der" }] : [{ move, side: null }]));
const keyOf = (s: Slot) => (s.side ? `${s.move.key}-${s.side}` : s.move.key);
type Phase = "intro" | "ready" | "countdown" | "running" | "record" | "rest" | "done";

export function FitTest({ profile, tests, onSave, onLater, onChangeWeight }: {
  profile: Profile; tests: TestResult[]; onSave: (r: TestResult) => void; onLater: () => void; onChangeWeight: (w: number) => void;
}) {
  const first = tests.length === 0;
  const locked = tests[0]?.weight ?? null;
  const [weight, setWeight] = useState<number | null>(profile.testWeight ?? locked ?? (profile.weights.length === 1 ? profile.weights[0] : null));
  const [phase, setPhase] = useState<Phase>("intro");
  const [slot, setSlot] = useState(0);
  const [time, setTime] = useState(0);
  const [values, setValues] = useState<Record<string, number>>({});
  const [entry, setEntry] = useState(0);
  const [detail, setDetail] = useState(false);
  const [quit, setQuit] = useState(false);
  const release = useRef<() => void>(() => {});
  const s = SLOTS[slot];
  const ex = exerciseFor(s.move, profile);
  const last = tests[tests.length - 1];
  const hold = s.move.measure === "hold";

  useEffect(() => { if (phase !== "intro" && phase !== "done") keepAwake().then((r) => (release.current = r)); return () => release.current(); }, [phase === "intro" || phase === "done"]);

  // Reloj: cuenta regresiva de 3, luego el ejercicio (plancha cuenta hacia arriba), luego descanso.
  useEffect(() => {
    if (!["countdown", "running", "rest"].includes(phase)) return;
    const t = window.setInterval(() => setTime((v) => (phase === "running" && hold ? v + 1 : v - 1)), 1000);
    return () => window.clearInterval(t);
  }, [phase, hold]);
  useEffect(() => {
    if (phase === "countdown") { if (time > 0) beep(); else { beep(true); setTime(hold ? 0 : s.move.seconds); setPhase("running"); } }
    if (phase === "running") {
      if (!hold && time > 0 && time <= 3) beep();
      if ((!hold && time === 0) || (hold && time >= s.move.seconds)) stopRunning();
    }
    if (phase === "rest") { if (time > 0 && time <= 3) beep(); if (time <= 0) { beep(true); setPhase("ready"); } }
  }, [time, phase]);

  const start = () => { setTime(3); setPhase("countdown"); };
  const stopRunning = () => {
    beep(true);
    if (hold) { save(Math.min(time, s.move.seconds)); return; }
    setEntry(values[keyOf(s)] ?? 0); setPhase("record");
  };
  const save = (n: number) => {
    const next = { ...values, [keyOf(s)]: n }; setValues(next);
    if (slot === SLOTS.length - 1) { setPhase("done"); return; }
    setSlot(slot + 1);
    // Entre brazos del mismo ejercicio no hay descanso largo.
    if (SLOTS[slot + 1].move.key === s.move.key) setPhase("ready"); else { setTime(REST_SECONDS); setPhase("rest"); }
  };
  const result: TestResult = { date: todayKey(), weight: weight ?? 0, values };

  if (phase === "intro") return (
    <Frame header={<div className="grid grid-cols-[48px_1fr_48px] items-center"><Button variant="text" size="icon" aria-label="Salir" onClick={onLater}><ArrowLeft /></Button><span className="text-center text-sm font-semibold text-muted-foreground">Prueba OneBell {tests.length + 1}</span><span /></div>}
      footer={<>
        <Button variant="ember" size="hero" disabled={!weight} onClick={() => { onChangeWeight(weight!); setPhase("ready"); }}>Empezar la prueba</Button>
        {first && <Button variant="text" className="mt-1 w-full" onClick={onLater}>Hacerla después</Button>}
      </>}>
      <h1 className="mt-2 font-display text-[42px] uppercase leading-none">{first ? "Tu punto de partida" : "Mide tu avance"}</h1>
      <p className="mt-3 text-[16px] leading-snug text-muted-foreground">Cinco ejercicios con tiempo fijo. Haz todas las repeticiones que puedas con buena técnica y al final anota cuántas hiciste. Se repite cada dos semanas para ver tu avance.</p>
      <ul className="mt-5 divide-y divide-border rounded-[16px] border border-border bg-card">
        {TEST_MOVES.map((m) => (
          <li key={m.key} className="flex items-center gap-3 p-3">
            <Thumb exercise={exerciseFor(m, profile)} className="h-12 w-12" />
            <span className="flex-1 font-semibold">{exerciseFor(m, profile).name}</span>
            <span className="text-sm text-muted-foreground">{m.measure === "hold" ? "máx. 2 min" : m.perSide ? `${m.seconds} s por brazo` : `${m.seconds} s`}</span>
          </li>
        ))}
      </ul>
      <h2 className="mt-6 font-display text-[22px] uppercase">¿Con qué pesa?</h2>
      {locked != null ? (
        <p className="mt-2 text-[16px]">Con tu pesa de <b>{locked} kg</b>, la misma de tu primera prueba, para que los números se puedan comparar.</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">Será la misma en todas tus pruebas de este programa.</p>
          <div role="radiogroup" className="mt-3 grid grid-cols-4 gap-2">
            {profile.weights.map((w) => <Button key={w} role="radio" aria-checked={weight === w} variant={weight === w ? "selected" : "tile"} className="h-14 gap-1" onClick={() => setWeight(w)}><span className="font-display text-xl">{w}</span><span className="text-sm text-muted-foreground">kg</span></Button>)}
          </div>
        </>
      )}
      <p className="mt-5 rounded-[14px] bg-card p-4 text-[15px] leading-snug">Calienta antes de empezar. Solo cuentan repeticiones con técnica limpia: si la técnica se cae, detente.</p>
    </Frame>
  );

  if (phase === "done") return (
    <Frame footer={<Button variant="ember" size="hero" onClick={() => onSave(result)}>Guardar prueba</Button>}>
      <h1 className="mt-4 font-display text-[44px] uppercase leading-none">Prueba {tests.length + 1} completa</h1>
      <p className="mt-2 text-muted-foreground">Con tu pesa de {weight} kg. {first ? "Este es tu punto de partida." : "Compara con tus pruebas anteriores."}</p>
      <div className="mt-6"><TestSheet tests={[...tests, result]} /></div>
    </Frame>
  );

  const label = `${ex.name}${s.side ? ` · brazo ${s.side === "izq" ? "izquierdo" : "derecho"}` : ""}`;
  return (
    <div className="flex h-full flex-col px-6 pt-5 pb-5">
      <div className="grid shrink-0 grid-cols-[48px_1fr_48px] items-center">
        <Button variant="subtle" size="icon" aria-label="Salir de la prueba" onClick={() => setQuit(true)}><X /></Button>
        <span className="text-center text-sm font-semibold text-muted-foreground">Prueba OneBell · {weight} kg</span><span />
      </div>
      <div className="mt-3 flex shrink-0 gap-1">{SLOTS.map((_, n) => <div key={n} className={cn("h-1.5 flex-1 rounded-full", n < slot || (n === slot && phase === "record") ? "bg-primary" : "bg-secondary")} />)}</div>

      {phase === "rest" ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="font-display text-[34px] uppercase">Descansa</p>
          <p className="font-display text-[120px] leading-none tabular-nums text-primary">{formatClock(Math.max(0, time))}</p>
          <p className="mt-4 text-muted-foreground">Sigue: <b className="text-foreground">{label}</b></p>
          <Button className="mt-6" onClick={() => setPhase("ready")}>Saltar descanso</Button>
        </div>
      ) : (
        <>
          <div className="flex min-h-0 flex-1 flex-col pt-5">
            <div className="flex items-start gap-3">
              <h1 className={cn("flex-1 font-display uppercase leading-[0.98]", ex.name.length > 14 ? "text-[40px]" : "text-[52px]")}>{ex.name}</h1>
              <Thumb exercise={ex} className="h-20 w-20" />
            </div>
            {s.side && <p className="mt-2 font-display text-[24px] uppercase text-primary">Brazo {s.side === "izq" ? "izquierdo" : "derecho"}</p>}
            <p className="mt-2 text-[17px] font-semibold">{hold ? "Sostén todo lo que puedas, máximo 2 minutos." : `Todas las repeticiones que puedas en ${s.move.seconds} segundos.`}</p>

            {phase === "ready" && (
              <div className="mt-4">
                <p className="text-[16px] leading-snug text-muted-foreground">{ex.cue}.</p>
                <button type="button" className="mt-3 flex items-center gap-1 text-[15px] font-semibold text-primary" onClick={() => setDetail(true)}><Info size={16} /> ¿Cómo se hace?</button>
                {last && !hold && <p className="mt-4 text-[15px] text-muted-foreground">Tu prueba anterior: <b className="text-foreground">{last.values[keyOf(s)] ?? "—"}</b></p>}
                {last && hold && <p className="mt-4 text-[15px] text-muted-foreground">Tu prueba anterior: <b className="text-foreground">{last.values.plancha != null ? formatClock(last.values.plancha) : "—"}</b></p>}
              </div>
            )}
            {(phase === "countdown" || phase === "running") && (
              <div className="my-auto text-center">
                <p className="text-[15px] font-semibold text-muted-foreground">{phase === "countdown" ? "Prepárate" : hold ? "Sostén" : "¡Dale!"}</p>
                <p className="font-display text-[132px] leading-none tabular-nums text-primary">{phase === "countdown" ? Math.max(time, 1) : formatClock(Math.max(0, time))}</p>
              </div>
            )}
            {phase === "record" && <div className="my-auto"><Stepper value={entry} onChange={setEntry} label="¿Cuántas repeticiones con buena técnica?" /></div>}
          </div>
          <div className="shrink-0 pt-4">
            {phase === "ready" && <Button variant="ember" size="hero" className="h-[68px] text-[24px]" onClick={start}>Empezar</Button>}
            {phase === "countdown" && <Button size="hero" className="h-[68px]" onClick={() => setPhase("ready")}>Cancelar</Button>}
            {phase === "running" && <Button variant={hold ? "ember" : "tile"} size="hero" className="h-[68px] text-[20px]" onClick={stopRunning}>{hold ? "Me detuve" : "Terminar antes"}</Button>}
            {phase === "record" && <Button variant="ember" size="hero" className="h-[68px] text-[24px]" onClick={() => save(entry)}>Guardar y seguir</Button>}
          </div>
        </>
      )}
      {detail && <Sheet title={ex.name} onClose={() => setDetail(false)}><ExerciseDetail exercise={ex} /></Sheet>}
      {quit && (
        <Sheet title="¿Salir de la prueba?" onClose={() => setQuit(false)}>
          <p className="text-[16px] text-muted-foreground">Lo que llevas no se guardará. Puedes hacerla completa en otro momento.</p>
          <div className="mt-5 space-y-2">
            <Button variant="ember" size="hero" onClick={() => setQuit(false)}>Seguir con la prueba</Button>
            <Button className="h-14 w-full" onClick={onLater}>Salir sin guardar</Button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
