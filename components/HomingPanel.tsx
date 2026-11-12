"use client";

import { useStore } from "@/store/store";
import { getRobot } from "@/lib/robots";
import { NO_HOMING, homingLabel } from "@/lib/homing";
import Icon from "@/components/Icon";

const STEPS = ["Homing", "Start", "Stop"];

/**
 * Homing control for kits that must find their zero position before they can
 * start (the master board reports `homed` only for those kits, so this panel
 * simply does not appear for the others). Sequence: HOMING -> START -> STOP.
 */
// Cara homing berbeda per kit, jadi petunjuknya juga.
//   rot_pend : motor diam, lengan & pendulum hanya diamati (tanpa limit switch)
//   lin_pend : kereta digerakkan motor ke limit kiri, kanan, lalu ke tengah
function teksHoming(family: string): { awal: string; jalan: string; gagal: string } {
  if (family === "lin_pend") {
    return {
      awal:
        "Kit ini wajib homing sebelum bisa dijalankan. Kosongkan rel, biarkan pendulum menggantung diam, lalu tekan Mulai Homing. Kereta akan bergerak ke limit kiri, kanan, lalu ke tengah.",
      jalan: "Kereta sedang homing (limit kiri → kanan → tengah). Jauhkan tangan dari rel.",
      gagal:
        "Homing gagal — kereta tidak sampai ke limit switch. Periksa catu motor 12 V dan limit switch, lalu coba lagi.",
    };
  }
  return {
    awal:
      "Kit ini wajib homing sebelum bisa dijalankan. Letakkan lengan di tengah, biarkan pendulum menggantung diam, lalu tekan Mulai Homing.",
    jalan: "Kit sedang mencari posisi nol. Jangan sentuh lengan dan pendulum sampai selesai.",
    gagal: "Homing gagal — lengan atau pendulum masih bergerak sampai waktu habis. Diamkan lalu coba lagi.",
  };
}

export default function HomingPanel() {
  const activeId = useStore((s) => s.activeId);
  const h = useStore((s) => s.homing[s.activeId] ?? NO_HOMING);
  const connected = useStore((s) => s.controls[s.activeId].connected);
  const running = useStore((s) => s.controls[s.activeId].running);
  const estop = useStore((s) => s.estop);
  const startHoming = useStore((s) => s.startHoming);
  const cancelHoming = useStore((s) => s.cancelHoming);

  if (getRobot(activeId).type !== "pid" || !h.needed) return null;

  const canHome = connected && !estop && !running && !h.active;
  const current = running ? 2 : h.homed ? 1 : 0;
  const kind = h.failed ? "red" : h.homed && !h.active ? "teal" : "warn";

  const t = teksHoming(getRobot(activeId).family);
  const message = h.active ? t.jalan : h.failed ? t.gagal : h.homed
    ? "Posisi nol valid. Start Balancing sudah bisa dipakai."
    : t.awal;

  const whyDisabled = !connected
    ? "Sambungkan robot di menu Settings."
    : estop
    ? "E-Stop aktif — reset dulu."
    : running
    ? "Hentikan balancing dulu untuk homing ulang."
    : "";

  return (
    <div className="inset-panel">
      <div className="homing-head">
        <span className="field-label field-label-flush">Homing</span>
        <span className={"chip chip-sm chip-" + kind}>{homingLabel(h)}</span>
      </div>

      <ol className="steps" aria-label="Urutan kerja">
        {STEPS.map((label, i) => (
          <li key={label} className={"step" + (i < current ? " done" : "") + (i === current ? " current" : "")}>
            <span className="step-num">{i < current ? <Icon name="check" size={11} /> : i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {h.active && <div className="homing-bar" role="progressbar" aria-label="Homing berjalan" />}
      <p className="hint-left">{message}</p>

      <div className="row-gap-8">
        {h.active ? (
          <button className="btn btn-outline btn-sm" onClick={() => cancelHoming(activeId)}>
            <Icon name="close" size={14} /> Batalkan
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" disabled={!canHome} onClick={() => startHoming(activeId)}>
            <Icon name="target" size={14} /> {h.homed ? "Homing Ulang" : "Mulai Homing"}
          </button>
        )}
      </div>
      {!h.active && whyDisabled && !canHome && <p className="hint-left hint-left-gap">{whyDisabled}</p>}
    </div>
  );
}
