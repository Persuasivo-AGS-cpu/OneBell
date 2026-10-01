import { useEffect, useRef, useState } from "react";
import { Tv, Smartphone, Check, X, Wifi } from "lucide-react";
import { Button } from "./Button";
import { canPublishProfile, formatPairCode, getQRUrl, parsePairCode, syncEngine, type SyncStatus, type WorkoutMirror } from "@/lib/sync";
import type { Saved } from "@/lib/storage";

export function TVSyncModal({
  isOpen,
  onClose,
  saved,
  onSaveRemote,
  autoCode,
  notice,
  onMirror,
}: {
  isOpen: boolean;
  onClose: () => void;
  saved: Saved;
  onSaveRemote: (s: Saved) => void;
  autoCode?: string | null;
  notice?: string | null;
  onMirror?: (m: WorkoutMirror) => void;
}) {
  const [mode, setMode] = useState<"choose" | "show_code" | "enter_code">("choose");
  const [code, setCode] = useState("");
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [status, setStatus] = useState<SyncStatus>("disconnected");
  const [localNotice, setLocalNotice] = useState<string | null>(null);
  const savedRef = useRef(saved);
  savedRef.current = saved;
  const joined = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen || !autoCode || notice || joined.current === autoCode) return;
    joined.current = autoCode;
    setCode(formatPairCode(autoCode));
    setMode("enter_code");
    syncEngine.joinRoom(autoCode, savedRef.current, setStatus);
  }, [isOpen, autoCode, notice]);

  if (!isOpen) return null;

  const shownNotice = notice || localNotice;
  const paired = status === "paired";

  const handleStartHostTV = () => {
    const newCode = syncEngine.startHost(
      (remoteSaved) => onSaveRemote(remoteSaved),
      onMirror,
      setStatus,
    );
    setPairCode(newCode);
    setMode("show_code");
  };

  const handleConnectMobile = () => {
    const parsed = parsePairCode(code);
    if (!parsed) return;
    if (!canPublishProfile(saved.profile.setupDone)) {
      setLocalNotice("Termina tu perfil en este celular antes de vincularlo.");
      return;
    }
    syncEngine.joinRoom(parsed, saved, setStatus);
    setPairCode(parsed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-[24px] border border-border bg-card p-6 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Cerrar">
          <X size={24} />
        </button>

        {shownNotice && (
          <div className="space-y-5 pt-2 text-center">
            <h2 className="font-display text-3xl uppercase">Conectar a la TV</h2>
            <p className="text-muted-foreground">{shownNotice}</p>
            <Button variant="ember" size="hero" className="w-full" onClick={onClose}>Entendido</Button>
          </div>
        )}

        {!shownNotice && mode === "choose" && (
          <div className="space-y-6 pt-2 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Tv size={36} />
            </div>
            <div>
              <h2 className="font-display text-3xl uppercase">Sincronizar sesión</h2>
              <p className="mt-2 text-muted-foreground">Usa el mismo perfil y el mismo programa en la televisión y en el celular.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
              <Button variant="ember" size="hero" className="h-24 flex-col justify-center gap-1 text-lg" onClick={handleStartHostTV}>
                <Tv size={28} />
                <span>Estoy en la TV</span>
                <span className="text-xs font-normal opacity-80">Mostrar código de enlace</span>
              </Button>
              <Button variant="tile" size="hero" className="h-24 flex-col justify-center gap-1 border-primary/30 text-lg" onClick={() => setMode("enter_code")}>
                <Smartphone size={28} className="text-primary" />
                <span>Estoy en celular</span>
                <span className="text-xs font-normal text-muted-foreground">Ingresar código de la TV</span>
              </Button>
            </div>
          </div>
        )}

        {!shownNotice && mode === "show_code" && pairCode && (
          <div className="space-y-5 pt-1 text-center">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
              <Wifi size={18} className={paired ? undefined : "animate-pulse"} />
              <span>{paired ? "Celular vinculado" : "Esperando celular..."}</span>
            </div>
            <h2 className="font-display text-2xl uppercase">Código de sincronización</h2>
            <div className="my-3 inline-block rounded-2xl border border-primary/40 bg-background px-8 py-4">
              <span className="font-display text-5xl tracking-[0.25em] text-primary">{formatPairCode(pairCode)}</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="rounded-xl bg-white p-3 shadow-lg">
                <img src={getQRUrl(pairCode)} alt="Código QR para abrir el enlace en el celular" className="h-44 w-44" />
              </div>
              <p className="text-sm text-muted-foreground">
                Escanea el QR o entra a <strong className="text-foreground">one-bell.vercel.app</strong> y elige "Estoy en celular".
              </p>
            </div>
            {paired && (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm font-semibold text-green-400">
                <Check size={20} /> Perfil recibido desde el celular.
              </div>
            )}
          </div>
        )}

        {!shownNotice && mode === "enter_code" && (
          <div className="space-y-5 pt-2 text-center">
            <h2 className="font-display text-2xl uppercase">Conectar a la TV</h2>
            <p className="text-sm text-muted-foreground">Escribe el código de 6 dígitos que aparece en la televisión.</p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^\d-]/g, "").slice(0, 7))}
              placeholder="849-102"
              className="w-full rounded-xl border-2 border-primary/50 bg-background py-3 text-center font-display text-4xl tracking-[0.3em] text-foreground outline-none focus:border-primary"
            />
            <Button variant="ember" size="hero" className="w-full" onClick={handleConnectMobile} disabled={parsePairCode(code) === null}>
              Vincular dispositivos
            </Button>
            {(status === "connecting" || status === "connected") && !paired && (
              <p className="text-sm font-semibold text-primary">Buscando la TV...</p>
            )}
            {paired && (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm font-semibold text-green-400">
                <Check size={20} /> La TV ya tiene tu perfil.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
