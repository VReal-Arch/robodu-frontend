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
import Icon, { IconName } from "@/components/Icon";

const MODE_LABEL: Record<string, string> = { mouse: "Mouse", keypad: "Keypad", analog: "Analog" };
const MODE_ICON: Record<string, IconName> = { mouse: "mouse", keypad: "keyboard", analog: "gamepad" };

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
      <div className="stack-18">
        <div className="card card-strip">
          <div className={"pulse-dot" + (ctrl.connected ? "" : " red")} />
          <div style={{ flex: 1, minWidth: 150 }}>
            <div className="strip-name">{displayName(robot)}</div>
            <div className="strip-sub">
              {ctrl.connected ? "WebSocket • Connected" : "Disconnected — Settings"}
            </div>
          </div>
          <span className="chip chip-teal">
            <Icon name={MODE_ICON[inputMode]} size={13} /> {MODE_LABEL[inputMode]}
          </span>
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
            <span className="card-title-robot"><span className="card-title-emoji">{robot.icon}</span> {displayName(robot)}</span>
          </span>
        </div>

        {isPid ? (
          <button
            className={"btn btn-full " + (ctrl.running ? "btn-danger" : "btn-primary")}
            onClick={toggleRun}
            style={{ marginBottom: 14 }}
          >
            <Icon name={ctrl.running ? "pause" : "play"} size={15} />
            {ctrl.running ? "Stop Balancing" : "Start Balancing"}
          </button>
        ) : (
          <GaitControl />
        )}

        {isPid && <SetpointControl />}

        <InputModeSelector label={isPid ? "Input Mode (Setpoint)" : "Input Mode (Walk Direction)"} />

        {lock && (
          <div className="alert-warn">{lock}</div>
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
