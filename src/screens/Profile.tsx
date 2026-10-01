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
      <div className="flex h-full w-full flex-col bg-background screen-in">
        <header className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-4">
            <Brand className="text-3xl" />
            <h1 className="font-display text-3xl uppercase">Tu Perfil</h1>
          </div>
          <div className="text-base text-muted-foreground font-semibold">
            Atleta: <span className="text-foreground">{profile.name || "OneBell"}</span>
          </div>
        </header>

        <div className="grid grid-cols-[1fr_1.3fr] gap-8 flex-1 min-h-0 pt-4">
          {/* Menú de Grupos a la Izquierda */}
          <div className="flex flex-col gap-2 min-h-0 overflow-y-auto no-scrollbar">
            {groups.map((g) => {
              const isSelected = activeGroup === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setActiveGroup(g.id)}
                  onFocus={() => setActiveGroup(g.id)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all",
                    isSelected ? "border-primary bg-primary/10 scale-[1.01]" : "border-border bg-card",
                    g.id === "reiniciar" && "text-amber-500 border-amber-500/20"
                  )}
                >
                  <span className="font-display text-2xl uppercase">{g.label}</span>
                  <span className="text-sm text-muted-foreground truncate max-w-[160px]">{g.summary}</span>
                </button>
              );
            })}
          </div>

          {/* Opciones del Grupo Activo a la Derecha */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xl min-h-0">
            <div className="space-y-4">
              <h2 className="font-display text-3xl uppercase text-primary border-b border-border pb-2">
                {groups.find((g) => g.id === activeGroup)?.label}
              </h2>

              {activeGroup === "pesas" && (
                <div>
                  <p className="text-lg text-muted-foreground mb-4">Selecciona las kettlebells con las que cuentas:</p>
                  <WeightGrid profile={profile} update={update} cols={4} />
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
                <div className="space-y-4">
                  <p className="text-xl text-muted-foreground leading-snug">
                    Borra todos tus datos: perfil, programa activo, historial de pruebas, racha y notas.
                  </p>
                  <Button variant="tile" className="h-16 text-xl text-amber-500 border-amber-500/40 w-full" onClick={() => setConfirm(true)}>
                    <RotateCcw className="mr-2" /> Borrar todo y empezar de cero
                  </Button>
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground border-t border-border pt-4">
              Los cambios se guardan de inmediato.
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

