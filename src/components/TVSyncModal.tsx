import { useState, useEffect } from "react";
import { QrCode, Tv, Smartphone, Check, X, Wifi } from "lucide-react";
import { Button } from "./Button";
import { getQRUrl, syncEngine, type SyncStatus } from "@/lib/sync";
import type { Saved } from "@/lib/storage";

export function TVSyncModal({
  isOpen,
  onClose,
  saved,
  onSaveRemote
}: {
  isOpen: boolean;
  onClose: () => void;
  saved: Saved;
  onSaveRemote: (s: Saved) => void;
}) {
  const [mode, setMode] = useState<"choose" | "show_code" | "enter_code">("choose");
  const [code, setCode] = useState("");
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [status, setStatus] = useState<SyncStatus>("disconnected");
  const [syncedSuccess, setSyncedSuccess] = useState(false);

  useEffect(() => {
    // Si la app se abrió con una URL de sincronización (?sync=XXXXXX)
    const initialCode = syncEngine.getCode();
    if (initialCode && initialCode.length === 6) {
      setPairCode(initialCode);
      setMode("enter_code");
      setCode(initialCode);
    }
  }, []);

  if (!isOpen) return null;

  const handleStartHostTV = () => {
    const newCode = syncEngine.startHost(
      (remoteSaved) => {
        onSaveRemote(remoteSaved);
        setSyncedSuccess(true);
      },
      undefined,
      (s) => setStatus(s)
    );
    setPairCode(newCode);
    setMode("show_code");
  };

  const handleConnectMobile = () => {
    if (code.trim().length !== 6) return;
    syncEngine.joinRoom(code.trim(), saved, (s) => setStatus(s));
    setPairCode(code.trim());
    setSyncedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[24px] border border-border bg-card p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X size={24} />
        </button>

        {mode === "choose" && (
          <div className="space-y-6 text-center pt-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Tv size={36} />
            </div>
            <div>
              <h2 className="font-display text-3xl uppercase">Sincronizar Sesión</h2>
              <p className="mt-2 text-muted-foreground">
                Usa el mismo perfil, programa y rutinas en tu televisión y en tu celular sin empezar de cero.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="ember"
                size="hero"
                className="h-24 flex-col text-lg justify-center gap-1"
                onClick={handleStartHostTV}
              >
                <Tv size={28} />
                <span>Estoy en la TV</span>
                <span className="text-xs opacity-80 font-normal">Mostrar código de enlace</span>
              </Button>

              <Button
                variant="tile"
                size="hero"
                className="h-24 flex-col text-lg justify-center gap-1 border-primary/30"
                onClick={() => setMode("enter_code")}
              >
                <Smartphone size={28} className="text-primary" />
                <span>Estoy en Celular</span>
                <span className="text-xs text-muted-foreground font-normal">Ingresar código de la TV</span>
              </Button>
            </div>
          </div>
        )}

        {mode === "show_code" && pairCode && (
          <div className="space-y-5 text-center pt-1">
            <div className="flex items-center justify-center gap-2 text-primary font-semibold text-sm">
              <Wifi size={18} className="animate-pulse" />
              <span>TV en espera de conexión ({status === "connected" ? "Conectado" : "Esperando celular..."})</span>
            </div>

            <h2 className="font-display text-2xl uppercase">Código de Sincronización</h2>

            <div className="my-3 inline-block rounded-2xl bg-background border border-primary/40 px-8 py-4">
              <span className="font-display text-5xl tracking-[0.25em] text-primary">{pairCode}</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-white rounded-xl shadow-lg">
                <img src={getQRUrl(pairCode)} alt="QR Code" className="h-44 w-44" />
              </div>
              <p className="text-sm text-muted-foreground">
                Abre la cámara de tu celular para escanear el QR o ingresa a <strong className="text-foreground">one-bell.vercel.app</strong> y presiona "Estoy en Celular".
              </p>
            </div>

            {syncedSuccess && (
              <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-green-400 font-semibold text-sm flex items-center justify-center gap-2">
                <Check size={20} /> ¡Perfil y sesión sincronizados con tu celular!
              </div>
            )}
          </div>
        )}

        {mode === "enter_code" && (
          <div className="space-y-5 text-center pt-2">
            <h2 className="font-display text-2xl uppercase">Conectar a la TV</h2>
            <p className="text-sm text-muted-foreground">
              Escribe el código de 6 dígitos que aparece en la pantalla de tu televisión:
            </p>

            <div className="pt-2">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center font-display text-4xl tracking-[0.3em] uppercase bg-background border-2 border-primary/50 focus:border-primary rounded-xl py-3 text-foreground outline-none"
              />
            </div>

            <Button
              variant="ember"
              size="hero"
              className="w-full"
              onClick={handleConnectMobile}
              disabled={code.length !== 6}
            >
              Vincular Dispositivos
            </Button>

            {syncedSuccess && (
              <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-green-400 font-semibold text-sm flex items-center justify-center gap-2">
                <Check size={20} /> ¡Conectado a la TV exitosamente! Tu sesión está activa.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
