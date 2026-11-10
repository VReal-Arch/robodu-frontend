import { CommandMsg, ServerMsg } from "./types";

type MsgHandler = (msg: ServerMsg) => void;
type StatusHandler = (connected: boolean) => void;

// Dashboard mengirim ping tiap PING_MS. Kalau tidak ada pesan APA PUN dari
// server selama DEAD_MS, koneksi dianggap mati diam-diam (laptop pindah WiFi,
// proxy hosting memutus tanpa menutup) lalu ditutup dan disambung ulang.
// Tanpa ini browser bisa menunggu bermenit-menit dengan status "Online"
// padahal datanya sudah berhenti.
// Deteksi ini baru aktif setelah server pernah membalas "pong". Backend lama
// tidak membalas ping, dan saat tidak ada robot menyala memang tidak ada pesan
// apa pun, jadi tanpa syarat ini web akan memutus-sambung tiap 25 detik.
const PING_MS = 10_000;
const DEAD_MS = 25_000;
// Jeda sambung ulang naik bertahap supaya server yang baru restart tidak
// dibanjiri, tapi tidak pernah lebih dari 10 s.
const RETRY_MIN_MS = 1_000;
const RETRY_MAX_MS = 10_000;

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
  private pinger: ReturnType<typeof setInterval> | null = null;
  private retryMs = RETRY_MIN_MS;
  private lastRxMs = 0;
  private serverPongs = false; // server mendukung ping/pong (backend baru)
  private listenersAdded = false;

  connect(url: string) {
    this.url = url;
    this.addWindowListeners();
    this.open();
  }

  private open() {
    if (typeof window === "undefined") return;
    // Jangan membuka koneksi kedua kalau yang lama masih hidup/menyambung.
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    let ws: WebSocket;
    try {
      ws = new WebSocket(this.url);
    } catch {
      this.scheduleRetry();
      return;
    }
    this.ws = ws;
    ws.onopen = () => {
      this.retryMs = RETRY_MIN_MS;
      this.lastRxMs = Date.now();
      this.serverPongs = false;
      this.startPing();
      this.statusHandler?.(true);
    };
    ws.onmessage = (e) => {
      this.lastRxMs = Date.now();
      let msg: ServerMsg;
      try {
        msg = JSON.parse(e.data) as ServerMsg;
      } catch {
        return; /* ignore malformed */
      }
      if (msg.type === "pong") {
        this.serverPongs = true;
        return;
      }
      this.msgHandler?.(msg);
    };
    ws.onclose = () => {
      // Abaikan close dari socket lama yang sudah diganti.
      if (this.ws !== ws) return;
      this.stopPing();
      this.ws = null;
      this.statusHandler?.(false);
      this.scheduleRetry();
    };
    ws.onerror = () => ws.close();
  }

  private startPing() {
    this.stopPing();
    this.pinger = setInterval(() => {
      const ws = this.ws;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      if (this.serverPongs && Date.now() - this.lastRxMs > DEAD_MS) {
        // Koneksi mati diam-diam: tutup paksa, onclose akan menyambung ulang.
        ws.close();
        return;
      }
      try {
        ws.send(JSON.stringify({ type: "ping", ts: Date.now() }));
      } catch {
        /* onclose menangani */
      }
    }, PING_MS);
  }

  private stopPing() {
    if (this.pinger) clearInterval(this.pinger);
    this.pinger = null;
  }

  private scheduleRetry() {
    if (this.retry) return;
    const wait = this.retryMs;
    this.retryMs = Math.min(this.retryMs * 2, RETRY_MAX_MS);
    this.retry = setTimeout(() => {
      this.retry = null;
      this.open();
    }, wait);
  }

  /** Sambung ulang SEKARANG (mis. jaringan laptop baru kembali). */
  private reconnectNow() {
    if (this.retry) {
      clearTimeout(this.retry);
      this.retry = null;
    }
    this.retryMs = RETRY_MIN_MS;
    this.open();
  }

  private addWindowListeners() {
    if (this.listenersAdded || typeof window === "undefined") return;
    this.listenersAdded = true;
    // Jaringan laptop kembali -> jangan tunggu jadwal retry.
    window.addEventListener("online", () => this.reconnectNow());
    // Tab dibuka lagi setelah lama di belakang: timer browser diperlambat
    // saat tab tersembunyi, jadi cek kesehatan koneksi saat tab terlihat.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") return;
      const ws = this.ws;
      if (ws && ws.readyState === WebSocket.OPEN && this.serverPongs && Date.now() - this.lastRxMs > DEAD_MS) {
        ws.close();
      } else if (!ws) {
        this.reconnectNow();
      }
    });
  }

  onMessage(h: MsgHandler) {
    this.msgHandler = h;
  }
  onConnectionChange(h: StatusHandler) {
    this.statusHandler = h;
  }

  /** Mengembalikan false kalau perintah tidak terkirim (server terputus). */
  send(cmd: CommandMsg): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(cmd));
      return true;
    }
    return false;
  }
}

export const wsClient = new WsClient();
