import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} data-sheet="true" className="sheet-in flex max-h-[88%] w-full max-w-[430px] flex-col rounded-t-[22px] border-t border-border bg-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between px-6 pt-4 pb-2">
          <h2 className="font-display text-[26px] uppercase leading-tight">{title}</h2>
          <Button variant="text" size="icon" aria-label="Cerrar" onClick={onClose}><X /></Button>
        </div>
        <div className="no-scrollbar min-h-0 overflow-y-auto px-6 pb-8">{children}</div>
      </div>
    </div>
  );
}
