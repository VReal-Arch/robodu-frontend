"use client";

import { useStore, canControl } from "@/store/store";
import { getRobot } from "@/lib/robots";
import { notifyIfBlocked } from "@/lib/control";
import { fmt } from "@/lib/format";

export default function SetpointControl() {
  const activeId = useStore((s) => s.activeId);
  const setpoint = useStore((s) => s.controls[s.activeId].setpoint);
  const setSetpoint = useStore((s) => s.setSetpoint);
  const nudge = useStore((s) => s.nudgeSetpoint);
  const zero = useStore((s) => s.zeroSetpoint);
  const addLog = useStore((s) => s.addLog);
  const ok = useStore((s) => canControl(s));
  const robot = getRobot(activeId);
  if (robot.type !== "pid") return null;

  return (
    <div className="inset-panel">
      <div className="field-label field-label-center">
        Setpoint — {robot.yVar}
      </div>
      <div className="big-val">
        {fmt(setpoint)} <small>{robot.yUnit}</small>
      </div>
      <input
        type="range"
        className="slider"
        min={robot.setMin}
        max={robot.setMax}
        step={robot.setStep / 2}
        value={setpoint}
        disabled={!ok}
        onChange={(e) => {
          if (notifyIfBlocked()) return;
          setSetpoint(activeId, parseFloat(e.target.value));
        }}
      />
      <div className="range-lbl">
        <span>{robot.setMin}</span>
        <span>{robot.setMax}</span>
      </div>
      <div className="step-row">
        <button
          className="step-btn"
          disabled={!ok}
          onClick={() => {
            if (notifyIfBlocked()) return;
            nudge(activeId, -robot.setStep);
            addLog("Setpoint → " + fmt(useStore.getState().controls[activeId].setpoint) + " " + robot.yUnit);
          }}
        >
          −
        </button>
        <button
          className="step-btn"
          disabled={!ok}
          style={{ fontSize: 11, width: "auto", padding: "0 12px" }}
          onClick={() => {
            if (notifyIfBlocked()) return;
            zero(activeId);
          }}
        >
          0
        </button>
        <button
          className="step-btn"
          disabled={!ok}
          onClick={() => {
            if (notifyIfBlocked()) return;
            nudge(activeId, robot.setStep);
            addLog("Setpoint → " + fmt(useStore.getState().controls[activeId].setpoint) + " " + robot.yUnit);
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
