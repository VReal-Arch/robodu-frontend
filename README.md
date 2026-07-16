# ROBODU Web Dashboard

Dashboard monitoring & tuning untuk **5 trainer kit kendali keseimbangan** (Ball & Beam, Bi-rotor, Linear/Rotary Inverted Pendulum, Humanoid). Dibangun dengan **Next.js (App Router) + TypeScript**.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
```

Build production:

```bash
npm run build && npm start
```

## Fitur

- Pemilih robot (dropdown, hanya di Dashboard)
- Tuning **PID (Kp/Ki/Kd)** + **Setpoint** per robot
- **Preset PID** — simpan / terapkan / hapus tuning (localStorage)
- Grafik real-time: setpoint vs actual, error, output PID — toggle **Gabung / Pisah**
- Input setpoint: **mouse / keypad / analog** (gamepad asli + demo joystick)
- Fail-safe: **E-Stop**, watchdog, auto-stop saat koneksi putus, modal notifikasi
- Dark mode, burger menu drawer

> Dashboard ini **live** — mengambil data telemetry dari backend lewat WebSocket
> dan mengirim perintah (setpoint, PID, start/stop, e-stop) balik ke backend.
> Robot muncul online otomatis saat ESP32-nya mengirim data. Tanpa backend yang
> jalan, semua robot tampil offline.

## Menyambung ke backend

Alamat WebSocket diatur lewat env (default `ws://localhost:4000/ws`):

```bash
cp .env.local.example .env.local   # ubah NEXT_PUBLIC_WS_URL jika perlu
```

Urutan menjalankan sistem lengkap:

```bash
# di project backend
docker compose up -d      # broker MQTT + PostgreSQL
npm run dev               # backend (ws://localhost:4000)
npm run mock              # 5 ESP32 palsu (opsional, buat tes tanpa hardware)

# di project ini (frontend)
npm run dev               # http://localhost:3000
```

Data langsung mengalir ke grafik, dan menggeser PID/setpoint di web diteruskan ke robot.

## Struktur

```
app/                halaman (layout, dashboard, control, data, settings)
components/          komponen UI (charts, panel kontrol, sidebar, dll)
hooks/              useInputDevices (keyboard + gamepad)
lib/
  types.ts          tipe data
  robots.ts         konfigurasi 5 robot
  engine.ts         SIMULASI  ← titik ganti ke WebSocket
  presets.ts        penyimpanan preset (localStorage)
  control.ts        helper gating kontrol
store/store.ts      state global (Zustand)
```

## Integrasi WebSocket (untuk backend)

Arsitektur sengaja memisahkan **state/UI** dari **sumber data**. Untuk menyambungkan ke backend real, fokus di dua titik:

**1. Telemetry masuk** — ganti isi `engine.tick()` di `lib/engine.ts`. Alih-alih menghitung fisika, isi ring buffer tiap robot dari pesan telemetry yang datang:

```ts
// pseudocode di handler WebSocket onmessage
const msg = JSON.parse(ev.data);        // { type:"telemetry", robotId, setpoint, actual, error, output, ... }
engine.pushTelemetry(msg.robotId, msg); // dorong ke buffer sp/y/e/u
```

**2. Command keluar** — di `store/store.ts`, action seperti `setPid`, `setSetpoint`, `setRunning`, `emergencyStop` saat ini hanya mengubah state lokal. Tambahkan pengiriman pesan command:

```ts
ws.send(JSON.stringify({
  type: "command",
  robotId,
  source: "web",
  action: "set_pid",          // set_setpoint | set_pid | start | stop | estop | set_gait
  payload: { kp, ki, kd },
}));
```

Format pesan (telemetry / command / heartbeat) ada di dokumen arsitektur backend. UI tidak perlu diubah — cukup ganti sumber datanya.
