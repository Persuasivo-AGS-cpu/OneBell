import { useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Sheet } from "@/components/Sheet";
import { Button } from "@/components/Button";
import { Choice } from "@/components/Choice";
import { Brand, Frame } from "@/components/Chrome";
import { cn } from "@/lib/utils";
import type { Profile as P } from "@/lib/types";
import { CONCERNS, LEVELS, SPACES, WeightGrid, toggleExclusive } from "./Setup";

const Group = ({ title, children }: { title: string; children: ReactNode }) => <section className="mt-7"><h2 className="mb-3 font-display text-[22px] uppercase">{title}</h2>{children}</section>;

export function Profile({ profile, update, onReset, tvMode, onToggleTv }: { profile: P; update: (p: Partial<P>) => void; onReset: () => void; tvMode: boolean; onToggleTv: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const [activeGroup, setActiveGroup] = useState<"pesas" | "nivel" | "espacio" | "zonas" | "dias" | "voz" | "tv" | "nombre" | "reiniciar">("pesas");

  if (tvMode) {
    const groups = [
      { id: "pesas", label: "Tus pesas", summary: profile.weights.length ? profile.weights.join(", ") + " kg" : "Sin pesas" },
      { id: "nivel", label: "Nivel", summary: profile.level },
      { id: "espacio", label: "Tu espacio", summary: profile.space.length ? profile.space.join(", ") : "Estándar" },
      { id: "zonas", label: "Zonas a cuidar", summary: profile.concerns.join(", ") },
      { id: "dias", label: "Días por semana", summary: `${profile.days} días` },
      { id: "voz", label: "Voz en entreno", summary: profile.voice ? "Activada" : "Desactivada" },
      { id: "tv", label: "Modo TV", summary: tvMode ? "Activo" : "Inactivo" },
      { id: "nombre", label: "Nombre atleta", summary: profile.name || "Sin nombre" },
      { id: "reiniciar", label: "Reiniciar app", summary: "Borrar datos" }
    ] as const;

    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background pt-2 screen-in">
        <div className="grid min-h-0 flex-1 grid-cols-[0.9fr_1.2fr] gap-3">
          <div className="grid min-h-0 min-w-0 gap-1" style={{ gridTemplateRows: `repeat(${groups.length}, minmax(0, 1fr))` }}>
            {groups.map((g) => {
              const isSelected = activeGroup === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setActiveGroup(g.id)}
                  onFocus={() => setActiveGroup(g.id)}
                  className={cn(
                    "flex min-h-0 items-center justify-between gap-2 rounded-lg border px-3 text-left",
                    isSelected ? "border-primary bg-primary/15" : "border-border bg-card",
                    g.id === "reiniciar" && "text-amber-500"
                  )}
                >
                  <span className="truncate font-display text-lg uppercase">{g.label}</span>
                  <span className="max-w-[46%] truncate text-sm text-muted-foreground">{g.summary}</span>
                </button>
              );
            })}
          </div>

          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-4">
            <div className="min-h-0 flex-1 overflow-hidden">
              <h2 className="border-b border-border pb-2 font-display text-2xl uppercase text-primary">
                {groups.find((g) => g.id === activeGroup)?.label}
              </h2>

              {activeGroup === "pesas" && (
                <div className="pt-3">
                  <p className="mb-3 text-base text-muted-foreground">Marca las kettlebells que tienes.</p>
                  <WeightGrid profile={profile} update={update} cols={4} dense />
                </div>
              )}

              {activeGroup === "nivel" && (
                <div className="space-y-3">
                  {LEVELS.map((l) => (
                    <Choice key={l.value} label={l.value} hint={l.hint} selected={profile.level === l.value} onClick={() => update({ level: l.value })} />
                  ))}
                </div>
              )}

              {activeGroup === "espacio" && (
                <div className="space-y-3">
                  {SPACES.map((o) => (
                    <Choice key={o.value} multi label={o.value} selected={profile.space.includes(o.value)} onClick={() => update({ space: profile.space.includes(o.value) ? profile.space.filter((v) => v !== o.value) : [...profile.space, o.value] })} />
                  ))}
                </div>
              )}

              {activeGroup === "zonas" && (
                <div className="grid grid-cols-2 gap-3">
                  {[...CONCERNS, "Ninguna"].map((c) => (
                    <Choice key={c} multi label={c} selected={profile.concerns.includes(c)} onClick={() => update({ concerns: toggleExclusive(profile.concerns, c, "Ninguna") })} />
                  ))}
                </div>
              )}

              {activeGroup === "dias" && (
                <div>
                  <p className="text-lg text-muted-foreground mb-4">Días de entrenamiento prescritos por semana:</p>
                  <div className="grid grid-cols-4 gap-3">
                    {[2, 3, 4, 5].map((d) => (
                      <Button key={d} role="radio" aria-checked={profile.days === d} variant={profile.days === d ? "selected" : "tile"} className="h-16 font-display text-3xl" onClick={() => update({ days: d })}>{d}</Button>
                    ))}
                  </div>
                </div>
              )}

              {activeGroup === "voz" && (
                <Choice multi label="Anunciar ejercicios en voz alta" hint="Dice el nombre del ejercicio, número de serie y avisa cuándo descansar." selected={profile.voice} onClick={() => update({ voice: !profile.voice })} />
              )}

              {activeGroup === "tv" && (
                <Choice multi label="Forzar Modo TV (16:9 y D-Pad)" hint="Optimiza los menús para pantallas grandes y control remoto Fire TV." selected={tvMode} onClick={onToggleTv} />
              )}

              {activeGroup === "nombre" && (
                <div>
                  <label htmlFor="tv-nombre" className="block text-lg text-muted-foreground mb-2">Tu nombre:</label>
                  <input id="tv-nombre" value={profile.name} maxLength={40} onChange={(e) => update({ name: e.target.value })} className="h-14 w-full rounded-xl border border-border bg-background px-4 text-2xl outline-none focus:border-primary" />
                </div>
              )}

              {activeGroup === "reiniciar" && (
                <div className="space-y-3 pt-3">
                  <p className="text-base leading-snug text-muted-foreground">
                    Borra perfil, programa, pruebas, racha y notas. No se puede deshacer.
                  </p>
                  <Button variant="tile" className="h-12 w-full border-amber-500/40 text-base text-amber-500" onClick={() => setConfirm(true)}>
                    <RotateCcw className="mr-2" /> Borrar todo y empezar de cero
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {confirm && (
          <Sheet title="¿Borrar todo?" onClose={() => setConfirm(false)}>
            <p className="text-[18px] leading-snug">Se eliminan tu perfil, tu programa con su calendario, todas tus Pruebas OneBell y tu racha. No se puede deshacer.</p>
            <div className="mt-5 space-y-3">
              <Button variant="ember" size="hero" onClick={() => { setConfirm(false); onReset(); }}>Sí, borrar todo</Button>
              <Button className="h-14 w-full" onClick={() => setConfirm(false)}>Cancelar</Button>
            </div>
          </Sheet>
        )}
      </div>
    );
  }

  // Renderizado estándar en Celular
  return (
    <Frame header={<Brand />}>
      <h1 className="mt-2 font-display text-[44px] uppercase leading-none">Tu perfil</h1>
      <p className="mt-2 text-muted-foreground">Los cambios se guardan solos y ajustan tus próximas sesiones. Los días por semana rearman el calendario desde las mismas fechas.</p>
      <label htmlFor="nombre" className="mt-5 block">
        <span className="text-sm font-semibold text-muted-foreground">Tu nombre</span>
        <input id="nombre" value={profile.name} maxLength={40} onChange={(e) => update({ name: e.target.value })} className="mt-2 h-14 w-full rounded-[14px] border border-border bg-card px-4 text-xl outline-none focus:border-primary" />
      </label>
      <Group title="Tus pesas"><WeightGrid profile={profile} update={update} cols={4} /></Group>
      <Group title="Nivel"><div className="space-y-2">{LEVELS.map((l) => <Choice key={l.value} label={l.value} hint={l.hint} selected={profile.level === l.value} onClick={() => update({ level: l.value })} />)}</div></Group>
      <Group title="Tu espacio"><div className="space-y-2">{SPACES.map((o) => <Choice key={o.value} multi label={o.value} selected={profile.space.includes(o.value)} onClick={() => update({ space: profile.space.includes(o.value) ? profile.space.filter((v) => v !== o.value) : [...profile.space, o.value] })} />)}</div></Group>
      <Group title="Zonas a cuidar"><div className="grid grid-cols-2 gap-2">{[...CONCERNS, "Ninguna"].map((c) => <Choice key={c} multi label={c} selected={profile.concerns.includes(c)} onClick={() => update({ concerns: toggleExclusive(profile.concerns, c, "Ninguna") })} />)}</div></Group>
      <Group title="Días por semana"><div className="grid grid-cols-4 gap-2">{[2, 3, 4, 5].map((d) => <Button key={d} role="radio" aria-checked={profile.days === d} variant={profile.days === d ? "selected" : "tile"} className="h-14 font-display text-2xl" onClick={() => update({ days: d })}>{d}</Button>)}</div></Group>
      <Group title="Voz en el entrenamiento"><Choice multi label="Anunciar los ejercicios en voz alta" hint="Dice el ejercicio, la serie y cuándo descansar." selected={profile.voice} onClick={() => update({ voice: !profile.voice })} /></Group>
      <Group title="Modo Pantalla Grande / TV">
        <Choice
          multi
          label="Forzar modo TV (16:9 y control remoto)"
          hint="Ajusta el entrenamiento a una pantalla grande y activa el control con flechas."
          selected={tvMode}
          onClick={onToggleTv}
        />
      </Group>
      <section className="mt-10 rounded-[16px] border border-border bg-card p-5">
        <h2 className="font-display text-[22px] uppercase">Reiniciar la app</h2>
        <p className="mt-1 text-[15px] leading-snug text-muted-foreground">Borra todo y vuelve a la configuración inicial: tus pesas, nivel, programa, calendario, pruebas y racha.</p>
        <Button className="mt-4 h-14 w-full border-primary text-primary" onClick={() => setConfirm(true)}><RotateCcw /> Borrar todo y empezar de cero</Button>
      </section>
      {confirm && (
        <Sheet title="¿Borrar todo?" onClose={() => setConfirm(false)}>
          <p className="text-[16px] leading-snug">Se eliminan tu perfil, tu programa con su calendario, todas tus Pruebas OneBell y tu racha. No se puede deshacer.</p>
          <div className="mt-5 space-y-2">
            <Button variant="ember" size="hero" onClick={() => { setConfirm(false); onReset(); }}>Sí, borrar todo</Button>
            <Button className="h-14 w-full" onClick={() => setConfirm(false)}>Cancelar</Button>
          </div>
        </Sheet>
      )}
    </Frame>
  );
}

