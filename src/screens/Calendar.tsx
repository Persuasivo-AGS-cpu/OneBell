import { useState } from "react";
import { Button } from "@/components/Button";
import { Brand, Frame } from "@/components/Chrome";
import { Sheet } from "@/components/Sheet";
import { TYPE_INFO, buildPlan, dateForIndex, dayIndexFor, doseLine, programById, typeDesc, weekBlocks, type PlanDay, type ProgramState } from "@/lib/program";
import { cn } from "@/lib/utils";

const fmt = (d: Date) => new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(d);
const shortWeekday = new Intl.DateTimeFormat("es-MX", { weekday: "short" });
const shortMonth = new Intl.DateTimeFormat("es-MX", { month: "short" });
const shortFmt = (d: Date) => `${shortWeekday.format(d).replace(".", "")} ${d.getDate()} ${shortMonth.format(d).replace(".", "")}`;

export function Calendar({ state, onPrograms, onToggle, onStartDay, tvMode }: { state: ProgramState | null; onPrograms: () => void; onToggle: (i: number) => void; onStartDay: (d: PlanDay) => void; tvMode?: boolean }) {
  const program = programById(state?.id);
  const plan = program && state ? buildPlan(program, state.days) : [];
  const today = state ? dayIndexFor(state.start) : 0;
  const currentDay = plan[today - 1] || plan[0];
  const currentWeek = currentDay?.week ?? 1;

  const [open, setOpen] = useState<PlanDay | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);
  const [selectedTvDay, setSelectedTvDay] = useState<PlanDay | null>(() => currentDay || null);

  if (!state || !program) return (
    <Frame header={<Brand />}>
      <h1 className="mt-2 font-display text-[44px] uppercase leading-none">Calendario</h1>
      <p className="mt-3 text-[16px] text-muted-foreground">Elige un programa y se arma tu calendario completo: qué toca cada día, tus pruebas y tus semanas de descarga.</p>
      <Button variant="ember" size="hero" className="mt-6" onClick={onPrograms}>Elegir programa</Button>
    </Frame>
  );

  const trainable = plan.filter((d) => d.type !== "Descanso");
  const done = trainable.filter((d) => state.done.includes(d.index)).length;

  // TV: los 7 días de la semana caben a la vez. Abajo pasa al día siguiente; no hay scroll.
  if (tvMode) {
    const weekDays = plan.filter((d) => d.week === selectedWeek);
    const activeDetail = selectedTvDay || weekDays[0] || plan[0];
    const goWeek = (nextW: number) => {
      setSelectedWeek(nextW);
      const first = plan.find((d) => d.week === nextW);
      if (first) setSelectedTvDay(first);
    };

    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background screen-in">
        <div className="flex shrink-0 items-center justify-between gap-3 py-1">
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="truncate font-display text-xl uppercase text-foreground">{program.name}</span>
            <span className="shrink-0 text-sm text-muted-foreground">{done} de {trainable.length}</span>
          </div>
          <Button variant="tile" onClick={onPrograms} className="h-10 shrink-0 px-3 text-sm">Cambiar programa</Button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[1.15fr_0.85fr] gap-3 pt-1">
          <div className="flex min-h-0 min-w-0 flex-col gap-1.5">
            <div className="flex shrink-0 items-center justify-between rounded-xl border border-border bg-card px-2">
              <Button variant="text" className="h-10 px-2 text-base" disabled={selectedWeek <= 1} onClick={() => goWeek(Math.max(1, selectedWeek - 1))}>← Anterior</Button>
              <span className="font-display text-lg uppercase text-primary">Semana {selectedWeek} de {program.weeks}</span>
              <Button variant="text" className="h-10 px-2 text-base" disabled={selectedWeek >= program.weeks} onClick={() => goWeek(Math.min(program.weeks, selectedWeek + 1))}>Siguiente →</Button>
            </div>

            <div className="grid min-h-0 flex-1 gap-1" style={{ gridTemplateRows: `repeat(${Math.max(weekDays.length, 1)}, minmax(0, 1fr))` }}>
              {weekDays.map((d) => {
                const isDone = state.done.includes(d.index);
                const isToday = d.index === today;
                const isSelected = activeDetail?.index === d.index;
                const rest = d.type === "Descanso";
                return (
                  <button
                    key={d.index}
                    type="button"
                    onClick={() => setSelectedTvDay(d)}
                    onFocus={() => setSelectedTvDay(d)}
                    className={cn(
                      "flex min-h-0 items-center gap-3 rounded-lg border px-3 text-left",
                      isSelected ? "border-primary bg-primary/15" : "border-border bg-card",
                      isToday && !isSelected && "border-primary/60"
                    )}
                  >
                    <span className={cn("w-7 shrink-0 font-display text-xl", isToday || isSelected ? "text-primary" : "text-muted-foreground")}>{d.index}</span>
                    <span className={cn("min-w-0 flex-1 truncate font-display text-xl uppercase", rest ? "text-muted-foreground" : "text-foreground")}>{d.type}</span>
                    <span className="shrink-0 text-sm text-muted-foreground">{shortFmt(dateForIndex(state.start, d.index))}</span>
                    {isToday && <span className="shrink-0 text-xs font-bold uppercase text-primary">Hoy</span>}
                    {isDone && <span className="shrink-0 font-display text-lg text-primary">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-4">
            {activeDetail ? (
              <div className="min-h-0 flex-1 overflow-hidden">
                <p className="text-sm font-semibold uppercase text-primary">{fmt(dateForIndex(state.start, activeDetail.index))}</p>
                <p className="text-sm text-muted-foreground">Semana {activeDetail.week}</p>
                <h2 className="mt-1 font-display text-3xl uppercase leading-none">{activeDetail.type}</h2>
                <p className="mt-2 line-clamp-4 text-lg leading-snug text-foreground/90">{typeDesc(program, activeDetail.type)}</p>
                {doseLine(program, activeDetail.week, activeDetail.type) && (
                  <p className="mt-2 text-base text-muted-foreground">Esta semana: <b className="text-foreground">{doseLine(program, activeDetail.week, activeDetail.type)}</b></p>
                )}
              </div>
            ) : (
              <p className="text-lg text-muted-foreground">Elige un día</p>
            )}

            {activeDetail && activeDetail.type !== "Descanso" && (
              <div className="mt-3 shrink-0 space-y-2 border-t border-border pt-3">
                {activeDetail.index === today && !state.done.includes(activeDetail.index) && (
                  <Button variant="ember" className="h-12 w-full text-lg" onClick={() => onStartDay(activeDetail)}>
                    {activeDetail.type === "Prueba" ? "Hacer la prueba" : "Ver sesión de hoy"}
                  </Button>
                )}
                <Button variant="tile" className="h-12 w-full text-base" onClick={() => onToggle(activeDetail.index)}>
                  {state.done.includes(activeDetail.index) ? "Quitar la marca" : "Marcar como hecho"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Renderizado estándar en Celular
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

