import { PID, Preset, RobotId } from "./types";

const KEY = "robodu-pid-presets";

export function loadPresets(): Preset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Preset[]) : [];
  } catch {
    return [];
  }
}

function persist(list: Preset[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage full / unavailable */
  }
}

export function addPreset(list: Preset[], name: string, robotId: RobotId, pid: PID): Preset[] {
  const preset: Preset = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || "Untitled",
    robotId,
    pid: { ...pid },
    createdAt: Date.now(),
  };
  const next = [preset, ...list];
  persist(next);
  return next;
}

export function removePreset(list: Preset[], id: string): Preset[] {
  const next = list.filter((p) => p.id !== id);
  persist(next);
  return next;
}
