"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useModal } from "@/context/ModalContext";
import AppShowcase from "./AppShowcase";

export default function FooterCTA() {
  const { openDemoModal, openContactModal } = useModal();

  return (
    <footer className="section-wrapper bg-background border-t border-white/5">
      <div className="absolute inset-0 bg-grid-white opacity-5 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-gradient-to-t from-primary/8 to-transparent blur-[120px] pointer-events-none" />

      <div className="section-inner text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl lg:text-8xl font-bold font-outfit mb-8 leading-[1.05] tracking-tight">
            Transportation Will Run <br />
            <span className="text-primary">on Intelligence.</span>
          </h2>
          <p className="text-xl text-foreground-muted mb-12 text-center mx-auto leading-relaxed">
            Queens OS is building the coordination layer powering the future of global mobility.
          </p>

          {/* <div className="mb-24 py-12">
            <AppShowcase />
          </div> */}

          <div style={{ marginTop: "20px", padding: "20px" }} className="flex flex-wrap items-center justify-center gap-4 mb-24">
            <button
              onClick={openDemoModal}
              className="px-8 py-4 bg-primary butten-padded text-black font-bold text-base rounded-2xl hover:bg-primary-dark transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-[0_0_32px_rgba(255,184,0,0.3)]"
            >
              Book a Demo
            </button>
            <button className="px-8 py-4 butten-padded glass text-white font-bold text-base rounded-2xl border-white/10 hover:bg-white/5 transition-all duration-200" onClick={openContactModal}>
              Contact Us
            </button>
          </div>

          {/* Footer row */}
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Queens OS Logo" className="w-9 h-9 object-contain" />
              <span className="font-bold text-xl font-outfit">Queens OS</span>
            </div>
            <p className="text-sm text-foreground-muted">
              © 2026 Queens Inc. All rights reserved. Built for the World.
            </p>
            <div className="flex gap-8 text-sm font-medium text-foreground-muted">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            </div>
          </div>
        </motion.div>
      </div >
    </footer >
  );
}
