"use client";

import { useStore } from "@/store/store";
import Icon from "@/components/Icon";

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
      <div className="field-label">
        {label}
      </div>
      <div className="mode-selector">
        <button className={"mode-btn" + (inputMode === "mouse" ? " active" : "")} onClick={() => select("mouse")}>
          <Icon name="mouse" size={15} /> Mouse
        </button>
        <button className={"mode-btn" + (inputMode === "keypad" ? " active" : "")} onClick={() => select("keypad")}>
          <Icon name="keyboard" size={15} /> Keypad
        </button>
        <button className={"mode-btn" + (inputMode === "analog" ? " active" : "")} onClick={() => select("analog")}>
          <Icon name="gamepad" size={15} /> Analog
        </button>
      </div>
      <div className="hint-text">
        {HINTS[inputMode]}
      </div>
    </div>
  );
}
