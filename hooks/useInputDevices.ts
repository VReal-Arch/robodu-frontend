"use client";

import { useEffect } from "react";
import { useStore } from "@/store/store";
import { inputState } from "@/lib/format";
import { getRobot } from "@/lib/robots";

const ARROWS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

/** Global keyboard + gamepad wiring. Mount once. */
export function useInputDevices() {
  useEffect(() => {
    // ---- keyboard ----
    function onKeyDown(e: KeyboardEvent) {
      const onControl = window.location.pathname.startsWith("/control");
      if (!onControl) return;
      const s = useStore.getState();
      if (e.key === " ") {
        e.preventDefault();
        const cfg = getRobot(s.activeId);
        if (cfg.type === "pid") {
          s.setRunning(s.activeId, false);
          s.addLog("⏸ STOP (spasi)");
        } else {
          s.setGait(s.activeId, "idle");
        }
        return;
      }
      if (ARROWS.includes(e.key) && s.inputMode === "keypad") {
        e.preventDefault();
        inputState.keys.add(e.key);
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      inputState.keys.delete(e.key);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // ---- gamepad connect/disconnect ----
    function onConnect(e: GamepadEvent) {
      const s = useStore.getState();
      s.setGamepad({ connected: true, id: e.gamepad.id, index: e.gamepad.index });
      s.addLog("🎮 Controller terhubung");
      s.pushModal({
        icon: "🎮",
        title: "Controller Terhubung",
        body: "Terdeteksi: " + e.gamepad.id.slice(0, 46),
        actions: [{ label: "OK", style: "primary" }],
      });
    }
    function onDisconnect(e: GamepadEvent) {
      const s = useStore.getState();
      if (e.gamepad.index !== s.gamepadIndex) return;
      s.setGamepad({ connected: false });
      inputState.analog = { x: 0, y: 0 };
      s.addLog("⚠️ Controller terputus");
      s.pushModal({
        icon: "🎮",
        title: "Controller Terputus",
        body:
          "Koneksi controller hilang." +
          (s.inputMode === "analog" ? " Sambungkan kembali atau pilih mode lain." : ""),
        actions: [{ label: "Mengerti", style: "primary" }],
      });
    }
    window.addEventListener("gamepadconnected", onConnect);
    window.addEventListener("gamepaddisconnected", onDisconnect);

    // ---- gamepad poll ----
    let raf = 0;
    const poll = () => {
      const s = useStore.getState();
      if (s.inputMode === "analog" && s.gamepadConnected && !s.demoMode && navigator.getGamepads) {
        const gp = navigator.getGamepads()[s.gamepadIndex ?? 0];
        if (gp) {
          const dz = (v: number) => (Math.abs(v) < 0.12 ? 0 : v);
          inputState.analog = { x: dz(gp.axes[0] || 0), y: dz(gp.axes[1] || 0) };
        }
      }
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("gamepadconnected", onConnect);
      window.removeEventListener("gamepaddisconnected", onDisconnect);
      cancelAnimationFrame(raf);
    };
  }, []);
}
