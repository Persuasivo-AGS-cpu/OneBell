import { TEST_COLUMNS, TEST_MOVES, fmtDate, totalFor, type TestResult } from "@/lib/fittest";
import { formatClock } from "@/lib/utils";

/** Hoja de registro estilo Fit Test: filas = ejercicios, columnas = pruebas. */
export function TestSheet({ tests }: { tests: TestResult[] }) {
  const cols = Math.max(TEST_COLUMNS, tests.length);
  const cell = (key: string, r?: TestResult) => {
    const m = TEST_MOVES.find((x) => x.key === key)!;
    if (!r) return "";
    if (m.measure === "hold") return typeof r.values[m.key] === "number" ? formatClock(r.values[m.key]) : "—";
    if (m.perSide) { const a = r.values[`${m.key}-izq`], b = r.values[`${m.key}-der`]; return a == null && b == null ? "—" : `${a ?? "—"} / ${b ?? "—"}`; }
    return r.values[m.key] ?? "—";
  };
  return (
    <div className="no-scrollbar -mx-6 overflow-x-auto">
      <table className="w-max border-separate border-spacing-0 text-[15px]">
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 z-20 border-r border-border bg-background pl-6 pr-3 pb-2 text-left align-bottom font-display text-[17px] font-normal uppercase">Ejercicio</th>
            {Array.from({ length: cols }, (_, i) => (
              <th key={i} scope="col" className={`min-w-[78px] px-2 pb-2 text-center align-bottom ${i === cols - 1 ? "pr-6" : ""}`}>
                <span className="block font-display text-[17px] font-normal uppercase">Prueba {i + 1}</span>
                <span className="block text-[12px] font-semibold text-muted-foreground">{tests[i] ? fmtDate(new Date(tests[i].date + "T12:00:00")) : `Día ${1 + i * 14}`}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TEST_MOVES.map((m) => (
            <tr key={m.key}>
              <th scope="row" className="sticky left-0 z-20 border-t border-r border-border bg-background py-3 pl-6 pr-3 text-left font-semibold">
                {m.label}<span className="block text-[12px] font-normal text-muted-foreground">{m.measure === "hold" ? "tiempo sostenido" : m.perSide ? `${m.seconds} s por brazo` : `${m.seconds} s`}</span>
              </th>
              {Array.from({ length: cols }, (_, i) => {
                const now = totalFor(m, tests[i]); const prev = totalFor(m, tests[i - 1]);
                const diff = now != null && prev != null ? now - prev : null;
                return (
                  <td key={i} className={`border-t border-border px-2 py-3 text-center tabular-nums ${i > 0 ? "border-l" : ""} ${i === cols - 1 ? "pr-6" : ""}`}>
                    <span className="block font-semibold">{cell(m.key, tests[i])}</span>
                    {diff != null && diff !== 0 && <span className={diff > 0 ? "text-[12px] font-semibold text-primary" : "text-[12px] text-muted-foreground"}>{diff > 0 ? "+" : ""}{m.measure === "hold" ? `${diff} s` : diff}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
