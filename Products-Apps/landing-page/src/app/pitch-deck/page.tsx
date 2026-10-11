"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { slides } from "@/components/pitch/slides";

export default function PitchDeck() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((index: number, dir: number) => {
    setDirection(dir);
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    if (current < slides.length - 1) goTo(current + 1, 1);
  }, [current, goTo]);

  const prev = useCallback(() => {
    if (current > 0) goTo(current - 1, -1);
  }, [current, goTo]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 80 : -80, scale: 0.97 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -80 : 80, scale: 0.97 }),
  };

  const slide = slides[current];

  return (
    <div className="fixed inset-0 bg-background overflow-hidden flex flex-col">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4 border-b border-white/5 bg-black/60 backdrop-blur-xl z-50 shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-foreground-muted hover:text-white transition-colors group">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Go Back</span>
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Queens OS" className="w-8 h-8 object-contain" />
            <span className="font-bold font-outfit text-sm text-white/80 hidden md:inline">Queens OS · Investor Deck</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-foreground-muted font-mono">
            {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-foreground-muted hover:text-primary transition-colors">
            <ExternalLink size={12} /> Landing Page
          </Link>
          <Link href="/" className="w-8 h-8 flex items-center justify-center rounded-lg glass hover:bg-white/10 transition-colors text-white/60 hover:text-white">
            <X size={16} />
          </Link>
        </div>
      </div>

      {/* ── Slide area ── */}
      <div className="flex-1 relative overflow-y-auto scrollbar-hide">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="min-h-full w-full flex flex-col items-start lg:items-center justify-start lg:justify-center py-4 lg:py-0"
          >
            <slide.component slideNumber={current + 1} total={slides.length} />
          </motion.div>
        </AnimatePresence>

        {/* Floating Navigation Controls (Mobile & Tablet) */}
        <div className="lg:hidden absolute bottom-24 left-0 right-0 px-6 flex justify-between items-center pointer-events-none z-50">
          <button
            onClick={prev}
            disabled={current === 0}
            className="w-12 h-12 flex items-center justify-center rounded-2xl glass border-white/5 bg-black/40 backdrop-blur-md pointer-events-auto shadow-2xl disabled:opacity-20"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>

          <button
            onClick={next}
            disabled={current === slides.length - 1}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary text-black pointer-events-auto shadow-[0_0_24px_rgba(255,184,0,0.4)] disabled:opacity-20"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-4 lg:p-8 z-50 shrink-0 gap-4 lg:gap-6 border-t border-white/5 bg-black/60 backdrop-blur-xl">
        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              className={`transition-all duration-500 rounded-full ${i === current
                  ? "w-8 h-2 bg-primary shadow-[0_0_12px_rgba(255,184,0,0.5)]"
                  : "w-2 h-2 bg-white/10 hover:bg-white/30"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation Arrows (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-10">
          <button
            onClick={prev}
            disabled={current === 0}
            className="w-12 h-12 flex items-center justify-center rounded-2xl glass border-white/5 hover:bg-white/10 transition-all hover:scale-110 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>

          <button
            onClick={next}
            disabled={current === slides.length - 1}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary text-black hover:bg-primary-dark transition-all hover:scale-110 active:scale-95 shadow-[0_0_24px_rgba(255,184,0,0.3)] disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Slide title */}
        <div className="flex flex-col items-center gap-1 hidden sm:flex">
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] opacity-80">
            {String(current + 1).padStart(2, "0")} — {slide.title}
          </span>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}
