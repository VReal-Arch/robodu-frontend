"use client";

import { useState } from "react";
import {
  ALUR, DI_WEB, KIT, KONEKSI_KABEL, Langkah, MASALAH, PENGAMAN, PERSIAPAN, SETUP_WIFI, SLOT_JST,
  STATUS_KIT, TUNING,
} from "@/lib/panduan";
import Icon from "@/components/Icon";

// Isi teks ada di lib/panduan.ts. Judul besar halaman datang dari PageHero
// (lib/nav.ts -> TITLES["/panduan"]).

const BAGIAN = [
  { id: "persiapan", label: "Persiapan" },
  { id: "kabel", label: "Koneksi Kabel" },
  { id: "wifi", label: "Setup WiFi" },
  { id: "web", label: "Di robodu.id" },
  { id: "kit", label: "Per Kit" },
  { id: "pengaman", label: "Keamanan" },
  { id: "status", label: "Status" },
  { id: "tuning", label: "Tuning" },
  { id: "masalah", label: "Masalah" },
];

function Bagian({ id, no, judul, sub, children }: { id: string; no: number; judul: string; sub?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="guide-section">
      <div className="guide-head">
        <span className="guide-no">{String(no).padStart(2, "0")}</span>
        <div>
          <h2 className="guide-h2">{judul}</h2>
          {sub && <p className="guide-sub">{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function DaftarLangkah({ items }: { items: Langkah[] }) {
  return (
    <ol className="guide-steps">
      {items.map((l, i) => (
        <li key={i} className="guide-step">
          <span className="guide-step-no">{i + 1}</span>
          <div>
            <div className="guide-step-title">{l.judul}</div>
            {l.isi && <div className="guide-step-body">{l.isi}</div>}
            {l.catatan && <div className="guide-note">{l.catatan}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Cek({ items }: { items: string[] }) {
  return (
    <ul className="guide-check">
      {items.map((t, i) => (
        <li key={i}>
          <span className="guide-check-mark"><Icon name="check" size={12} /></span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PanduanPage() {
  const [kitAktif, setKitAktif] = useState(KIT[0].family);
  const kit = KIT.find((k) => k.family === kitAktif) ?? KIT[0];

  return (
    <div className="fade-up guide">
      <div className="card guide-intro">
        <p className="guide-lead">
          Cara menyambungkan trainer kit ROBODU ke Master Board, menghubungkannya ke robodu.id, lalu
          menjalankan tiap kit dengan aman.
        </p>
        <div className="field-label">Alur data</div>
        <div className="guide-flow">
          {ALUR.map((a, i) => (
            <span key={a} className="guide-flow-item">
              <span className="guide-flow-box">{a}</span>
              {i < ALUR.length - 1 && <span className="guide-flow-arrow" aria-hidden>→</span>}
            </span>
          ))}
        </div>
        <nav className="guide-toc" aria-label="Daftar isi">
          {BAGIAN.map((b, i) => (
            <a key={b.id} href={`#${b.id}`} className="guide-toc-item">
              <span>{String(i + 1).padStart(2, "0")}</span> {b.label}
            </a>
          ))}
        </nav>
      </div>

      <Bagian id="persiapan" no={1} judul="Persiapan" sub="Siapkan ini sebelum mulai.">
        <div className="card">
          <Cek items={PERSIAPAN} />
        </div>
      </Bagian>

      <Bagian id="kabel" no={2} judul="Koneksi Kabel" sub="Menyambungkan trainer kit ke Master Board lewat kabel JST.">
        <div className="guide-grid">
          <div className="card">
            <DaftarLangkah items={KONEKSI_KABEL} />
          </div>
          <div className="card">
            <div className="card-title">Slot JST Master Board</div>
            <div className="guide-table-wrap">
              <table className="guide-table">
                <thead>
                  <tr>
                    <th>Slot</th>
                    <th>Trainer kit</th>
                    <th>ID robot</th>
                  </tr>
                </thead>
                <tbody>
                  {SLOT_JST.map((s) => (
                    <tr key={s.jst}>
                      <td><span className="guide-pill">JST-{s.jst}</span></td>
                      <td>{s.icon} {s.kit}</td>
                      <td><code>{s.id}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="guide-note">
              N = nomor Master Board (1, 2, atau 3). Contoh: Rotary di Master Board 2 bernama <code>rot_pend_2</code>.
            </p>
          </div>
        </div>
      </Bagian>

      <Bagian id="wifi" no={3} judul="Setup WiFi Master Board" sub="Cukup sekali per lokasi. Tidak perlu laptop atau upload ulang firmware.">
        <div className="card">
          <DaftarLangkah items={SETUP_WIFI} />
        </div>
      </Bagian>

      <Bagian id="web" no={4} judul="Menghubungkan di robodu.id">
        <div className="card">
          <DaftarLangkah items={DI_WEB} />
        </div>
      </Bagian>

      <Bagian id="kit" no={5} judul="Penggunaan per Kit" sub="Pilih trainer kit yang akan dipakai.">
        <div className="guide-tabs" role="tablist">
          {KIT.map((k) => (
            <button
              key={k.family}
              role="tab"
              aria-selected={k.family === kitAktif}
              className={"guide-tab" + (k.family === kitAktif ? " active" : "")}
              onClick={() => setKitAktif(k.family)}
            >
              <span aria-hidden>{k.icon}</span> {k.nama}
            </button>
          ))}
        </div>

        <div className="card guide-kit" role="tabpanel">
          <div className="card-title">
            <span className="card-title-robot">
              <span className="card-title-emoji">{kit.icon}</span>
              {kit.nama}
            </span>
          </div>
          <p className="guide-sub guide-kit-sum">{kit.ringkas}</p>
          <div className="guide-setpoint">
            <span>Setpoint</span>
            <b>{kit.setpoint}</b>
          </div>
          {kit.peringatan && (
            <div className="guide-warn">
              <Icon name="alert" size={16} />
              <span>{kit.peringatan}</span>
            </div>
          )}

          <div className="guide-grid guide-kit-grid">
            <div>
              <div className="field-label">Sebelum Start</div>
              <Cek items={kit.sebelumStart} />
            </div>
            <div>
              <div className="field-label">Menjalankan</div>
              <DaftarLangkah items={kit.langkah} />
            </div>
            <div>
              <div className="field-label">Saat berjalan</div>
              <Cek items={kit.saatBerjalan} />
            </div>
            <div>
              <div className="field-label">Menghentikan</div>
              <Cek items={kit.berhenti} />
            </div>
          </div>
        </div>
      </Bagian>

      <Bagian id="pengaman" no={6} judul="Keamanan" sub="Pengaman yang bekerja otomatis, dan yang tetap harus dilakukan pengguna.">
        <div className="guide-grid">
          {PENGAMAN.map((p) => (
            <div key={p.judul} className="card">
              <div className="guide-step-title">{p.judul}</div>
              <div className="guide-step-body">{p.isi}</div>
            </div>
          ))}
        </div>
      </Bagian>

      <Bagian id="status" no={7} judul="Arti Status di Dashboard">
        <div className="card">
          <ul className="guide-status">
            {STATUS_KIT.map((s) => (
              <li key={s.label}>
                <span className={"chip " + (s.warna === "teal" ? "chip-teal" : s.warna === "warn" ? "chip-warn" : "chip-red")}>
                  {s.label}
                </span>
                <span>{s.arti}</span>
              </li>
            ))}
          </ul>
        </div>
      </Bagian>

      <Bagian id="tuning" no={8} judul="Tips Tuning PID" sub="Urutan yang aman: Kp, lalu Kd, terakhir Ki.">
        <div className="card">
          <DaftarLangkah items={TUNING.map((t) => ({ judul: t }))} />
        </div>
      </Bagian>

      <Bagian id="masalah" no={9} judul="Mengatasi Masalah">
        <div className="guide-faq">
          {MASALAH.map((m) => (
            <details key={m.gejala} className="guide-faq-item">
              <summary>{m.gejala}</summary>
              <div className="guide-faq-body">
                <div><span className="guide-label">Penyebab</span>{m.penyebab}</div>
                <div><span className="guide-label">Solusi</span>{m.solusi}</div>
              </div>
            </details>
          ))}
        </div>
      </Bagian>
    </div>
  );
}
