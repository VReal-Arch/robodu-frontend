"use client";

import { useStore, canControl } from "@/store/store";
import { getRobot } from "@/lib/robots";
import { fmt } from "@/lib/format";
import { notifyIfBlocked } from "@/lib/control";
import { PID } from "@/lib/types";
import Icon from "@/components/Icon";

const ROWS: { key: keyof PID; label: string; sub: string; dec: number }[] = [
  { key: "kp", label: "Kp", sub: "Proportional", dec: 1 },
  { key: "ki", label: "Ki", sub: "Integral", dec: 2 },
  { key: "kd", label: "Kd", sub: "Derivative", dec: 1 },
];

export default function PIDPanel() {
  const activeId = useStore((s) => s.activeId);
  const pid = useStore((s) => s.controls[s.activeId].pid);
  const setPid = useStore((s) => s.setPid);
  const resetPid = useStore((s) => s.resetPid);
  const ok = useStore((s) => canControl(s));
  const robot = getRobot(activeId);
  if (robot.type !== "pid") return null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span className="field-label field-label-flush">
          PID Tuning
        </span>
        <button className="btn btn-ghost btn-sm" onClick={() => resetPid(activeId)}>
          <Icon name="reset" size={13} /> Reset
        </button>
      </div>
      {ROWS.map((r) => (
        <div className="pid-ctrl" key={r.key}>
          <div className="pid-head">
            <span className="pid-name">
              {r.label} <small>{r.sub}</small>
            </span>
            <span className="pid-val">{fmt(pid[r.key], r.dec)}</span>
          </div>
          <input
            type="range"
            className="slider"
            style={{ margin: "6px 0 0" }}
            min={0}
            max={robot.pidMax[r.key]}
            step={r.key === "ki" ? 0.05 : 0.1}
            value={pid[r.key]}
            disabled={!ok}
            onChange={(e) => {
              if (notifyIfBlocked()) return;
              setPid(activeId, r.key, parseFloat(e.target.value));
            }}
          />
        </div>
      ))}
    </div>
  );
}
