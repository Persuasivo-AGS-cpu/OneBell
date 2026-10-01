import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/Button";
import { Frame } from "@/components/Chrome";
import { Sheet } from "@/components/Sheet";
import { levelNumber } from "@/lib/catalog";
import { PROGRAMS, blockPossible, buildPlan, deloadText, type Program, type ProgramState } from "@/lib/program";
import { todayKey } from "@/lib/storage";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const nextMonday = () => { const d = new Date(); d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7)); return d; };
const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function Programs({ profile, current, onBack, onStart }: { profile: Profile; current: ProgramState | null; onBack: () => void; onStart: (p: ProgramState) => void }) {
  const [chosen, setChosen] = useState<Program | null>(null);
  const [when, setWhen] = useState<"hoy" | "lunes">("hoy");
  const plan = chosen ? buildPlan(chosen, profile.days) : [];
  const count = (t: string) => plan.filter((d) => d.type === t).length;
  return (
    <Frame header={<div className="grid grid-cols-[48px_1fr_48px] items-center"><Button variant="text" size="icon" aria-label="Volver" onClick={onBack}><ArrowLeft /></Button><h1 className="text-center font-display text-[26px] uppercase">Programas</h1><span /></div>}>
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
