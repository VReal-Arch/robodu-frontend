import { RobotId, TelemetryMsg } from "./types";
import { ROBOTS } from "./robots";

const BUF = 140; // points kept per series

export interface PidBuffers { sp: number[]; y: number[]; e: number[]; u: number[]; }
export interface HumBuffers { roll: number[]; pitch: number[]; comX: number[]; comY: number[]; }

interface Last {
  actual: number; output: number; error: number; setpoint: number;
  roll: number; pitch: number; comX: number; comY: number;
}

/** Nilai awal sebelum paket telemetry pertama tiba. Harus berupa angka, bukan
 *  objek kosong: komponen memformatnya begitu halaman dibuka, dan undefined
 *  membuat pemanggilan toFixed gagal. */
const NOL: Last = {
  actual: 0, output: 0, error: 0, setpoint: 0,
  roll: 0, pitch: 0, comX: 0, comY: 0,
};
interface PidRt { type: "pid"; buf: PidBuffers; last: Last; }
interface HumRt { type: "humanoid"; buf: HumBuffers; last: Last; }
type Rt = PidRt | HumRt;

const push = (a: number[], v: number) => { a.push(v); if (a.length > BUF) a.shift(); };

/**
 * Holds the live telemetry buffers that the charts read from. Data is pushed
 * in by the WebSocket client (`pushTelemetry`) as it arrives from the backend.
 * No physics here anymore — the real robots compute their own PID.
 */
export class TelemetryStore {
  private rt: Record<RobotId, Rt>;

  constructor() {
    this.rt = {} as Record<RobotId, Rt>;
    for (const r of ROBOTS) {
      if (r.type === "pid") {
        this.rt[r.id] = { type: "pid", buf: { sp: [], y: [], e: [], u: [] }, last: { ...NOL } };
      } else {
        this.rt[r.id] = { type: "humanoid", buf: { roll: [], pitch: [], comX: [], comY: [] }, last: { ...NOL } };
      }
    }
  }

  getPidBuffers(id: RobotId): PidBuffers | null {
    const r = this.rt[id];
    return r.type === "pid" ? r.buf : null;
  }
  getHumBuffers(id: RobotId): HumBuffers | null {
    const r = this.rt[id];
    return r.type === "humanoid" ? r.buf : null;
  }
  telemetry(id: RobotId): Last {
    return this.rt[id].last;
  }

  /** Called by the WebSocket client for every incoming telemetry packet. */
  pushTelemetry(m: TelemetryMsg) {
    const r = this.rt[m.robotId];
    if (!r) return;
    if (r.type === "pid") {
      push(r.buf.sp, m.setpoint);
      push(r.buf.y, m.actual);
      push(r.buf.e, m.error);
      push(r.buf.u, m.output);
      r.last = { ...NOL, actual: m.actual, output: m.output, error: m.error, setpoint: m.setpoint };
    } else {
      const roll = m.imu?.roll ?? 0;
      const pitch = m.imu?.pitch ?? 0;
      push(r.buf.roll, roll);
      push(r.buf.pitch, pitch);
      push(r.buf.comX, 0);
      push(r.buf.comY, 0);
      r.last = { ...NOL, roll, pitch };
    }
  }
}

export const engine = new TelemetryStore();
