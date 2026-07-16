"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/store";
import { ROBOTS, getRobot } from "@/lib/robots";

export default function RobotDropdown() {
  const open = useStore((s) => s.dropdownOpen);
  const setOpen = useStore((s) => s.setDropdownOpen);
  const activeId = useStore((s) => s.activeId);
  const selectRobot = useStore((s) => s.selectRobot);
  const controls = useStore((s) => s.controls);
  const ref = useRef<HTMLDivElement>(null);
  const active = getRobot(activeId);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [setOpen]);

  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--t2)",
          textTransform: "uppercase",
          letterSpacing: ".8px",
          marginBottom: 8,
        }}
      >
        Pilih Robot
      </div>
      <div className="robot-dropdown" ref={ref}>
        <button
          className="dropdown-btn"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          <span className="rtab-icon">{active.icon}</span>
          <span>{active.name}</span>
          <span className={"rtab-dot" + (controls[activeId].connected ? "" : " off")} />
          <span className="dd-caret" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}>
            ▾
          </span>
        </button>
        {open && (
          <div className="dropdown-menu fade-up">
            {ROBOTS.map((r) => (
              <div
                key={r.id}
                className={"dd-item" + (r.id === activeId ? " active" : "")}
                onClick={() => selectRobot(r.id)}
              >
                <span className="rtab-icon">{r.icon}</span>
                <span style={{ flex: 1 }}>{r.name}</span>
                <span className={"rtab-dot" + (controls[r.id].connected ? "" : " off")} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
