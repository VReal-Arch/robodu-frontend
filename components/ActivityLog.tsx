"use client";

import { useStore } from "@/store/store";

export default function ActivityLog({ max = 6 }: { max?: number }) {
  const logs = useStore((s) => s.logs);
  return (
    <div>
      {logs.slice(0, max).map((e, i) => (
        <div className="log-item" key={i}>
          <div className="log-dot" style={{ background: e.active ? "var(--teal)" : "var(--teal-mid)" }} />
          <div className="log-text">{e.text}</div>
          <div className="log-time">{e.time}</div>
        </div>
      ))}
    </div>
  );
}
