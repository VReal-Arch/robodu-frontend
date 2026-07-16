"use client";

import { useStore, canControl } from "@/store/store";
import { notifyIfBlocked } from "@/lib/control";
import { Gait } from "@/lib/types";

const GAITS: { g: Gait; label: string }[] = [
  { g: "idle", label: "🧍 Idle" },
  { g: "stand", label: "🤸 Stand" },
  { g: "balance", label: "⚖️ Balance" },
  { g: "walk", label: "🚶 Walk" },
];

export default function GaitControl() {
  const activeId = useStore((s) => s.activeId);
  const gait = useStore((s) => s.controls[s.activeId].gait);
  const setGait = useStore((s) => s.setGait);
  const addLog = useStore((s) => s.addLog);

  function pick(g: Gait) {
    if (notifyIfBlocked()) return;
    setGait(activeId, g);
    addLog("Gait: " + g);
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--t2)",
          textTransform: "uppercase",
          letterSpacing: ".8px",
          marginBottom: 10,
        }}
      >
        Gait Mode
      </div>
      <div className="gait-grid">
        {GAITS.map((x) => (
          <button
            key={x.g}
            className={"gait-btn" + (x.g === gait ? " active" : "")}
            onClick={() => pick(x.g)}
          >
            {x.label}
          </button>
        ))}
      </div>
    </div>
  );
}
