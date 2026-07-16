import { useStore, canControl } from "@/store/store";
import { getRobot } from "@/lib/robots";

let lastBlocked = 0;

/** Show a throttled modal explaining why control is unavailable. Returns true if blocked. */
export function notifyIfBlocked(): boolean {
  const s = useStore.getState();
  if (canControl(s)) return false;
  const now = Date.now();
  if (now - lastBlocked < 4000) return true;
  let body = "";
  if (s.estop) body = "E-Stop sedang aktif. Tekan Reset E-Stop dulu.";
  else if (!s.controls[s.activeId].connected)
    body = "Robot belum terhubung. Sambungkan di menu Settings.";
  else if (s.inputMode === "analog" && !s.gamepadConnected && !s.demoMode)
    body = "Controller belum terhubung. Sambungkan atau aktifkan Demo.";
  else return true;
  lastBlocked = now;
  s.pushModal({
    icon: "⚠️",
    title: "Kontrol Tidak Tersedia",
    body,
    actions: [{ label: "Mengerti", style: "primary" }],
  });
  return true;
}

export function lockReason(): string {
  const s = useStore.getState();
  if (s.estop) return "⛔ E-Stop aktif — kontrol terkunci. Reset untuk lanjut.";
  if (!s.controls[s.activeId].connected) return "📡 Robot tidak terhubung — kontrol dinonaktifkan.";
  if (s.inputMode === "analog" && !s.gamepadConnected && !s.demoMode)
    return "🎮 Controller belum terhubung.";
  return "";
}

export { getRobot };
