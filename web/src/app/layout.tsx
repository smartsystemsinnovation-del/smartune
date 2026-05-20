import type { Metadata } from "next";
import { Inter, Vazirmatn, Roboto } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import Sidebar from "@/components/Sidebar";
import Navigation from "@/components/Navigation";
import RealtimeListener from "@/components/RealtimeListener";
import AdsterraInterstitialModal from "@/components/AdsterraInterstitialModal";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const vazirmatn = Vazirmatn({ subsets: ["arabic", "latin"], variable: "--font-vazirmatn" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-roboto" });

export const metadata: Metadata = {
  title: "Smartune - Aprende Música Rápido",
  description: "Learn music with Spaced Repetition (Ebbinghaus Curve).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8388922041059415" 
          crossOrigin="anonymous" 
        ></script>
      </head>
      <body className={`${inter.variable} ${vazirmatn.variable} ${roboto.variable}`}>
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            <Navigation />
            {children}
          </div>
        </div>
        <Analytics />
        <RealtimeListener />
        <AdsterraInterstitialModal />
      </body>
    </html>
  );
}