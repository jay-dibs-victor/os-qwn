"use client";
import Image from "next/image";
import { SlideShell, Tag, BigHeading, Body, GlassCard, StatCard, Glow, TwoCol } from "./primitives";
import type { SlideProps } from "./primitives";

/* ── Slide 1: Cover ────────────────────────────────────────────── */
export function Slide01Cover() {
  return (
    <SlideShell bgImage="/futuristic_african_smart_city_1778791860222.png">
      <Glow color="bg-primary/15" cls="top-1/4 left-1/4 w-[500px] h-[500px]" />
      <Glow color="bg-accent-purple/10" cls="bottom-1/4 right-1/4 w-[400px] h-[400px]" />
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <Image src="/logo.svg" alt="Queens OS" width={80} height={80} className="object-contain" />
        </div>
        <div className="pitch-tag mb-6">Seed Stage · Confidential · 2026</div>
        <h1 className="fluid-h1 mb-4">
          Queens<span className="text-gradient-primary"> OS</span>
        </h1>
        <p className="text-xl lg:text-2xl text-foreground-muted mb-10 text-center mx-auto leading-relaxed">
          The Global Operating System for Transportation
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {["Global Launch", "Seed Round · 2026", "AI · Mobility · Infrastructure"].map((tag) => (
            <span key={tag} className="glass px-4 py-2 rounded-full text-sm text-foreground-muted">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

/* ── Slide 2: Executive Summary ────────────────────────────────── */
export function Slide02Summary() {
  return (
    <SlideShell>
      <Glow color="bg-primary/8" cls="top-0 right-0 w-[400px] h-[400px]" />
      <TwoCol
        left={
          <>
            <Tag>Executive Summary</Tag>
            <BigHeading>60-Second Overview.</BigHeading>
            <Body>Queens OS is building the unified global AI intelligence layer to coordinate every form of transportation — starting with the world&apos;s most complex mobility markets.</Body>
          </>
        }
        right={
          <div className="pitch-grid pitch-grid-2" style={{ gridTemplateColumns: "1fr" }}>
            {[
              { n: "01", t: "The Coordination Gap", d: "Global mobility isn&apos;t lacking services; it&apos;s lacking coordination. Fragmented systems lead to trillions in systemic waste yearly." },
              { n: "02", t: "The Global TOS", d: "A modular OS that standardizes how transportation connects, transacts, and scales on a global level." },
              { n: "03", t: "Immediate Execution", d: "Raising $1.8M – $3.5M seed to launch initial operations and validate the global playbook." },
            ].map((item) => (
              <GlassCard key={item.n} centered className="flex gap-4 items-start p-6">
                <span className="text-primary font-mono font-bold text-xs mt-0.5 shrink-0">{item.n}</span>
                <div>
                  <div className="font-bold text-base mb-1">{item.t}</div>
                  <div className="text-sm text-foreground-muted leading-relaxed">{item.d}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        }
      />
    </SlideShell>
  );
}

/* ── Slide 3: The Problem ──────────────────────────────────────── */
export function Slide03Problem() {
  return (
    <SlideShell bg="bg-surface" bgImage="/futuristic_lagos_mobility_map_1778791789242.png">
      <Glow color="bg-red-500/5" cls="bottom-0 left-0 w-[600px] h-[400px]" />
      <div className="text-center">
        <Tag color="text-red-400">The Problem</Tag>
        <BigHeading>Transportation Lacks <span className="text-red-500">Coordination.</span></BigHeading>
        <p className="fluid-body text-center mx-auto mb-10">
          Services exist, but they operate as isolated silos with duplicated supply, fragmented demand, and zero interoperability.
        </p>
        <div className="pitch-grid pitch-grid-3  mx-auto centered">
          {[
            { v: "$6B", l: "Lost Daily", d: "Productivity losses due to megacity gridlock alone", color: "text-red-400" },
            { v: "0%", l: "Software Coverage", d: "No unified OS exists for modern transportation", color: "text-red-400" },
            { v: "85%", l: "Informal Operators", d: "No data, no visibility, no coordination", color: "text-red-400" },
          ].map((s) => (
            <StatCard key={s.l} value={s.v} label={s.l} sub={s.d} color={s.color} />
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

/* ── Slide 4: Problem Deep-Dive ────────────────────────────────── */
export function Slide04ProblemDeep() {
  return (
    <SlideShell>
      <TwoCol
        left={
          <>
            <Tag color="text-red-400">Problem Deep-Dive</Tag>
            <BigHeading>Four Compounding <span className="text-red-500">Failures.</span></BigHeading>
          </>
        }
        right={
          <div className="space-y-5">
            {[
              { t: "Isolated Silos", d: "Intra-city, logistics, and intercity travel rarely interoperate in a unified, intelligent way." },
              { t: "Duplicated Supply Pools", d: "Drivers and assets are locked into single-vertical platforms, leading to massive utilization waste." },
              { t: "Disconnected Discovery", d: "Users face fragmented demand discovery and inconsistent pricing across different transport modes." },
              { t: "Shared Infrastructure Void", d: "No unified identity, payment, or decision layer exists to coordinate the $5T mobility ecosystem." },
            ].map((item, i) => (
              <GlassCard key={i} className="flex gap-4 items-start p-6">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="font-bold text-sm mb-1">{item.t}</div>
                  <div className="text-sm text-foreground-muted leading-relaxed">{item.d}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        }
      />
    </SlideShell>
  );
}

/* ── Slide 5: Market Opportunity ──────────────────────────────── */
export function Slide05Market() {
  return (
    <SlideShell bg="bg-surface">
      <Glow color="bg-primary/8" cls="top-1/4 right-1/4 w-[500px] h-[500px]" />
      <div>
        <div className="text-center mb-10">
          <Tag>Market Opportunity</Tag>
          <BigHeading>A <span className="text-primary">$45 Billion</span> Untouched Market.</BigHeading>
        </div>
        <div className="pitch-grid pitch-grid-3">
          <StatCard value="$450B" label="TAM" sub="Total global urban mobility market by 2030" />
          <StatCard value="$85B" label="SAM" sub="Primary digitisable logistics + ride segment" color="text-accent-blue" />
          <StatCard value="$6.2B" label="SOM (Yr 3)" sub="Realistic capturable market in initial launch cities" color="text-accent-purple" />
        </div>
      </div>
    </SlideShell>
  );
}
