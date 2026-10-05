"use client";

import Link from "next/link";
import { useStore } from "@/store/store";
import { getRobot, displayName } from "@/lib/robots";
import { engine } from "@/lib/engine";
import { fmt } from "@/lib/format";
import RobotDropdown from "@/components/RobotDropdown";
import ActivityLog from "@/components/ActivityLog";
import LiveValue from "@/components/LiveValue";
import PartnerLogos from "@/components/PartnerLogos";
import Icon from "@/components/Icon";

export default function DashboardPage() {
  const activeId = useStore((s) => s.activeId);
  const ctrl = useStore((s) => s.controls[s.activeId]);
  const emergencyStop = useStore((s) => s.emergencyStop);
  const robot = getRobot(activeId);

  const isPid = robot.type === "pid";
  const status = !ctrl.connected ? "Offline" : isPid ? (ctrl.running ? "Balancing" : "Idle") : ctrl.gait;
  const varLabel = isPid ? robot.yVar : "Body Roll";

  return (
    <div className="fade-up">
      <RobotDropdown />

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-icon stat-icon-emoji">{robot.icon}</div>
          <div className="stat-label">Active Robot</div>
          <div className="stat-value stat-value-text">
            {displayName(robot)}
          </div>
          <div className="stat-sub">{isPid ? "PID balance control" : "Humanoid balance"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icon name="bolt" size={20} /></div>
          <div className="stat-label">Status</div>
          <div className="stat-value stat-value-text">
            {status}
          </div>
          <div className="stat-sub">{ctrl.connected ? "Loop active" : "Disconnected"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icon name="target" size={20} /></div>
          <div className="stat-label">{varLabel}</div>
          <div className="stat-value">
            <LiveValue
              get={() => {
                const t = engine.telemetry(activeId) as { actual?: number; roll?: number };
                return fmt(isPid ? t.actual ?? 0 : t.roll ?? 0);
              }}
            />
          </div>
          <div className="stat-sub">{isPid ? "setpoint " + fmt(ctrl.setpoint) : "live tilt"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Icon name="signal" size={20} /></div>
          <div className="stat-label">Connection</div>
          <div className="stat-value stat-value-text">
            {ctrl.connected ? "Online" : "—"}
          </div>
          <div className="stat-sub">{ctrl.connected ? "WebSocket OK" : "No link"}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Activity Log</div>
          <ActivityLog max={4} />
        </div>
        <div className="card">
          <div className="card-title">Quick Actions</div>
          <div className="stack-10">
            <Link className="btn btn-primary btn-full btn-cta" href="/control">
              <Icon name="sliders" size={16} /> Tune Active Robot
            </Link>
            <Link className="btn btn-outline btn-full btn-cta" href="/data">
              <Icon name="chart" size={16} /> View Live Charts
            </Link>
            <Link className="btn btn-outline btn-full btn-cta" href="/settings">
              <Icon name="plug" size={16} /> Manage Connections
            </Link>
            <button className="btn btn-danger btn-full btn-cta" onClick={emergencyStop}>
              <Icon name="stop" size={16} /> Emergency Stop (All)
            </button>
          </div>
        </div>
      </div>

      <PartnerLogos />
    </div>
  );
}
