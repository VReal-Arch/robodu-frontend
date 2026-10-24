import { HomingInfo, TelemetryMsg } from "./types";

/** Used until a robot has reported anything: nothing to home, nothing running. */
export const NO_HOMING: HomingInfo = { needed: false, homed: false, active: false, failed: false };

/**
 * Homing status from one telemetry packet.
 *
 * The master board only includes `homed` / `homingFailed` for kits that must be
 * homed (HOMING_TYPES in the firmware), so the dashboard does not keep its own
 * list of homing kits: `homed !== undefined` is the signal.
 */
export function homingFromTelemetry(m: TelemetryMsg): HomingInfo {
  return {
    needed: m.homed !== undefined,
    homed: m.homed === true,
    active: m.state === "homing",
    failed: m.homingFailed === true,
  };
}

/** True when START must stay locked for this robot. */
export function startBlockedByHoming(h: HomingInfo): boolean {
  return h.needed && (!h.homed || h.active);
}

/** Short label for chips / status tiles. */
export function homingLabel(h: HomingInfo): string {
  if (h.active) return "Homing";
  if (h.failed) return "Gagal";
  if (h.homed) return "Sudah homing";
  return "Belum homing";
}
