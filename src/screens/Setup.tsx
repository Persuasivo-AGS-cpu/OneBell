import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { Choice } from "@/components/Choice";
import { Frame, StepHeader } from "@/components/Chrome";
import { Sheet } from "@/components/Sheet";
import type { Level, Profile } from "@/lib/types";

export const WEIGHTS = [6, 8, 10, 12, 14, 16, 20, 24, 28];
export const LEVELS: { value: Level; hint: string }[] = [
  { value: "Principiante", hint: "Nunca o casi nunca he usado kettlebell." },
  { value: "Intermedio", hint: "Domino el swing y el goblet squat." },
  { value: "Avanzado", hint: "Hago clean, snatch o get-ups con buena técnica." },
];
export const SPACES = [
  { value: "Techo bajo", hint: "No puedo levantar la pesa sobre mi cabeza estando de pie." },
  { value: "Vecinos abajo", hint: "Necesito evitar golpes y ruido." },
  { value: "Espacio reducido", hint: "Poco lugar para moverme." },
  { value: "Exterior", hint: "Entreno al aire libre." },
];
export const CONCERNS = ["Espalda baja", "Rodillas", "Hombros", "Muñecas"];

export const toggleExclusive = (list: string[], value: string, none: string) =>
  value === none ? [none] : list.includes(value) ? (list.filter((v) => v !== value).length ? list.filter((v) => v !== value) : [none]) : [...list.filter((v) => v !== none), value];

export function WeightGrid({ profile, update, cols = 3 }: { profile: Profile; update: (p: Partial<Profile>) => void; cols?: number }) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState(32);
  const all = [...new Set([...WEIGHTS, ...profile.weights])].sort((a, b) => a - b);
  const toggle = (w: number) => {
    if (profile.weights.includes(w) && profile.weights.length === 1) return;
    update({ weights: profile.weights.includes(w) ? profile.weights.filter((x) => x !== w) : [...profile.weights, w].sort((a, b) => a - b) });
  };
  return (
    <>
      <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {all.map((w) => (
          <Button key={w} role="checkbox" aria-checked={profile.weights.includes(w)} variant={profile.weights.includes(w) ? "selected" : "tile"} className="h-[60px] gap-1 rounded-[16px]" onClick={() => toggle(w)}>
            <span className="font-display text-[26px] leading-none">{w}</span><span className="text-sm text-muted-foreground">kg</span>
          </Button>
        ))}
        <Button className="h-[60px] rounded-[16px] text-sm" onClick={() => setAdding(true)}><Plus /> Otro</Button>
      </div>
      {adding && (
        <Sheet title="Agregar peso" onClose={() => setAdding(false)}>
          <label htmlFor="peso" className="block text-sm text-muted-foreground">Peso de tu kettlebell en kg</label>
          <input id="peso" type="number" inputMode="numeric" min={1} max={100} value={value} onChange={(e) => setValue(Number(e.target.value))}
            className="mt-2 h-14 w-full rounded-[14px] border border-border bg-background px-4 text-xl outline-none focus:border-primary" />
          <Button variant="ember" size="hero" className="mt-5" onClick={() => { if (value > 0 && value <= 100) { update({ weights: [...new Set([...profile.weights, value])].sort((a, b) => a - b) }); setAdding(false); } }}>Agregar peso</Button>
        </Sheet>
      )}
    </>
  );
}

const STEPS = [
  { title: "¿Qué kettlebells tienes?", sub: "Marca todas. Puedes cambiarlas en Perfil." },
  { title: "¿Cuál es tu nivel?", sub: "Ajustamos los ejercicios a tu experiencia." },
  { title: "¿Qué aplica a tu espacio?", sub: "Puedes elegir varias." },
  { title: "¿Qué zonas cuidamos?", sub: "Puedes elegir varias. Evitaremos los ejercicios que las cargan." },
  { title: "¿Cuántos días por semana?", sub: "Elige un ritmo que sí puedas mantener." },
];

export function Setup({ profile, update, onDone }: { profile: Profile; update: (p: Partial<Profile>) => void; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const spaceNone = profile.space.length === 0;
  return (
    <Frame scrollKey={String(step)}
      header={<StepHeader label="Paso" current={step + 1} total={5} onBack={step > 0 ? () => setStep(step - 1) : undefined} />}
      footer={<Button variant="ember" size="hero" disabled={step === 0 && profile.weights.length === 0} onClick={() => (step < 4 ? setStep(step + 1) : onDone())}>{step < 4 ? "Continuar" : "Guardar y continuar"}</Button>}>
      {step === 0 && <p className="mt-4 font-semibold text-primary">Hazlo tuyo</p>}
      <h1 className="mt-3 font-display text-[40px] uppercase leading-[1.02]">{s.title}</h1>
      <p className="mt-2 text-[16px] text-muted-foreground">{s.sub}</p>
      <div className="mt-6">
        {step === 0 && (
          <>
            <label htmlFor="nombre" className="mb-5 block">
              <span className="text-sm font-semibold text-muted-foreground">¿Cómo te llamas?</span>
              <input id="nombre" value={profile.name} maxLength={40} onChange={(e) => update({ name: e.target.value })} className="mt-2 h-14 w-full rounded-[14px] border border-border bg-background px-4 text-xl outline-none focus:border-primary" />
            </label>
            <WeightGrid profile={profile} update={update} />
          </>
        )}
        {step === 1 && <div role="radiogroup" className="space-y-3">{LEVELS.map((l) => <Choice key={l.value} label={l.value} hint={l.hint} selected={profile.level === l.value} onClick={() => update({ level: l.value })} />)}</div>}
        {step === 2 && (
          <div className="space-y-2.5">
            {SPACES.map((o) => <Choice key={o.value} multi label={o.value} hint={o.hint} selected={profile.space.includes(o.value)} onClick={() => update({ space: profile.space.includes(o.value) ? profile.space.filter((v) => v !== o.value) : [...profile.space, o.value] })} />)}
            <Choice multi label="Ninguna de estas" selected={spaceNone} onClick={() => update({ space: [] })} />
          </div>
        )}
        {step === 3 && (
          <div className="grid grid-cols-2 gap-2.5">
            {[...CONCERNS, "Ninguna"].map((c) => <Choice key={c} multi label={c} selected={profile.concerns.includes(c)} onClick={() => update({ concerns: toggleExclusive(profile.concerns, c, "Ninguna") })} />)}
          </div>
        )}
        {step === 4 && (
          <div role="radiogroup" className="grid grid-cols-4 gap-2.5">
            {[2, 3, 4, 5].map((d) => <Button key={d} role="radio" aria-checked={profile.days === d} variant={profile.days === d ? "selected" : "tile"} className="h-[84px] rounded-[16px] font-display text-4xl" onClick={() => update({ days: d })}>{d}</Button>)}
          </div>
        )}
      </div>
    </Frame>
  );
}
