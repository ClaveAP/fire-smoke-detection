import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AegisFlame — Deteksi Api & Asap Real-Time",
  description:
    "Sistem deteksi dini api dan kepulan asap berbasis computer vision langsung di browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${poppins.variable} ${jetbrainsMono.variable} font-sans bg-[#050507] text-[#f5f5f7] min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
