import { ControlState, PidRobotConfig, RobotConfig, RobotId } from "./types";

export const ROBOTS: RobotConfig[] = [
  {
    id: "ball_beam",
    name: "Ball & Beam",
    icon: "⚪",
    type: "pid",
    yVar: "Ball Position",
    yUnit: "cm",
    yMin: -15,
    yMax: 15,
    setMin: -12,
    setMax: 12,
    setStep: 1,
    uVar: "Beam Angle",
    uUnit: "°",
    uMax: 30,
    plant: { unstable: 0, ctrl: 1.6, damp: 0.35, vMax: 70, iMax: 40 },
    pidDef: { kp: 4.0, ki: 0.2, kd: 2.6 },
    pidMax: { kp: 30, ki: 5, kd: 15 },
    dist: 7,
  },
  {
    id: "bi_rotor",
    name: "Bi-rotor Trainer",
    icon: "🚁",
    type: "pid",
    yVar: "Pitch Angle",
    yUnit: "°",
    yMin: -40,
    yMax: 40,
    setMin: -30,
    setMax: 30,
    setStep: 2,
    uVar: "Rotor Thrust",
    uUnit: "%",
    uMax: 100,
    plant: { unstable: 0, ctrl: 0.9, damp: 0.85, vMax: 130, iMax: 60 },
    pidDef: { kp: 3.0, ki: 0.5, kd: 1.4 },
    pidMax: { kp: 25, ki: 8, kd: 12 },
    dist: 16,
  },
  {
    id: "lin_pend",
    name: "Linear Inverted Pendulum",
    icon: "📏",
    type: "pid",
    yVar: "Pendulum Angle",
    yUnit: "°",
    yMin: -25,
    yMax: 25,
    setMin: -10,
    setMax: 10,
    setStep: 1,
    uVar: "Cart Force",
    uUnit: "N",
    uMax: 100,
    plant: { unstable: 9, ctrl: 1.2, damp: 0.25, vMax: 220, iMax: 30 },
    pidDef: { kp: 13, ki: 0.0, kd: 3.0 },
    pidMax: { kp: 40, ki: 5, kd: 12 },
    dist: 10,
  },
  {
    id: "rot_pend",
    name: "Rotary Inverted Pendulum",
    icon: "🔄",
    type: "pid",
    yVar: "Pendulum Angle",
    yUnit: "°",
    yMin: -25,
    yMax: 25,
    setMin: -8,
    setMax: 8,
    setStep: 1,
    uVar: "Arm Torque",
    uUnit: "Nm",
    uMax: 100,
    plant: { unstable: 11, ctrl: 1.3, damp: 0.22, vMax: 240, iMax: 30 },
    pidDef: { kp: 15, ki: 0.0, kd: 3.4 },
    pidMax: { kp: 45, ki: 5, kd: 14 },
    dist: 9,
  },
  {
    id: "humanoid",
    name: "Humanoid Platform",
    icon: "🤖",
    type: "humanoid",
  },
];

export function getRobot(id: RobotId): RobotConfig {
  return ROBOTS.find((r) => r.id === id) ?? ROBOTS[0];
}

export function isPid(r: RobotConfig): r is PidRobotConfig {
  return r.type === "pid";
}

/** Initial control state for every robot. Robots start offline until their
 *  ESP32 connects to WiFi + MQTT and begins publishing (or, in the demo, until
 *  the user connects them). */
export function initialControls(): Record<RobotId, ControlState> {
  const out = {} as Record<RobotId, ControlState>;
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
