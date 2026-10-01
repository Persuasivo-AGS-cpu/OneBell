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
      <div className="flex h-full w-full flex-col bg-background screen-in">
        <div className="grid grid-cols-[1.2fr_1fr] gap-6 flex-1 min-h-0 pt-3">
          {/* Columna Izquierda: Prueba OneBell más reciente y acción */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xl min-h-0">
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-border pb-3">
                <h2 className="font-display text-3xl uppercase text-foreground">Prueba OneBell</h2>
                {latestTest && (
                  <span className="font-display text-4xl text-primary font-bold">
                    {latestTest.weight} kg
                  </span>
                )}
              </div>

              <p className="text-xl text-muted-foreground leading-snug">
                {tests.length === 0
                  ? "Aún no haces tu prueba inicial. Es tu punto de partida para calibrar el peso de tus ejercicios."
                  : due
                  ? "Ya te toca tu siguiente prueba OneBell de control."
                  : `Próxima prueba programada: ${fmtDate(next!)}.`}
              </p>

              <div className="pt-2">
                <TestSheet tests={tests} />
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <Button
                variant={due ? "ember" : "tile"}
                size="hero"
                className="w-full h-16 text-2xl uppercase tracking-wider font-display focus:scale-105"
                onClick={onTest}
              >
                {tests.length === 0 ? "Hacer mi prueba inicial" : due ? "Hacer la prueba OneBell" : "Hacer la prueba antes"}
              </Button>
            </div>
          </div>

          {/* Columna Derecha: Última sesión */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xl min-h-0">
            <div className="space-y-4 min-h-0 flex flex-col">
              <h2 className="font-display text-3xl uppercase text-foreground border-b border-border pb-3">
                Última Sesión
              </h2>

              {last && last.ratings.length > 0 ? (
                <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pt-1">
                  <p className="text-base text-muted-foreground font-semibold">
                    Fecha: {last.date} · Duración: {Math.round(last.seconds / 60)} min
                  </p>
                  <ul className="space-y-2.5">
                    {last.ratings.map((r) => (
                      <li key={`${r.id}-${r.rating}`} className="flex items-center justify-between rounded-xl bg-background border border-border px-4 py-3">
                        <span className="font-semibold text-lg text-foreground">{r.name}</span>
                        <span className="font-display text-lg text-primary uppercase">{r.rating}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xl text-muted-foreground pt-4">
                  Aún no has completado sesiones de entrenamiento en este dispositivo.
                </p>
              )}
            </div>
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

