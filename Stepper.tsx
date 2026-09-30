import { Minus, Plus } from "lucide-react";
import { Button } from "./Button";

/** Captura grande de repeticiones: se usa después del tiempo, con la pesa ya en el piso. */
export function Stepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  const set = (n: number) => onChange(Math.max(0, Math.min(999, n)));
  return (
    <div>
      <label htmlFor="reps" className="block text-center text-[15px] font-semibold text-muted-foreground">{label}</label>
      <div className="mt-2 grid grid-cols-[64px_1fr_64px] items-center gap-3">
        <Button className="h-16 rounded-[16px]" aria-label="Menos 1" onClick={() => set(value - 1)}><Minus /></Button>
        <input id="reps" inputMode="numeric" value={value} onChange={(e) => set(Number(e.target.value.replace(/\D/g, "")) || 0)}
          className="h-20 w-full rounded-[16px] border border-border bg-card text-center font-display text-[56px] leading-none text-primary outline-none focus:border-primary" />
        <Button className="h-16 rounded-[16px]" aria-label="Más 1" onClick={() => set(value + 1)}><Plus /></Button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <Button variant="subtle" className="h-12" onClick={() => set(value - 5)}>−5</Button>
        <Button variant="subtle" className="h-12" onClick={() => set(value + 5)}>+5</Button>
      </div>
    </div>
  );
}
