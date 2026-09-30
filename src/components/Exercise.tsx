import { Activity, ArrowDownUp, Dumbbell, Footprints, MoveHorizontal, RotateCw, StretchHorizontal, Waves } from "lucide-react";
import { imageFor } from "@/lib/catalog";
import type { Exercise } from "@/lib/types";
import { cn } from "@/lib/utils";

const patternIcon: Record<string, typeof Activity> = {
  Calentamiento: Waves, Bisagra: ArrowDownUp, "Sentadilla y zancada": Footprints, Empuje: Dumbbell,
  Jalón: MoveHorizontal, Carga: Activity, "Core y rotación": RotateCw, Movilidad: StretchHorizontal,
};

export function Thumb({ exercise, className }: { exercise: Exercise; className?: string }) {
  const src = imageFor(exercise);
  const Icon = patternIcon[exercise.pattern] ?? Activity;
  return (
    <div className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-photo", className)}>
      {src ? <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" /> : <Icon className="text-primary" size={26} strokeWidth={1.8} aria-hidden />}
    </div>
  );
}

/** Ficha completa del ejercicio: foto, grupos, pasos, clave y errores comunes. */
export function ExerciseDetail({ exercise }: { exercise: Exercise }) {
  const src = imageFor(exercise);
  return (
    <div>
      {src && <img src={src} alt={`Demostración de ${exercise.name}`} className="aspect-square w-full rounded-[16px] object-cover" />}
      <div className="mt-4 flex flex-wrap gap-2">
        {exercise.groups.map((g) => <span key={g} className="rounded-full border border-border px-3 py-1 text-sm font-semibold text-muted-foreground">{g}</span>)}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {exercise.pattern} · {["", "Principiante", "Intermedio", "Avanzado"][exercise.level]} · {exercise.primary}
      </p>
      <h3 className="mt-6 font-display text-xl uppercase">Cómo se hace</h3>
      <ol className="mt-2 border-t border-border">
        {exercise.steps.map((s, i) => (
          <li key={i} className="grid grid-cols-[28px_1fr] gap-2 border-b border-border py-3 text-[16px] leading-snug">
            <span className="font-display text-xl text-primary">{i + 1}</span><span>{s}</span>
          </li>
        ))}
      </ol>
      <div className="mt-5 rounded-[14px] bg-background p-4">
        <p className="text-sm font-semibold text-muted-foreground">Clave de técnica</p>
        <p className="mt-1 text-[17px] font-semibold leading-snug">{exercise.cue}</p>
      </div>
      {exercise.mistakes.length > 0 && (
        <>
          <h3 className="mt-6 font-display text-xl uppercase">Errores comunes</h3>
          <ul className="mt-2 space-y-2">
            {exercise.mistakes.map((m) => <li key={m} className="flex gap-3 text-[15px] leading-snug text-muted-foreground"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{m}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}
