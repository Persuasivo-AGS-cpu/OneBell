import { ChevronRight } from "lucide-react";
import { Button } from "@/components/Button";
import { Brand, Frame } from "@/components/Chrome";
import { TestSheet } from "@/components/TestSheet";
import { catalog } from "@/lib/catalog";
import { fmtDate, nextTestDate, type TestResult } from "@/lib/fittest";

export function Progress({ tests, onTest, onLibrary }: { tests: TestResult[]; onTest: () => void; onLibrary: () => void }) {
  const next = nextTestDate(tests);
  const due = next ? next <= new Date() : true;
  return (
    <Frame header={<Brand />}>
      <h1 className="mt-2 font-display text-[44px] uppercase leading-none">Progreso</h1>
      <section className="mt-6">
        <div className="flex items-baseline justify-between"><h2 className="font-display text-[24px] uppercase">Prueba OneBell</h2>{tests[0] && <span className="text-sm text-muted-foreground">Pesa: {tests[0].weight} kg</span>}</div>
        <p className="mt-1 text-[15px] text-muted-foreground">
          {tests.length === 0 ? "Aún no haces tu prueba inicial. Es tu punto de partida para medir el avance." : due ? "Ya te toca tu siguiente prueba." : `Próxima prueba: ${fmtDate(next!)}.`}
        </p>
        <div className="mt-4"><TestSheet tests={tests} /></div>
        <Button variant={due ? "ember" : "tile"} size="hero" className="mt-5" onClick={onTest}>{tests.length === 0 ? "Hacer mi prueba inicial" : due ? "Hacer la prueba" : "Hacer la prueba antes"}</Button>
      </section>
      <button type="button" onClick={onLibrary} className="mt-8 flex w-full items-center justify-between rounded-[16px] border border-border bg-card p-5 text-left">
        <span><span className="block font-display text-[22px] uppercase">Biblioteca de ejercicios</span><span className="mt-1 block text-sm text-muted-foreground">{catalog.length} ejercicios con instrucciones paso a paso</span></span>
        <ChevronRight className="text-primary" />
      </button>
    </Frame>
  );
}
