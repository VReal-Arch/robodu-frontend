import type { CSSProperties } from "react";

/**
 * Line-icon set (purely visual) used in place of emoji so the UI reads like
 * a technical product site. 24x24 grid, 1.75px stroke, mitered corners.
 */
const PATHS = {
  menu: "M3 6h18M3 12h18M3 18h18",
  close: "M6 6l12 12M18 6L6 18",
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  sliders: "M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4",
  chart: "M3 3v18h18M7 14l4-4 3 3 5-6",
  plug: "M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  target: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 11.5v1",
  signal: "M3 20v-3M8 20v-7M13 20V9M18 20V4",
  stop: "M7.9 2h8.2L22 7.9v8.2L16.1 22H7.9L2 16.1V7.9zM12 7v6M12 16.5v.5",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z",
  bot: "M5 8h14v12H5zM12 8V4M9 13v2M15 13v2M2 13v3M22 13v3",
  play: "M6 4l14 8-14 8z",
  pause: "M7 4v16M17 4v16",
  save: "M5 3h11l3 3v15H5zM8 3v6h7V3M8 21v-7h8v7",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3",
  gamepad: "M6 6h12a4 4 0 0 1 4 4v4a3 3 0 0 1-5.2 2L15 14H9l-1.8 2A3 3 0 0 1 2 14v-4a4 4 0 0 1 4-4zM6 10h4M8 8v4M15.5 11h.01M18 13h.01",
  mouse: "M6 9a6 6 0 0 1 12 0v6a6 6 0 0 1-12 0zM12 5v5",
  keyboard: "M2 6h20v12H2zM6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10",
  reset: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5",
  upload: "M12 19V5M5 12l7-7 7 7",
  link: "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1",
  alert: "M12 3l10 18H2zM12 10v5M12 18v.5",
  check: "M5 12l5 5L20 7",
  server: "M3 4h18v6H3zM3 14h18v6H3zM7 7h.01M7 17h.01",
  pulse: "M3 12h4l3-8 4 16 3-8h4",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  trend: "M3 7l6 6 4-4 8 8M21 11v6h-6",
  user: "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21v-2a6 6 0 0 1 16 0v2",
  stand: "M6 17l6-6 6 6M6 11l6-6 6 6",
  scale: "M12 3v18M5 21h14M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z",
  walk: "M5 12h14M13 6l6 6-6 6",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5v.5",
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({
  name,
  size = 18,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={"ico" + (className ? " " + className : "")}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
