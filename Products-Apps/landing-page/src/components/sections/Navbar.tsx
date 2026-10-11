"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useModal } from "@/context/ModalContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openDemoModal, openProposalModal } = useModal();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{ padding: "16px" }}
      className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 ${scrolled || mobileMenuOpen
        ? "bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl"
        : "bg-transparent"
        }`}
    >
      {/* Desktop */}
      <div className="section-inner py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Queens OS Logo" width={36} height={36} className="object-contain" />
          <span className="font-bold text-lg font-outfit tracking-tight">Queens OS</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Pitch Deck", "Solution", "Ecosystem", "Metrics"].map((item) => (
            <a
              key={item}
              href={item === "Pitch Deck" ? "/pitch-deck" : `#${item.toLowerCase()}`}
              className="text-sm font-medium text-foreground-muted hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
          <button
            onClick={openProposalModal}
            className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors"
          >
            Business Proposal
          </button>
          <button
            onClick={openDemoModal}
            className="px-6 py-3 butten-padded bg-primary text-black font-bold text-sm rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-[0_0_16px_rgba(255,184,0,0.3)]"
          >
            Book a Demo
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 overflow-hidden bg-black/90 backdrop-blur-xl"
          >
            <div className="section-inner py-8 flex flex-col gap-6">
              {["Pitch Deck", "Solution", "Ecosystem", "Metrics"].map((item) => (
                <a
                  key={item}
                  href={item === "Pitch Deck" ? "/pitch-deck" : `#${item.toLowerCase()}`}
                  className="text-lg font-semibold hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openProposalModal();
                }}
                className="text-lg font-semibold text-left hover:text-primary transition-colors"
              >
                Business Proposal
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openDemoModal();
                }}
                className="w-full butten-padded  py-4 bg-primary text-black font-bold rounded-2xl text-base hover:bg-primary-dark transition-all duration-200"
              >
                Book a Demo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
