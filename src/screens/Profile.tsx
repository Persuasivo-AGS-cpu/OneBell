import { useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Sheet } from "@/components/Sheet";
import { Button } from "@/components/Button";
import { Choice } from "@/components/Choice";
import { Brand, Frame } from "@/components/Chrome";
import type { Profile as P } from "@/lib/types";
import { CONCERNS, LEVELS, SPACES, WeightGrid, toggleExclusive } from "./Setup";

const Group = ({ title, children }: { title: string; children: ReactNode }) => <section className="mt-7"><h2 className="mb-3 font-display text-[22px] uppercase">{title}</h2>{children}</section>;

export function Profile({ profile, update, onReset }: { profile: P; update: (p: Partial<P>) => void; onReset: () => void }) {
  const [confirm, setConfirm] = useState(false);
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
          label="Forzar Modo TV (16:9 y Control Remoto D-Pad)"
          hint="Ajusta el diseño a pantallas horizontales de 3 metros y activa la navegación por teclado."
          selected={document.documentElement.classList.contains("tv-mode")}
          onClick={() => {
            document.documentElement.classList.toggle("tv-mode");
            try {
              localStorage.setItem("onebell:tv_mode", JSON.stringify(document.documentElement.classList.contains("tv-mode")));
            } catch { /* ignorar */ }
          }}
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
