import type { Saved } from "./storage";

export type SyncStatus = "disconnected" | "connecting" | "connected" | "paired" | "error";
export type SyncRole = "tv" | "mobile";
export const NTFY_MAX_BYTES = 3800;

export type WorkoutMirror = {
  active: boolean;
  exerciseId: string;
  exerciseName: string;
  cue: string;
  left: number;
  paused: boolean;
  set: number;
  totalSets: number;
  amount: string;
  mode: string;
  section: string;
  label: string;
};

export type RemoteSyncMessage = {
  type: "STATE_PUSH" | "STATE_ACK" | "WORKOUT_MIRROR";
  room: string;
  senderId: string;
  sender: "mobile" | "tv";
  saved?: Saved;
  workoutState?: WorkoutMirror;
  timestamp: number;
};

export function parsePairCode(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 6 ? digits : null;
}

export function formatPairCode(code: string): string {
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

export function syncCodeFromLocation(search: string): string | null {
  const code = new URLSearchParams(search).get("sync");
  return code ? parsePairCode(code) : null;
}

export function canPublishProfile(setupDone: boolean): boolean {
  return setupDone;
}

export function mirrorChanged(prev: WorkoutMirror | null, next: WorkoutMirror): boolean {
  if (!prev) return true;
  return prev.active !== next.active
    || prev.exerciseId !== next.exerciseId
    || prev.paused !== next.paused
    || prev.set !== next.set
    || prev.totalSets !== next.totalSets
    || prev.label !== next.label;
}

function payloadBytes(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

/** Recorta historial viejo para que el JSON quepa en ntfy. No muta el original. */
export function fitSyncPayload(saved: Saved, maxBytes = NTFY_MAX_BYTES): Saved {
  const next: Saved = { ...saved, notes: [...saved.notes], recent: saved.recent.map((row) => [...row]), tests: [...saved.tests] };
  const trim = (list: unknown[]) => { while (list.length > 0 && payloadBytes(next) > maxBytes) list.shift(); };
  if (payloadBytes(next) <= maxBytes) return next;
  trim(next.notes);
  trim(next.recent);
  while (next.tests.length > 1 && payloadBytes(next) > maxBytes) next.tests.shift();
  return next;
}

export function shouldApply(msg: RemoteSyncMessage, selfId: string, role: SyncRole, room: string): "state" | "ack" | "mirror" | "ignore" {
  if (!msg || msg.senderId === selfId || msg.room !== room) return "ignore";
  if (role === "tv" && msg.type === "STATE_PUSH" && msg.saved) return "state";
  if (role === "mobile" && msg.type === "STATE_ACK") return "ack";
  if (role === "tv" && msg.type === "WORKOUT_MIRROR" && msg.workoutState) return "mirror";
  return "ignore";
}

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
  readonly clientId = Math.random().toString(36).slice(2, 10);
  role: SyncRole | null = null;
  private pairCode: string | null = null;
  private eventSource: EventSource | null = null;
  private pollTimer: number | null = null;
  private onStateReceived?: (saved: Saved) => void;
  private onWorkoutMirrorReceived?: (msg: WorkoutMirror) => void;
  private onStatusChange?: (status: SyncStatus) => void;
  private paired = false;

  public getCode(): string | null {
    return this.pairCode;
  }

  public startHost(onState: (saved: Saved) => void, onMirror?: (w: WorkoutMirror) => void, onStatus?: (s: SyncStatus) => void): string {
    if (!this.pairCode) {
      this.pairCode = generateSyncCode();
    }
    this.role = "tv";
    this.onStateReceived = onState;
    this.onWorkoutMirrorReceived = onMirror;
    this.onStatusChange = onStatus;
    
    this.connect();
    return this.pairCode;
  }

  public joinRoom(code: string, currentState: Saved, onStatus?: (s: SyncStatus) => void) {
    const parsed = parsePairCode(code);
    if (!parsed) return;
    this.pairCode = parsed;
    this.role = "mobile";
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
        if (!this.paired) this.onStatusChange?.("connected");
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
        if (this.eventSource?.readyState === EventSource.CLOSED) this.onStatusChange?.("error");
      };
    } catch {
      this.onStatusChange?.("error");
    }
  }

  private handleMessage(data: RemoteSyncMessage) {
    if (!this.pairCode || !this.role) return;
    const action = shouldApply(data, this.clientId, this.role, this.pairCode);
    if (action === "state" && data.saved) {
      this.paired = true;
      this.onStateReceived?.(data.saved);
      this.onStatusChange?.("paired");
      this.acknowledge();
    } else if (action === "ack") {
      this.paired = true;
      this.onStatusChange?.("paired");
    } else if (action === "mirror" && data.workoutState) {
      this.onWorkoutMirrorReceived?.(data.workoutState);
    }
  }

  public pushState(saved: Saved) {
    if (this.role !== "mobile" || !this.pairCode || !canPublishProfile(saved.profile.setupDone)) return;
    const payload = fitSyncPayload(saved);
    if (payloadBytes(payload) > NTFY_MAX_BYTES) {
      this.onStatusChange?.("error");
      return;
    }
    this.sendMessage({
      type: "STATE_PUSH",
      room: this.pairCode,
      senderId: this.clientId,
      sender: "mobile",
      saved: payload,
      timestamp: Date.now(),
    });
  }

  public pushWorkoutMirror(workoutState: WorkoutMirror) {
    if (this.role !== "mobile" || !this.pairCode) return;
    this.sendMessage({
      type: "WORKOUT_MIRROR",
      room: this.pairCode,
      senderId: this.clientId,
      sender: "mobile",
      workoutState,
      timestamp: Date.now(),
    });
  }

  public acknowledge() {
    if (this.role !== "tv" || !this.pairCode) return;
    this.sendMessage({
      type: "STATE_ACK",
      room: this.pairCode,
      senderId: this.clientId,
      sender: "tv",
      timestamp: Date.now(),
    });
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
    this.role = null;
    this.paired = false;
    this.onStatusChange?.("disconnected");
  }
}

export const syncEngine = new SyncEngine();
