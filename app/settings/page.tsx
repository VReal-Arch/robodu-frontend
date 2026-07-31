"use client";

import { useStore } from "@/store/store";
import { ROBOTS, robotsByFamily, getRobot } from "@/lib/robots";
import { RobotId } from "@/lib/types";

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
      <div
        style={{
          background: wsConnected ? "var(--teal-light)" : "#FFEBEE",
          border: "1px solid " + (wsConnected ? "var(--teal-mid)" : "#FFCDD2"),
          borderRadius: 14, padding: 22, display: "flex", alignItems: "center", gap: 20, marginBottom: 22,
        }}
      >
        <div
          style={{
            width: 60, height: 60, background: wsConnected ? "var(--teal)" : "var(--danger)",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, color: "#fff", flexShrink: 0,
          }}
        >
          {wsConnected ? "🔗" : "⚠️"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {wsConnected ? "Server — Online" : "Server — Terputus"}
          </div>
          <div style={{ fontSize: 13, color: "var(--t2)", marginTop: 2 }}>
            {wsConnected
              ? `WebSocket hub • ${connectedCount} dari ${ROBOTS.length} robot terhubung`
              : "Menunggu koneksi ke backend (ws)…"}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span>Koneksi Robot</span>
          <span style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline" style={{ fontSize: 11, padding: "5px 12px" }} onClick={connectAll}>
              Hubungkan Semua
            </button>
            <button className="btn btn-ghost" style={{ fontSize: 11, padding: "5px 12px" }} onClick={disconnectAll}>
              Putus Semua
            </button>
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 14 }}>
          Sambungkan tiap robot secara manual. Pastikan robot sudah menyala &amp; terhubung ke WiFi.
        </div>

        {groups.map((g) => (
          <div key={g.family} style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: ".6px", textTransform: "uppercase",
                color: "var(--t2)", margin: "4px 0 8px", display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <span style={{ fontSize: 15 }}>{g.icon}</span> {g.name}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {g.units.map((r) => {
                const c = controls[r.id];
                return (
                  <div key={r.id} className={"robot-item" + (c.connected ? " connected" : "")}>
                    <div className="robot-avatar" style={{ fontSize: 15, width: 34, height: 34 }}>
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
