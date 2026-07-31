/** @type {import("next").NextConfig} */
const nextConfig = {
  // Dashboard ini sepenuhnya berjalan di browser (data masuk lewat WebSocket),
  // jadi bisa diekspor jadi file statis. Hasilnya ada di folder out/ dan tinggal
  // diupload ke public_html Hostinger, tanpa perlu slot Node.js app.
  // Kalau suatu saat butuh fitur server Next.js, hapus baris output di bawah.
  output: "export",
  images: { unoptimized: true },
};
export default nextConfig;
