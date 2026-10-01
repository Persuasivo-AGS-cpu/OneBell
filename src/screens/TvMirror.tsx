import { useEffect, useState } from "react";
import { byId } from "@/lib/catalog";
import { imageFor } from "@/lib/images";
import type { WorkoutMirror } from "@/lib/sync";
import { formatClock } from "@/lib/utils";

/** Lo que la televisión muestra mientras el celular lleva el entrenamiento. */
export function TvMirror({ mirror }: { mirror: WorkoutMirror }) {
  const [left, setLeft] = useState(mirror.left);
  const stamp = `${mirror.exerciseId}:${mirror.set}:${mirror.paused}:${mirror.left}:${mirror.label}`;
  useEffect(() => { setLeft(mirror.left); }, [stamp, mirror.left]);
  useEffect(() => {
    if (mirror.paused) return;
    const id = window.setInterval(() => setLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [mirror.paused, stamp]);

  const exercise = byId(mirror.exerciseId);
  const photo = imageFor(exercise);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background px-8 py-6">
      <div className="tv-stage min-h-0 flex-1">
        <div className="tv-stage-photo">
          {photo ? <img src={photo} alt="" /> : <p className="px-6 text-center font-display text-[48px] uppercase leading-none">{mirror.exerciseName}</p>}
        </div>
        <div className="flex min-h-0 flex-col overflow-hidden">
          <p className="text-[32px] font-semibold text-muted-foreground">{mirror.section}{mirror.totalSets > 1 ? ` · serie ${mirror.set} de ${mirror.totalSets}` : ""}</p>
          <h1 className="mt-3 font-display text-[48px] uppercase leading-none">{mirror.exerciseName}</h1>
          <p className="mt-2 text-[32px] font-semibold text-muted-foreground">{mirror.label}</p>
          <p className="mt-4 font-display text-[120px] leading-none tabular-nums text-primary">{formatClock(left)}</p>
          <p className="text-[32px] font-semibold leading-snug">{mirror.cue}</p>
          <p className="mt-auto text-[32px] font-semibold text-primary">Se controla desde el celular</p>
        </div>
      </div>
    </div>
  );
}
