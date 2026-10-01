import { useState } from "react";
import { Button } from "@/components/Button";
import { Brand, Frame } from "@/components/Chrome";
import { Sheet } from "@/components/Sheet";
import { TYPE_INFO, buildPlan, dateForIndex, dayIndexFor, doseLine, programById, typeDesc, weekBlocks, type PlanDay, type ProgramState } from "@/lib/program";
import { cn } from "@/lib/utils";

const fmt = (d: Date) => new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(d);

export function Calendar({ state, onPrograms, onToggle, onStartDay }: { state: ProgramState | null; onPrograms: () => void; onToggle: (i: number) => void; onStartDay: (d: PlanDay) => void }) {
  const program = programById(state?.id);
  const [open, setOpen] = useState<PlanDay | null>(null);
  if (!state || !program) return (
    <Frame header={<Brand />}>
      <h1 className="mt-2 font-display text-[44px] uppercase leading-none">Calendario</h1>
      <p className="mt-3 text-[16px] text-muted-foreground">Elige un programa y se arma tu calendario completo: qué toca cada día, tus pruebas y tus semanas de descarga.</p>
      <Button variant="ember" size="hero" className="mt-6" onClick={onPrograms}>Elegir programa</Button>
    </Frame>
  );
  const plan = buildPlan(program, state.days);
  const today = dayIndexFor(state.start);
  const trainable = plan.filter((d) => d.type !== "Descanso");
  const done = trainable.filter((d) => state.done.includes(d.index)).length;
  return (
    <Frame header={<div className="flex items-center justify-between"><Brand /><button type="button" onClick={onPrograms} className="text-sm font-semibold text-primary">Cambiar programa</button></div>}>
      <h1 className="mt-2 font-display text-[34px] uppercase leading-none">{program.name}</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">{done} de {trainable.length} días completados. Toca un día para ver qué incluye.</p>
      {weekBlocks(program.weeks).map((b) => (
        <section key={b.title} className="mt-5">
          <h2 className="rounded-t-[10px] bg-foreground py-1.5 text-center font-display text-[17px] uppercase text-background">{b.title}</h2>
          <div className="grid grid-cols-7 border-l border-t border-border">
            {plan.filter((d) => d.index >= b.from && d.index <= b.to).map((d) => {
              const isDone = state.done.includes(d.index);
              const isToday = d.index === today;
              const rest = d.type === "Descanso";
              return (
                <button key={d.index} type="button" onClick={() => setOpen(d)} aria-label={`Día ${d.index}, ${d.type}${isDone ? ", completado" : ""}${isToday ? ", hoy" : ""}`}
                  className={cn("relative flex h-[64px] flex-col items-start border-r border-b border-border p-1 text-left", isToday && "outline outline-2 -outline-offset-2 outline-primary", d.type === "Prueba" && "bg-primary/15")}>
                  <span className={cn("text-[11px] font-semibold", isToday ? "text-primary" : "text-muted-foreground")}>{d.index}</span>
                  <span className={cn("mt-0.5 text-[11px] leading-tight", rest ? "text-muted-foreground" : "font-semibold")}>{TYPE_INFO[d.type].short}</span>
                  {isDone && (
                    <svg aria-hidden viewBox="0 0 40 40" className="pointer-events-none absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)] text-primary"><path d="M8 8 32 32M32 8 8 32" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" /></svg>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}
      {open && (
        <Sheet title={`Día ${open.index} · ${open.type}`} onClose={() => setOpen(null)}>
          <p className="text-sm font-semibold text-muted-foreground first-letter:uppercase">{fmt(dateForIndex(state.start, open.index))} · Semana {open.week}</p>
          <p className="mt-3 text-[16px] leading-snug">{typeDesc(program, open.type)}</p>
          {doseLine(program, open.week, open.type) && <p className="mt-2 text-[16px]">Esta semana: <b>{doseLine(program, open.week, open.type)}</b>.</p>}
          {open.type !== "Descanso" && (
            <div className="mt-5 space-y-2">
              {open.index === today && !state.done.includes(open.index) && <Button variant="ember" size="hero" onClick={() => { setOpen(null); onStartDay(open); }}>{open.type === "Prueba" ? "Hacer la prueba" : "Ver sesión de hoy"}</Button>}
              <Button className="h-14 w-full" onClick={() => { onToggle(open.index); setOpen(null); }}>{state.done.includes(open.index) ? "Quitar la X" : "Marcar como hecho"}</Button>
            </div>
          )}
        </Sheet>
      )}
    </Frame>
  );
}
