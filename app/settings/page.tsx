"use client";

import { useStore } from "@/store/store";
import { ROBOTS, robotsByFamily, getRobot } from "@/lib/robots";
import { RobotId } from "@/lib/types";
import Icon from "@/components/Icon";

export default function SettingsPage() {
  const controls = useStore((s) => s.controls);
  const wsConnected = useStore((s) => s.wsConnected);
  const setConnected = useStore((s) => s.setConnected);
  const connectAll = useStore((s) => s.connectAll);
  const disconnectAll = useStore((s) => s.disconnectAll);
  const pushModal = useStore((s) => s.pushModal);
  const connectedCount = ROBOTS.filter((r) => controls[r.id].connected).length;
  const groups = robotsByFamily();

  function toggle(id: RobotId) {
    const willConnect = !controls[id].connected;
    setConnected(id, willConnect);
    const r = getRobot(id);
    pushModal({
      icon: willConnect ? "✅" : "🔌",
      title: willConnect ? "Robot Dihubungkan" : "Robot Diputus",
      body:
        `${r.name} · Unit ${r.unit}` +
        (willConnect
          ? " dihubungkan. Data akan tampil begitu robot mengirim telemetry."
          : " diputus." + (r.type === "pid" ? " Balancing dihentikan (fail-safe)." : "")),
      actions: [{ label: "OK", style: "primary" }],
    });
  }

  return (
    <div className="fade-up">
      <div className={"status-banner " + (wsConnected ? "ok" : "bad")}>
        <div className="status-orb">
          <Icon name={wsConnected ? "link" : "alert"} size={26} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="status-title">
            {wsConnected ? "Server — Online" : "Server — Terputus"}
          </div>
          <div className="status-sub">
            {wsConnected
              ? `WebSocket hub • ${connectedCount} dari ${ROBOTS.length} robot terhubung`
              : "Menunggu koneksi ke backend (ws)…"}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span>Koneksi Robot</span>
          <span className="row-gap-8">
            <button className="btn btn-outline btn-sm" onClick={connectAll}>
              Hubungkan Semua
            </button>
            <button className="btn btn-ghost btn-sm" onClick={disconnectAll}>
              Putus Semua
            </button>
          </span>
        </div>
        <div className="card-hint">
          Sambungkan tiap robot secara manual. Pastikan robot sudah menyala &amp; terhubung ke WiFi.
        </div>

        {groups.map((g) => (
          <div key={g.family} style={{ marginBottom: 16 }}>
            <div className="group-label">
              <span className="group-emoji">{g.icon}</span> {g.name}
            </div>
            <div className="stack-8">
              {g.units.map((r) => {
                const c = controls[r.id];
                return (
                  <div key={r.id} className={"robot-item" + (c.connected ? " connected" : "")}>
                    <div className="robot-avatar robot-avatar-sm">
                      U{r.unit}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="r-name">Unit {r.unit}</div>
                      <div className="r-sub">{c.connected ? "terhubung" : "belum terhubung"}</div>
                    </div>
                    <button className={"badge " + (c.connected ? "badge-on" : "badge-off")} onClick={() => toggle(r.id)}>
                      {c.connected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
