import { create } from "zustand";
import {
  ChartMode,
  CommandAction,
  CommandMsg,
  ControlState,
  Gait,
  HomingInfo,
  InputMode,
  LogEntry,
  ModalSpec,
  PID,
  Preset,
  PublicRobotState,
  RobotId,
  Theme,
} from "@/lib/types";
import { displayName, getRobot, initialControls } from "@/lib/robots";
import { NO_HOMING } from "@/lib/homing";
import { nowHM } from "@/lib/format";
import { addPreset, loadPresets, removePreset } from "@/lib/presets";
import { wsClient } from "@/lib/wsClient";

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

let modalSeq = 1;

/** Per robot: has the master reacted to the last homing request yet? */
const homingSeen: Record<RobotId, boolean> = {};

function sendCmd(robotId: RobotId, action: CommandAction, payload?: CommandMsg["payload"]) {
  if (!wsClient.send({ type: "command", robotId, source: "web", action, payload })) {
    // Jangan diam-diam: pengguna harus tahu perintahnya tidak sampai.
    useStore.getState().addLog("⚠ Perintah " + action + " tidak terkirim: server terputus");
  }
}

interface State {
  // theme + layout
  theme: Theme;
  sidebarOpen: boolean;
  dropdownOpen: boolean;
  // selection + input
  activeId: RobotId;
  inputMode: InputMode;
  chartMode: ChartMode;
  estop: boolean;
  wsConnected: boolean;
  // false = server tersambung ke dashboard tapi kehilangan broker MQTT
  brokerConnected: boolean;
  // robot yang tadinya dihubungkan pengguna lalu putus SENDIRI (watchdog
  // server). Begitu robot online lagi, koneksinya dipulihkan otomatis tanpa
  // harus ke Settings. Start tetap harus ditekan ulang (alat sudah di-stop).
  autoDropped: Record<RobotId, boolean>;
  gamepadConnected: boolean;
  gamepadId: string | null;
  gamepadIndex: number | null;
  demoMode: boolean;
  // per-robot control (desired state)
  controls: Record<RobotId, ControlState>;
  // per-robot homing status, from telemetry (only kits that need homing have needed=true)
  homing: Record<RobotId, HomingInfo>;
  // presets / logs / modals
  presets: Preset[];
  logs: LogEntry[];
  modals: ModalSpec[];

  // actions
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setDropdownOpen: (v: boolean) => void;
  selectRobot: (id: RobotId) => void;
  setInputMode: (m: InputMode) => void;
  setChartMode: (m: ChartMode) => void;
  setGamepad: (info: { connected: boolean; id?: string | null; index?: number | null }) => void;
  setDemo: (v: boolean) => void;

  setSetpoint: (id: RobotId, value: number) => void;
  nudgeSetpoint: (id: RobotId, delta: number) => void;
  zeroSetpoint: (id: RobotId) => void;
  setPid: (id: RobotId, key: keyof PID, value: number) => void;
  setPidAll: (id: RobotId, pid: PID) => void;
  resetPid: (id: RobotId) => void;
  setRunning: (id: RobotId, v: boolean) => void;
  setGait: (id: RobotId, g: Gait) => void;

  // driven by the backend (no command sent)
  setWsConnected: (c: boolean) => void;
  setConnected: (id: RobotId, v: boolean) => void;
  connectAll: () => void;
  disconnectAll: () => void;
  applyServerState: (robots: Record<string, PublicRobotState>) => void;
  applyStatus: (id: RobotId, connected: boolean) => void;
  applyTelemetryState: (id: RobotId, running: boolean) => void;
  applyEstop: (active: boolean) => void;
  applyBroker: (connected: boolean) => void;
  applyHoming: (id: RobotId, info: HomingInfo) => void;

  startHoming: (id: RobotId) => void;
  cancelHoming: (id: RobotId) => void;

  emergencyStop: () => void;
  resetEstop: () => void;

  addLog: (text: string) => void;
  pushModal: (m: Omit<ModalSpec, "id">) => void;
  popModal: () => void;

  initPresets: () => void;
  savePreset: (name: string) => void;
  applyPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
}

export const useStore = create<State>((set, get) => ({
  theme: "light",
  sidebarOpen: false,
  dropdownOpen: false,
  activeId: "ball_beam_1",
  inputMode: "mouse",
  chartMode: "combined",
  estop: false,
  wsConnected: false,
  brokerConnected: true,
  autoDropped: {} as Record<RobotId, boolean>,
  gamepadConnected: false,
  gamepadId: null,
  gamepadIndex: null,
  demoMode: false,
  controls: initialControls(),
  homing: {},
  presets: [],
  logs: [
    { text: "Sistem aktif", time: "14:25", active: false },
    { text: "Kalibrasi selesai", time: "14:28", active: true },
    { text: "5 kit terdeteksi", time: "14:31", active: true },
    { text: "Master controller online", time: "14:32", active: true },
  ].reverse(),
  modals: [],

  setTheme: (t) => set({ theme: t }),
  toggleTheme: () => {
    const t = get().theme === "dark" ? "light" : "dark";
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", t === "dark");
      try {
        localStorage.setItem("robodu-theme", t);
      } catch {}
    }
    set({ theme: t });
  },
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  setDropdownOpen: (v) => set({ dropdownOpen: v }),

  selectRobot: (id) => {
    set({ activeId: id, dropdownOpen: false });
    get().addLog("Pilih robot: " + getRobot(id).name);
  },
  setInputMode: (m) => set({ inputMode: m }),
  setChartMode: (m) => {
    set({ chartMode: m });
    get().addLog("Grafik: " + (m === "combined" ? "Gabung" : "Pisah"));
  },
  setGamepad: (info) =>
    set({
      gamepadConnected: info.connected,
      gamepadId: info.id ?? null,
      gamepadIndex: info.index ?? null,
      demoMode: info.connected ? false : get().demoMode,
    }),
  setDemo: (v) => set({ demoMode: v, gamepadConnected: v ? false : get().gamepadConnected }),

  setSetpoint: (id, value) => {
    const cfg = getRobot(id);
    if (cfg.type !== "pid") return;
    const v = clamp(value, cfg.setMin, cfg.setMax);
    set((s) => ({
      controls: { ...s.controls, [id]: { ...s.controls[id], setpoint: v } },
    }));
    sendCmd(id, "set_setpoint", { setpoint: v });
  },
  nudgeSetpoint: (id, delta) => {
    const cfg = getRobot(id);
    if (cfg.type !== "pid") return;
    const cur = get().controls[id].setpoint;
    get().setSetpoint(id, cur + delta);
  },
  zeroSetpoint: (id) => get().setSetpoint(id, 0),

  setPid: (id, key, value) => {
    let pid: PID = { kp: 0, ki: 0, kd: 0 };
    set((s) => {
      pid = { ...s.controls[id].pid, [key]: value };
      return { controls: { ...s.controls, [id]: { ...s.controls[id], pid } } };
    });
    sendCmd(id, "set_pid", { kp: pid.kp, ki: pid.ki, kd: pid.kd });
  },
  setPidAll: (id, pid) => {
    set((s) => ({
      controls: { ...s.controls, [id]: { ...s.controls[id], pid: { ...pid } } },
    }));
    sendCmd(id, "set_pid", { kp: pid.kp, ki: pid.ki, kd: pid.kd });
  },
  resetPid: (id) => {
    const cfg = getRobot(id);
    if (cfg.type !== "pid") return;
    get().setPidAll(id, cfg.pidDef);
    get().addLog("PID direset ke default");
  },
  setRunning: (id, v) => {
    set((s) => ({ controls: { ...s.controls, [id]: { ...s.controls[id], running: v } } }));
    sendCmd(id, v ? "start" : "stop");
  },
  setGait: (id, g) => {
    set((s) => ({ controls: { ...s.controls, [id]: { ...s.controls[id], gait: g } } }));
    sendCmd(id, "set_gait", { gait: g });
  },

  setWsConnected: (c) => {
    const was = get().wsConnected;
    set({ wsConnected: c });
    if (c && !was) get().addLog("Terhubung ke server");
    if (!c && was) get().addLog("Server terputus");
  },
  setConnected: (id, v) => {
    set((s) => {
      const next = { ...s.controls[id], connected: v };
      if (!v) {
        if (getRobot(id).type === "pid") next.running = false;
        else next.gait = "idle";
      }
      // pilihan manual pengguna menghapus status "menunggu tersambung lagi"
      return { controls: { ...s.controls, [id]: next }, autoDropped: { ...s.autoDropped, [id]: false } };
    });
    get().addLog((v ? "Tersambung: " : "Diputus: ") + getRobot(id).name);
  },
  connectAll: () => {
    set((s) => {
      const controls = { ...s.controls };
      for (const id of Object.keys(controls) as RobotId[]) controls[id] = { ...controls[id], connected: true };
      return { controls };
    });
    get().addLog("Semua robot dihubungkan");
  },
  disconnectAll: () => {
    set((s) => {
      const controls = { ...s.controls };
      for (const id of Object.keys(controls) as RobotId[]) {
        const off = { ...controls[id], connected: false };
        if (getRobot(id).type === "pid") off.running = false;
        else off.gait = "idle";
        controls[id] = off;
      }
      return { controls, autoDropped: {} as Record<RobotId, boolean> };
    });
    get().addLog("Semua robot diputus");
  },
  applyServerState: (robots) => {
    // sync desired values from backend, but keep the manual connection flag.
    // Snapshot juga datang setiap kali WebSocket tersambung ulang, jadi status
    // online/offline robot ikut disamakan di sini.
    const dropped: RobotId[] = [];
    const back: RobotId[] = [];
    set((s) => {
      const controls = { ...s.controls };
      const autoDropped = { ...s.autoDropped };
      for (const id of Object.keys(robots) as RobotId[]) {
        const r = robots[id];
        if (!controls[id]) continue;
        let connected = controls[id].connected;
        if (connected && r.connected === false) {
          connected = false;
          autoDropped[id] = true;
          dropped.push(id);
        } else if (!connected && autoDropped[id] && r.connected) {
          connected = true;
          autoDropped[id] = false;
          back.push(id);
        }
        controls[id] = {
          connected,
          running: connected ? r.running : false,
          gait: r.gait,
          setpoint: r.setpoint,
          pid: r.pid,
        };
      }
      return { controls, autoDropped };
    });
    for (const id of dropped) get().addLog("Koneksi terputus: " + getRobot(id).name + " (menunggu)");
    for (const id of back) get().addLog("Tersambung lagi: " + getRobot(id).name);
  },
  applyStatus: (id, connected) => {
    // Connect pertama tetap manual (via Settings). Putus dari server
    // (watchdog) menandai robot "menunggu"; begitu online lagi, koneksi yang
    // tadinya dipilih pengguna dipulihkan otomatis.
    const s = get();
    if (!s.controls[id]) return;
    if (!connected) {
      if (!s.controls[id].connected) return;
      const next = { ...s.controls[id], connected: false };
      if (getRobot(id).type === "pid") next.running = false;
      else next.gait = "idle";
      set({ controls: { ...s.controls, [id]: next }, autoDropped: { ...s.autoDropped, [id]: true } });
      get().addLog("Koneksi terputus: " + getRobot(id).name + " (menunggu)");
      return;
    }
    if (!s.autoDropped[id] || s.controls[id].connected) return;
    set({
      controls: { ...s.controls, [id]: { ...s.controls[id], connected: true } },
      autoDropped: { ...s.autoDropped, [id]: false },
    });
    get().addLog("Tersambung lagi: " + getRobot(id).name + " (tekan Start untuk melanjutkan)");
  },
  applyTelemetryState: (id, running) =>
    // update running only for robots the user has connected
    set((s) => {
      if (!s.controls[id] || !s.controls[id].connected) return {} as Partial<State>;
      return { controls: { ...s.controls, [id]: { ...s.controls[id], running } } };
    }),
  applyEstop: (active) => set({ estop: active }),
  applyBroker: (connected) => {
    if (get().brokerConnected === connected) return;
    set({ brokerConnected: connected });
    get().addLog(connected ? "Server tersambung lagi ke broker MQTT" : "Server kehilangan broker MQTT");
  },

  applyHoming: (id, info) => {
    const prev = get().homing[id] ?? NO_HOMING;
    if (
      prev.needed === info.needed &&
      prev.homed === info.homed &&
      prev.active === info.active &&
      prev.failed === info.failed
    )
      return; // telemetry arrives ~10x/s; only touch the store when something changed
    set((s) => ({ homing: { ...s.homing, [id]: info } }));

    if (info.active || info.failed || (info.homed && !prev.homed)) homingSeen[id] = true;
    if (!info.needed) return;

    const name = displayName(getRobot(id));
    if (info.active && !prev.active) get().addLog("Homing berjalan — " + name);
    if (prev.active && info.homed) get().addLog("Homing selesai — " + name);
    if (info.failed && !prev.failed && prev.needed) {
      get().addLog("Homing GAGAL — " + name);
      get().pushModal({
        icon: "⚠️",
        title: "Homing Gagal",
        body:
          `<b>${name}</b> gagal menemukan posisi nol (titik acuan tidak ketemu atau waktu habis). ` +
          "Biarkan lengan di tengah dan pendulum menggantung diam selama homing (kit dengan limit switch: periksa limit switch-nya), lalu coba homing lagi.",
        actions: [{ label: "Mengerti", style: "primary" }],
      });
    }
  },

  startHoming: (id) => {
    const s = get();
    const ctrl = s.controls[id];
    const h = s.homing[id] ?? NO_HOMING;
    if (!ctrl || !ctrl.connected || s.estop || ctrl.running || h.active) return;
    homingSeen[id] = false;
    sendCmd(id, "homing");
    s.addLog("Homing diminta — " + displayName(getRobot(id)));
    // The master silently ignores a homing command it cannot run (slave not
    // answering, kit running, ...). If nothing changed after a few seconds,
    // say so instead of leaving the user waiting.
    setTimeout(() => {
      if (homingSeen[id]) return;
      get().pushModal({
        icon: "⚠️",
        title: "Homing Tidak Dimulai",
        body:
          "Robot tidak menjawab perintah homing. Pastikan kit tersambung ke master (kabel JST), " +
          "kit sedang berhenti, lalu coba lagi.",
        actions: [{ label: "Mengerti", style: "primary" }],
      });
    }, 3500);
  },
  cancelHoming: (id) => {
    const h = get().homing[id] ?? NO_HOMING;
    if (!h.active) return;
    sendCmd(id, "stop"); // the master cancels a running homing when it gets "stop"
    get().addLog("Homing dibatalkan — " + displayName(getRobot(id)));
  },

  emergencyStop: () => {
    set((s) => {
      const controls = { ...s.controls };
      for (const id of Object.keys(controls) as RobotId[]) {
        if (getRobot(id).type === "pid") controls[id] = { ...controls[id], running: false };
        else controls[id] = { ...controls[id], gait: "idle" };
      }
      return { estop: true, controls };
    });
    sendCmd(get().activeId, "estop"); // backend broadcasts to all robots
    get().addLog("🛑 EMERGENCY STOP (semua robot)");
    get().pushModal({
      icon: "🛑",
      title: "Emergency Stop Aktif",
      body: "Semua aktuator dihentikan & kontrol dikunci. Tekan Reset untuk melanjutkan.",
      actions: [{ label: "Reset E-Stop", style: "danger", onClick: () => get().resetEstop() }],
    });
  },
  resetEstop: () => {
    if (!get().estop) return;
    set({ estop: false });
    get().addLog("E-Stop direset");
  },

  addLog: (text) =>
    set((s) => ({
      logs: [{ text, time: nowHM(), active: true }, ...s.logs].slice(0, 25),
    })),
  pushModal: (m) => set((s) => ({ modals: [...s.modals, { ...m, id: modalSeq++ }] })),
  popModal: () => set((s) => ({ modals: s.modals.slice(1) })),

  initPresets: () => set({ presets: loadPresets() }),
  savePreset: (name) => {
    const id = get().activeId;
    const cfg = getRobot(id);
    if (cfg.type !== "pid") return;
    const pid = get().controls[id].pid;
    set({ presets: addPreset(get().presets, name, id, pid) });
    get().addLog("Preset PID disimpan: " + (name || "Untitled"));
  },
  applyPreset: (presetId) => {
    const p = get().presets.find((x) => x.id === presetId);
    if (!p) return;
    get().setPidAll(get().activeId, p.pid);
    get().addLog("Preset diterapkan: " + p.name);
  },
  deletePreset: (presetId) => {
    set({ presets: removePreset(get().presets, presetId) });
  },
}));

/** Whether the user is allowed to control the active robot right now. */
export function canControl(s: State): boolean {
  if (s.estop) return false;
  const ctrl = s.controls[s.activeId];
  if (!ctrl.connected) return false;
  if (s.homing[s.activeId]?.active) return false; // the slave is driving the motor
  if (s.inputMode === "analog" && !s.gamepadConnected && !s.demoMode) return false;
  return true;
}
