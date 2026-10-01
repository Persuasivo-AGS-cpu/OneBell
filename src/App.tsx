import { useEffect, useRef, useState } from "react";
import { Brand, BottomNav, TvTopNav } from "@/components/Chrome";
import { TVSyncModal } from "@/components/TVSyncModal";
import { buildSession } from "@/lib/session";
import { rememberSession } from "@/lib/session-config";
import { isTestDue } from "@/lib/fittest";
import { buildPlan, dayIndexFor, programById, type PlanDay, type ProgramState } from "@/lib/program";
import { afterSession, clearLocal, cloudDoc, currentStreak, defaultProfile, defaultStats, doneIncludingTests, loadLocal, normalizeSaved, saveLocal, streakContext, todayKey, type Saved } from "@/lib/storage";
import { useSpatialNav, useTVMode } from "@/lib/spatial-nav";
import { canPublishProfile, syncCodeFromLocation, syncEngine, type WorkoutMirror } from "@/lib/sync";
import type { Profile as ProfileT, Screen, SessionItem } from "@/lib/types";
import { FitTest } from "@/screens/FitTest";
import { Progress } from "@/screens/Progress";
import { Library } from "@/screens/Library";
import { Calendar } from "@/screens/Calendar";
import { Programs } from "@/screens/Programs";
import { Preview } from "@/screens/Preview";
import { Profile } from "@/screens/Profile";
import { Setup } from "@/screens/Setup";
import { Summary } from "@/screens/Summary";
import { Today } from "@/screens/Today";
import { TvMirror } from "@/screens/TvMirror";
import { Workout } from "@/screens/Workout";

const local = loadLocal();

export default function App() {
  const [saved, setSaved] = useState<Saved>(local ?? normalizeSaved(null));
  const [screen, setScreen] = useState<Screen | "loading">(local ? (local.profile.setupDone ? "today" : "setup") : "loading");
  const [minutes, setMinutes] = useState(20);
  const [energy, setEnergy] = useState("Normal");
  const [session, setSession] = useState<SessionItem[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncAutoCode, setSyncAutoCode] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);
  const [mirror, setMirror] = useState<WorkoutMirror | null>(null);

  const cloud = useRef<Awaited<ReturnType<typeof cloudDoc>>>(null);
  const synced = useRef(false);
  const edited = useRef(false);
  const cloudSettled = useRef(false);

  const { tvMode, toggleTVMode } = useTVMode();

  const { profile, stats, tests, program, recent } = saved;
  const [dayCtx, setDayCtx] = useState<PlanDay | null>(null);

  const planDayToday = () => { const pr = programById(program?.id); if (!pr || !program) return null; const i = dayIndexFor(program.start); return buildPlan(pr, program.days)[i - 1] ?? null; };
  const markDone = (index: number, on = true) => commit((s) => s.program ? ({ ...s, program: { ...s.program, done: on ? [...new Set([...s.program.done, index])] : s.program.done.filter((x) => x !== index) } }) : s);
  const startDay = (d: PlanDay) => { setDayCtx(d); setSession(buildSession(profile, d.type, d.week, minutes, energy, recent, [], programById(program?.id) ?? undefined)); setScreen("preview"); };

  useEffect(() => {
    let cancelled = false;
    const baseline = local?.updatedAt ?? 0;
    const open = (next?: Saved) => setScreen((cur) => (cur === "loading" || cur === "setup" ? (next ?? local)?.profile.setupDone ? "today" : "setup" : cur));
    const timer = window.setTimeout(() => {
      if (cancelled || cloudSettled.current) return;
      synced.current = true;
      setBooted(true);
      open();
    }, 6000);
    cloudDoc().then(async (ref) => {
      if (cancelled) return;
      cloud.current = ref;
      window.clearTimeout(timer);
      cloudSettled.current = true;
      if (!ref) { synced.current = true; setBooted(true); open(); return; }
      try {
        const snap = await ref.get();
        if (cancelled) return;
        const remote = snap.exists ? normalizeSaved(snap.data() as Partial<Saved>) : null;
        const remoteWins = !!remote && ((remote.updatedAt ?? 0) > baseline || (!local && !edited.current));
        if (remote && remoteWins) {
          edited.current = false;
          synced.current = true;
          setBooted(true);
          setSaved(remote);
          saveLocal(remote);
          open(remote);
          return;
        }
        synced.current = true;
        setBooted(true);
        setSaved((cur) => {
          if ((edited.current || local) && cur.updatedAt !== 0) ref.set(cur as unknown as Record<string, unknown>).catch(() => {});
          return cur;
        });
        open();
      } catch {
        synced.current = true;
        setBooted(true);
        open();
      }
    });
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, []);

  // Guardado local y push a la nube / sync engine
  useEffect(() => {
    if (!synced.current || saved.updatedAt === 0) return;
    saveLocal(saved);
    if (syncEngine.role === "mobile") syncEngine.pushState(saved);
    if (!cloudSettled.current) return;
    const t = window.setTimeout(() => { cloud.current?.set(saved as unknown as Record<string, unknown>).catch(() => {}); }, 700);
    return () => window.clearTimeout(t);
  }, [saved]);

  const commit = (fn: (s: Saved) => Saved, touch = true) => {
    if (touch) edited.current = true;
    setSaved((cur) => {
      const next = { ...fn(cur), updatedAt: Date.now() };
      return next;
    });
  };

  const update = (p: Partial<ProfileT>) => commit((s) => ({
    ...s,
    profile: { ...s.profile, ...p },
    program: s.program && typeof p.days === "number" && p.days !== s.program.days ? { ...s.program, days: p.days } : s.program,
  }));

  useEffect(() => {
    if (!program) return;
    const done = doneIncludingTests(program, tests);
    if (done.length === program.done.length && done.every((id) => program.done.includes(id))) return;
    commit((s) => s.program ? { ...s, program: { ...s.program, done: doneIncludingTests(s.program, s.tests) } } : s, false);
  }, [program, tests]);

  const finish = (s: number) => {
    setSeconds(s);
    commit((cur) => ({ ...cur, stats: afterSession(cur.stats, streakContext(cur.program)), recent: rememberSession(cur.recent, session.map((i) => i.exercise.id)) }));
    const real = planDayToday();
    if (dayCtx && real && dayCtx.index === real.index && real.type !== "Descanso") markDone(real.index);
    setScreen("summary");
  };

  useSpatialNav(tvMode, () => {
    if (syncModalOpen) { setSyncModalOpen(false); return; }
    const back = document.querySelector<HTMLElement>("[data-action='back']");
    if (back && back.getClientRects().length > 0) { back.click(); return; }
    if (screen === "workout") { window.dispatchEvent(new CustomEvent("onebell:pause")); return; }
    if (screen === "preview" || screen === "summary") { setScreen("today"); return; }
    if (screen === "library") { setScreen("progress"); return; }
    if (screen === "programs") { setScreen(program ? "calendar" : "today"); return; }
    if (screen === "fittest") setScreen(program ? "today" : "programs");
  });

  const urlHandled = useRef(false);
  useEffect(() => {
    if (!booted || urlHandled.current) return;
    const code = syncCodeFromLocation(window.location.search);
    if (!code) return;
    urlHandled.current = true;
    const url = new URL(window.location.href);
    url.searchParams.delete("sync");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    if (!canPublishProfile(saved.profile.setupDone)) {
      setSyncNotice("Termina tu perfil en este celular antes de vincularlo.");
      setSyncModalOpen(true);
      return;
    }
    setSyncAutoCode(code);
    setSyncModalOpen(true);
  }, [booted, saved]);

  const openSync = () => { setSyncNotice(null); setSyncAutoCode(null); setSyncModalOpen(true); };
  const abandon = () => setScreen("today");
  const streak = currentStreak(stats, streakContext(program));
  const tabs: string[] = ["today", "calendar", "programs", "progress", "library", "profile"];

  if (screen === "loading") return (
    <div className="flex h-full flex-col items-center justify-center gap-3"><Brand className="text-[40px]" /><p className="text-muted-foreground">Cargando tu perfil</p></div>
  );

  return (
    <div className="app-container mx-auto flex h-full max-w-[430px] flex-col bg-background">
      {tvMode && tabs.includes(screen) && (
        <TvTopNav screen={screen} go={setScreen} onOpenSync={openSync} />
      )}
      <div className="min-h-0 flex-1 flex flex-col">
        {screen === "setup" && <Setup profile={profile} update={update} onUseTv={openSync} onDone={() => { update({ setupDone: true }); setScreen("fittest"); }} />}
        {screen === "fittest" && <FitTest profile={profile} tests={tests} onChangeWeight={(w) => update({ testWeight: w })} onLater={() => setScreen(program ? "today" : "programs")}
          onSave={(r) => { commit((s) => ({ ...s, tests: [...s.tests, r] })); const d = planDayToday(); if (d?.type === "Prueba") markDone(d.index); setScreen(program ? "progress" : "programs"); }} />}
        {screen === "today" && <Today profile={profile} minutes={minutes} setMinutes={setMinutes} energy={energy} setEnergy={setEnergy} streak={streak} stats={stats} tests={tests} program={program} onPrograms={() => setScreen("programs")} onCalendar={() => setScreen("calendar")} onStartDay={startDay} onTest={() => setScreen(tests.length && !isTestDue(tests) && planDayToday()?.type !== "Prueba" ? "progress" : "fittest")} />}
        {screen === "preview" && <Preview profile={profile} minutes={minutes} title={dayCtx && dayCtx.index > 0 ? `Día ${dayCtx.index} · ${dayCtx.type}` : `Sesión extra · ${dayCtx?.type ?? "Movilidad"}`} session={session} setSession={setSession} regenerate={() => setSession(buildSession(profile, dayCtx?.type, dayCtx?.week, minutes, energy, recent, session.map((i) => i.exercise.id), programById(program?.id) ?? undefined))} onBack={() => setScreen("today")} onStart={() => setScreen("workout")} />}
        {screen === "workout" && <Workout profile={profile} session={session} setSession={setSession} onFinish={finish} onQuit={abandon} tvMode={tvMode} onMirror={(m) => syncEngine.pushWorkoutMirror(m)} />}
        {screen === "summary" && <Summary profile={profile} session={session} seconds={seconds} streak={streak} onSave={(ratings) => { commit((s) => ({ ...s, notes: [...s.notes, { date: todayKey(), seconds, ratings }].slice(-40) })); setScreen("today"); }} />}
        {screen === "calendar" && <Calendar state={program} tvMode={tvMode} onPrograms={() => setScreen("programs")} onToggle={(i) => markDone(i, !program?.done.includes(i))} onStartDay={(d) => (d.type === "Prueba" ? setScreen("fittest") : startDay(d))} />}
        {screen === "programs" && <Programs profile={profile} current={program} tvMode={tvMode} onBack={() => setScreen(program ? "calendar" : "today")} onStart={(p: ProgramState) => { commit((s) => ({ ...s, program: { ...p, done: doneIncludingTests(p, s.tests) } })); setScreen("calendar"); }} />}
        {screen === "progress" && <Progress tests={tests} notes={saved.notes} tvMode={tvMode} onTest={() => setScreen("fittest")} onLibrary={() => setScreen("library")} />}
        {screen === "library" && <Library onBack={() => setScreen("progress")} />}
        {screen === "profile" && <Profile profile={profile} update={update} tvMode={tvMode} onToggleTv={toggleTVMode} onReset={() => { clearLocal(); commit(() => ({ profile: defaultProfile, stats: defaultStats, tests: [], program: null, notes: [], recent: [], updatedAt: 0 })); setScreen("setup"); }} />}
      </div>
      {!tvMode && tabs.includes(screen) && <BottomNav screen={screen} go={setScreen} onOpenSync={openSync} />}
      {mirror?.active && <div className="fixed inset-0 z-40"><TvMirror mirror={mirror} /></div>}

      <TVSyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        saved={saved}
        autoCode={syncAutoCode}
        notice={syncNotice}
        onMirror={(next) => setMirror(next.active ? next : null)}
        onSaveRemote={(remote) => {
          setSaved(remote);
          saveLocal(remote);
          if (remote.profile.setupDone) setScreen((cur) => (cur === "setup" || cur === "loading" ? "today" : cur));
        }}
      />
    </div>
  );
}
