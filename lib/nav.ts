import type { IconName } from "@/components/Icon";

/** Navigation entries shared by the header nav and the mobile drawer. */
export const NAV: { href: string; icon: IconName; label: string }[] = [
  { href: "/", icon: "home", label: "Dashboard" },
  { href: "/control", icon: "sliders", label: "Control & Tuning" },
  { href: "/data", icon: "chart", label: "Data & Charts" },
  { href: "/settings", icon: "plug", label: "Settings" },
];

/** Page titles: [title, eyebrow]. */
export const TITLES: Record<string, [string, string]> = {
  "/": ["Dashboard", "Overview"],
  "/control": ["Control & Tuning", "PID + Setpoint"],
  "/data": ["Data & Charts", "Live Telemetry"],
  "/settings": ["Settings", "Connections"],
};
