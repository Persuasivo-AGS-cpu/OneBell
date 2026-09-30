import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Opción seleccionable: círculo para selección única, cuadro para múltiple. */
export function Choice({ label, hint, selected, multi, onClick, className }: { label: string; hint?: string; selected: boolean; multi?: boolean; onClick: () => void; className?: string }) {
  return (
    <button type="button" role={multi ? "checkbox" : "radio"} aria-checked={selected} onClick={onClick}
      className={cn("flex w-full items-center gap-4 rounded-[16px] bg-card px-4 py-3.5 text-left", selected ? "border-2 border-primary bg-primary/10" : "border border-border", className)}>
      <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center border-2", multi ? "rounded-[6px]" : "rounded-full", selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground")}>
        {selected && (multi ? <Check size={16} strokeWidth={3} /> : <span className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />)}
      </span>
      <span className="min-w-0">
        <span className="block text-[17px] font-semibold leading-tight">{label}</span>
        {hint && <span className="mt-0.5 block text-[14px] leading-snug text-muted-foreground">{hint}</span>}
      </span>
    </button>
  );
}
