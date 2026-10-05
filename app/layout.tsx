import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import PageHero from "@/components/PageHero";

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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          <div className="app">
            <Sidebar />
            <div className="main">
              <Topbar />
              <div className="content">
                <PageHero />
                <div className="page-body">{children}</div>
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
