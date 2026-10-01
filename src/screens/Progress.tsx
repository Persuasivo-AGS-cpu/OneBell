import { ChevronRight } from "lucide-react";
import { Button } from "@/components/Button";
import { Brand, Frame } from "@/components/Chrome";
import { TestSheet } from "@/components/TestSheet";
import { catalog } from "@/lib/catalog";
import { fmtDate, isTestDue, nextTestDate, type TestResult } from "@/lib/fittest";
import type { SessionNote } from "@/lib/storage";

export function Progress({ tests, notes, onTest, onLibrary, tvMode }: { tests: TestResult[]; notes: SessionNote[]; onTest: () => void; onLibrary: () => void; tvMode?: boolean }) {
  const next = nextTestDate(tests);
  const due = tests.length === 0 || isTestDue(tests);
  const last = notes[notes.length - 1];
  const latestTest = tests[tests.length - 1];

  if (tvMode) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background pt-2 screen-in">
        <div className="grid min-h-0 flex-1 grid-cols-[1.35fr_0.75fr] gap-3">
          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-4">
            <div className="flex shrink-0 items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl uppercase text-foreground">Prueba OneBell</h2>
              {latestTest && <span className="font-display text-3xl text-primary">{latestTest.weight} kg</span>}
            </div>
            <p className="mt-1 shrink-0 text-base leading-snug text-muted-foreground">
              {tests.length === 0
                ? "Aún no haces tu prueba inicial. Sirve para calibrar el peso."
                : due
                ? "Ya te toca tu siguiente prueba de control."
                : `Próxima prueba: ${fmtDate(next!)}.`}
            </p>
            <div className="mt-2 min-h-0 flex-1 overflow-hidden">
              <TestSheet tests={tests} compact />
            </div>
            <Button variant={due ? "ember" : "tile"} className="mt-2 h-12 w-full shrink-0 text-lg" onClick={onTest}>
              {tests.length === 0 ? "Hacer mi prueba inicial" : due ? "Hacer la prueba" : "Hacer la prueba antes"}
            </Button>
          </div>

          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-4">
            <h2 className="shrink-0 font-display text-2xl uppercase">Última sesión</h2>
            {last && last.ratings.length > 0 ? (
              <div className="mt-2 min-h-0 flex-1 overflow-hidden">
                <p className="text-sm text-muted-foreground">{last.date} · {Math.round(last.seconds / 60)} min</p>
                <ul className="mt-2 space-y-1.5">
                  {last.ratings.map((r) => (
                    <li key={`${r.id}-${r.rating}`} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2">
                      <span className="truncate text-base font-semibold">{r.name}</span>
                      <span className="shrink-0 font-display text-base uppercase text-primary">{r.rating}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-lg leading-snug text-muted-foreground">Aún no completas una sesión en esta tele.</p>
            )}
            <Button variant="tile" className="mt-auto h-12 w-full shrink-0 text-base" onClick={onLibrary}>Biblioteca</Button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado estándar en Celular
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
      {last && last.ratings.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-[24px] uppercase">Última sesión</h2>
          <ul className="mt-3 space-y-2">
            {last.ratings.map((r) => <li key={`${r.id}-${r.rating}`} className="flex items-center justify-between rounded-[14px] bg-card px-4 py-3"><span className="font-semibold">{r.name}</span><span className="text-sm text-muted-foreground">{r.rating}</span></li>)}
          </ul>
        </section>
      )}
      <button type="button" onClick={onLibrary} className="mt-8 flex w-full items-center justify-between rounded-[16px] border border-border bg-card p-5 text-left">
        <span><span className="block font-display text-[22px] uppercase">Biblioteca de ejercicios</span><span className="mt-1 block text-sm text-muted-foreground">{catalog.length} ejercicios con instrucciones paso a paso</span></span>
        <ChevronRight className="text-primary" />
      </button>
    </Frame>
  );
}

