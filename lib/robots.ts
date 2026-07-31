import { ControlState, HumanoidRobotConfig, PidRobotConfig, RobotConfig, RobotFamily, RobotId } from "./types";

/** How many physical units exist per robot type. Change this if the count changes. */
export const UNITS_PER_TYPE = 3;

// ---- Base config per robot TYPE (one entry per family) ----
type PidType = Omit<PidRobotConfig, "id" | "unit">;
type HumType = Omit<HumanoidRobotConfig, "id" | "unit">;
type TypeConfig = PidType | HumType;

const TYPES: TypeConfig[] = [
  {
    family: "ball_beam", name: "Ball & Beam", icon: "⚪", type: "pid",
    yVar: "Ball Position", yUnit: "cm", yMin: -15, yMax: 15, setMin: -12, setMax: 12, setStep: 1,
    uVar: "Beam Angle", uUnit: "°", uMax: 30,
    plant: { unstable: 0, ctrl: 1.6, damp: 0.35, vMax: 70, iMax: 40 },
    pidDef: { kp: 4.0, ki: 0.2, kd: 2.6 }, pidMax: { kp: 30, ki: 5, kd: 15 }, dist: 7,
  },
  {
    family: "bi_rotor", name: "Bi-rotor Trainer", icon: "🚁", type: "pid",
    yVar: "Pitch Angle", yUnit: "°", yMin: -40, yMax: 40, setMin: -30, setMax: 30, setStep: 2,
    uVar: "Rotor Thrust", uUnit: "%", uMax: 100,
    plant: { unstable: 0, ctrl: 0.9, damp: 0.85, vMax: 130, iMax: 60 },
    pidDef: { kp: 3.0, ki: 0.5, kd: 1.4 }, pidMax: { kp: 25, ki: 8, kd: 12 }, dist: 16,
  },
  {
    family: "lin_pend", name: "Linear Inverted Pendulum", icon: "📏", type: "pid",
    yVar: "Pendulum Angle", yUnit: "°", yMin: -25, yMax: 25, setMin: -10, setMax: 10, setStep: 1,
    uVar: "Cart Force", uUnit: "N", uMax: 100,
    plant: { unstable: 9, ctrl: 1.2, damp: 0.25, vMax: 220, iMax: 30 },
    pidDef: { kp: 13, ki: 0.0, kd: 3.0 }, pidMax: { kp: 40, ki: 5, kd: 12 }, dist: 10,
  },
  {
    family: "rot_pend", name: "Rotary Inverted Pendulum", icon: "🔄", type: "pid",
    yVar: "Pendulum Angle", yUnit: "°", yMin: -25, yMax: 25, setMin: -8, setMax: 8, setStep: 1,
    uVar: "Arm Torque", uUnit: "Nm", uMax: 100,
    plant: { unstable: 11, ctrl: 1.3, damp: 0.22, vMax: 240, iMax: 30 },
    pidDef: { kp: 15, ki: 0.0, kd: 3.4 }, pidMax: { kp: 45, ki: 5, kd: 14 }, dist: 9,
  },
  { family: "humanoid", name: "Humanoid Platform", icon: "🤖", type: "humanoid" },
];

/** All robot families, for grouped UI. */
export const FAMILIES: { family: RobotFamily; name: string; icon: string }[] = TYPES.map((t) => ({
  family: t.family,
  name: t.name,
  icon: t.icon,
}));

// ---- Expand each type into UNITS_PER_TYPE physical robots ----
export const ROBOTS: RobotConfig[] = TYPES.flatMap((t) =>
  Array.from({ length: UNITS_PER_TYPE }, (_, i) => ({
    ...t,
    unit: i + 1,
    id: `${t.family}_${i + 1}`,
  })) as RobotConfig[]
);

export function getRobot(id: RobotId): RobotConfig {
  return ROBOTS.find((r) => r.id === id) ?? ROBOTS[0];
}

export function isPid(r: RobotConfig): r is PidRobotConfig {
  return r.type === "pid";
}

/** "Humanoid Platform · Unit 2" */
export function displayName(r: RobotConfig): string {
  return `${r.name} · Unit ${r.unit}`;
}

/** Robots grouped by family, for grouped selectors. */
export function robotsByFamily(): { family: RobotFamily; name: string; icon: string; units: RobotConfig[] }[] {
  return FAMILIES.map((f) => ({
    ...f,
    units: ROBOTS.filter((r) => r.family === f.family),
  }));
}

/** Initial control state for every robot (starts offline; connect via Settings). */
export function initialControls(): Record<RobotId, ControlState> {
  const out: Record<RobotId, ControlState> = {};
  for (const r of ROBOTS) {
    out[r.id] = {
      connected: false,
      running: r.type === "pid",
      gait: "balance",
      setpoint: 0,
      pid: r.type === "pid" ? { ...r.pidDef } : { kp: 0, ki: 0, kd: 0 },
    };
  }
  return out;
}
