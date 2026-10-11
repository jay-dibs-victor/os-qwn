import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Queens OS | The Operating System for Transportation",
  description: "Queens OS unifies ride-hailing, logistics, payments, routing, and AI-powered mobility coordination into one intelligent infrastructure layer.",
};

import { ModalProvider } from "@/context/ModalContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}
