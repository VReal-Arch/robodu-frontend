"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { ROBOTS } from "@/lib/robots";
import Icon from "@/components/Icon";

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
        <div className="modal-icon"><Icon name="signal" size={28} /></div>
        <div className="modal-title">Sambungkan Robot</div>
        <div className="modal-body">
          <b>{online} dari {ROBOTS.length}</b> robot terhubung.
          <br />
          Nyalakan robot &amp; pastikan terhubung WiFi, lalu hubungkan tiap robot
          lewat halaman koneksi (Settings).
        </div>
        <div className="modal-list">
          {ROBOTS.map((r) => (
            <div key={r.id} className="modal-list-item">
              <span className="modal-list-emoji">{r.icon}</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{r.name} · U{r.unit}</span>
              <span
                className={"chip chip-sm " + (controls[r.id].connected ? "chip-teal" : "chip-red")}
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
