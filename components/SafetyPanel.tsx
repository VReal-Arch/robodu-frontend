"use client";

import { ReactElement } from "react";
import { useStore } from "@/store/store";

const MODE_ICON: Record<string, string> = { mouse: "🖱️", keypad: "⌨️", analog: "🎮" };
const MODE_LABEL: Record<string, string> = { mouse: "Mouse", keypad: "Keypad", analog: "Analog" };

function Chip({ label, kind }: { label: string; kind: "teal" | "red" }) {
  return (
    <span className={"chip chip-" + kind} style={{ padding: "2px 9px", fontSize: 10 }}>
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

  const rows: { ic: string; l: string; chip: ReactElement }[] = [
    { ic: "🖥️", l: "Server Link", chip: wsConnected ? <Chip label="OK" kind="teal" /> : <Chip label="DOWN" kind="red" /> },
    { ic: "🔗", l: "Robot Link", chip: connected ? <Chip label="OK" kind="teal" /> : <Chip label="LOST" kind="red" /> },
    { ic: "💓", l: "Heartbeat", chip: connected ? <Chip label="Live" kind="teal" /> : <Chip label="No signal" kind="red" /> },
    { ic: MODE_ICON[inputMode], l: "Input Source", chip: <Chip label={MODE_LABEL[inputMode]} kind="teal" /> },
    { ic: "⏱️", l: "Watchdog Timer", chip: <Chip label="Armed" kind="teal" /> },
    { ic: "🛑", l: "Emergency Stop", chip: estop ? <Chip label="ACTIVE" kind="red" /> : <Chip label="Clear" kind="teal" /> },
  ];

  return (
    <div className="card">
      <div className="card-title">Safety &amp; Fail-Safe</div>
      <div>
        {rows.map((r, i) => (
          <div className="safety-row" key={i}>
            <span style={{ fontSize: 16 }}>{r.ic}</span>
            <span className="s-label">{r.l}</span>
            {r.chip}
          </div>
        ))}
      </div>
      {estop && (
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-danger" style={{ fontSize: 12 }} onClick={resetEstop}>
            Reset E-Stop
          </button>
        </div>
      )}
    </div>
  );
}
