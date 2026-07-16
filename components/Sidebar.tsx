"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/store";
import { getRobot } from "@/lib/robots";

const NAV = [
  { href: "/", icon: "🏠", label: "Dashboard" },
  { href: "/control", icon: "🎛️", label: "Control & Tuning" },
  { href: "/data", icon: "📈", label: "Data & Charts" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const open = useStore((s) => s.sidebarOpen);
  const closeSidebar = useStore((s) => s.closeSidebar);
  const activeId = useStore((s) => s.activeId);
  const connected = useStore((s) => s.controls[s.activeId].connected);
  const robot = getRobot(activeId);

  return (
    <>
      <div className={"sidebar-overlay" + (open ? " show" : "")} onClick={closeSidebar} />
      <aside className={"sidebar" + (open ? " open" : "")}>
        <div className="sidebar-logo">
          <div className="logo-icon">🤖</div>
          <div className="logo-text">
            Robo<span>-du</span>
          </div>
          <button className="sidebar-close" onClick={closeSidebar} aria-label="Tutup">
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Menu</div>
          {NAV.slice(0, 3).map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={"nav-item" + (pathname === n.href ? " active" : "")}
              onClick={closeSidebar}
            >
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </Link>
          ))}
          <div className="nav-section">System</div>
          <Link
            href="/settings"
            className={"nav-item" + (pathname === "/settings" ? " active" : "")}
            onClick={closeSidebar}
          >
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="conn-badge">
            <div className={"pulse-dot" + (connected ? "" : " red")} />
            <div>
              <div className="conn-label">{robot.name}</div>
              <div className="conn-sub">{connected ? "Connected" : "Disconnected"}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
