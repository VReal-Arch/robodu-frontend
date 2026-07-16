import { create } from "zustand";
import {
  ChartMode,
  CommandAction,
  CommandMsg,
  ControlState,
  Gait,
  InputMode,
  LogEntry,
  ModalSpec,
  PID,
  Preset,
  PublicRobotState,
  RobotId,
  Theme,
} from "@/lib/types";
import { getRobot, initialControls } from "@/lib/robots";
import { nowHM } from "@/lib/format";
import { addPreset, loadPresets, removePreset } from "@/lib/presets";
import { wsClient } from "@/lib/wsClient";

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

let modalSeq = 1;

function sendCmd(robotId: RobotId, action: CommandAction, payload?: CommandMsg["payload"]) {
  wsClient.send({ type: "command", robotId, source: "web", action, payload });
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
  gamepadConnected: boolean;
  gamepadId: string | null;
  gamepadIndex: number | null;
  demoMode: boolean;
  // per-robot control (desired state)
  controls: Record<RobotId, ControlState>;
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
  activeId: "ball_beam",
  inputMode: "mouse",
  chartMode: "combined",
  estop: false,
  wsConnected: false,
  gamepadConnected: false,
  gamepadId: null,
  gamepadIndex: null,
  demoMode: false,
  controls: initialControls(),
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
      return { controls: { ...s.controls, [id]: next } };
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
      return { controls };
    });
    get().addLog("Semua robot diputus");
  },
  applyServerState: (robots) =>
    // sync desired values from backend, but keep the manual connection flag
    set((s) => {
      const controls = { ...s.controls };
      for (const id of Object.keys(robots) as RobotId[]) {
        const r = robots[id];
        if (!controls[id]) continue;
        controls[id] = {
          connected: controls[id].connected,
          running: r.running,
          gait: r.gait,
          setpoint: r.setpoint,
          pid: r.pid,
        };
      }
      return { controls };
    }),
  applyStatus: (id, connected) =>
    // Connect is manual (via Settings). Only honor backend DISCONNECT as a
    // fail-safe when a robot drops off; ignore auto-connect.
    set((s) => {
      if (!s.controls[id] || connected) return {} as Partial<State>;
      if (!s.controls[id].connected) return {} as Partial<State>;
      const next = { ...s.controls[id], connected: false };
      if (getRobot(id).type === "pid") next.running = false;
      else next.gait = "idle";
      return { controls: { ...s.controls, [id]: next } };
    }),
  applyTelemetryState: (id, running) =>
    // update running only for robots the user has connected
    set((s) => {
      if (!s.controls[id] || !s.controls[id].connected) return {} as Partial<State>;
      return { controls: { ...s.controls, [id]: { ...s.controls[id], running } } };
    }),
  applyEstop: (active) => set({ estop: active }),

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
  if (s.inputMode === "analog" && !s.gamepadConnected && !s.demoMode) return false;
  return true;
}
