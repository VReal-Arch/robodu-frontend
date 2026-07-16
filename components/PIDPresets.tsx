"use client";

import { useState } from "react";
import { useStore } from "@/store/store";
import { getRobot } from "@/lib/robots";

export default function PIDPresets() {
  const activeId = useStore((s) => s.activeId);
  const presets = useStore((s) => s.presets);
  const savePreset = useStore((s) => s.savePreset);
  const applyPreset = useStore((s) => s.applyPreset);
  const deletePreset = useStore((s) => s.deletePreset);
  const [name, setName] = useState("");

  const robot = getRobot(activeId);
  if (robot.type !== "pid") return null;

  // presets that belong to the current robot
  const mine = presets.filter((p) => p.robotId === activeId);

  function save() {
    const n = name.trim();
    savePreset(n || "Tuning " + (mine.length + 1));
    setName("");
  }

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--t2)",
          textTransform: "uppercase",
          letterSpacing: ".8px",
          marginBottom: 10,
        }}
      >
        Preset PID
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          className="preset-input"
          placeholder="Nama preset…"
          value={name}
          maxLength={28}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
          }}
        />
        <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={save}>
          💾 Simpan
        </button>
      </div>

      {mine.length === 0 ? (
        <div className="empty-hint">Belum ada preset untuk {robot.name}. Simpan tuning yang sekarang.</div>
      ) : (
        mine.map((p) => (
          <div className="preset-row" key={p.id}>
            <div className="preset-info">
              <div className="preset-name">{p.name}</div>
              <div className="preset-pid">
                Kp {p.pid.kp} · Ki {p.pid.ki} · Kd {p.pid.kd}
              </div>
            </div>
            <button
              className="icon-btn"
              title="Terapkan"
              onClick={() => applyPreset(p.id)}
            >
              ↥
            </button>
            <button
              className="icon-btn danger"
              title="Hapus"
              onClick={() => deletePreset(p.id)}
            >
              🗑
            </button>
          </div>
        ))
      )}
    </div>
  );
}
