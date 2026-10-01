import { useState } from "react";
import { Button } from "@/components/Button";
import { Brand, Frame } from "@/components/Chrome";
import { Sheet } from "@/components/Sheet";
import { TYPE_INFO, buildPlan, dateForIndex, dayIndexFor, doseLine, programById, typeDesc, weekBlocks, type PlanDay, type ProgramState } from "@/lib/program";
import { cn } from "@/lib/utils";

const fmt = (d: Date) => new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(d);

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

  // Renderizado especial en MODO TV (1 semana a la vez, fuentes de 24px a 32px, sin scroll)
  if (tvMode) {
    const weekDays = plan.filter((d) => d.week === selectedWeek);
    const activeDetail = selectedTvDay || weekDays[0] || plan[0];

    return (
      <div className="flex h-full w-full flex-col bg-background screen-in">
        <div className="flex items-center justify-between border-b border-border pb-2 pt-2">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl uppercase text-foreground">{program.name}</span>
            <span className="text-sm text-muted-foreground font-semibold">({done} de {trainable.length} completados)</span>
          </div>
          <Button variant="tile" onClick={onPrograms} className="h-10 px-3 text-sm">Cambiar programa</Button>
        </div>

        <div className="grid grid-cols-[1.1fr_1fr] gap-6 flex-1 min-h-0 pt-3">
          {/* Panel Izquierdo: 1 Semana a la vez con tarjetas de 24px */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between rounded-xl bg-card border border-border px-4 py-2">
              <Button
                variant="text"
                className="h-12 text-lg"
                disabled={selectedWeek <= 1}
                onClick={() => {
                  const nextW = Math.max(1, selectedWeek - 1);
                  setSelectedWeek(nextW);
                  const first = plan.find((d) => d.week === nextW);
                  if (first) setSelectedTvDay(first);
                }}
              >
                &larr; Semana anterior
              </Button>
              <span className="font-display text-2xl uppercase text-primary">
                Semana {selectedWeek} de {program.weeks}
              </span>
              <Button
                variant="text"
                className="h-12 text-lg"
                disabled={selectedWeek >= program.weeks}
                onClick={() => {
                  const nextW = Math.min(program.weeks, selectedWeek + 1);
                  setSelectedWeek(nextW);
                  const first = plan.find((d) => d.week === nextW);
                  if (first) setSelectedTvDay(first);
                }}
              >
                Semana siguiente &rarr;
              </Button>
            </div>

            <div className="flex flex-col gap-2 flex-1 overflow-y-auto no-scrollbar">
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
                      "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all",
                      isSelected ? "border-primary bg-primary/10 scale-[1.01]" : "border-border bg-card hover:border-border/80",
                      isToday && "ring-2 ring-primary"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn("font-display text-2xl w-8", isToday ? "text-primary font-bold" : "text-muted-foreground")}>
                        {d.index}
                      </span>
                      <div>
                        <p className={cn("font-display text-2xl uppercase leading-none", rest ? "text-muted-foreground" : "text-foreground")}>
                          {d.type}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {fmt(dateForIndex(state.start, d.index))}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isToday && <span className="text-xs uppercase font-bold text-primary bg-primary/20 px-2.5 py-1 rounded-full">Hoy</span>}
                      {isDone && <span className="font-display text-xl text-primary font-bold">✓ HECHO</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel Derecho: Detalle del día seleccionado (texto a 32px y acciones) */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xl min-h-0">
            {activeDetail ? (
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-semibold uppercase text-primary tracking-wider">
                    {fmt(dateForIndex(state.start, activeDetail.index))} · Semana {activeDetail.week}
                  </span>
                  <h2 className="font-display text-4xl uppercase mt-1 leading-tight">
                    {activeDetail.type} (Día {activeDetail.index})
                  </h2>
                </div>

                <p className="text-[28px] leading-snug text-foreground/90 font-medium pt-2">
                  {typeDesc(program, activeDetail.type)}
                </p>

                {doseLine(program, activeDetail.week, activeDetail.type) && (
                  <p className="text-[24px] text-muted-foreground bg-background rounded-xl p-4 border border-border">
                    Esta semana: <b className="text-foreground">{doseLine(program, activeDetail.week, activeDetail.type)}</b>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-2xl text-muted-foreground">Selecciona un día para ver el detalle</p>
            )}

            {activeDetail && activeDetail.type !== "Descanso" && (
              <div className="space-y-3 pt-6 border-t border-border">
                {activeDetail.index === today && !state.done.includes(activeDetail.index) && (
                  <Button
                    variant="ember"
                    size="hero"
                    className="h-18 text-2xl uppercase tracking-wider font-display w-full"
                    onClick={() => onStartDay(activeDetail)}
                  >
                    {activeDetail.type === "Prueba" ? "Hacer la prueba OneBell" : "Ver sesión de hoy"}
                  </Button>
                )}
                <Button
                  variant="tile"
                  className="h-14 text-xl w-full"
                  onClick={() => onToggle(activeDetail.index)}
                >
                  {state.done.includes(activeDetail.index) ? "Quitar la marca de completado" : "Marcar día como completado"}
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

