"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/store";
import { NAV } from "@/lib/nav";
import Icon from "@/components/Icon";

export default function Topbar() {
  const pathname = usePathname();
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const theme = useStore((s) => s.theme);
  const emergencyStop = useStore((s) => s.emergencyStop);
  const connected = useStore((s) => s.controls[s.activeId].connected);

  return (
    <header className="topbar">
      <button className="burger" onClick={toggleSidebar} aria-label="Menu">
        <Icon name="menu" size={20} />
      </button>

      <Link href="/" className="brand" aria-label="Robo-du">
        <span className="brand-mark">
          <Icon name="bot" size={20} />
        </span>
        <span className="brand-text">
          ROBO<span>-DU</span>
        </span>
      </Link>

      <nav className="topnav" aria-label="Utama">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={"topnav-link" + (pathname === n.href ? " active" : "")}>
            {n.label}
          </Link>
        ))}
      </nav>

      <div className="topbar-actions">
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
        <button className="theme-btn" onClick={toggleTheme} title="Toggle dark mode" aria-label="Toggle dark mode">
          <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
        </button>
        <button className="btn btn-danger btn-estop" onClick={emergencyStop}>
          <Icon name="stop" size={15} />
          <span>E-Stop</span>
        </button>
      </div>
    </header>
  );
}
