"use client";

import { ReactElement } from "react";
import { useStore } from "@/store/store";
import Icon, { IconName } from "@/components/Icon";

const MODE_ICON: Record<string, IconName> = { mouse: "mouse", keypad: "keyboard", analog: "gamepad" };
const MODE_LABEL: Record<string, string> = { mouse: "Mouse", keypad: "Keypad", analog: "Analog" };

function Chip({ label, kind }: { label: string; kind: "teal" | "red" }) {
  return (
    <span className={"chip chip-sm chip-" + kind}>
      {label}
    </span>
  );
}

export default function SafetyPanel() {
  const connected = useStore((s) => s.controls[s.activeId].connected);
  const wsConnected = useStore((s) => s.wsConnected);
  const inputMode = useStore((s) => s.inputMode);
  const estop = useStore((s) => s.estop);
  const resetEstop = useStore((s) => s.resetEstop);

  const rows: { ic: IconName; l: string; chip: ReactElement }[] = [
    { ic: "server", l: "Server Link", chip: wsConnected ? <Chip label="OK" kind="teal" /> : <Chip label="DOWN" kind="red" /> },
    { ic: "link", l: "Robot Link", chip: connected ? <Chip label="OK" kind="teal" /> : <Chip label="LOST" kind="red" /> },
    { ic: "pulse", l: "Heartbeat", chip: connected ? <Chip label="Live" kind="teal" /> : <Chip label="No signal" kind="red" /> },
    { ic: MODE_ICON[inputMode], l: "Input Source", chip: <Chip label={MODE_LABEL[inputMode]} kind="teal" /> },
    { ic: "clock", l: "Watchdog Timer", chip: <Chip label="Armed" kind="teal" /> },
    { ic: "stop", l: "Emergency Stop", chip: estop ? <Chip label="ACTIVE" kind="red" /> : <Chip label="Clear" kind="teal" /> },
  ];

  return (
    <div className="card">
      <div className="card-title">Safety &amp; Fail-Safe</div>
      <div>
        {rows.map((r, i) => (
          <div className="safety-row" key={i}>
            <span className="safety-ico"><Icon name={r.ic} size={16} /></span>
            <span className="s-label">{r.l}</span>
            {r.chip}
          </div>
        ))}
      </div>
      {estop && (
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-danger btn-sm" onClick={resetEstop}>
            Reset E-Stop
          </button>
        </div>
      )}
    </div>
  );
}
