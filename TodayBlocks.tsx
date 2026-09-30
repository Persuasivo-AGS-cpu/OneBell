import { useState } from "react";
import { Award, CalendarClock, Dumbbell, Flame, Medal, Repeat, Star, Trophy } from "lucide-react";
import { ExerciseDetail, Thumb } from "./Exercise";
import { Sheet } from "./Sheet";
import { allowed } from "@/lib/catalog";
import { TEST_MOVES, fmtDate, nextTestDate, totalFor, type TestResult } from "@/lib/fittest";
import { TYPE_INFO, dateForIndex, programDose, type PlanDay, type Program, type ProgramState } from "@/lib/program";
import type { Stats } from "@/lib/storage";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const initial = (d: Date) => new Intl.DateTimeFormat("es-MX", { weekday: "narrow" }).format(d).toUpperCase();
const longDay = (d: Date) => { const s = new Intl.DateTimeFormat("es-MX", { weekday: "long" }).format(d); return s.charAt(0).toUpperCase() + s.slice(1); };

/** Tira de 7 días de la semana actual del programa. */
export function WeekStrip({ state, plan, today, onOpen }: { state: ProgramState; plan: PlanDay[]; today: number; onOpen: () => void }) {
  const week = Math.ceil(today / 7);
  const days = plan.filter((d) => Math.ceil(d.index / 7) === week);
  const trainable = days.filter((d) => d.type !== "Descanso");
  const done = trainable.filter((d) => state.done.includes(d.index)).length;
  return (
    <button type="button" onClick={onOpen} className="mt-5 block w-full text-left" aria-label={`Semana ${week}: ${done} de ${trainable.length} días hechos. Ver calendario`}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-[20px] uppercase">Semana {week}</h2>
        <span className="text-sm text-muted-foreground">{done} de {trainable.length} hechos</span>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const date = dateForIndex(state.start, d.index);
          const isDone = state.done.includes(d.index);
          const isToday = d.index === today;
          const rest = d.type === "Descanso";
          return (
            <div key={d.index} className={cn("relative flex h-[74px] flex-col items-center justify-center rounded-[12px] border", isToday ? "border-2 border-primary" : "border-border", isDone ? "bg-primary text-primary-foreground" : "bg-card")}>
              <span className={cn("text-[12px] font-semibold", isDone ? "" : "text-muted-foreground")}>{initial(date)}</span>
              <span className="font-display text-[20px] leading-tight">{date.getDate()}</span>
              <span className={cn("text-[10px] font-semibold leading-none", isDone ? "" : rest ? "text-muted-foreground" : "text-primary")}>{isDone ? "Hecho" : TYPE_INFO[d.type].short}</span>
            </div>
          );
        })}
      </div>
    </button>
  );
}

/** Lo que viene: siguiente sesión y siguiente prueba. */
export function UpNext({ state, plan, today, tests, onTest }: { state: ProgramState; plan: PlanDay[]; today: number; tests: TestResult[]; onTest: () => void }) {
  const next = plan.find((d) => d.index > today && d.type !== "Descanso");
  const testDate = nextTestDate(tests);
  const testDue = tests.length === 0 || (testDate && testDate <= new Date());
  return (
    <section className="mt-7">
      <h2 className="font-display text-[20px] uppercase">Lo que viene</h2>
      <div className="mt-2 divide-y divide-border rounded-[16px] border border-border bg-card">
        {next && (
          <div className="flex items-center gap-3 p-4">
            <CalendarClock className="shrink-0 text-primary" size={22} aria-hidden />
            <p className="text-[15px]"><b>{longDay(dateForIndex(state.start, next.index))}:</b> {next.type}{next.type === "Acondicionamiento" ? ` · ${programDose(next.week)[0]} min × ${programDose(next.week)[1]} swings` : ""}</p>
          </div>
        )}
        <button type="button" onClick={onTest} className="flex w-full items-center gap-3 p-4 text-left">
          <Repeat className="shrink-0 text-primary" size={22} aria-hidden />
          <span className="flex-1 text-[15px]">{tests.length === 0 ? "Prueba inicial pendiente" : testDue ? "Te toca tu Prueba OneBell" : <>Prueba OneBell: <b>{fmtDate(testDate!)}</b></>}</span>
          <span className="text-[15px] font-semibold text-primary">{testDue ? "Hacer" : "Ver"}</span>
        </button>
      </div>
    </section>
  );
}

/** Camino a la meta del programa, con la prueba y el volumen de la semana. */
export function GoalProgress({ program, tests, week }: { program: Program; tests: TestResult[]; week: number }) {
  const swing = TEST_MOVES[0];
  const last = tests[tests.length - 1];
  const best = Math.max(0, ...tests.map((t) => totalFor(swing, t) ?? 0));
  const pace = 20; // 100 swings en 5 minutos = 20 por minuto sostenidos
  const [sets, reps] = programDose(week);
  const volume = sets * reps;
  return (
    <section className="mt-7">
      <h2 className="font-display text-[20px] uppercase">Camino a tu meta</h2>
      <div className="mt-2 rounded-[16px] border border-border bg-card p-4">
        <p className="text-[15px] leading-snug">Meta: <b>{program.goal}</b>. Equivale a {pace} swings por minuto durante 5 minutos seguidos.</p>
        <div className="mt-4">
          <div className="flex items-baseline justify-between text-[15px]"><span>Tu mejor minuto en la prueba</span><span className="font-display text-[22px] text-primary">{last ? best : "—"}</span></div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (best / pace) * 100)}%` }} /></div>
          <p className="mt-1.5 text-sm text-muted-foreground">{!last ? "Haz tu prueba inicial para medir tu ritmo." : best >= pace ? "Ya tienes el ritmo en un minuto. Ahora el reto es sostenerlo." : `Te faltan ${pace - best} por minuto para el ritmo de la meta.`}</p>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline justify-between text-[15px]"><span>Swings por sesión esta semana</span><span className="font-display text-[22px] text-primary">{volume} / 100</span></div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, volume)}%` }} /></div>
          <p className="mt-1.5 text-sm text-muted-foreground">El volumen sube cada semana hasta llegar a 100 en la semana 7.</p>
        </div>
      </div>
    </section>
  );
}

/** Técnica del día: cambia cada día, dentro de tu nivel y espacio. */
export function TipOfDay({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const pool = allowed(profile).filter((e) => e.pattern !== "Calentamiento" && e.img);
  if (!pool.length) return null;
  const d = new Date(); const seed = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate();
  const ex = pool[seed % pool.length];
  return (
    <section className="mt-7">
      <h2 className="font-display text-[20px] uppercase">Técnica del día</h2>
      <button type="button" onClick={() => setOpen(true)} className="mt-2 flex w-full gap-4 rounded-[16px] border border-border bg-card p-3 text-left">
        <Thumb exercise={ex} className="h-24 w-24" />
        <span className="min-w-0 flex-1 py-1">
          <span className="block text-[17px] font-semibold leading-tight">{ex.name}</span>
          <span className="mt-1 block text-[15px] leading-snug">{ex.cue}.</span>
          {ex.mistakes[0] && <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">Evita: {ex.mistakes[0].charAt(0).toLowerCase() + ex.mistakes[0].slice(1)}</span>}
        </span>
      </button>
      {open && <Sheet title={ex.name} onClose={() => setOpen(false)}><ExerciseDetail exercise={ex} /></Sheet>}
    </section>
  );
}

type Badge = { id: string; name: string; hint: string; icon: typeof Award; earned: boolean };
export function achievements(stats: Stats, tests: TestResult[], state: ProgramState | null, plan: PlanDay[]): Badge[] {
  const weeks = [...new Set(plan.map((d) => Math.ceil(d.index / 7)))];
  const fullWeek = !!state && weeks.some((w) => { const t = plan.filter((d) => Math.ceil(d.index / 7) === w && d.type !== "Descanso"); return t.length > 0 && t.every((d) => state.done.includes(d.index)); });
  const record = tests.some((t, i) => i > 0 && TEST_MOVES.some((m) => (totalFor(m, t) ?? 0) > (totalFor(m, tests[i - 1]) ?? Infinity)));
  const trainable = plan.filter((d) => d.type !== "Descanso");
  const programDone = !!state && trainable.length > 0 && trainable.every((d) => state.done.includes(d.index));
  return [
    { id: "primera", name: "Primera sesión", hint: "Completa tu primera sesión", icon: Dumbbell, earned: stats.sessions >= 1 },
    { id: "prueba", name: "Punto de partida", hint: "Haz tu prueba inicial", icon: Star, earned: tests.length >= 1 },
    { id: "semana", name: "Semana completa", hint: "Completa todos los días de una semana", icon: Medal, earned: fullWeek },
    { id: "racha", name: "Racha de 3", hint: "Entrena 3 días seguidos", icon: Flame, earned: stats.streak >= 3 },
    { id: "diez", name: "10 sesiones", hint: "Acumula 10 sesiones", icon: Award, earned: stats.sessions >= 10 },
    { id: "record", name: "Nuevo récord", hint: "Supera tu prueba anterior en un ejercicio", icon: Trophy, earned: record },
    { id: "programa", name: "Programa terminado", hint: "Completa todo el calendario", icon: Trophy, earned: programDone },
  ];
}
export function Achievements({ badges }: { badges: Badge[] }) {
  const [open, setOpen] = useState<Badge | null>(null);
  const earned = badges.filter((b) => b.earned).length;
  return (
    <section className="mt-7">
      <div className="flex items-baseline justify-between"><h2 className="font-display text-[20px] uppercase">Logros</h2><span className="text-sm text-muted-foreground">{earned} de {badges.length}</span></div>
      <div className="no-scrollbar -mx-6 mt-2 flex gap-2.5 overflow-x-auto px-6 pb-1">
        {badges.map((b) => (
          <button key={b.id} type="button" onClick={() => setOpen(b)} className={cn("flex w-[92px] shrink-0 flex-col items-center gap-2 rounded-[16px] border p-3 text-center", b.earned ? "border-primary bg-card" : "border-border bg-card opacity-60")}>
            <span className={cn("flex h-12 w-12 items-center justify-center rounded-full", b.earned ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}><b.icon size={24} /></span>
            <span className="text-[12px] font-semibold leading-tight">{b.name}</span>
          </button>
        ))}
      </div>
      {open && (
        <Sheet title={open.name} onClose={() => setOpen(null)}>
          <p className="text-[16px]">{open.earned ? "Logro obtenido." : "Aún no lo obtienes."} {open.hint}.</p>
        </Sheet>
      )}
    </section>
  );
}
