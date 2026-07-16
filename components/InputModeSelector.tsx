"use client";

import { useStore } from "@/store/store";

const HINTS: Record<string, string> = {
  mouse: "Geser slider / tombol −+ untuk setpoint",
  keypad: "Tahan ⬆️ / ⬇️ untuk ubah setpoint (Spasi = STOP)",
  analog: "Tahan joystick atas/bawah untuk ubah setpoint",
};

function scanGamepads(): boolean {
  if (typeof navigator === "undefined" || !navigator.getGamepads) return false;
  for (const g of navigator.getGamepads()) {
    if (g) {
      useStore.getState().setGamepad({ connected: true, id: g.id, index: g.index });
      return true;
    }
  }
  return false;
}

export default function InputModeSelector({ label }: { label: string }) {
  const inputMode = useStore((s) => s.inputMode);
  const setInputMode = useStore((s) => s.setInputMode);
  const setDemo = useStore((s) => s.setDemo);
  const pushModal = useStore((s) => s.pushModal);

  function select(mode: "mouse" | "keypad" | "analog") {
    const s = useStore.getState();
    if (mode === inputMode) return;
    if (mode === "analog" && !s.gamepadConnected && !s.demoMode) {
      if (!scanGamepads()) {
        pushModal({
          icon: "🎮",
          title: "Hubungkan Controller",
          body:
            "Untuk mode Analog, sambungkan controller via <b>USB</b> atau <b>Bluetooth</b> ke komputer, lalu tekan salah satu tombolnya agar terdeteksi.",
          actions: [
            { label: "Scan ulang", style: "outline", onClick: () => select("analog") },
            { label: "Pakai Demo", style: "primary", onClick: () => { setDemo(true); setInputMode("analog"); } },
            { label: "Batal", style: "ghost" },
          ],
        });
        return;
      }
    }
    setInputMode(mode);
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--t2)",
          textTransform: "uppercase",
          letterSpacing: ".8px",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div className="mode-selector">
        <button className={"mode-btn" + (inputMode === "mouse" ? " active" : "")} onClick={() => select("mouse")}>
          🖱️ Mouse
        </button>
        <button className={"mode-btn" + (inputMode === "keypad" ? " active" : "")} onClick={() => select("keypad")}>
          ⌨️ Keypad
        </button>
        <button className={"mode-btn" + (inputMode === "analog" ? " active" : "")} onClick={() => select("analog")}>
          🎮 Analog
        </button>
      </div>
      <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 8, textAlign: "center" }}>
        {HINTS[inputMode]}
      </div>
    </div>
  );
}
