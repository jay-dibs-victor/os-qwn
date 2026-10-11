"use client";
import Link from "next/link";
import Image from "next/image";
import { SlideShell, Tag, BigHeading, Body, GlassCard, Glow, TwoCol, StatCard } from "./primitives";
import type { SlideProps } from "./primitives";

/* ── Slide 16: Financial Projections ─────────────────────────── */
export function Slide16Financials() {
  const rows = [
    { yr: "2026", arr: "$32K", gmv: "$800K", users: "1.2K", color: "text-foreground-muted" },
    { yr: "2027", arr: "$240K", gmv: "$6M", users: "8.5K", color: "text-foreground-muted" },
    { yr: "2028", arr: "$3.2M", gmv: "$80M", users: "45K", color: "text-primary" },
    { yr: "2029", arr: "$18M", gmv: "$450M", users: "220K", color: "text-primary" },
    { yr: "2030", arr: "$80M", gmv: "$2.1B", users: "1.2M", color: "text-primary" },
  ];
  return (
    <SlideShell bg="bg-surface">
      <Glow color="bg-primary/6" cls="bottom-0 left-0 w-[500px] h-[400px]" />
      <div className="text-center mb-10">
        <Tag>Financial Projections</Tag>
        <BigHeading>Path to <span className="text-primary">$80M ARR</span> by 2030.</BigHeading>
      </div>
      <div className="glass-dark rounded-3xl overflow-hidden max-w-5xl mx-auto border border-white/5 shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {["Year", "ARR (USD)", "GMV (USD)", "Active Network Units"].map((h) => (
                <th key={h} className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-muted text-center">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.yr} className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${i === rows.length - 1 ? "bg-primary/5" : ""}`}>
                <td className="px-8 py-6 font-bold font-outfit text-lg text-center">{row.yr}</td>
                <td className={`px-8 py-6 font-bold font-outfit text-2xl ${row.color} text-center`}>{row.arr}</td>
                <td className="px-8 py-6 text-foreground-muted font-medium text-center">{row.gmv}</td>
                <td className="px-8 py-6 text-foreground-muted font-medium text-center">{row.users}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-foreground-muted/40 text-center mt-6 font-medium tracking-wide">
        * Projections based on contracted pipeline and comparable global SaaS/mobility scaling trajectories.
      </p>
    </SlideShell>
  );
}

/* ── Slide 17: Unit Economics ─────────────────────────────────── */
export function Slide17UnitEcon() {
  return (
    <SlideShell>
      <Glow color="bg-accent-blue/8" cls="top-0 right-0 w-[400px] h-[400px]" />
      <TwoCol
        left={
          <>
            <Tag>Unit Economics</Tag>
            <BigHeading>Strong LTV:CAC <span className="text-primary">from Day One.</span></BigHeading>
            <Body>Our enterprise-first sales motion drives high ACV with minimal CAC through direct outreach to fleet operators.</Body>
          </>
        }
        right={
          <div className="grid grid-cols-1 gap-4">
            {[
              { metric: "Platform Rev / Trip", value: "$0.60 – $1.60", note: "Average orchestration fee per urban movement" },
              { metric: "Driver CAC", value: "$20 – $60", note: "Onboarding, verification & verification cost" },
              { metric: "Rider CAC", value: "$3 – $10", note: "Incentivized liquidity acquisition" },
              { metric: "LTV:CAC Ratio", value: "8:1", note: "Conservative model based on high retention", highlight: true },
            ].map((row) => (
              <GlassCard key={row.metric} className={`flex items-center justify-between p-6 ${row.highlight ? "border-primary/30 bg-primary/5" : ""}`}>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted mb-1">{row.metric}</div>
                  <div className="text-xs text-foreground-muted/60 leading-snug">{row.note}</div>
                </div>
                <div className={`text-3xl font-bold font-outfit ${row.highlight ? "text-primary" : "text-white"}`}>{row.value}</div>
              </GlassCard>
            ))}
          </div>
        }
      />
    </SlideShell>
  );
}

/* ── Slide 18: Use of Funds ───────────────────────────────────── */
export function Slide18UseOfFunds() {
  const allocation = [
    { pct: 35, label: "Supply & Demand Acquisition", desc: "Driver onboarding incentives, rider referrals, launch campaigns", color: "bg-primary" },
    { pct: 20, label: "Product & Engineering", desc: "Scalability, reliability, logistics module expansion, payments", color: "bg-accent-blue" },
    { pct: 20, label: "Operations (City Execution)", desc: "Driver/customer support, local ops staff, onboarding teams", color: "bg-accent-purple" },
    { pct: 15, label: "Team Expansion", desc: "Operations lead, growth/marketing, partnerships manager", color: "bg-white/40" },
    { pct: 10, label: "Regulatory & Legal", desc: "Compliance, legal structuring, operational contingency", color: "bg-white/20" },
  ];
  return (
    <SlideShell bg="bg-surface">
      <TwoCol
        left={
          <>
            <Tag>Use of Funds</Tag>
            <BigHeading>Deploying <span className="text-primary">$3.5M Target.</span></BigHeading>
            <Body>18-month runway to hit Series A milestones: Primary megacity-level unit economics validated and global expansion ready.</Body>
          </>
        }
        right={
          <div className="space-y-6">
            {allocation.map((row) => (
              <div key={row.label} style={{ height: "100px", padding: "10px" }} >
                <div className="flex justify-between mb-2 items-end">
                  <span className="text-sm font-bold text-white tracking-tight">{row.label}</span>
                  <span className="text-base font-bold text-primary font-outfit">{row.pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden mb-2 shadow-inner">
                  <div className={`h-full ${row.color} rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,184,0,0.3)]`} style={{ width: `${row.pct}%` }} />
                </div>
                <div className="text-xs text-foreground-muted leading-relaxed font-medium">{row.desc}</div>
              </div>
            ))}
          </div>
        }
      />
    </SlideShell>
  );
}

/* ── Slide 19: The Ask ────────────────────────────────────────── */
export function Slide19TheAsk() {
  return (
    <SlideShell>
      <Glow color="bg-primary/15" cls="top-1/3 left-1/3 w-[600px] h-[400px]" />
      <div className="text-center mb-10">
        <Tag>The Ask</Tag>
        <BigHeading>Raising <span className="text-primary">$1.8M – $3.5M</span> Seed Round.</BigHeading>
        <p className="fluid-body mx-auto text-center max-w-2xl">
          Funding to execute focused market entry in Tier-1 megacities and validate unit economics before global expansion.
        </p>
      </div>
      <div className="pitch-grid pitch-grid-3 mb-8">
        {[
          { l: "Target Raise", v: "$1.8M+", s: "Seed Stage" },
          { l: "Drivers Target", v: "800 – 1.2K", s: "Active network" },
          { l: "Daily Trips", v: "10K – 20K", s: "Market liquidity" },
        ].map((s) => (
          <StatCard key={s.l} value={s.v} label={s.l} sub={s.s} />
        ))}
      </div>
      <GlassCard style={{ marginTop: "40px", }} className="p-8 border-primary/20 bg-primary/5">
        <div className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Investor Requirements</div>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
          {[
            "Strategic value-add in global mobility",
            "Minimum check: $250K",
            "Board seat available for lead investor ($1M+)",
            "SAFE instrument · 20% discount cap"
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm font-medium text-foreground-muted">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 shadow-[0_0_8px_rgba(255,184,0,0.5)]" />
              {item}
            </div>
          ))}
        </div>
      </GlassCard>
    </SlideShell>
  );
}

/* ── Slide 20: Vision & Close ─────────────────────────────────── */
export function Slide20Vision() {
  return (
    <SlideShell bg="bg-surface" bgImage="/futuristic_african_smart_city_1778791860222.png">
      <Glow color="bg-primary/20" cls="top-1/4 left-1/4 w-[700px] h-[500px]" />
      <Glow color="bg-accent-purple/10" cls="bottom-0 right-0 w-[500px] h-[400px]" />
      <div className="text-center relative z-10 max-w-4xl mx-auto">
        <div className="flex justify-center mb-10">
          <Image src="/logo.svg" alt="Queens OS" width={80} height={80} className="object-contain shadow-2xl" />
        </div>
        <Tag>The Future of Mobility</Tag>
        <h2 className="fluid-h1" style={{ fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: 1.1 }}>
          Transportation Will <br />
          <span className="text-gradient-primary">Run on Intelligence.</span>
        </h2>
        <p className="text-xl lg:text-2xl text-foreground-muted mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          In 10 years, every fleet, government, and logistics operator <strong>globally</strong> will run on <span className="text-white font-semibold">Queens OS</span>.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          <a href="mailto:invest@queensos.com" className="pitch-btn pitch-btn-primary shadow-[0_0_40px_rgba(255,184,0,0.3)]">
            Contact Us to Invest
          </a>
          <Link href="/" className="pitch-btn pitch-btn-glass">
            ← Return to Website
          </Link>
        </div>
        {/* <div className="flex flex-wrap justify-center gap-10 text-xs font-bold uppercase tracking-[0.2em] text-foreground-muted">
          <span className="hover:text-primary transition-colors cursor-pointer">invest@queensos.com</span>
          <span className="hover:text-primary transition-colors cursor-pointer">queensos.com</span>
        </div> */}
      </div>
    </SlideShell>
  );
}
