"use client";

import { useEffect, useRef } from "react";
import { cssVar } from "@/lib/format";

export interface Series {
  data: number[];
  colorVar: string;
  width?: number;
  dash?: number[];
}

const N = 140;

function draw(cv: HTMLCanvasElement, series: Series[], min: number, max: number) {
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  if (w === 0 || h === 0) return;
  if (cv.width !== w * dpr || cv.height !== h * dpr) {
    cv.width = w * dpr;
    cv.height = h * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (min === max) max = min + 1;
  const pad = 4;
  const X = (i: number) => pad + (i * (w - 2 * pad)) / (N - 1);
  const Y = (v: number) => {
    const t = (v - min) / (max - min);
    return h - pad - (h - 2 * pad) * Math.max(0, Math.min(1, t));
  };

  // zero line
  ctx.strokeStyle = cssVar("--border");
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  const zy = Y(0);
  ctx.moveTo(0, zy);
  ctx.lineTo(w, zy);
  ctx.stroke();
  ctx.setLineDash([]);

  for (const s of series) {
    const d = s.data;
    const n = d.length;
    if (!n) continue;
    ctx.strokeStyle = cssVar(s.colorVar);
    ctx.lineWidth = s.width ?? 2;
    ctx.lineJoin = "round";
    if (s.dash) ctx.setLineDash(s.dash);
    else ctx.setLineDash([]);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = X(i + (N - n));
      const y = Y(d[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

/** read() is called every frame to fetch the latest series + range. */
export default function StripChart({
  read,
  height = 120,
}: {
  read: () => { series: Series[]; min: number; max: number };
  height?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const r = useRef(read);
  r.current = read;

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (ref.current) {
        const { series, min, max } = r.current();
        draw(ref.current, series, min, max);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="chart-box" style={{ height }}>
      <canvas ref={ref} />
    </div>
  );
}
