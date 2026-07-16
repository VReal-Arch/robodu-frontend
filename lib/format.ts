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

export function fmt(v: number, d = 1): string {
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
