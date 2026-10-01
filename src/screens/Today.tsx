import { Flame } from "lucide-react";
import { Button } from "@/components/Button";
import { Brand, Frame } from "@/components/Chrome";
import { TvDashboard } from "@/components/TvDashboard";
import { byId } from "@/lib/catalog";
import { imageFor } from "@/lib/images";
import { fmtDate, isTestDue, nextTestDate, type TestResult } from "@/lib/fittest";
import { TYPE_INFO, buildPlan, dateForIndex, dayIndexFor, doseLine, programById, typeDesc, type PlanDay, type ProgramState } from "@/lib/program";
import type { Profile } from "@/lib/types";
import { todayKey, type Stats } from "@/lib/storage";
import { Achievements, GoalProgress, TipOfDay, UpNext, WeekStrip, achievements } from "@/components/TodayBlocks";

const raw = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
const todayLabel = raw.charAt(0).toUpperCase() + raw.slice(1);
const hero = imageFor(byId("swing-a-dos-manos"));

export function Today({ profile, minutes, setMinutes, energy, setEnergy, streak, stats, tests, program: state, onPrograms, onCalendar, onStartDay, onTest }: {
  profile: Profile; minutes: number; setMinutes: (n: number) => void; energy: string; setEnergy: (e: string) => void; streak: number; stats: Stats; onCalendar: () => void;
  tests: TestResult[]; program: ProgramState | null; onPrograms: () => void; onStartDay: (d: PlanDay) => void; onTest: () => void;
}) {
  const isTv = typeof document !== "undefined" && document.documentElement.classList.contains("tv-mode");

  if (isTv) {
    return (
      <TvDashboard
        profile={profile}
        minutes={minutes}
        setMinutes={setMinutes}
        energy={energy}
        setEnergy={setEnergy}
        streak={streak}
        stats={stats}
        tests={tests}
        program={state}
        onPrograms={onPrograms}
        onCalendar={onCalendar}
        onStartDay={onStartDay}
        onTest={onTest}
      />
    );
  }

  const program = programById(state?.id);
  const plan = program && state ? buildPlan(program, state.days) : [];
  const index = state ? dayIndexFor(state.start) : 0;
  const day: PlanDay | undefined = plan[index - 1];
  const notStarted = state != null && index < 1;
  const finished = state != null && index > plan.length;
  const trainable = plan.filter((d) => d.type !== "Descanso");
  const done = state ? trainable.filter((d) => state.done.includes(d.index)).length : 0;
  const testedToday = tests.some((t) => t.date === todayKey());
  const doneToday = !!(state && day && (state.done.includes(day.index) || (day.type === "Prueba" && testedToday)));
  const training = day && !["Descanso", "Prueba"].includes(day.type);
  const next = nextTestDate(tests);

  let footer = <Button variant="ember" size="hero" onClick={onPrograms}>Elegir programa</Button>;
  if (state && !finished) {
    if (notStarted) footer = <Button size="hero" onClick={() => onStartDay({ index: 0, week: 1, type: "Movilidad" })}>Entrenar antes de empezar</Button>;
    else if (doneToday) footer = <Button size="hero" onClick={() => onStartDay({ ...day!, type: "Movilidad" })}>Hecho por hoy · entrenar de más</Button>;
    else if (day?.type === "Prueba") footer = <Button variant="ember" size="hero" onClick={onTest}>Hacer la Prueba OneBell</Button>;
    else if (day?.type === "Descanso") footer = <Button size="hero" onClick={() => onStartDay({ ...day, type: "Movilidad" })}>Hoy descansas · hacer movilidad</Button>;
    else if (day) footer = <Button variant="ember" size="hero" onClick={() => onStartDay(day)}>Ver sesión de hoy</Button>;
  }

  return (
    <Frame
      header={<div className="flex items-center justify-between"><Brand />{streak > 0 ? <span className="flex items-center gap-1.5 text-primary"><Flame size={20} fill="currentColor" /><span className="font-display text-xl">{streak}</span><span className="text-sm text-muted-foreground">{streak === 1 ? "día seguido" : "días seguidos"}</span></span> : <span className="text-sm text-muted-foreground">Hoy empieza tu racha</span>}</div>}
      footer={footer}>
      <p className="mt-2 text-sm font-semibold text-muted-foreground">{todayLabel}</p>
      <h1 className="mt-1 font-display text-[44px] uppercase leading-none">Vamos{profile.name ? `, ${profile.name}` : ""}</h1>
      {state && program && !notStarted && !finished && <WeekStrip state={state} plan={plan} today={index} onOpen={onCalendar} />}
      <div className="mt-5 overflow-hidden rounded-[18px] border border-border bg-card">
        <div className="relative h-[110px] bg-photo">
          {hero && <img src={hero} alt="" className="h-full w-full object-cover object-[center_35%]" />}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
        </div>
        <div className="px-5 pb-5">
          {!program || !state ? (
            <>
              <h2 className="font-display text-[28px] uppercase leading-tight">Elige tu programa</h2>
              <p className="mt-1 text-[15px] text-muted-foreground">Se arma tu calendario completo con lo que toca cada día.</p>
            </>
          ) : (
            <>
              <button type="button" onClick={onPrograms} className="flex w-full items-center justify-between text-sm font-semibold"><span className="text-primary">Tu programa</span><span className="text-muted-foreground">{finished ? "Terminado" : notStarted ? `Empieza el ${fmtDate(dateForIndex(state.start, 1))}` : `Semana ${day?.week} de ${program.weeks}`}</span></button>
              <h2 className="mt-2 font-display text-[28px] uppercase leading-tight">{program.name}</h2>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((done / Math.max(1, trainable.length)) * 100)}%` }} /></div>
              <p className="mt-2 text-sm text-muted-foreground">{done} de {trainable.length} días completados</p>
              {day && !finished && (
                <div className="mt-4 rounded-[12px] bg-background px-4 py-3">
                  <p className="text-sm font-semibold text-primary">Hoy · día {day.index}</p>
                  <p className="font-display text-[24px] uppercase leading-tight">{day.type}</p>
                  <p className="mt-1 text-[15px] leading-snug text-muted-foreground">{doseLine(program, day.week, day.type) ? `${doseLine(program, day.week, day.type)}. ` : ""}{typeDesc(program, day.type)}</p>
                </div>
              )}
              {finished && <p className="mt-4 text-[15px]">Terminaste las {program.weeks} semanas. Haz tu prueba final y elige tu siguiente programa.</p>}
            </>
          )}
          {!state && <button type="button" onClick={onTest} className="mt-3 flex w-full items-center justify-between rounded-[12px] bg-background px-4 py-3 text-left text-[15px]">
            <span>{tests.length === 0 ? "Haz tu prueba inicial" : isTestDue(tests) ? "Te toca tu Prueba OneBell" : `Próxima Prueba OneBell: ${fmtDate(next!)}`}</span>
            <span className="font-semibold text-primary">{tests.length === 0 || isTestDue(tests) ? "Empezar" : "Ver"}</span>
          </button>}
        </div>
      </div>
      {training && !doneToday && (
        <>
          <h2 className="mt-7 font-display text-[22px] uppercase">¿Cuánto tiempo tienes?</h2>
          <div role="radiogroup" className="mt-3 grid grid-cols-4 gap-2">
            {[10, 20, 30, 45].map((m) => <Button key={m} role="radio" aria-checked={minutes === m} variant={minutes === m ? "selected" : "tile"} className="h-14 gap-1" onClick={() => setMinutes(m)}><span className="font-display text-xl">{m}</span><span className="text-sm text-muted-foreground">min</span></Button>)}
          </div>
          <h2 className="mt-6 font-display text-[22px] uppercase">¿Cómo andas de energía?</h2>
          <div role="radiogroup" className="mt-3 grid grid-cols-3 gap-2">
            {["Con energía", "Normal", "Cansado"].map((e) => <Button key={e} role="radio" aria-checked={energy === e} variant={energy === e ? "selected" : "tile"} className="h-14 px-2 text-[15px]" onClick={() => setEnergy(e)}>{e}</Button>)}
          </div>
        </>
      )}
      {state && program && !notStarted && !finished && <UpNext state={state} plan={plan} today={index} tests={tests} onTest={onTest} />}
      {program && <GoalProgress program={program} tests={tests} week={finished ? program.weeks : (day?.week ?? 1)} />}
      <TipOfDay profile={profile} />
      <Achievements badges={achievements(stats, tests, state, plan)} />
    </Frame>
  );
}
