import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// paytm.com uses Inter (variable, 100–900). Inter is SIL OFL — self-hosted here via next/font.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Small mono status labels only. JetBrains Mono is SIL OFL.
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-mono-jb", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://pi.global"),
  title: "Pi Agents — AI Agents by Paytm",
  description: "Get more customers per dollar, earn more dollars per customer",
  openGraph: {
    title: "Pi Agents — AI Agents by Paytm",
    description: "Get more customers per dollar, earn more dollars per customer",
    siteName: "Pi Agents — AI Agents by Paytm",
    type: "website",
  },
  twitter: { card: "summary_large_image", description: "Get more customers per dollar, earn more dollars per customer" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#002970" },
    { media: "(prefers-color-scheme: dark)", color: "#060d1f" },
  ],
  colorScheme: "light dark",
  viewportFit: "cover",
};

// Runs before first paint: saved choice wins, else the system setting. Never hides content.
const themeScript = `(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;r.setAttribute('data-theme',d?'dark':'light');r.style.colorScheme=d?'dark':'light';if(s){var m=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<m.length;i++)m[i].setAttribute('content',d?'#08152f':'#002970')}}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
