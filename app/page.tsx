"use client";

import Link from "next/link";
import { useStore } from "@/store/store";
import { getRobot } from "@/lib/robots";
import { engine } from "@/lib/engine";
import { fmt } from "@/lib/format";
import RobotDropdown from "@/components/RobotDropdown";
import ActivityLog from "@/components/ActivityLog";
import LiveValue from "@/components/LiveValue";
import PartnerLogos from "@/components/PartnerLogos";

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
          <div className="stat-icon">{robot.icon}</div>
          <div className="stat-label">Active Robot</div>
          <div className="stat-value" style={{ fontSize: 16, paddingTop: 4 }}>
            {robot.name}
          </div>
          <div className="stat-sub">{isPid ? "PID balance control" : "Humanoid balance"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-label">Status</div>
          <div className="stat-value" style={{ fontSize: 16, paddingTop: 4 }}>
            {status}
          </div>
          <div className="stat-sub">{ctrl.connected ? "Loop active" : "Disconnected"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
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
          <div className="stat-icon">📶</div>
          <div className="stat-label">Connection</div>
          <div className="stat-value" style={{ fontSize: 16, paddingTop: 4 }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            <Link className="btn btn-primary btn-full" href="/control" style={{ textAlign: "center" }}>
              🎛️ Tune Active Robot
            </Link>
            <Link className="btn btn-outline btn-full" href="/data" style={{ textAlign: "center" }}>
              📈 View Live Charts
            </Link>
            <Link className="btn btn-outline btn-full" href="/settings" style={{ textAlign: "center" }}>
              ⚙️ Manage Connections
            </Link>
            <button className="btn btn-danger btn-full" onClick={emergencyStop}>
              🛑 Emergency Stop (All)
            </button>
          </div>
        </div>
      </div>

      <PartnerLogos />
    </div>
  );
}
