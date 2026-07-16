"use client";

import { useEffect, useRef } from "react";
import { useStore, canControl } from "@/store/store";
import { inputState } from "@/lib/format";
import { notifyIfBlocked } from "@/lib/control";

export default function Joystick() {
  const demoMode = useStore((s) => s.demoMode);
  const gamepadConnected = useStore((s) => s.gamepadConnected);
  const gamepadId = useStore((s) => s.gamepadId);
  const setDemo = useStore((s) => s.setDemo);
  const addLog = useStore((s) => s.addLog);
  const pushModal = useStore((s) => s.pushModal);

  const padRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const radius = () => {
    const p = padRef.current;
    return p ? p.clientWidth / 2 - 26 : 60;
  };

  function moveKnob(dx: number, dy: number) {
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx}px,${dy}px)`;
  }

  // reflect inputState.analog (demo drag OR gamepad) onto the knob each frame
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const r = radius();
      moveKnob(inputState.analog.x * r, inputState.analog.y * r);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  function onDown(e: React.PointerEvent) {
    if (!demoMode) return;
    if (notifyIfBlocked()) return;
    dragging.current = true;
    padRef.current?.setPointerCapture(e.pointerId);
    onMove(e);
  }
  function onMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const pad = padRef.current!;
    const rect = pad.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const R = radius();
    const d = Math.hypot(dx, dy);
    if (d > R) {
      dx = (dx / d) * R;
      dy = (dy / d) * R;
    }
    inputState.analog = { x: dx / R, y: dy / R };
  }
  function onUp() {
    if (!dragging.current) return;
    dragging.current = false;
    inputState.analog = { x: 0, y: 0 };
  }

  function scan() {
    if (typeof navigator !== "undefined" && navigator.getGamepads) {
      for (const g of navigator.getGamepads()) {
        if (g) {
          useStore.getState().setGamepad({ connected: true, id: g.id, index: g.index });
          pushModal({ icon: "🎮", title: "Controller Ditemukan", body: g.id.slice(0, 46), actions: [{ label: "OK", style: "primary" }] });
          return;
        }
      }
    }
    pushModal({
      icon: "🔌",
      title: "Tidak Ditemukan",
      body: "Pastikan controller tersambung via USB/Bluetooth, lalu TEKAN salah satu tombolnya agar terdeteksi browser.",
      actions: [{ label: "OK", style: "primary" }],
    });
  }

  function toggleDemo() {
    const next = !demoMode;
    setDemo(next);
    if (next) {
      addLog("🎮 Demo controller aktif");
      pushModal({ icon: "🎮", title: "Demo Controller", body: "Seret joystick untuk mengubah setpoint.", actions: [{ label: "OK", style: "primary" }] });
    } else addLog("Demo controller nonaktif");
  }

  const locked = !(demoMode && canControl(useStore.getState()));
  const status = gamepadConnected
    ? { ic: "🎮", label: (gamepadId ?? "Gamepad").slice(0, 26), chip: "Terhubung", kind: "teal" }
    : demoMode
    ? { ic: "🎮", label: "Demo controller", chip: "Demo", kind: "warn" }
    : { ic: "⚪", label: "Belum terhubung", chip: "Offline", kind: "red" };

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        className={"joy-pad" + (locked ? " locked" : "")}
        ref={padRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="joy-knob" ref={knobRef} />
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--t2)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 8 }}>
          Analog Controller
        </div>
        <div className="safety-row" style={{ padding: "6px 0" }}>
          <span style={{ fontSize: 16 }}>{status.ic}</span>
          <span className="s-label">{status.label}</span>
          <span className={"chip chip-" + status.kind} style={{ padding: "2px 9px", fontSize: 10 }}>
            {status.chip}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={scan}>
            🔌 Scan
          </button>
          <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={toggleDemo}>
            🎮 Demo
          </button>
        </div>
      </div>
    </div>
  );
}
