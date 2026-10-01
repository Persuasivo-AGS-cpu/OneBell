import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/Button";
import { Brand, Frame } from "@/components/Chrome";
import { Sheet } from "@/components/Sheet";
import { levelNumber } from "@/lib/catalog";
import { PROGRAMS, blockPossible, buildPlan, deloadText, type Program, type ProgramState } from "@/lib/program";
import { todayKey } from "@/lib/storage";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const nextMonday = () => { const d = new Date(); d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7)); return d; };
const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function Programs({ profile, current, onBack, onStart, tvMode }: { profile: Profile; current: ProgramState | null; onBack: () => void; onStart: (p: ProgramState) => void; tvMode?: boolean }) {
  const [chosen, setChosen] = useState<Program | null>(() => PROGRAMS.find((p) => p.id === current?.id) || PROGRAMS[0]);
  const [when, setWhen] = useState<"hoy" | "lunes">("hoy");
  const plan = chosen ? buildPlan(chosen, profile.days) : [];
  const count = (t: string) => plan.filter((d) => d.type === t).length;

  if (tvMode) {
    const activeProgram = chosen || PROGRAMS[0];
    const tooHard = levelNumber[activeProgram.level] > levelNumber[profile.level];
    const blocked = !blockPossible(activeProgram, profile);
    const activeCurrent = current?.id === activeProgram.id;
    const canSelect = activeProgram.ready && !blocked;

    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background pt-2 screen-in">
        <div className="flex shrink-0 items-center justify-between gap-3 py-1">
          <div className="flex items-center gap-3">
            <Button variant="tile" onClick={onBack} data-action="back" className="flex h-10 items-center gap-2 px-3 text-sm">
              <ArrowLeft size={16} /> Volver
            </Button>
            <h1 className="font-display text-xl uppercase">Programas</h1>
          </div>
          <span className="text-sm text-muted-foreground">{profile.days} días por semana</span>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 pt-1">
          <div className="grid min-h-0 min-w-0 gap-1.5" style={{ gridTemplateRows: `repeat(${PROGRAMS.length}, minmax(0, 1fr))` }}>
            {PROGRAMS.map((p) => {
              const pTooHard = levelNumber[p.level] > levelNumber[profile.level];
              const pActive = current?.id === p.id;
              const pBlocked = !blockPossible(p, profile);
              const isSelected = activeProgram.id === p.id;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setChosen(p)}
                  onFocus={() => setChosen(p)}
                  className={cn(
                    "flex min-h-0 flex-col justify-center rounded-lg border px-3 text-left",
                    isSelected ? "border-primary bg-primary/15" : "border-border bg-card",
                    pActive && !isSelected && "border-primary/60"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 text-sm font-semibold">
                    <span className="truncate text-primary">{p.level} · {p.weeks} sem</span>
                    {pActive ? (
                      <span className="flex items-center gap-1 text-primary text-sm font-bold"><Check size={16} /> Activo</span>
                    ) : !p.ready ? (
                      <span className="text-muted-foreground text-xs uppercase bg-secondary px-2 py-0.5 rounded">Próximamente</span>
                    ) : pBlocked ? (
                      <span className="text-amber-500 text-xs uppercase bg-amber-500/10 px-2 py-0.5 rounded">Incompatible con zonas</span>
                    ) : pTooHard ? (
                      <span className="text-muted-foreground text-xs uppercase bg-secondary px-2 py-0.5 rounded">Nivel avanzado</span>
                    ) : null}
                  </div>
                  <p className="truncate font-display text-xl uppercase leading-tight text-foreground">{p.name}</p>
                  <p className="truncate text-sm text-muted-foreground">Meta: {p.goal}</p>
                </button>
              );
            })}
          </div>

          {/* Columna Derecha: Detalle del programa y arranque */}
          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-4">
            <div className="min-h-0 flex-1 overflow-hidden">
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {activeProgram.level} · {activeProgram.weeks} semanas
                </span>
                <h2 className="mt-1 font-display text-3xl uppercase leading-none text-foreground">
                  {activeProgram.name}
                </h2>
                <p className="mt-2 text-base font-semibold">
                  Meta: <span className="text-primary">{activeProgram.goal}</span>
                </p>
              </div>

              <div className="grid grid-cols-5 gap-1.5 pt-3">
                {(["Fuerza", "Acondicionamiento", "Movilidad", "Descarga", "Prueba"] as const).map((t) => (
                  <div key={t} className="rounded-lg border border-border bg-background px-1.5 py-2 text-center">
                    <p className="font-display text-xl leading-none text-primary">{count(t)}</p>
                    <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
                      {({ Fuerza: "días fuerza", Acondicionamiento: "días cardio", Movilidad: "movilidad", Descarga: "descarga", Prueba: "pruebas" } as Record<string, string>)[t]}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-base text-muted-foreground">
                {deloadText(activeProgram.weeks)} La prueba final es el día {plan.length}.
              </p>

              {canSelect && (
                <div className="pt-2">
                  <h3 className="font-display text-xl uppercase mb-2">¿Cuándo empiezas?</h3>
                  <div role="radiogroup" className="grid grid-cols-2 gap-3">
                    <Button role="radio" aria-checked={when === "hoy"} variant={when === "hoy" ? "selected" : "tile"} className="h-12 text-lg" onClick={() => setWhen("hoy")}>Hoy</Button>
                    <Button role="radio" aria-checked={when === "lunes"} variant={when === "lunes" ? "selected" : "tile"} className="h-12 text-lg" onClick={() => setWhen("lunes")}>El lunes</Button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 shrink-0 border-t border-border pt-3">
              {canSelect ? (
                <Button
                  variant="ember"
                  className="h-12 w-full text-lg"
                  onClick={() => onStart({ id: activeProgram.id, start: when === "hoy" ? todayKey() : key(nextMonday()), days: profile.days, done: [] })}
                >
                  {activeCurrent ? "Reiniciar mi calendario" : "Armar mi calendario"}
                </Button>
              ) : (
                <div className="p-4 bg-background border border-amber-500/30 rounded-xl text-center text-base text-muted-foreground">
                  {blocked ? "Este programa no es compatible con tus zonas a cuidar actuales." : !activeProgram.ready ? "Este programa estará disponible próximamente." : "Este programa está por encima de tu nivel actual."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado estándar en Celular
  return (
    <Frame header={<div className="grid grid-cols-[48px_1fr_48px] items-center"><Button variant="text" size="icon" aria-label="Volver" data-action="back" onClick={onBack}><ArrowLeft /></Button><h1 className="text-center font-display text-[26px] uppercase">Programas</h1><span /></div>}>
      <p className="mt-1 text-[16px] text-muted-foreground">Cada programa tiene una meta medible. Al elegirlo se arma tu calendario completo con {profile.days} días de entrenamiento por semana.</p>
      <div className="mt-5 space-y-3">
        {PROGRAMS.map((p) => {
          const tooHard = levelNumber[p.level] > levelNumber[profile.level];
          const active = current?.id === p.id;
          const blocked = !blockPossible(p, profile);
          return (
            <button key={p.id} type="button" disabled={!p.ready || blocked} onClick={() => setChosen(p)}
              className={cn("w-full rounded-[16px] border bg-card p-4 text-left disabled:opacity-50", active ? "border-2 border-primary" : "border-border")}>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-primary">{p.level} · {p.weeks} semanas</span>
                {active ? <span className="flex items-center gap-1 text-primary"><Check size={16} /> Activo</span> : !p.ready ? <span className="text-muted-foreground">Próximamente</span> : blocked ? <span className="text-muted-foreground">No va con tus zonas a cuidar</span> : tooHard ? <span className="text-muted-foreground">Arriba de tu nivel</span> : null}
              </div>
              <p className="mt-1 font-display text-[26px] uppercase leading-tight">{p.name}</p>
              <p className="mt-1 text-[15px] text-muted-foreground">Meta: {p.goal}.</p>
            </button>
          );
        })}
      </div>
      {chosen && (
        <Sheet title={chosen.name} onClose={() => setChosen(null)}>
          <p className="text-[16px]">Meta: <b>{chosen.goal}</b>.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[15px]">
            {(["Fuerza", "Acondicionamiento", "Movilidad", "Descarga", "Prueba"] as const).map((t) => (
              <div key={t} className="rounded-[12px] bg-background p-3"><p className="font-display text-[24px] leading-none text-primary">{count(t)}</p><p className="mt-1 text-muted-foreground">{({ Fuerza: "días de fuerza", Acondicionamiento: "días de acondicionamiento", Movilidad: "días de movilidad", Descarga: "días ligeros", Prueba: "pruebas" } as Record<string, string>)[t]}</p></div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{deloadText(chosen.weeks)} La prueba final es el día {plan.length}.</p>
          <h3 className="mt-5 font-display text-[20px] uppercase">¿Cuándo empiezas?</h3>
          <div role="radiogroup" className="mt-2 grid grid-cols-2 gap-2">
            <Button role="radio" aria-checked={when === "hoy"} variant={when === "hoy" ? "selected" : "tile"} className="h-14" onClick={() => setWhen("hoy")}>Hoy</Button>
            <Button role="radio" aria-checked={when === "lunes"} variant={when === "lunes" ? "selected" : "tile"} className="h-14" onClick={() => setWhen("lunes")}>El lunes</Button>
          </div>
          {current && current.id !== chosen.id && <p className="mt-3 text-sm text-muted-foreground">Esto reemplaza tu programa actual y su calendario.</p>}
          {current && current.id === chosen.id && <p className="mt-3 text-sm text-muted-foreground">Esto reinicia tu calendario desde el día 1.</p>}
          <Button variant="ember" size="hero" className="mt-5" onClick={() => onStart({ id: chosen.id, start: when === "hoy" ? todayKey() : key(nextMonday()), days: profile.days, done: [] })}>Armar mi calendario</Button>
        </Sheet>
      )}
    </Frame>
  );
}

