export function nowHM(): string {
  const d = new Date();
  return (
    d.getHours().toString().padStart(2, "0") +
    ":" +
    d.getMinutes().toString().padStart(2, "0")
  );
}

export function cssVar(name: string): string {
  if (typeof window === "undefined") return "#4DB6AC";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#4DB6AC";
}

/** Memformat angka untuk ditampilkan. Sengaja menerima nilai kosong: telemetry
 *  yang belum tiba atau paket yang rusak tidak boleh sampai membuat seluruh
 *  dashboard berhenti, cukup tampilkan nol. */
export function fmt(v: number | undefined | null, d = 1): string {
  if (typeof v !== "number" || !isFinite(v)) return (0).toFixed(d);
  return v.toFixed(d);
}

/**
 * High-frequency input shared between the keyboard/gamepad/joystick and the
 * simulation driver. Kept outside React state to avoid re-render storms.
 */
export const inputState = {
  keys: new Set<string>(),
  analog: { x: 0, y: 0 },
  dragging: false,
};
