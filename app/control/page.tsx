"use client";

import { useStore, canControl } from "@/store/store";
import { getRobot, displayName } from "@/lib/robots";
import { notifyIfBlocked, lockReason } from "@/lib/control";
import ChartsPanel from "@/components/ChartsPanel";
import SafetyPanel from "@/components/SafetyPanel";
import ActivityLog from "@/components/ActivityLog";
import SetpointControl from "@/components/SetpointControl";
import InputModeSelector from "@/components/InputModeSelector";
import PIDPanel from "@/components/PIDPanel";
import PIDPresets from "@/components/PIDPresets";
import Joystick from "@/components/Joystick";
import GaitControl from "@/components/GaitControl";

const MODE_LABEL: Record<string, string> = { mouse: "🖱️ Mouse", keypad: "⌨️ Keypad", analog: "🎮 Analog" };

export default function ControlPage() {
  const activeId = useStore((s) => s.activeId);
  const ctrl = useStore((s) => s.controls[s.activeId]);
  const inputMode = useStore((s) => s.inputMode);
  const setRunning = useStore((s) => s.setRunning);
  const addLog = useStore((s) => s.addLog);
  const ok = useStore((s) => canControl(s));
  const robot = getRobot(activeId);
  const isPid = robot.type === "pid";
  const lock = lockReason();

  function toggleRun() {
    if (!ctrl.running && notifyIfBlocked()) return;
    const next = !ctrl.running;
    setRunning(activeId, next);
    addLog((next ? "▶ Balancing ON — " : "⏸ Balancing OFF — ") + robot.name);
  }

  const runChip = isPid
    ? ctrl.running
      ? { label: "● Balancing", kind: "teal" }
      : { label: "○ Idle", kind: "warn" }
    : { label: ctrl.gait, kind: "teal" };

  return (
    <div className="control-wrap fade-up">
      {/* LEFT */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div className={"pulse-dot" + (ctrl.connected ? "" : " red")} />
          <div style={{ flex: 1, minWidth: 150 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{displayName(robot)}</div>
            <div style={{ fontSize: 11, color: "var(--t2)" }}>
              {ctrl.connected ? "WebSocket • Connected" : "Disconnected — Settings"}
            </div>
          </div>
          <span className="chip chip-teal">{MODE_LABEL[inputMode]}</span>
          <span className={"chip chip-" + runChip.kind}>{runChip.label}</span>
        </div>

        <ChartsPanel height={110} />
        <SafetyPanel />

        <div className="card">
          <div className="card-title">Command Log</div>
          <ActivityLog max={5} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="card">
        <div className="card-title">
          <span>
            {robot.icon} {displayName(robot)}
          </span>
        </div>

        {isPid ? (
          <button
            className={"btn btn-full " + (ctrl.running ? "btn-danger" : "btn-primary")}
            onClick={toggleRun}
            style={{ marginBottom: 14 }}
          >
            {ctrl.running ? "⏸ Stop Balancing" : "▶ Start Balancing"}
          </button>
        ) : (
          <GaitControl />
        )}

        {isPid && <SetpointControl />}

        <InputModeSelector label={isPid ? "Input Mode (Setpoint)" : "Input Mode (Walk Direction)"} />

        {lock && (
          <div
            style={{
              background: "#FFF8E1",
              border: "1px solid #FFE082",
              color: "#e65100",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 12,
              fontWeight: 600,
              textAlign: "center",
              marginBottom: 14,
            }}
          >
            {lock}
          </div>
        )}

        {inputMode === "analog" && <Joystick />}

        {isPid && (
          <>
            <PIDPanel />
            <PIDPresets />
          </>
        )}
      </div>
    </div>
  );
}
