"use client";

import { usePathname } from "next/navigation";
import { useStore } from "@/store/store";

const TITLES: Record<string, [string, string]> = {
  "/": ["Dashboard", "Overview"],
  "/control": ["Control & Tuning", "PID + Setpoint"],
  "/data": ["Data & Charts", "Live Telemetry"],
  "/settings": ["Settings", "Connections"],
};

export default function Topbar() {
  const pathname = usePathname();
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const theme = useStore((s) => s.theme);
  const emergencyStop = useStore((s) => s.emergencyStop);
  const connected = useStore((s) => s.controls[s.activeId].connected);

  const [title, sub] = TITLES[pathname] ?? ["Robo-du", ""];

  return (
    <div className="topbar">
      <button className="burger" onClick={toggleSidebar} aria-label="Menu">
        ☰
      </button>
      <div className="topbar-title">
        {title} <span>{sub}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className={"chip " + (connected ? "chip-teal" : "chip-red")}>
          {connected ? (
            <>
              <span className="pulse-dot" style={{ width: 6, height: 6 }} />
              &nbsp;Online
            </>
          ) : (
            "● Offline"
          )}
        </div>
        <button className="theme-btn" onClick={toggleTheme} title="Toggle dark mode">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <button
          className="btn btn-danger"
          onClick={emergencyStop}
          style={{ padding: "7px 14px", fontSize: 12 }}
        >
          🛑 E-Stop
        </button>
      </div>
    </div>
  );
}
