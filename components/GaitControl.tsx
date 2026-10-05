"use client";

import { useStore, canControl } from "@/store/store";
import { notifyIfBlocked } from "@/lib/control";
import { Gait } from "@/lib/types";
import Icon, { IconName } from "@/components/Icon";

const GAITS: { g: Gait; label: string; icon: IconName }[] = [
  { g: "idle", label: "Idle", icon: "user" },
  { g: "stand", label: "Stand", icon: "stand" },
  { g: "balance", label: "Balance", icon: "scale" },
  { g: "walk", label: "Walk", icon: "walk" },
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
      <div className="field-label">
        Gait Mode
      </div>
      <div className="gait-grid">
        {GAITS.map((x) => (
          <button
            key={x.g}
            className={"gait-btn" + (x.g === gait ? " active" : "")}
            onClick={() => pick(x.g)}
          >
            <Icon name={x.icon} size={16} />
            {x.label}
          </button>
        ))}
      </div>
    </div>
  );
}
