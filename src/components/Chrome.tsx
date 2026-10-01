import type { ReactNode } from "react";
import { ArrowLeft, CalendarDays, ChartNoAxesColumn, Flame, Settings2, Tv } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import type { Screen } from "@/lib/types";

export const Brand = ({ className }: { className?: string }) => (
  <span className={cn("font-display text-[24px] uppercase leading-none", className)}>One<span className="text-primary">Bell</span></span>
);

/** Pantalla de altura fija: encabezado arriba, contenido con scroll y pie fijo abajo. */
export function Frame({ header, footer, children, scrollKey }: { header?: ReactNode; footer?: ReactNode; children: ReactNode; scrollKey?: string }) {
  return (
    <div className="flex h-full flex-col tv-layout-container">
      {header && <div className="shrink-0 bg-background px-6 pt-5 pb-3">{header}</div>}
      <main key={scrollKey} className="screen-in no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</main>
      {footer && <div className="shrink-0 bg-background px-6 pt-3 pb-5">{footer}</div>}
    </div>
  );
}

export function StepHeader({ label, current, total, onBack }: { label: string; current: number; total: number; onBack?: () => void }) {
  return (
    <>
      <div className="grid grid-cols-[48px_1fr_auto] items-center gap-2">
        {onBack ? <Button variant="text" size="icon" aria-label="Atrás" data-action="back" onClick={onBack}><ArrowLeft /></Button> : <span />}
        <Brand className="justify-self-center" />
        <span className="min-w-12 text-right text-sm font-semibold text-muted-foreground">{label} {current}/{total}</span>
      </div>
      <div className="mt-4 flex gap-1.5">{Array.from({ length: total }, (_, i) => <div key={i} className={cn("h-1.5 flex-1 rounded-full", i < current ? "bg-primary" : "bg-secondary")} />)}</div>
    </>
  );
}

const tabs = [
  { key: "today", label: "Hoy", icon: Flame },
  { key: "calendar", label: "Calendario", icon: CalendarDays },
  { key: "progress", label: "Progreso", icon: ChartNoAxesColumn },
  { key: "profile", label: "Perfil", icon: Settings2 },
] as const;

export function TvTopNav({ screen, go, onOpenSync, streak, athleteName }: { screen: Screen; go: (s: Screen) => void; onOpenSync: () => void; streak: number; athleteName?: string }) {
  const active = screen === "library" ? "progress" : screen === "programs" ? "calendar" : screen;
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border bg-background pb-3">
      <div className="flex items-center gap-6">
        <Brand className="text-3xl tracking-wide" />
        <nav aria-label="Navegación TV" className="flex items-center gap-2">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              aria-current={active === key ? "page" : undefined}
              onClick={() => go(key)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2 rounded-xl font-display text-xl uppercase transition-all",
                active === key
                  ? "bg-primary text-primary-foreground font-bold shadow-lg scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border"
              )}
            >
              <Icon size={20} strokeWidth={2.2} />
              <span>{label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={onOpenSync}
            aria-label="Sincronizar TV"
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl font-display text-xl uppercase text-muted-foreground hover:text-primary hover:bg-card border border-transparent hover:border-border transition-all"
          >
            <Tv size={20} strokeWidth={2.2} />
            <span>TV Sync</span>
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-card border border-border px-3.5 py-1.5 rounded-xl">
          <Flame size={20} className="text-primary animate-pulse" fill="currentColor" />
          <span className="font-display text-2xl text-primary">{streak}</span>
          <span className="text-[11px] uppercase text-muted-foreground font-semibold">
            {streak === 1 ? "día" : "días"}
          </span>
        </div>

        {athleteName && (
          <div className="rounded-xl bg-card border border-border px-3.5 py-1.5 text-right">
            <span className="text-[10px] uppercase text-muted-foreground block leading-none">Atleta</span>
            <span className="font-display text-lg uppercase leading-none text-foreground">{athleteName}</span>
          </div>
        )}
      </div>
    </header>
  );
}

export function BottomNav({ screen, go, onOpenSync }: { screen: Screen; go: (s: Screen) => void; onOpenSync?: () => void }) {
  const active = screen === "library" ? "progress" : screen === "programs" ? "calendar" : screen;
  return (
    <nav aria-label="Navegación principal" className="grid shrink-0 grid-cols-5 border-t border-border bg-background px-3 pt-1.5 pb-2">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button key={key} type="button" aria-current={active === key ? "page" : undefined} onClick={() => go(key)}
          className={cn(
            "flex h-14 flex-col items-center justify-center gap-0.5 rounded-[12px] text-[12px] transition-transform focus:scale-105",
            active === key ? "text-primary font-semibold" : "text-muted-foreground"
          )}>
          <Icon size={22} strokeWidth={active === key ? 2.4 : 1.8} /><span>{label}</span>
        </button>
      ))}
      <button type="button" onClick={onOpenSync} aria-label="Sincronizar TV"
        className="flex h-14 flex-col items-center justify-center gap-0.5 rounded-[12px] text-[12px] text-muted-foreground hover:text-primary transition-transform focus:scale-105">
        <Tv size={22} strokeWidth={1.8} /><span>TV Sync</span>
      </button>
    </nav>
  );
}


