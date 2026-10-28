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

export const viewport: Viewport = { themeColor: "#002970" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <head>
        {/* Enables scroll-reveal styles only when JS runs, so content is never hidden without JS */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
