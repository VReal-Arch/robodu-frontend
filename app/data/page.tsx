"use client";

import { useStore } from "@/store/store";
import { getRobot } from "@/lib/robots";
import { engine } from "@/lib/engine";
import { fmt } from "@/lib/format";
import ChartsPanel from "@/components/ChartsPanel";
import ActivityLog from "@/components/ActivityLog";
import LiveValue from "@/components/LiveValue";
import Icon from "@/components/Icon";

export default function DataPage() {
  const activeId = useStore((s) => s.activeId);
  const ctrl = useStore((s) => s.controls[s.activeId]);
  const robot = getRobot(activeId);
  const isPid = robot.type === "pid";

  return (
    <div className="fade-up">
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-icon"><Icon name="target" size={20} /></div>
          <div className="stat-label">{isPid ? robot.yVar : "Roll"}</div>
          <div className="stat-value">
            <LiveValue
              get={() => {
                const t = engine.telemetry(activeId) as { actual?: number; roll?: number };
                return fmt(isPid ? t.actual ?? 0 : t.roll ?? 0);
              }}
            />
          </div>
          <div className="stat-sub">{isPid ? "setpoint " + fmt(ctrl.setpoint) : "tilt"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icon name="trend" size={20} /></div>
          <div className="stat-label">Error</div>
          <div className="stat-value">
            <LiveValue
              get={() => {
                const t = engine.telemetry(activeId) as { actual?: number; comX?: number };
                return isPid ? fmt(ctrl.setpoint - (t.actual ?? 0)) : fmt(t.comX ?? 0, 2);
              }}
            />
          </div>
          <div className="stat-sub">{isPid ? "steady-state" : "CoM X"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icon name="sliders" size={20} /></div>
          <div className="stat-label">{isPid ? robot.uVar : "Pitch"}</div>
          <div className="stat-value">
            <LiveValue
              get={() => {
                const t = engine.telemetry(activeId) as { output?: number; pitch?: number };
                return fmt(isPid ? t.output ?? 0 : t.pitch ?? 0);
              }}
            />
          </div>
          <div className="stat-sub">{isPid ? robot.uUnit : "°"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icon name="pulse" size={20} /></div>
          <div className="stat-label">PID</div>
          <div className="stat-value stat-value-text stat-value-mono">
            {isPid ? `${fmt(ctrl.pid.kp)} / ${fmt(ctrl.pid.ki, 2)} / ${fmt(ctrl.pid.kd)}` : "—"}
          </div>
          <div className="stat-sub">Kp / Ki / Kd</div>
        </div>
      </div>

      <ChartsPanel height={150} />

      <div className="card mt-18">
        <div className="card-title">Log Aktivitas</div>
        <ActivityLog max={8} />
      </div>
    </div>
  );
}
