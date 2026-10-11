import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Queens OS Partners | Global Mobility Partnership Network",
  description:
    "A partner application for fleets, travel operators, logistics providers, payment networks, governments, and infrastructure teams joining Queens OS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
