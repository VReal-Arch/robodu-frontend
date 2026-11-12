// ============================================================================
//  Isi halaman Panduan (/panduan): tata cara koneksi dan penggunaan alat.
//  Semua teks ada di sini supaya bisa diperbarui tanpa menyentuh tampilan.
//  Sumber: firmware robodu-master-homing + README firmware slave tiap kit.
// ============================================================================
import { RobotFamily } from "./types";

export interface Langkah {
  judul: string;
  isi?: string;
  catatan?: string; // ditampilkan sebagai catatan kecil di bawah langkah
}

export interface SlotJst {
  jst: number;
  kit: string;
  icon: string;
  alamat: string;
  id: string; // pola ID robot, N = nomor Master Board
}

export interface PanduanKit {
  family: RobotFamily;
  nama: string;
  icon: string;
  ringkas: string;
  setpoint: string;
  peringatan?: string;
  sebelumStart: string[];
  langkah: Langkah[];
  saatBerjalan: string[];
  berhenti: string[];
}

export interface Masalah {
  gejala: string;
  penyebab: string;
  solusi: string;
}

export const ALUR = ["Trainer kit (slave)", "Master Board", "WiFi", "Server", "robodu.id"];

export const SLOT_JST: SlotJst[] = [
  { jst: 1, kit: "Ball & Beam", icon: "⚪", alamat: "0x10", id: "ball_beam_N" },
  { jst: 2, kit: "Bi-rotor Trainer", icon: "🚁", alamat: "0x11", id: "bi_rotor_N" },
  { jst: 3, kit: "Linear Inverted Pendulum", icon: "📏", alamat: "0x12", id: "lin_pend_N" },
  { jst: 4, kit: "Rotary Inverted Pendulum", icon: "🔄", alamat: "0x13", id: "rot_pend_N" },
  { jst: 5, kit: "Humanoid Platform", icon: "🤖", alamat: "0x14", id: "humanoid_N" },
];

export const PERSIAPAN: string[] = [
  "Master Board, kabel JST untuk tiap trainer kit, dan catu daya masing-masing kit.",
  "Catu daya Master Board yang stabil dan cukup kuat. Jangan hanya mengandalkan port USB laptop saat kit ikut tersambung.",
  "Jaringan WiFi 2,4 GHz yang terhubung ke internet. ESP32 tidak bisa memakai WiFi 5 GHz.",
  "Laptop atau HP dengan browser untuk membuka robodu.id.",
  "Area kerja yang kosong di sekitar bagian alat yang bergerak.",
];

export const KONEKSI_KABEL: Langkah[] = [
  {
    judul: "Matikan semua daya",
    isi: "Cabut catu daya Master Board dan semua trainer kit sebelum memasang atau mencabut kabel JST.",
  },
  {
    judul: "Colok kabel JST sesuai slot",
    isi: "Setiap kit punya slot JST sendiri di Master Board (lihat tabel). Kit yang dicolok ke slot yang salah tidak akan terbaca.",
    catatan: "Slot boleh dibiarkan kosong. Kit yang tidak tercolok tetap tampil di dashboard dengan status fault.",
  },
  {
    judul: "Nyalakan trainer kit dulu, lalu Master Board",
    isi: "Dengan urutan ini Master Board langsung menemukan semua kit saat memindai slot JST ketika menyala.",
  },
  {
    judul: "Satu Master Board untuk satu set kit",
    isi: "Ada 3 Master Board. Master Board 1 memegang unit 1 dari tiap kit, Master Board 2 unit 2, dan Master Board 3 unit 3.",
  },
];

export const SETUP_WIFI: Langkah[] = [
  {
    judul: "Nyalakan Master Board",
    isi: "Kalau board sudah pernah tersambung ke WiFi yang sama, langkah 2–5 dilewati dan board langsung tersambung sendiri.",
  },
  {
    judul: "Sambungkan HP ke hotspot ROBODU-Setup",
    isi: "Hotspot ini muncul kalau board belum punya WiFi tersimpan atau jaringannya tidak ditemukan. Password hotspot bisa ditanyakan ke pengelola lab.",
  },
  {
    judul: "Isi jaringan WiFi dan ID robot",
    isi: "Halaman setup terbuka otomatis. Pilih WiFi 2,4 GHz, isi passwordnya, lalu isi ID robot untuk slot 1–5 sesuai nomor Master Board (contoh Master Board 1: ball_beam_1, bi_rotor_1, lin_pend_1, rot_pend_1, humanoid_1).",
  },
  {
    judul: "Simpan",
    isi: "Board menyimpan WiFi dan ID secara permanen, lalu tersambung ke server. Tidak perlu upload ulang firmware.",
    catatan: "Halaman setup tertutup sendiri setelah 3 menit tanpa diisi, lalu board menyala ulang.",
  },
  {
    judul: "Ganti WiFi atau ID robot",
    isi: "Nyalakan board seperti biasa, lalu dalam 5 detik pertama tekan tombol BOOT dan tahan 3 detik. Hotspot ROBODU-Setup akan muncul lagi.",
    catatan: "Jangan menahan tombol BOOT saat board baru dinyalakan, karena board akan masuk mode upload dan tidak berjalan.",
  },
];

export const DI_WEB: Langkah[] = [
  {
    judul: "Buka robodu.id",
    isi: "Pastikan status server di halaman Settings menunjukkan Online.",
  },
  {
    judul: "Hubungkan robot di Settings",
    isi: "Tekan Connect pada unit yang akan dipakai, atau Hubungkan Semua. Robot yang Master Board-nya menyala akan mulai mengirim data dalam beberapa detik.",
  },
  {
    judul: "Pilih robot di Control & Tuning",
    isi: "Pilih kit dan nomor unitnya dari daftar robot di bagian atas halaman.",
  },
  {
    judul: "Ikuti langkah sesuai kit",
    isi: "Setiap kit punya urutan sendiri (lihat bagian Penggunaan per Kit). Kit berjalan setelah Start Balancing ditekan. Rotary dan Linear wajib homing dulu lewat tombol Mulai Homing.",
  },
  {
    judul: "Pantau dan atur",
    isi: "Grafik sudut atau posisi tampil langsung. Setpoint dan nilai Kp, Ki, Kd bisa diubah saat kit berjalan. Grafik lengkap ada di halaman Data & Charts.",
  },
  {
    judul: "Selesai",
    isi: "Tekan Stop, tunggu bagian yang bergerak diam, lalu matikan daya kit dan Master Board.",
  },
];

export const KIT: PanduanKit[] = [
  {
    family: "rot_pend",
    nama: "Rotary Inverted Pendulum",
    icon: "🔄",
    ringkas: "Lengan diputar motor untuk menjaga pendulum tetap tegak.",
    setpoint: "Sudut pendulum, −8° sampai 8°",
    sebelumStart: [
      "Putar lengan dengan tangan ke tengah mekaniknya.",
      "Biarkan pendulum menggantung diam ke bawah, jangan disentuh.",
    ],
    langkah: [
      {
        judul: "Tekan Mulai Homing",
        isi: "Kit mengamati lengan dan pendulum selama sekitar 1 detik lalu menjadikannya posisi nol. Motor tidak bergerak selama homing.",
        catatan: "Kalau lengan atau pendulum masih bergoyang, homing diulang otomatis. Setelah 20 detik masih bergerak, homing dinyatakan gagal: diamkan lalu tekan Mulai Homing lagi.",
      },
      { judul: "Tunggu status Sudah homing", isi: "Tombol Start Balancing baru aktif setelah homing selesai." },
      { judul: "Tekan Start Balancing", isi: "Kit mulai menegakkan pendulum." },
    ],
    saatBerjalan: [
      "Setpoint dan gain PID bisa diubah dari dashboard.",
      "Jauhkan tangan dan kabel dari jangkauan putaran lengan.",
    ],
    berhenti: [
      "Tekan Stop. Status homing tetap tersimpan selama kit tidak dimatikan.",
      "Tekan Homing Ulang kalau kit baru dinyalakan atau lengan sempat diputar dengan tangan.",
    ],
  },
  {
    family: "lin_pend",
    nama: "Linear Inverted Pendulum",
    icon: "📏",
    ringkas: "Kereta bergerak di rel untuk mengayun pendulum ke atas lalu menjaganya tetap tegak.",
    setpoint: "Diabaikan: pendulum selalu ditegakkan di 0°",
    peringatan: "Kereta bergerak cepat sepanjang rel saat homing dan swing-up. Kosongkan rel dan jauhkan tangan.",
    sebelumStart: [
      "Pastikan rel kosong dan kedua limit switch tidak tertekan.",
      "Biarkan pendulum menggantung diam ke bawah.",
    ],
    langkah: [
      {
        judul: "Tekan Mulai Homing",
        isi: "Kereta bergerak menyentuh limit kiri dan kanan untuk mengukur panjang rel, lalu berhenti di tengah. Tunggu sampai status Sudah homing.",
        catatan: "Kalau kereta tidak bergerak dan homing gagal, periksa catu motor 12 V dan limit switch, lalu tekan Mulai Homing lagi.",
      },
      { judul: "Tekan Start Balancing", isi: "Tombol ini baru aktif setelah homing selesai." },
      { judul: "Swing-up", isi: "Kereta mengayun pendulum bolak-balik sampai cukup tinggi." },
      { judul: "Balancing", isi: "Begitu pendulum dekat posisi tegak, kit berpindah ke mode balancing dan kereta kembali ke tengah rel." },
    ],
    saatBerjalan: [
      "Kalau pendulum jatuh, kit otomatis melakukan swing-up lagi.",
      "Kereta yang ditahan atau macet membuat kit berhenti dengan status fault.",
      "Gain PID bisa diubah dari dashboard (satuan PWM).",
    ],
    berhenti: [
      "Tekan Stop. Motor langsung mati dan pendulum jatuh ke bawah dengan sendirinya.",
      "Status homing tetap tersimpan. Tekan Homing Ulang kalau kit baru dinyalakan atau kereta sempat digeser dengan tangan.",
    ],
  },
  {
    family: "ball_beam",
    nama: "Ball & Beam",
    icon: "⚪",
    ringkas: "Bilah dimiringkan motor stepper untuk menahan bola di posisi setpoint.",
    setpoint: "Posisi bola, −12 cm sampai 12 cm dari tengah",
    sebelumStart: [
      "Letakkan bola di tengah bilah.",
      "Pastikan tidak ada benda yang menghalangi sensor jarak di ujung bilah.",
    ],
    langkah: [
      { judul: "Tekan Start Balancing", isi: "Bilah naik dari penahan bawah ke posisi datar." },
      { judul: "Kendali aktif", isi: "Setelah datar, kit mulai menahan bola di setpoint." },
      { judul: "Ubah setpoint", isi: "Geser setpoint untuk memindahkan bola sepanjang bilah." },
    ],
    saatBerjalan: [
      "Sensor yang tertutup tangan membuat bilah turun otomatis dalam 0,2 detik.",
      "Bola yang terlempar keluar bilah: tekan Stop, letakkan bola di tengah, lalu Start lagi.",
    ],
    berhenti: ["Tekan Stop. Bilah turun pelan ke penahan bawah, lalu motor dimatikan."],
  },
  {
    family: "bi_rotor",
    nama: "Bi-rotor Trainer",
    icon: "🚁",
    ringkas: "Dua motor baling-baling di ujung batang menjaga sudut batang sesuai setpoint.",
    setpoint: "Sudut batang, −30° sampai 30°",
    peringatan: "Baling-baling berputar sangat cepat dan tajam. Gunakan pelindung mata, pastikan baling-baling terpasang kencang, dan jangan berada sejajar dengan bidang putarnya.",
    sebelumStart: [
      "Sambungkan baterai, lalu tunggu sekitar 3 detik sampai ESC selesai arming.",
      "Pastikan batang tidak miring lebih dari 40°. Start ditolak kalau batang terlalu miring.",
      "Kosongkan area di sekitar baling-baling.",
    ],
    langkah: [
      { judul: "Tekan Start Balancing", isi: "Putaran motor naik bertahap selama sekitar 1,5 detik." },
      { judul: "Batang terangkat", isi: "Batang bergerak menuju setpoint dengan kecepatan paling tinggi 20° per detik." },
    ],
    saatBerjalan: [
      "Batang yang miring lebih dari 45° membuat motor langsung berhenti (fault).",
      "Ubah setpoint dan gain sedikit demi sedikit.",
    ],
    berhenti: ["Tekan Stop. Tunggu baling-baling benar-benar berhenti sebelum menyentuh alat, lalu cabut baterai."],
  },
  {
    family: "humanoid",
    nama: "Humanoid Platform",
    icon: "🤖",
    ringkas: "Robot humanoid dengan pilihan gerak idle, stand, balance, dan walk.",
    setpoint: "Tidak ada setpoint: yang dipilih adalah mode gerak (gait)",
    peringatan: "Kit ini masih dalam pengembangan. Gerakan servo bisa berubah sewaktu-waktu.",
    sebelumStart: ["Letakkan robot di permukaan datar dengan ruang kosong di sekitarnya."],
    langkah: [
      { judul: "Pilih gait", isi: "Pilih stand, balance, atau walk dari dashboard." },
      { judul: "Kembali ke idle", isi: "Pilih idle untuk menghentikan gerak dan kembali ke pose aman." },
    ],
    saatBerjalan: ["Robot yang miring terlalu jauh dianggap jatuh: gerak berhenti dan statusnya fault sampai gait dipilih lagi."],
    berhenti: ["Pilih idle atau tekan Stop."],
  },
];

export const PENGAMAN: { judul: string; isi: string }[] = [
  {
    judul: "E-STOP menghentikan semua kit",
    isi: "Tombol E-Stop di pojok kanan atas menghentikan semua kit sekaligus, bukan hanya kit yang sedang dibuka. Tekan Reset E-Stop, lalu Start lagi kit yang ingin dijalankan.",
  },
  {
    judul: "Koneksi putus = kit berhenti",
    isi: "Kalau WiFi Master Board putus, koneksi ke server hilang, atau server tidak menerima data selama 6 detik, kit yang sedang berjalan dihentikan otomatis.",
  },
  {
    judul: "Kabel JST lepas = kit berhenti",
    isi: "Trainer kit menghentikan motornya sendiri kalau tidak mendengar Master Board selama 2 detik.",
  },
  {
    judul: "Start tetap harus ditekan ulang",
    isi: "Setelah koneksi pulih, dashboard menyambung lagi otomatis, tetapi kit tidak berjalan sendiri. Periksa alat dulu, lalu tekan Start.",
  },
];

export const STATUS_KIT: { label: string; warna: "teal" | "warn" | "red"; arti: string }[] = [
  { label: "Online", warna: "teal", arti: "Robot tersambung dan data mengalir." },
  { label: "Menyambung…", warna: "warn", arti: "Koneksi putus sesaat. Dashboard menunggu robot kembali dan menyambung sendiri." },
  { label: "Offline", warna: "red", arti: "Robot belum dihubungkan di Settings atau Master Board-nya mati." },
  { label: "idle", warna: "teal", arti: "Kit tersambung, motor diam, siap di-Start." },
  { label: "homing", warna: "warn", arti: "Kit sedang mencari posisi nol." },
  { label: "balancing", warna: "teal", arti: "Kit sedang berjalan." },
  { label: "fault", warna: "red", arti: "Kit berhenti karena gangguan: sensor, batas sudut, kabel JST, atau slot kosong. Periksa alat lalu tekan Start atau Stop." },
];

export const TUNING: string[] = [
  "Mulai dari nilai bawaan. Simpan nilai yang sudah bagus sebagai preset.",
  "Naikkan Kp sampai alat cukup cepat merespons tetapi belum bergetar.",
  "Naikkan Kd untuk meredam ayunan atau getaran.",
  "Tambahkan Ki sedikit saja kalau alat tidak pernah tepat di setpoint.",
  "Ubah satu nilai saja setiap kali, dan amati grafik minimal beberapa detik.",
  "Kalau alat mulai liar, tekan Stop lalu kembalikan nilai terakhir yang stabil.",
];

export const MASALAH: Masalah[] = [
  {
    gejala: "Semua robot Offline",
    penyebab: "Master Board mati, belum tersambung WiFi, atau robot belum dihubungkan di Settings.",
    solusi: "Periksa daya Master Board. Kalau hotspot ROBODU-Setup muncul, isi ulang WiFi. Hubungkan robot di Settings.",
  },
  {
    gejala: "Satu kit selalu fault, kit lain normal",
    penyebab: "Kabel JST kit itu lepas, dicolok ke slot yang salah, atau kit belum dinyalakan.",
    solusi: "Matikan daya, periksa kabel dan nomor slot JST, nyalakan kit, lalu nyalakan ulang Master Board.",
  },
  {
    gejala: "Status sering berganti ke Menyambung…",
    penyebab: "Sinyal WiFi di dekat Master Board lemah atau internet tidak stabil.",
    solusi: "Dekatkan Master Board ke router atau pindahkan router. Gunakan jaringan yang tidak terlalu ramai.",
  },
  {
    gejala: "Master Board menyala ulang terus",
    penyebab: "Catu daya kurang kuat (brownout), terutama saat WiFi menyala.",
    solusi: "Ganti adaptor yang lebih kuat atau beri catu terpisah untuk kit. Jangan hanya memakai USB laptop.",
  },
  {
    gejala: "Rotary / Linear: Start tidak berjalan",
    penyebab: "Homing belum dilakukan atau homing gagal, sehingga Start Balancing terkunci.",
    solusi: "Tekan Mulai Homing dan tunggu sampai Sudah homing. Rotary: lengan di tengah dan pendulum diam. Linear: rel kosong dan catu motor 12 V menyala.",
  },
  {
    gejala: "Kit langsung fault setelah Start",
    penyebab: "Alat di luar batas aman: sudut terlalu miring, kereta macet, atau sensor tertutup.",
    solusi: "Kembalikan alat ke posisi awal sesuai panduan kit, lalu Start lagi.",
  },
  {
    gejala: "Perintah dari web tidak berpengaruh",
    penyebab: "Koneksi ke server terputus. Log aktivitas akan menampilkan perintah tidak terkirim.",
    solusi: "Periksa internet laptop. Halaman akan menyambung lagi otomatis, kalau tidak, muat ulang halaman.",
  },
];
