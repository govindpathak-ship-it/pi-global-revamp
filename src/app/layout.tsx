import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", weight: ["500", "600", "700"], display: "swap" });

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

export const viewport: Viewport = { themeColor: "#000c22" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <head>
        {/* Enables scroll-reveal styles only when JS runs, so content is never hidden without JS */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
