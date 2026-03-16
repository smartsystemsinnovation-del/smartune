import type { Metadata } from "next";
import { Inter, Vazirmatn } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"; // <-- 1. Agrega esta importación aquí arriba

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const vazirmatn = Vazirmatn({ subsets: ["arabic", "latin"], variable: "--font-vazirmatn" });

export const metadata: Metadata = {
  title: "Smartune - Aprende Música Rápido",
  description: "Learn music with Spaced Repetition (Ebbinghaus Curve).",
};

import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${vazirmatn.variable}`}>
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            {children}
          </div>
        </div>
        <Analytics /> {/* <-- 2. Pon el componente justo antes de cerrar el body */}
      </body>
    </html>
  );
}