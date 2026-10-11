"use client";
import { SlideShell, Tag, BigHeading, Body, GlassCard, Glow, Bullet, TwoCol } from "./primitives";
import type { SlideProps } from "./primitives";

/* ── Slide 6: Why Now ─────────────────────────────────────────── */
export function Slide06WhyNow() {
  return (
    <SlideShell>
      <Glow color="bg-accent-blue/8" cls="top-0 left-1/3 w-[500px] h-[300px]" />
      <TwoCol
        left={
          <>
            <Tag>Why Now</Tag>
            <BigHeading>Three Forces Creating the Window.</BigHeading>
            <Body>The convergence of mobile penetration, fintech adoption, and urban explosion has created a once-in-a-decade infrastructure opportunity.</Body>
          </>
        }
        right={
          <div className="space-y-4">
            {[
              { icon: "📱", t: "Mobile-First Population", v: "85%", d: "Digital payment penetration in target megacities" },
              { icon: "🏙️", t: "Explosive Urbanisation", v: "4.4%", d: "Annual urban growth rate in emerging markets" },
              { icon: "⚡", t: "Leapfrog Moment", v: "10×", d: "Infrastructure leapfrogging opportunity vs legacy incumbents" },
            ].map((item) => (
              <GlassCard key={item.t} className="flex items-center gap-5 p-6">
                <div className="text-3xl shrink-0">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-bold text-sm">{item.t}</div>
                    <div className="text-xl font-bold font-outfit text-primary shrink-0">{item.v}</div>
                  </div>
                  <div className="text-xs text-foreground-muted">{item.d}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        }
      />
    </SlideShell>
  );
}

/* ── Slide 7: Why Africa First ────────────────────────────────── */
export function Slide07MegacityStressTest() {
  return (
    <SlideShell bg="bg-surface">
      <TwoCol
        left={
          <div className="relative aspect-video rounded-3xl overflow-hidden glass">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=2070')] bg-cover bg-center opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <div className="absolute bottom-6 left-6">
            <div className="pitch-tag mb-1">Launch Focus</div>
            <div className="text-3xl font-bold font-outfit">High-Density Megacities</div>
            </div>
          </div>
        }
        right={
          <>
            <Tag>Global Launch Strategy</Tag>
            <BigHeading>Megacities as the <span className="text-primary">Global Benchmark.</span></BigHeading>
            <Bullet items={[
              "We focus on the world's most dense mobility stress-tests (20M+ residents)",
              "If the OS coordinates a megacity, it can coordinate any urban center globally",
              "Leapfrogging legacy systems with AI-driven systemic coordination",
              "Our playbook: Solve for the hardest markets first to own the global standard",
            ]} />
          </>
        }
      />
    </SlideShell>
  );
}

/* ── Slide 8: The Solution ────────────────────────────────────── */
export function Slide08Solution() {
  return (
    <SlideShell bgImage="/fleet_management_coordination_ui_1778791843148.png">
      <Glow color="bg-primary/12" cls="bottom-0 right-0 w-[600px] h-[400px]" />
      <div>
        <div className="text-center mb-10">
          <Tag>The Solution</Tag>
          <BigHeading>Queens OS: One Platform. <span className="text-primary">All of Mobility.</span></BigHeading>
          <p className="fluid-body max-w-3xl mx-auto">
            Not just a service, but the <strong>standardized infrastructure</strong> for how operators connect, transact, and scale within a unified, self-optimizing network.
          </p>
        </div>
        <div className="pitch-grid pitch-grid-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            { icon: "🚗", l: "Ride-hailing" },
            { icon: "📦", l: "Logistics" },
            { icon: "🚛", l: "Fleet Mgmt" },
            { icon: "🧠", l: "AI Dispatch" },
            { icon: "💳", l: "Smart Payments" },
            { icon: "🗺️", l: "Live Routing" },
            { icon: "📊", l: "Demand Forecast" },
            { icon: "🔧", l: "Driver Ops" },
          ].map((m) => (
            <GlassCard key={m.l} className="items-center text-center justify-center p-6 hover:border-primary/40 transition-colors cursor-default" style={{ minHeight: "120px" }}>
              <span className="text-3xl mb-3 block">{m.icon}</span>
              <span className="text-sm font-bold">{m.l}</span>
            </GlassCard>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

/* ── Slide 9: Product Architecture ───────────────────────────── */
export function Slide09Architecture() {
  return (
    <SlideShell bg="bg-surface">
      <TwoCol
        left={
          <>
            <Tag>Product Architecture</Tag>
            <BigHeading>Modular. <span className="text-accent-blue">API-First.</span> Scalable.</BigHeading>
            <Body>Three layers of intelligence — data ingestion, AI coordination, and application surfaces — all accessible through a single unified API.</Body>
            <div className="space-y-4 mt-2">
              {[
                { l: "Data Layer", d: "Real-time ingestion from GPS, payments, and demand signals" },
                { l: "AI Coordination Engine", d: "Dispatch optimisation, routing, and demand prediction" },
                { l: "Application Layer", d: "Rider app, driver app, fleet dashboard, admin portal" },
              ].map((row, i) => (
                <div key={i} className="flex gap-3 items-start" >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">{row.l}</div>
                    <div className="text-sm text-foreground-muted">{row.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        }
        right={
          <div className="glass-dark rounded-[40px] p-10 flex flex-col gap-8 shadow-2xl">
            {[
              { label: "Application Layer", color: "border-primary/20 bg-primary/5 text-primary", items: ["Rider App", "Driver App", "Fleet Dashboard"] },
              { label: "AI Engine", color: "border-accent-blue/20 bg-accent-blue/5 text-accent-blue", items: ["Dispatch", "Routing", "Forecasting"] },
              { label: "Data Layer", color: "border-accent-purple/20 bg-accent-purple/5 text-accent-purple", items: ["GPS", "Payments", "Demand"] },
            ].map((layer) => (
              <div key={layer.label} className={`rounded-3xl border p-8 ${layer.color} transition-all hover:scale-[1.01]`}>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] mb-6 opacity-80">{layer.label}</div>
                <div className="flex gap-4 flex-wrap">
                  {layer.items.map((item) => (
                    <span key={item} className="glass px-6 py-3 rounded-2xl text-base font-bold text-white shadow-lg border-white/10">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        }
      />
    </SlideShell>
  );
}

/* ── Slide 10: AI Infrastructure ─────────────────────────────── */
export function Slide10AI() {
  return (
    <SlideShell bgImage="/futuristic_lagos_mobility_map_1778791789242.png">
      <Glow color="bg-accent-blue/10" cls="top-1/4 right-0 w-[500px] h-[500px]" />
      <TwoCol
        left={
          <>
            <Tag color="text-accent-blue">AI Infrastructure</Tag>
            <BigHeading>Intelligence at the <span className="text-accent-blue">Core.</span></BigHeading>
            <div className="space-y-4">
              {[
                { t: "Predictive Routing", d: "Traffic pattern prediction 45 minutes ahead with 89% accuracy across dense urban corridors." },
                { t: "Autonomous Dispatch", d: "AI reduces manual dispatch overhead by 94%, matching drivers to rides in <150ms." },
                { t: "Dynamic Surge Intelligence", d: "Hyperlocal demand heatmaps recalculate every 90 seconds." },
              ].map((item, i) => (
                <GlassCard key={i} className="p-5 hover:border-accent-blue/30 transition-colors">
                  <div className="font-bold text-sm mb-1">{item.t}</div>
                  <div className="text-sm text-foreground-muted leading-relaxed">{item.d}</div>
                </GlassCard>
              ))}
            </div>
          </>
        }
        right={
          <div className="glass rounded-3xl h-72 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-accent-blue/5" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-accent-blue/70 shadow-[0_0_12px_#0EA5E9]"
                style={{
                  top: `${15 + (i * 10) % 70}%`,
                  left: `${10 + (i * 13) % 80}%`,
                }}
              />
            ))}
            <div className="relative z-10 text-center">
              <div className="pitch-stat-value text-accent-blue">&lt;150ms</div>
              <div className="text-xs uppercase tracking-widest text-foreground-muted">Dispatch Latency</div>
            </div>
          </div>
        }
      />
    </SlideShell>
  );
}
