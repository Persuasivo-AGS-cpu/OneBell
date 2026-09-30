import { useState } from "react";
import { ArrowLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/Button";
import { Frame } from "@/components/Chrome";
import { ExerciseDetail, Thumb } from "@/components/Exercise";
import { Sheet } from "@/components/Sheet";
import { doseLabel } from "@/lib/catalog";
import { alternativesFor, sessionGroups } from "@/lib/session";
import type { Exercise, Profile, Section, SessionItem } from "@/lib/types";
import { plural } from "@/lib/utils";

const SECTIONS: Section[] = ["Calentamiento", "Programa", "Bloque principal", "Cierre"];
const dose = (it: SessionItem) => (it.sets && it.reps ? `${it.sets} × ${it.reps} swings` : doseLabel(it.exercise));

export function Preview({ profile, minutes, title, session, setSession, regenerate, onBack, onStart }: {
  profile: Profile; minutes: number; title: string; session: SessionItem[]; setSession: (s: SessionItem[]) => void; regenerate: () => void; onBack: () => void; onStart: () => void;
}) {
  const [detail, setDetail] = useState<Exercise | null>(null);
  const [changing, setChanging] = useState<number | null>(null);
  const alts = changing === null ? [] : alternativesFor(profile, session[changing].exercise, session.map((s) => s.exercise));
  return (
    <Frame
      header={<div className="grid grid-cols-[48px_1fr_48px] items-center"><Button variant="text" size="icon" aria-label="Volver a Hoy" onClick={onBack}><ArrowLeft /></Button><span className="text-center text-sm font-semibold text-muted-foreground">Tu sesión de {minutes} min</span><Button variant="text" size="icon" aria-label="Regenerar sesión" onClick={regenerate}><RefreshCw /></Button></div>}
      footer={<Button variant="ember" size="hero" onClick={onStart}>Empezar</Button>}>
      <h1 className="mt-2 font-display text-[42px] uppercase leading-none">{title}</h1>
      <div className="mt-4 flex flex-wrap gap-2">{sessionGroups(session).map((g) => <span key={g} className="rounded-full border border-border px-3 py-1 text-sm font-semibold text-muted-foreground">{g}</span>)}</div>
      {SECTIONS.map((sec) => {
        const items = session.map((it, i) => ({ it, i })).filter(({ it }) => it.section === sec);
        if (!items.length) return null;
        return (
          <section key={sec} className="mt-7">
            <div className="mb-2 flex items-baseline justify-between border-b border-border pb-2">
              <h2 className="font-display text-[22px] uppercase">{sec}</h2>
              <span className="text-sm text-muted-foreground">{plural(items.length, "ejercicio", "ejercicios")}</span>
            </div>
            <div className="space-y-2">
              {items.map(({ it, i }) => (
                <div key={it.exercise.id + i} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-[14px] bg-card p-2">
                  <button type="button" className="flex min-w-0 items-center gap-3 text-left" onClick={() => setDetail(it.exercise)}>
                    <Thumb exercise={it.exercise} className="h-14 w-14" />
                    <span className="min-w-0"><span className="block line-clamp-2 text-[17px] font-semibold leading-tight">{it.exercise.name}</span><span className="block text-sm text-muted-foreground">{dose(it)}</span>{it.note && <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{it.note}</span>}</span>
                  </button>
                  {it.section === "Programa" ? <span className="px-3 text-[13px] font-semibold text-primary">Clave</span> : <Button variant="text" className="px-3 text-[15px] font-semibold text-primary hover:text-primary" onClick={() => setChanging(i)}>Cambiar</Button>}
                </div>
              ))}
            </div>
          </section>
        );
      })}
      {detail && <Sheet title={detail.name} onClose={() => setDetail(null)}><ExerciseDetail exercise={detail} /></Sheet>}
      {changing !== null && (
        <Sheet title="Cambiar ejercicio" onClose={() => setChanging(null)}>
          <p className="mb-4 text-sm text-muted-foreground">Mismo tipo de movimiento que {session[changing].exercise.name}.</p>
          {alts.length === 0 && <p className="text-[16px]">No hay más opciones para tu nivel y espacio en este patrón.</p>}
          <div className="space-y-2">
            {alts.map((e) => (
              <button key={e.id} type="button" className="flex w-full items-center gap-3 rounded-[14px] border border-border bg-background p-2 text-left" onClick={() => { setSession(session.map((s, i) => (i === changing ? { ...s, exercise: e } : s))); setChanging(null); }}>
                <Thumb exercise={e} className="h-14 w-14" />
                <span className="min-w-0 flex-1"><span className="block text-[17px] font-semibold">{e.name}</span><span className="block text-sm text-muted-foreground">{e.groups.join(", ")}</span></span>
                <ChevronRight className="text-primary" />
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </Frame>
  );
}
