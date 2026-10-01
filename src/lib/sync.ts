import type { Saved } from "./storage";

export type SyncStatus = "disconnected" | "connecting" | "connected" | "error";

export type RemoteSyncMessage = {
  type: "STATE_PUSH" | "STATE_REQUEST" | "WORKOUT_MIRROR";
  room: string;
  sender: "mobile" | "tv";
  saved?: Saved;
  workoutState?: {
    screen: string;
    exerciseName?: string;
    left?: number;
    elapsed?: number;
    paused?: boolean;
    set?: number;
    totalSets?: number;
    amount?: string;
    mode?: string;
    cue?: string;
  };
  timestamp: number;
};

// Servicio de Sincronización en la Nube basado en API de Almacenamiento Relay Público
const SYNC_ENDPOINT = "https://ntfy.sh"; // Canal PubSub rápido, gratuito y de baja latencia sin API key required

export function generateSyncCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getQRUrl(pairCode: string): string {
  const targetUrl = `${window.location.origin}${window.location.pathname}?sync=${pairCode}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(targetUrl)}`;
}

export class SyncEngine {
  private pairCode: string | null = null;
  private isHost: boolean = false; // TV es host (escucha), Mobile es cliente (push)
  private eventSource: EventSource | null = null;
  private pollTimer: number | null = null;
  private onStateReceived?: (saved: Saved) => void;
  private onWorkoutMirrorReceived?: (msg: RemoteSyncMessage["workoutState"]) => void;
  private onStatusChange?: (status: SyncStatus) => void;

  constructor() {
    // Si la URL contiene ?sync=XXXXXX, emparejar automáticamente
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("sync");
      if (code && code.length === 6) {
        this.pairCode = code;
      }
    }
  }

  public getCode(): string | null {
    return this.pairCode;
  }

  public startHost(onState: (saved: Saved) => void, onMirror?: (w: RemoteSyncMessage["workoutState"]) => void, onStatus?: (s: SyncStatus) => void): string {
    if (!this.pairCode) {
      this.pairCode = generateSyncCode();
    }
    this.isHost = true;
    this.onStateReceived = onState;
    this.onWorkoutMirrorReceived = onMirror;
    this.onStatusChange = onStatus;
    
    this.connect();
    return this.pairCode;
  }

  public joinRoom(code: string, currentState: Saved, onStatus?: (s: SyncStatus) => void) {
    this.pairCode = code;
    this.isHost = false;
    this.onStatusChange = onStatus;

    this.connect();
    // Al unirse como móvil, enviar estado de inmediato al TV
    this.pushState(currentState);
  }

  private connect() {
    if (!this.pairCode) return;
    this.onStatusChange?.("connecting");

    try {
      // Suscripción SSE (Server-Sent Events) en ntfy.sh para eventos instantáneos sin demora
      const topic = `onebell_sync_${this.pairCode}`;
      const sseUrl = `${SYNC_ENDPOINT}/${topic}/sse`;

      if (this.eventSource) {
        this.eventSource.close();
      }

      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        this.onStatusChange?.("connected");
      };

      this.eventSource.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          if (raw.message) {
            const data: RemoteSyncMessage = JSON.parse(raw.message);
            this.handleMessage(data);
          }
        } catch { /* Ignorar mensajes con formato distinto */ }
      };

      this.eventSource.onerror = () => {
        this.onStatusChange?.("error");
      };
    } catch {
      this.onStatusChange?.("error");
    }
  }

  private handleMessage(data: RemoteSyncMessage) {
    if (!data || data.room !== this.pairCode) return;

    if (data.type === "STATE_PUSH" && data.saved && this.isHost) {
      this.onStateReceived?.(data.saved);
    }

    if (data.type === "WORKOUT_MIRROR" && data.workoutState && this.isHost) {
      this.onWorkoutMirrorReceived?.(data.workoutState);
    }
  }

  public pushState(saved: Saved) {
    if (!this.pairCode) return;
    const msg: RemoteSyncMessage = {
      type: "STATE_PUSH",
      room: this.pairCode,
      sender: this.isHost ? "tv" : "mobile",
      saved,
      timestamp: Date.now()
    };
    this.sendMessage(msg);
  }

  public pushWorkoutMirror(workoutState: RemoteSyncMessage["workoutState"]) {
    if (!this.pairCode) return;
    const msg: RemoteSyncMessage = {
      type: "WORKOUT_MIRROR",
      room: this.pairCode,
      sender: this.isHost ? "tv" : "mobile",
      workoutState,
      timestamp: Date.now()
    };
    this.sendMessage(msg);
  }

  private async sendMessage(msg: RemoteSyncMessage) {
    if (!this.pairCode) return;
    try {
      const topic = `onebell_sync_${this.pairCode}`;
      await fetch(`${SYNC_ENDPOINT}/${topic}`, {
        method: "POST",
        body: JSON.stringify(msg),
        headers: { "Content-Type": "application/json" }
      });
    } catch { /* Ignorar errores de red temporales */ }
  }

  public disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.pollTimer) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.pairCode = null;
    this.onStatusChange?.("disconnected");
  }
}

export const syncEngine = new SyncEngine();
