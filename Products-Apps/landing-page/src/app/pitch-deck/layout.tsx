import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Queens OS | Investor Pitch Deck",
  description: "Queens OS — Seed Stage Pitch Deck. The Operating System for Transportation.",
};

export default function PitchDeckLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
