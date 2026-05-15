import type { Metadata } from "next";
import { Inter, Vazirmatn } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"; // <-- Analíticas
import Script from "next/script"; // <-- AdSense Script
import Sidebar from "@/components/Sidebar"; // <-- Sidebar movido hacia arriba
import Navigation from "@/components/Navigation";
import RealtimeListener from "@/components/RealtimeListener";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const vazirmatn = Vazirmatn({ subsets: ["arabic", "latin"], variable: "--font-vazirmatn" });

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
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8388922041059415" 
          crossOrigin="anonymous" 
          strategy="lazyOnload"
        />
      </head>
      <body className={`${inter.variable} ${vazirmatn.variable}`}>
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            <Navigation />
            {children}
          </div>
        </div>
        <Analytics />
        <RealtimeListener />
      </body>
    </html>
  );
}