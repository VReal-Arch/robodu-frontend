"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { ROBOTS } from "@/lib/robots";

/**
 * Shown once when the dashboard loads. Since robots connect themselves over
 * WiFi/MQTT, this is a reminder + status prompt, not a manual connect switch.
 *
 * When wired to the real backend, drop the "Hubungkan Semua (Demo)" button —
 * robots appear online automatically as their heartbeat arrives.
 */
export default function StartupConnect() {
  const router = useRouter();
  const controls = useStore((s) => s.controls);
  const [open, setOpen] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    const anyOffline = ROBOTS.some((r) => !useStore.getState().controls[r.id].connected);
    if (anyOffline) setOpen(true);
  }, []);

  if (!open) return null;

  const online = ROBOTS.filter((r) => controls[r.id].connected).length;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-icon">📡</div>
        <div className="modal-title">Sambungkan Robot</div>
        <div className="modal-body">
          <b>{online} dari {ROBOTS.length}</b> robot terhubung.
          <br />
          Nyalakan robot &amp; pastikan terhubung WiFi, lalu hubungkan tiap robot
          lewat halaman koneksi (Settings).
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18, maxHeight: 220, overflowY: "auto" }}>
          {ROBOTS.map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "7px 12px",
                background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5,
              }}
            >
              <span style={{ fontSize: 15 }}>{r.icon}</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{r.name} · U{r.unit}</span>
              <span
                className={"chip " + (controls[r.id].connected ? "chip-teal" : "chip-red")}
                style={{ padding: "2px 9px", fontSize: 10 }}
              >
                {controls[r.id].connected ? "Online" : "Menunggu…"}
              </span>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setOpen(false);
              router.push("/settings");
            }}
          >
            Halaman Koneksi
          </button>
          <button className="btn btn-ghost" onClick={() => setOpen(false)}>
            Nanti
          </button>
        </div>
      </div>
    </div>
  );
}
