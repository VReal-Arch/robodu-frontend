/** @type {import("next").NextConfig} */
// Mode deploy:
//   - Node.js app (Hostinger "Node.js Web App", yang dipakai robodu.id)
//       npm run build  ->  npm start      (bawaan, tanpa setting apa pun)
//   - Hosting statis (upload folder out/ ke public_html)
//       set env STATIC_EXPORT=1 sebelum npm run build
// `output: "export"` TIDAK boleh aktif di mode Node.js: `next start` menolak
// berjalan dan hasil build tidak dipakai server.
const nextConfig = {
  ...(process.env.STATIC_EXPORT === "1" ? { output: "export" } : {}),
  images: { unoptimized: true },
  poweredByHeader: false,
};
export default nextConfig;
