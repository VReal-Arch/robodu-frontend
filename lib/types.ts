export type RobotId = string;
export type RobotFamily = "ball_beam" | "bi_rotor" | "lin_pend" | "rot_pend" | "humanoid";
export type Gait = "idle" | "stand" | "balance" | "walk";
export type InputMode = "mouse" | "keypad" | "analog";
export type ChartMode = "combined" | "separated";
export type Theme = "light" | "dark";

export interface PID {
  kp: number;
  ki: number;
  kd: number;
}

export interface Plant {
  unstable: number;
  ctrl: number;
  damp: number;
  vMax: number;
  iMax: number;
}

export interface PidRobotConfig {
  id: RobotId;
  family: RobotFamily;
  unit: number;
  name: string;
  icon: string;
  type: "pid";
  yVar: string;
  yUnit: string;
  yMin: number;
  yMax: number;
  setMin: number;
  setMax: number;
  setStep: number;
  uVar: string;
  uUnit: string;
  uMax: number;
  plant: Plant;
  pidDef: PID;
  pidMax: PID;
  dist: number;
}

export interface HumanoidRobotConfig {
  id: RobotId;
  family: RobotFamily;
  unit: number;
  name: string;
  icon: string;
  type: "humanoid";
}

export type RobotConfig = PidRobotConfig | HumanoidRobotConfig;

/** Desired / control state (set by user, read by the simulation/WS layer). */
export interface ControlState {
  connected: boolean;
  running: boolean;
  gait: Gait;
  setpoint: number;
  pid: PID;
}

export interface Preset {
  id: string;
  name: string;
  robotId: RobotId;
  pid: PID;
  createdAt: number;
}

export interface LogEntry {
  text: string;
  time: string;
  active: boolean;
}

export type ModalStyle = "primary" | "outline" | "danger" | "ghost";

export interface ModalAction {
  label: string;
  style?: ModalStyle;
  onClick?: () => void;
}

export interface ModalSpec {
  id: number;
  icon?: string;
  title: string;
  body?: string;
  actions?: ModalAction[];
}

// ---- WebSocket message contract (shared with backend) ----
export type CommandAction = "set_setpoint" | "set_pid" | "start" | "stop" | "estop" | "set_gait";

export interface TelemetryMsg {
  type: "telemetry";
  robotId: RobotId;
  ts: number;
  setpoint: number;
  actual: number;
  error: number;
  output: number;
  pid: PID;
  imu?: { roll: number; pitch: number };
  state: "balancing" | "idle" | "fault";
  health?: { sensor: boolean; motor: boolean };
}

export interface CommandMsg {
  type: "command";
  robotId: RobotId;
  source: "web" | "keypad" | "analog";
  action: CommandAction;
  payload?: { setpoint?: number; kp?: number; ki?: number; kd?: number; gait?: Gait };
}

export interface PublicRobotState {
  robotId: RobotId;
  connected: boolean;
  running: boolean;
  gait: Gait;
  setpoint: number;
  pid: PID;
}

export type ServerMsg =
  | TelemetryMsg
  | { type: "state"; robots: Record<string, PublicRobotState> }
  | { type: "status"; robotId: RobotId; connected: boolean }
  | { type: "estop"; active: boolean };
