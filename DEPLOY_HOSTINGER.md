# Deploy robodu.id ke Hostinger (Node.js Web App)

robodu.id dijalankan sebagai **aplikasi Node.js (server Next.js)**, bukan file
statis di `public_html`. Jadi yang di-deploy adalah **kode lengkap** ini, lalu
Hostinger yang menjalankan `npm install`, `npm run build`, dan `npm start`.

## Pengaturan aplikasi di hPanel

| Pengaturan | Nilai |
|---|---|
| Framework | Next.js |
| Versi Node.js | 20.x (minimal 18.18) |
| Root directory | folder yang berisi `package.json` ini |
| Install command | `npm install` |
| Build command | `npm run build` |
| Start command | `npm start` |
| Output directory | `.next` (kalau diminta) |
| Environment variable | `NEXT_PUBLIC_WS_URL` = `wss://api.robodu.id/ws` |

Environment variable sudah ada juga di file `.env.production`, jadi build tetap
benar walau belum diisi di hPanel. Kalau diisi di hPanel, nilai hPanel yang dipakai.
Port tidak perlu diatur: `npm start` otomatis memakai port dari Hostinger.

## Langkah deploy

1. hPanel → **Websites** → robodu.id → bagian **Node.js** (aplikasi yang sudah ada).
2. Ganti sumber kodenya dengan isi zip ini:
   - **Lewat GitHub**: push isi folder ini ke repo yang tersambung, lalu tekan
     **Redeploy** / **Deploy**.
   - **Upload file**: upload zip ini sebagai sumber baru (jangan ikutkan folder
     `node_modules` dan `.next`), lalu **Deploy**.
3. Tunggu build selesai. Di log build harus ada daftar halaman:
   `/`, `/control`, `/data`, `/panduan`, `/settings`.
4. Kalau Hostinger CDN aktif, tekan **Clear cache** / **Purge**.
5. Buka https://robodu.id dengan **Ctrl+F5**, lalu cek:
   - menu **Panduan** ada di bar atas,
   - https://robodu.id/panduan terbuka,
   - Settings menunjukkan **Server — Online**.

## Bersihkan sisa upload statis

File hasil upload statis sebelumnya di `public_html` (misalnya `index.html`,
`panduan.html`, folder `_next`) tidak dipakai server Node.js. Kembalikan
`public_html` dari backup atau hapus file-file itu supaya tidak membingungkan.

## Cek di laptop sebelum deploy (opsional)

```bash
npm install
npm run build
npm start          # http://localhost:3000
```

## Mode statis (hanya kalau suatu saat pindah ke public_html)

Set `STATIC_EXPORT=1` sebelum `npm run build`. Hasilnya ada di folder `out/` dan
diupload ke `public_html` (file `public/.htaccess` ikut ter-copy). Mode ini
**tidak** dipakai robodu.id sekarang.

## Isi versi ini (10 November 2026)

- Halaman baru **/panduan**: tata cara koneksi dan penggunaan alat. Teksnya di
  `lib/panduan.ts`.
- Koneksi lebih tahan putus: robot yang putus sesaat tersambung lagi otomatis,
  status "Menyambung…", ping WebSocket (aktif kalau backend sudah mendukung),
  peringatan saat perintah tidak terkirim.
- Pesan homing Rotary disesuaikan (lengan di tengah, pendulum diam).
- Tombol E-Stop tidak lagi terdorong keluar layar pada lebar 1024–1279 px.
