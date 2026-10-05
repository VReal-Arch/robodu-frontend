"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/store";
import { getRobot, robotsByFamily, displayName } from "@/lib/robots";

export default function RobotDropdown() {
  const open = useStore((s) => s.dropdownOpen);
  const setOpen = useStore((s) => s.setDropdownOpen);
  const activeId = useStore((s) => s.activeId);
  const selectRobot = useStore((s) => s.selectRobot);
  const controls = useStore((s) => s.controls);
  const ref = useRef<HTMLDivElement>(null);
  const active = getRobot(activeId);
  const groups = robotsByFamily();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [setOpen]);

  return (
    <div style={{ marginBottom: 18 }}>
      <div className="field-label">
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
          <span>{displayName(active)}</span>
          <span className={"rtab-dot" + (controls[activeId]?.connected ? "" : " off")} />
          <span className="dd-caret" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
        </button>
        {open && (
          <div className="dropdown-menu fade-up">
            {groups.map((g) => (
              <div key={g.family}>
                <div className="dd-group-label">
                  <span>{g.icon}</span> {g.name}
                </div>
                {g.units.map((r) => (
                  <div
                    key={r.id}
                    className={"dd-item dd-unit" + (r.id === activeId ? " active" : "")}
                    onClick={() => selectRobot(r.id)}
                  >
                    <span style={{ flex: 1 }}>Unit {r.unit}</span>
                    <span className={"rtab-dot" + (controls[r.id]?.connected ? "" : " off")} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
