"use client";

import { useEffect } from "react";
import { useStore } from "@/store/store";
import { wsClient } from "@/lib/wsClient";
import { engine } from "@/lib/engine";
import { inputState } from "@/lib/format";
import { getRobot } from "@/lib/robots";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/ws";
const DT = 0.05;

/**
 * Live link to the backend. Incoming telemetry fills the chart buffers and
 * updates robot status; held keyboard/analog input is turned into setpoint
 * commands. Mount once.
 */
export default function WsProvider() {
  useEffect(() => {
    wsClient.onConnectionChange((c) => useStore.getState().setWsConnected(c));
    wsClient.onMessage((m) => {
      const st = useStore.getState();
      if (m.type === "telemetry") {
        engine.pushTelemetry(m);
        st.applyTelemetryState(m.robotId, m.state === "balancing");
      } else if (m.type === "state") {
        st.applyServerState(m.robots);
      } else if (m.type === "status") {
        st.applyStatus(m.robotId, m.connected);
      } else if (m.type === "estop") {
        st.applyEstop(m.active);
      }
    });
    wsClient.connect(WS_URL);

    // held keypad / analog input -> setpoint commands (control page only)
    const loop = setInterval(() => {
      if (typeof window === "undefined" || !window.location.pathname.startsWith("/control")) return;
      const st = useStore.getState();
      const ctrl = st.controls[st.activeId];
      if (st.estop || !ctrl.connected) return;
      if (st.inputMode === "analog" && !st.gamepadConnected && !st.demoMode) return;
      const cfg = getRobot(st.activeId);
      if (cfg.type !== "pid") return;
      let dir = 0;
      if (st.inputMode === "keypad") {
        if (inputState.keys.has("ArrowUp")) dir += 1;
        if (inputState.keys.has("ArrowDown")) dir -= 1;
      } else if (st.inputMode === "analog") {
        dir += -inputState.analog.y;
      }
      if (dir !== 0) {
        const rate = (cfg.setMax - cfg.setMin) / 2;
        st.setSetpoint(st.activeId, ctrl.setpoint + dir * rate * DT);
      }
    }, DT * 1000);

    return () => clearInterval(loop);
  }, []);

  return null;
}
