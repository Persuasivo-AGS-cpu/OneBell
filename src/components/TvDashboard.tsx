import { Clock, Zap } from "lucide-react";
import { Button } from "@/components/Button";
import { byId } from "@/lib/catalog";
import { imageFor } from "@/lib/images";
import { type TestResult } from "@/lib/fittest";
import { buildPlan, dayIndexFor, doseLine, programById, typeDesc, type PlanDay, type ProgramState } from "@/lib/program";
import type { Profile } from "@/lib/types";
import { todayKey, type Stats } from "@/lib/storage";
import { GoalProgress } from "@/components/TodayBlocks";

const raw = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
const todayLabel = raw.charAt(0).toUpperCase() + raw.slice(1);
const hero = imageFor(byId("swing-a-dos-manos"));

export function TvDashboard({
  profile,
  minutes,
  setMinutes,
  energy,
  setEnergy,
  streak,
  stats,
  tests,
  program: state,
  onPrograms,
  onCalendar,
  onStartDay,
  onTest
}: {
  profile: Profile;
  minutes: number;
  setMinutes: (n: number) => void;
  energy: string;
  setEnergy: (e: string) => void;
  streak: number;
  stats: Stats;
  onCalendar: () => void;
  tests: TestResult[];
  program: ProgramState | null;
  onPrograms: () => void;
  onStartDay: (d: PlanDay) => void;
  onTest: () => void;
}) {
  const program = programById(state?.id);
  const plan = program && state ? buildPlan(program, state.days) : [];
  const index = state ? dayIndexFor(state.start) : 0;
  const day: PlanDay | undefined = plan[index - 1];
  const notStarted = state != null && index < 1;
  const finished = state != null && index > plan.length;
  const testedToday = tests.some((t) => t.date === todayKey());
  const doneToday = !!(state && day && (state.done.includes(day.index) || (day.type === "Prueba" && testedToday)));
  const training = day && !["Descanso", "Prueba"].includes(day.type);

  let primaryActionText = "Elegir programa";
  let primaryActionFn = onPrograms;
  let isEmber = true;

  if (state && !finished) {
    if (notStarted) {
      primaryActionText = "Entrenar antes de empezar";
      primaryActionFn = () => onStartDay({ index: 0, week: 1, type: "Movilidad" });
      isEmber = false;
    } else if (doneToday) {
      primaryActionText = "Hecho por hoy · Entrenar de más";
      primaryActionFn = () => onStartDay({ ...day!, type: "Movilidad" });
      isEmber = false;
    } else if (day?.type === "Prueba") {
      primaryActionText = "Hacer la Prueba OneBell";
      primaryActionFn = onTest;
      isEmber = true;
    } else if (day?.type === "Descanso") {
      primaryActionText = "Hoy descansas · Hacer movilidad";
      primaryActionFn = () => onStartDay({ ...day, type: "Movilidad" });
      isEmber = false;
    } else if (day) {
      primaryActionText = `COMENZAR ENTRENAMIENTO (DÍA ${day.index})`;
      primaryActionFn = () => onStartDay(day);
      isEmber = true;
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background pt-2 screen-in">
      <div className="grid min-h-0 flex-1 grid-cols-[1.15fr_0.85fr] gap-3 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-col gap-3">
          <div className="relative flex min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-primary/40 bg-card p-5">
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-30 pointer-events-none">
              {hero && <img src={hero} alt="" className="h-full w-full object-cover object-center" />}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-card" />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">
                  {state && program ? `Programa: ${program.name}` : "Inicio"}
                </span>
                {day && (
                  <span className="text-sm text-muted-foreground font-semibold">
                    Semana {day.week} de {program?.weeks}
                  </span>
                )}
              </div>

              {!program || !state ? (
                <>
                  <h2 className="font-display text-4xl uppercase leading-tight">Elige tu programa</h2>
                  <p className="text-muted-foreground text-base">
                    Configura tu calendario y comienza tu plan de entrenamiento personalizado con kettlebell.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-display text-4xl uppercase leading-none text-foreground">
                    {day ? `${day.type} · Día ${day.index}` : "Sesión de hoy"}
                  </h2>
                  <p className="line-clamp-3 text-lg leading-snug text-muted-foreground">
                    {day ? (doseLine(program, day.week, day.type) ? `${doseLine(program, day.week, day.type)}. ` : "") + typeDesc(program, day.type) : "Elige tu rutina para comenzar."}
                  </p>
                </>
              )}
            </div>

            <div className="relative z-10 pt-4">
              <Button
                variant={isEmber ? "ember" : "tile"}
                className="h-14 w-full text-xl"
                onClick={primaryActionFn}
              >
                {primaryActionText}
              </Button>
            </div>
          </div>

          {/* Ajustes Rápidos de Tiempo y Energía */}
          {training && !doneToday && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl uppercase flex items-center gap-2">
                  <Clock size={20} className="text-primary" /> ¿Tiempo disponible?
                </h3>
                <div role="radiogroup" className="flex gap-2">
                  {[10, 20, 30, 45].map((m) => (
                    <Button
                      key={m}
                      role="radio"
                      aria-checked={minutes === m}
                      variant={minutes === m ? "selected" : "tile"}
                      className="h-12 px-4 gap-1 min-w-[70px]"
                      onClick={() => setMinutes(m)}
                    >
                      <span className="font-display text-lg">{m}</span>
                      <span className="text-xs text-muted-foreground">min</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <h3 className="font-display text-xl uppercase flex items-center gap-2">
                  <Zap size={20} className="text-primary" /> Nivel de Energía
                </h3>
                <div role="radiogroup" className="flex gap-2">
                  {["Con energía", "Normal", "Cansado"].map((e) => (
                    <Button
                      key={e}
                      role="radio"
                      aria-checked={energy === e}
                      variant={energy === e ? "selected" : "tile"}
                      className="h-12 px-4 text-sm"
                      onClick={() => setEnergy(e)}
                    >
                      {e}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-4">
          {program ? (
            <GoalProgress program={program} tests={tests} week={finished ? program.weeks : (day?.week ?? 1)} plain />
          ) : (
            <div>
              <h2 className="font-display text-2xl uppercase">Camino a tu meta</h2>
              <p className="mt-2 text-lg text-muted-foreground">Elige un programa para ver la meta y el volumen de la semana.</p>
              <Button variant="tile" className="mt-4 h-12 w-full" onClick={onPrograms}>Elegir programa</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
