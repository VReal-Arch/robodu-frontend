"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/store";
import { getRobot, displayName } from "@/lib/robots";
import { NAV } from "@/lib/nav";
import Icon from "@/components/Icon";

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
          <div className="logo-icon">
            <Icon name="bot" size={20} />
          </div>
          <div className="logo-text">
            ROBO<span>-DU</span>
          </div>
          <button className="sidebar-close" onClick={closeSidebar} aria-label="Tutup">
            <Icon name="close" size={16} />
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
              <span className="nav-icon">
                <Icon name={n.icon} size={18} />
              </span>
              <span>{n.label}</span>
            </Link>
          ))}
          <div className="nav-section">System</div>
          <Link
            href="/settings"
            className={"nav-item" + (pathname === "/settings" ? " active" : "")}
            onClick={closeSidebar}
          >
            <span className="nav-icon">
              <Icon name="plug" size={18} />
            </span>
            <span>Settings</span>
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="conn-badge">
            <div className={"pulse-dot" + (connected ? "" : " red")} />
            <div>
              <div className="conn-label">{displayName(robot)}</div>
              <div className="conn-sub">{connected ? "Connected" : "Disconnected"}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
