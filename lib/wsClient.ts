import { CommandMsg, ServerMsg } from "./types";

type MsgHandler = (msg: ServerMsg) => void;
type StatusHandler = (connected: boolean) => void;

/**
 * Single WebSocket connection to the backend. Auto-reconnects.
 * Send commands with .send(), receive telemetry/state via .onMessage().
 */
class WsClient {
  private ws: WebSocket | null = null;
  private url = "";
  private msgHandler: MsgHandler | null = null;
  private statusHandler: StatusHandler | null = null;
  private retry: ReturnType<typeof setTimeout> | null = null;
  private manuallyClosed = false;

  connect(url: string) {
    this.url = url;
    this.manuallyClosed = false;
    // guard: don't open a second socket if one is already open/connecting
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.open();
  }

  disconnect() {
    this.manuallyClosed = true;
    if (this.retry) {
      clearTimeout(this.retry);
      this.retry = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  private open() {
    if (typeof window === "undefined") return;
    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.scheduleRetry();
      return;
    }
    this.ws.onopen = () => this.statusHandler?.(true);
    this.ws.onmessage = (e) => {
      try {
        this.msgHandler?.(JSON.parse(e.data) as ServerMsg);
      } catch {
        /* ignore malformed */
      }
    };
    this.ws.onclose = () => {
      this.statusHandler?.(false);
      if (!this.manuallyClosed) this.scheduleRetry();
    };
    this.ws.onerror = () => this.ws?.close();
  }

  private scheduleRetry() {
    if (this.retry) return;
    this.retry = setTimeout(() => {
      this.retry = null;
      this.open();
    }, 2000);
  }

  onMessage(h: MsgHandler) {
    this.msgHandler = h;
  }
  onConnectionChange(h: StatusHandler) {
    this.statusHandler = h;
  }

  send(cmd: CommandMsg) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(cmd));
    }
  }
}

export const wsClient = new WsClient();