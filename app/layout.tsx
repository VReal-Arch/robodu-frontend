import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export const metadata: Metadata = {
  title: "Robo-du Dashboard",
  description: "Monitoring & tuning untuk 5 trainer kit kendali keseimbangan ROBODU",
};

// Set theme before paint to avoid a flash / hydration mismatch.
const themeScript = `
(function(){try{
  var t=localStorage.getItem('robodu-theme');
  if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){
    document.documentElement.classList.add('dark');
  }
}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Fonts load via <link> with preconnect. Loading them with @import
            inside globals.css chained the requests (CSS -> discover import ->
            fetch fonts) and blocked first render. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Space+Mono:wght@400;700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          <div className="app">
            <Sidebar />
            <div className="main">
              <Topbar />
              <div className="content">{children}</div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
