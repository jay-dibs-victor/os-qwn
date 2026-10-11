"use client";

import { motion } from "framer-motion";
import { FileText, Mail } from "lucide-react";
import { useModal } from "@/context/ModalContext";

export default function Investor() {
  const { openProposalModal } = useModal();
  return (
    <section className="section-wrapper bg-background">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mx-auto glass rounded-[40px] p-12 lg:p-20 text-center relative overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)", padding: "20px" }}

        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <h2 className="fluid-h2 font-bold font-outfit mb-6 leading-tight">
            Infrastructure for the <br />
            <span className="text-primary">Next Mobility Economy.</span>
          </h2>
          <p className="text-lg text-foreground-muted mb-12 text-center mx-auto leading-relaxed">
            Raising <span className="text-white font-bold">$1.8M – $3.5M</span> seed to execute focused market entry in Tier-1 megacities and validate unit economics before global expansion.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={openProposalModal}
              style={{ margin: "20px" }}
              className="inline-flex butten-padded items-center gap-2.5 px-10 py-5 bg-primary text-black font-bold text-base rounded-2xl hover:bg-primary-dark transition-all duration-200 shadow-[0_0_24px_rgba(255,184,0,0.3)]"
            >
              <FileText size={18} className="shrink-0" />
              View Executive Summary
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
