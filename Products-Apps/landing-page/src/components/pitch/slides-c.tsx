"use client";
import { SlideShell, Tag, BigHeading, Body, GlassCard, StatCard, Glow, Bullet, TwoCol } from "./primitives";
import type { SlideProps } from "./primitives";

/* ── Slide 11: Business Model ──────────────────────────────────── */
export function Slide11BizModel() {
  return (
    <SlideShell bg="bg-surface">
      <Glow color="bg-primary/8" cls="top-0 right-0 w-[400px] h-[400px]" />
      <div>
        <div className="text-center mb-10">
          <Tag>Business Model</Tag>
          <BigHeading>Three Stacked <span className="text-primary">Revenue Streams.</span></BigHeading>
        </div>
        <div className="pitch-grid pitch-grid-3">
          {[
            {
              icon: "📋", stream: "Orchestration & SaaS",
              borderColor: "border-primary/25 bg-primary/5",
              pricing: "$500 – $5,000 / mo",
              desc: "Subscription fees from fleet operators for the OS layer.",
              items: ["Real-time dispatch OS", "Driver management console", "Automated settlement rails"],
            },
            {
              icon: "⚡", stream: "Transaction Flow",
              borderColor: "border-accent-blue/25 bg-accent-blue/5",
              pricing: "3 – 5% orchestration fee",
              desc: "Take rate on ride-hailing, courier, and intercity bookings.",
              items: ["Urban mobility transactions", "Last-mile delivery flow", "Intercity booking fees"],
            },
            {
              icon: "📊", stream: "Ecosystem Services",
              borderColor: "border-accent-purple/25 bg-accent-purple/5",
              pricing: "Tiered API access",
              desc: "Value-added services and API licensing for 3rd party developers.",
              items: ["Mobility data licensing", "Urban planning APIs", "Insurance & Fintech integration"],
            },
          ].map((s) => (
            <GlassCard key={s.stream} centered className={`border ${s.borderColor}`}>
              <div className="text-3xl mb-4">{s.icon}</div>
              <div className="font-bold font-outfit text-lg mb-2">{s.stream}</div>
              <div className="text-sm text-foreground-muted mb-4 leading-relaxed">{s.desc}</div>
              <div className="text-primary font-bold text-sm mb-5">{s.pricing}</div>
              <ul className="space-y-2 mt-auto">
                {s.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-foreground-muted">
                    <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

/* ── Slide 12: Go-to-Market ────────────────────────────────────── */
export function Slide12GTM() {
  return (
    <SlideShell>
      <TwoCol
        left={
          <>
            <Tag>Go-to-Market</Tag>
            <BigHeading>Launch Megacities. <span className="text-primary">Then Scale Globally.</span></BigHeading>
            <Body>A three-phase geographic expansion built on enterprise-first sales, then platform network effects.</Body>
          </>
        }
        right={
          <div className="space-y-4">
            {[
              { phase: "Phase 1 · 2026", city: "Tier-1 Megacities (Launch)", desc: "Direct-to-Fleet sales. Deploy AI Dispatch & Routing OS to initial 500+ vehicles. Validate the playbook.", accent: "border-primary/30 bg-primary/5" },
              { phase: "Phase 2 · 2027", city: "Regional Hubs", desc: "Expansion to primary regional economic centers. Standardize the cross-border coordination layer.", accent: "border-accent-blue/20" },
              { phase: "Phase 3 · 2028–2030", city: "Global Expansion", desc: "Scale to Jakarta, Mexico City, and London. Build the global standard for mobility OS.", accent: "border-accent-purple/20" },
            ].map((row, i) => (
              <GlassCard key={i} className={`border ${row.accent} p-6`}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted mb-1">{row.phase}</div>
                <div className="font-bold text-lg font-outfit mb-2">{row.city}</div>
                <div className="text-sm text-foreground-muted leading-relaxed">{row.desc}</div>
              </GlassCard>
            ))}
          </div>
        }
      />
    </SlideShell>
  );
}

/* ── Slide 13: Traction ────────────────────────────────────────── */
export function Slide13Traction() {
  return (
    <SlideShell bg="bg-surface" bgImage="/futuristic_african_smart_city_1778791860222.png">
      <Glow color="bg-primary/8" cls="top-1/3 left-1/4 w-[500px] h-[300px]" />
      <div>
        <div className="text-center mb-10">
          <Tag>Traction</Tag>
          <BigHeading>Early Signals. <span className="text-primary">Strong Validation.</span></BigHeading>
        </div>
        <div className="pitch-grid pitch-grid-4 mb-8">
          {[
            { v: "1", l: "LOI Signed", s: "With enterprise fleet operator" },
            { v: "$1.5M", l: "Pipeline GMV", s: "In initial test deployments" },
            { v: "1.8K", l: "Trips Simulated", s: "On AI dispatch engine" },
            { v: "81%", l: "Routing Accuracy", s: "In dense urban traffic models" },
          ].map((s) => (
            <StatCard key={s.l} value={s.v} label={s.l} sub={s.s} />
          ))}
        </div>
        <GlassCard className="p-12 border-primary/10">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-12 opacity-80">Milestone Timeline</div>
          <div className="flex items-center gap-0 overflow-x-auto pb-6 scrollbar-hide">
            {[
              { m: "Phase 1 (Active)", e: "Liquidity Layer: Primary urban ride-hailing and courier launch." },
              { m: "Phase 2 (2027)", e: "Network Expansion: Intercity travel and scheduled transport integration." },
              { m: "Phase 3 (2028)", e: "Ecosystem Layer: API exposure and global travel partnerships." },
              { m: "Phase 4 (Vision)", e: "Infrastructure: Selective investment in dispatch hubs & terminals." },
            ].map((item, i) => (
              <div key={i} className="flex items-center shrink-0">
                <div className="text-center px-8 group">
                  <div className="w-5 h-5 rounded-full bg-primary mx-auto mb-5 shadow-[0_0_20px_rgba(255,184,0,0.6)] group-hover:scale-125 transition-transform" />
                  <div className="text-sm font-bold text-primary whitespace-nowrap mb-2 tracking-tight">{item.m}</div>
                  <div className="text-[13px] text-foreground-muted max-w-[160px] text-center leading-relaxed font-medium">{item.e}</div>
                </div>
                {i < 3 && <div className="h-[1px] w-24 bg-gradient-to-r from-primary/40 to-transparent shrink-0" />}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </SlideShell>
  );
}

/* ── Slide 14: Competitive Landscape ──────────────────────────── */
export function Slide14Competition() {
  return (
    <SlideShell>
      <TwoCol
        left={
          <>
            <Tag>Competitive Landscape</Tag>
            <BigHeading>No One Owns <span className="text-primary">the OS Layer.</span></BigHeading>
            <Body>Uber, Bolt, and Kobo360 operate individual point solutions. Queens OS is the coordination platform they all plug into.</Body>
            <Bullet items={[
              "Uber/Bolt = consumer apps, not B2B infrastructure",
              "Kobo360 = logistics niche only, no AI dispatch",
              "No player offers a unified multi-modal OS for enterprises",
              "Our moat: data network effects + switching costs",
            ]} />
          </>
        }
        right={
          <div className="space-y-3">
            {[
              { name: "Queens OS", ride: true, logistics: true, ai: true, gov: true, enterprise: true, highlight: true },
              { name: "Uber / Bolt", ride: true, logistics: false, ai: false, gov: false, enterprise: false, highlight: false },
              { name: "Kobo360", ride: false, logistics: true, ai: false, gov: false, enterprise: false, highlight: false },
              { name: "Moove", ride: false, logistics: false, ai: false, gov: false, enterprise: false, highlight: false },
            ].map((row) => {
              const features = ["ride", "logistics", "ai", "gov", "enterprise"] as const;
              return (
                <GlassCard key={row.name} className={`flex items-center gap-4 p-5 ${row.highlight ? "border-primary/30 bg-primary/5" : ""}`}>
                  <div className={`text-sm font-bold w-24 shrink-0 ${row.highlight ? "text-primary" : "text-foreground-muted"}`}>{row.name}</div>
                  <div className="flex gap-2 flex-wrap">
                    {features.map((f) => (
                      <span key={f} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${row[f] ? "bg-primary/20 text-primary" : "bg-white/5 text-foreground-muted/30 line-through"}`}>
                        {f}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        }
      />
    </SlideShell>
  );
}

/* ── Slide 15: Team ────────────────────────────────────────────── */
export function Slide15Team() {
  return (
    <SlideShell bg="bg-surface">
      <Glow color="bg-primary/8" cls="bottom-0 right-1/3 w-[400px] h-[300px]" />
      <div>
        <div className="text-center mb-10">
          <Tag>The Team</Tag>
          <BigHeading>Built by <span className="text-primary">Operators & Engineers.</span></BigHeading>
        </div>
        <div className="pitch-grid pitch-grid-3 mb-6">
          {[
            { name: "Victor Juwa", role: "Full-Stack Engineer", bg: "Real-Time Systems Expert", detail: "Built ride-matching logic, real-time tracking, and payment orchestration systems." },
            { name: "Chidi Nwosu", role: "CTO & Co-founder", bg: "Ex-Google · MIT CS", detail: "Built routing systems serving 2M+ daily users" },
            { name: "Elizabeth Dibiamaka", role: "CPO", bg: "Ex-Bolt · International Business School", detail: "Scaled 3 mobility products to 500K+ users" },
          ].map((member) => (
            <GlassCard key={member.name} className="text-center items-center p-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-accent-purple/30 mx-auto mb-5 flex items-center justify-center text-xl font-bold font-outfit text-primary shrink-0">
                {member.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="font-bold text-base font-outfit mb-1">{member.name}</div>
              <div className="text-primary text-[10px] font-bold uppercase tracking-wider mb-3">{member.role}</div>
              <div className="text-xs text-foreground-muted mb-1">{member.bg}</div>
              <div className="text-xs text-foreground-muted/60">{member.detail}</div>
            </GlassCard>
          ))}
        </div>
        <GlassCard className="text-center p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted mb-3">Advisors</div>
          <div className="flex flex-wrap justify-center gap-3">
            {["Ex-Flutterwave COO", "Global Transport Advisor", "Google Engineering Lead", "Sequoia Africa LP"].map((a) => (
              <span key={a} className="glass px-4 py-2 rounded-full text-xs">{a}</span>
            ))}
          </div>
        </GlassCard>
      </div>
    </SlideShell>
  );
}
