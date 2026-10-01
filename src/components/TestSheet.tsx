import { byId } from "@/lib/catalog";
import { TEST_COLUMNS, TEST_MOVES, fmtDate, perSideFor, totalFor, type TestMove, type TestResult } from "@/lib/fittest";
import { formatClock } from "@/lib/utils";

/** Hoja de registro estilo Fit Test: filas = ejercicios, columnas = pruebas. */
export function TestSheet({ tests, compact = false }: { tests: TestResult[]; compact?: boolean }) {
  const cols = Math.max(TEST_COLUMNS, tests.length);
  const cell = (m: TestMove, r?: TestResult) => {
    if (!r) return "";
    if (m.measure === "hold") return typeof r.values[m.key] === "number" ? formatClock(r.values[m.key]) : "—";
    if (perSideFor(m, r)) { const a = r.values[`${m.key}-izq`], b = r.values[`${m.key}-der`]; return a == null && b == null ? "—" : `${a ?? "—"} / ${b ?? "—"}`; }
    return r.values[m.key] ?? "—";
  };
  return (
    <div className={compact ? "h-full min-h-0 overflow-hidden" : "no-scrollbar -mx-6 overflow-x-auto"}>
      <table className={compact ? "w-full table-fixed border-separate border-spacing-0 text-[13px]" : "w-max border-separate border-spacing-0 text-[15px]"}>
        <thead>
          <tr>
            <th scope="col" className={compact ? "w-[28%] border-r border-border pb-1 text-left align-bottom font-display text-[14px] font-normal uppercase" : "sticky left-0 z-20 border-r border-border bg-background pl-6 pr-3 pb-2 text-left align-bottom font-display text-[17px] font-normal uppercase"}>Ejercicio</th>
            {Array.from({ length: cols }, (_, i) => (
              <th key={i} scope="col" className={compact ? "px-1 pb-1 text-center align-bottom" : `min-w-[78px] px-2 pb-2 text-center align-bottom ${i === cols - 1 ? "pr-6" : ""}`}>
                <span className={compact ? "block font-display text-[13px] font-normal uppercase" : "block font-display text-[17px] font-normal uppercase"}>Prueba {i + 1}</span>
                <span className="block text-[11px] font-semibold text-muted-foreground">{tests[i] ? fmtDate(new Date(tests[i].date + "T12:00:00")) : `Día ${1 + i * 14}`}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TEST_MOVES.map((m) => {
            const sample = tests.find((t) => t.moves?.[m.key]) ?? tests.find((t) => typeof t.values[m.key] === "number" || typeof t.values[`${m.key}-izq`] === "number");
            const title = byId(sample?.moves?.[m.key] ?? "")?.name ?? m.label;
            const detail = m.measure === "hold" ? "tiempo sostenido" : perSideFor(m, sample) ? `${m.seconds} s por brazo` : `${m.seconds} s`;
            return (
            <tr key={m.key}>
              <th scope="row" className={compact ? "border-t border-r border-border py-1 pr-2 text-left font-semibold" : "sticky left-0 z-20 border-t border-r border-border bg-background py-3 pl-6 pr-3 text-left font-semibold"}>
                <span className="block truncate">{title}</span><span className="block truncate text-[11px] font-normal text-muted-foreground">{detail}</span>
              </th>
              {Array.from({ length: cols }, (_, i) => {
                const now = totalFor(m, tests[i]); const prev = totalFor(m, tests[i - 1]);
                const diff = now != null && prev != null ? now - prev : null;
                return (
                  <td key={i} className={`border-t border-border text-center tabular-nums ${compact ? "px-1 py-1" : "px-2 py-3"} ${i > 0 ? "border-l" : ""} ${!compact && i === cols - 1 ? "pr-6" : ""}`}>
                    <span className="block font-semibold">{cell(m, tests[i])}</span>
                    {diff != null && diff !== 0 && <span className={diff > 0 ? "text-[12px] font-semibold text-primary" : "text-[12px] text-muted-foreground"}>{diff > 0 ? "+" : ""}{m.measure === "hold" ? `${diff} s` : diff}</span>}
                  </td>
                );
              })}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
