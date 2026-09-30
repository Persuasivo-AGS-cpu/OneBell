import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/Button";
import { Frame } from "@/components/Chrome";
import { ExerciseDetail, Thumb } from "@/components/Exercise";
import { Sheet } from "@/components/Sheet";
import { catalog, PATTERNS } from "@/lib/catalog";
import type { Exercise } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEVEL = ["", "Principiante", "Intermedio", "Avanzado"];
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function Library({ onBack }: { onBack: () => void }) {
  const [q, setQ] = useState("");
  const [pattern, setPattern] = useState("Todos");
  const [open, setOpen] = useState<Exercise | null>(null);
  const list = useMemo(() => catalog.filter((e) =>
    (pattern === "Todos" || e.pattern === pattern) &&
    (!q || norm(`${e.name} ${e.groups.join(" ")} ${e.primary}`).includes(norm(q)))), [q, pattern]);
  return (
    <Frame
      header={
        <>
          <div className="grid grid-cols-[48px_1fr_48px] items-center"><Button variant="text" size="icon" aria-label="Volver a Progreso" onClick={onBack}><ArrowLeft /></Button><h1 className="text-center font-display text-[26px] uppercase">Ejercicios</h1><span /></div>
          <label className="mt-3 flex h-12 items-center gap-2 rounded-[14px] border border-border bg-card px-4 focus-within:border-primary">
            <Search size={18} className="text-muted-foreground" aria-hidden />
            <span className="sr-only">Buscar ejercicio o músculo</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar ejercicio o músculo" className="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-muted-foreground" />
          </label>
          <div className="no-scrollbar -mx-6 mt-3 flex gap-2 overflow-x-auto px-6">
            {["Todos", ...PATTERNS].map((p) => (
              <button key={p} type="button" aria-pressed={pattern === p} onClick={() => setPattern(p)}
                className={cn("h-10 shrink-0 rounded-full border px-4 text-[14px] font-semibold", pattern === p ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}>{p}</button>
            ))}
          </div>
        </>
      }>
      <p className="mt-1 mb-3 text-sm text-muted-foreground">{list.length} de {catalog.length} ejercicios</p>
      <div className="space-y-2">
        {list.map((e) => (
          <button key={e.id} type="button" onClick={() => setOpen(e)} className="flex w-full items-center gap-3 rounded-[14px] bg-card p-2 text-left">
            <Thumb exercise={e} className="h-16 w-16" />
            <span className="min-w-0 flex-1">
              <span className="block line-clamp-2 text-[17px] font-semibold leading-tight">{e.name}</span>
              <span className="block truncate text-sm text-muted-foreground">{e.groups.join(", ")}</span>
            </span>
            <span className="pr-2 text-[13px] text-muted-foreground">{LEVEL[e.level]}</span>
          </button>
        ))}
        {list.length === 0 && <p className="py-8 text-center text-muted-foreground">Ningún ejercicio coincide. Prueba con otra palabra o quita el filtro.</p>}
      </div>
      {open && <Sheet title={open.name} onClose={() => setOpen(null)}><ExerciseDetail exercise={open} /></Sheet>}
    </Frame>
  );
}
