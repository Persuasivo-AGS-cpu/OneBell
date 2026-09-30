import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/Button";
import { Frame } from "@/components/Chrome";
import { MuscleFigure } from "@/components/MuscleFigure";
import { sessionBell } from "@/lib/catalog";
import type { Profile, SessionItem } from "@/lib/types";

export type ExerciseRating = { id: string; name: string; rating: string };
export function Summary({ profile, session, seconds, streak, onSave }: { profile: Profile; session: SessionItem[]; seconds: number; streak: number; onSave: (ratings: ExerciseRating[]) => void }) {
  const [ratings, setRatings] = useState<Record<number, string>>({});
  const main = session.filter((s) => s.section === "Bloque principal" || s.section === "Programa");
  const groups = new Set(main.flatMap((s) => s.exercise.groups));
  if (groups.has("Cuerpo completo")) ["Piernas", "Glúteos", "Espalda", "Hombros", "Core", "Brazos", "Pecho"].forEach((g) => groups.add(g));
  const bell = sessionBell(profile);
  const kg = bell == null ? null : main.filter((s) => s.exercise.mode === "reps" && s.exercise.sides !== "Sin pesa")
    .reduce((t, s) => t + (s.reps ?? s.exercise.amount) * (s.sets ?? 1) * (s.exercise.perSide ? 2 : 1) * bell, 0);
  const save = () => onSave(session.flatMap((s, n) => ratings[n] ? [{ id: s.exercise.id, name: s.exercise.name, rating: ratings[n] }] : []));
  return (
    <Frame footer={<Button variant="ember" size="hero" onClick={save}>Guardar y terminar</Button>}>
      <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check size={26} strokeWidth={3} /></div>
      <h1 className="mt-4 font-display text-[48px] uppercase leading-none">Sesión completa</h1>
      <div className="mt-6 grid grid-cols-3 gap-2">
        {[[String(Math.max(1, Math.round(seconds / 60))), "minutos"], [kg == null ? "—" : kg.toLocaleString("es-MX"), "kg movidos"], [String(streak), streak === 1 ? "día seguido" : "días seguidos"]].map(([v, l]) => (
          <div key={l} className="rounded-[14px] border border-border bg-card p-3"><p className="font-display text-[28px] leading-none text-primary">{v}</p><p className="mt-1 text-sm text-muted-foreground">{l}</p></div>
        ))}
      </div>
      <h2 className="mt-8 font-display text-[22px] uppercase">Músculos trabajados</h2>
      <div className="mt-3 flex justify-center gap-10 rounded-[18px] border border-border bg-card p-5"><MuscleFigure back={false} groups={groups} /><MuscleFigure back groups={groups} /></div>
      <h2 className="mt-8 font-display text-[22px] uppercase">¿Cómo se sintió cada ejercicio?</h2>
      <div className="mt-3 space-y-2">
        {session.map((s, n) => (
          <div key={n} className="rounded-[14px] border border-border bg-card p-3">
            <p className="font-semibold">{s.exercise.name}</p>
            <div role="radiogroup" className="mt-2 grid grid-cols-3 gap-1.5">
              {["Fácil", "Bien", "Pesado"].map((r) => <Button key={r} role="radio" aria-checked={ratings[n] === r} variant={ratings[n] === r ? "selected" : "tile"} className="h-12 rounded-[10px] text-[15px]" onClick={() => setRatings({ ...ratings, [n]: r })}>{r}</Button>)}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}
