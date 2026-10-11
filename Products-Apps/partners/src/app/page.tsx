"use client";

import Image from "next/image";
import TravelHeroShowcase from "./hero.jsx";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  Bus,
  Car,
  Check,
  ChevronRight,
  Compass,
  FileCheck2,
  Handshake,
  Landmark,
  MapPin,
  Menu,
  Network,
  Package,
  Plane,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  ["Programs", "#programs"],
  ["Infrastructure", "#infrastructure"],
  ["Onboarding", "#onboarding"],
  ["Login", "/login"],
];

const partnerTracks = [
  {
    title: "Fleet Operators",
    icon: Car,
    desc: "Dispatch, wallet settlement, driver tooling, routing, and live vehicle visibility.",
    stat: "2.8x utilization",
  },
  {
    title: "Travel & Tours",
    icon: Plane,
    desc: "Package routes, airport pickups, guides, hotels, bus schedules, and group itinerary flows.",
    stat: "50K+ travelers",
  },
  {
    title: "Logistics Providers",
    icon: Truck,
    desc: "Parcel, haulage, proof of delivery, carrier assignment, and enterprise shipment lanes.",
    stat: "24/7 tracking",
  },
  {
    title: "Public Mobility",
    icon: Landmark,
    desc: "City-scale access programs for transport unions, smart corridors, and regulated operators.",
    stat: "Multi-agency ready",
  },
];

const infrastructure = [
  ["Partner API", "Booking, fares, trips, shipments, payouts, and KYC webhooks.", Network],
  ["Revenue Engine", "Split earnings, commissions, escrow states, and invoice exports.", Banknote],
  ["Trust Layer", "Verification, SLA checks, policy flags, and operational audit trails.", ShieldCheck],
  ["Live Coordination", "Fleet positions, exceptions, route demand, and partner command center.", Route],
];

const onboardingSteps = [
  ["01", "Register", "Submit company profile, operating regions, service categories, and commercial needs."],
  ["02", "Verify", "Queens reviews licensing, fleet or carrier capacity, tax data, and compliance readiness."],
  ["03", "Integrate", "Connect APIs, configure payouts, invite operators, and publish approved inventory."],
  ["04", "Launch", "Go live with monitored routes, support SLAs, shared analytics, and growth reviews."],
];

const markets = ["Lagos", "Abuja", "Accra", "Nairobi", "London", "Dubai", "New York"];

/* -- Navbar ----------------------------------------------- */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${scrolled || open
          ? "border-white/8 bg-black/90 backdrop-blur-xl"
          : "border-transparent bg-transparent"
        }`}
    >
      <div className="section-inner flex min-h-[5rem] items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.svg" alt="Queens OS" width={38} height={38} />
          <div>
            <p className="font-outfit text-base font-bold leading-none">Queens OS</p>
            <p style={{ fontSize: "0.6875rem" }} className="mt-1 font-semibold uppercase text-foreground-muted">
              Partner Network
            </p>
          </div>
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-semibold text-foreground-muted transition-colors hover:text-white"
            >
              {label}
            </a>
          ))}
          <a href="/become-partner" className="btn-primary" style={{ padding: "0.65rem 1.25rem", fontSize: "0.875rem" }}>
            Become a Partner
            <ArrowRight size={15} />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-[8px] border border-white/10 p-2 text-white md:hidden"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/8 bg-black/95 md:hidden">
          <div className="section-inner flex flex-col gap-3 py-6">
            {navItems.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-[8px] px-3 py-2 text-base font-semibold text-foreground-muted hover:bg-white/5 hover:text-white"
              >
                {label}
              </a>
            ))}
            <a href="/become-partner" onClick={() => setOpen(false)} className="btn-primary mt-1 justify-center">
              Become a Partner
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

/* -- Hero -------------------------------------------------- */
function Hero() {
  return <TravelHeroShowcase />;
}

/* -- Programs ---------------------------------------------- */
function ProgramSection() {
  return (
    <section id="programs" className="section-wrapper bg-black">
      <div className="section-inner">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-primary">
            <Sparkles size={16} />
            Partner tracks
          </div>
          <h2 className="font-outfit fluid-h2 font-bold">
            Choose the partnership model that matches how your business moves.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground-muted">
            Each track includes onboarding, verification, operating dashboards,
            API access, settlement logic, support workflows, and growth reporting.
          </p>
        </div>

        {/* Cards grid */}
        <div className="responsive-grid-4 mt-12">
          {partnerTracks.map((track, index) => (
            <motion.article
              key={track.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="partner-card group"
            >
              {/* Icon + chevron row */}
              <div className="mb-6 flex items-center justify-between">
                <div
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "8px",
                    background: "rgba(255,184,0,0.12)",
                    color: "#FFB800",
                    flexShrink: 0,
                  }}
                >
                  <track.icon size={22} />
                </div>
                <ChevronRight className="text-foreground-muted transition group-hover:text-primary" size={19} />
              </div>

              <h3 className="font-outfit text-xl font-bold">{track.title}</h3>
              <p className="mt-3 text-sm leading-6 text-foreground-muted" style={{ minHeight: "5rem" }}>
                {track.desc}
              </p>

              {/* Stat badge */}
              <p
                className="mt-5 text-sm font-bold text-primary"
                style={{
                  borderRadius: "8px",
                  border: "1px solid rgba(255,184,0,0.15)",
                  background: "rgba(255,184,0,0.08)",
                  padding: "0.45rem 0.75rem",
                }}
              >
                {track.stat}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -- Infrastructure ---------------------------------------- */
function InfrastructureSection() {
  return (
    <section id="infrastructure" className="section-wrapper bg-surface">
      <div className="absolute inset-0 bg-grid-white opacity-15" />
      <div className="section-inner relative z-10 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">

        {/* Left column */}
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-[8px] border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
            <Network size={16} />
            Infrastructure console
          </div>
          <h2 className="font-outfit fluid-h2 font-bold">
            Give every partner a command center, not another static form.
          </h2>
          <p className="mt-5 text-lg leading-8 text-foreground-muted">
            The partnership app turns the travel-tour hero into a working
            commercial surface: browse programs, qualify operators, preview
            integrations, and capture high-intent partner applications.
          </p>

          <div className="responsive-grid-2 mt-8">
            {infrastructure.map(([title, desc, Icon]) => {
              const IconComponent = Icon as React.ComponentType<{ size?: number; className?: string }>;
              return (
                <div key={title as string} className="dashboard-card">
                  <IconComponent className="mb-4 text-primary" size={22} />
                  <h3 className="font-outfit text-base font-bold">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-foreground-muted">{desc as string}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column — operations hub mockup */}
        <div
          className="overflow-hidden"
          style={{
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "#000",
            boxShadow: "0 28px 90px rgba(0,0,0,0.55)",
          }}
        >
          {/* Hub header */}
          <div
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              padding: "1rem 1.25rem",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image src="/logo.svg" alt="Queens OS" width={32} height={32} />
                <div>
                  <p className="text-sm font-bold">Partner Operations Hub</p>
                  <p className="text-xs text-foreground-muted">Network status: synchronized</p>
                </div>
              </div>
              <div
                className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-300"
                style={{
                  borderRadius: "8px",
                  border: "1px solid rgba(52,211,153,0.20)",
                  background: "rgba(52,211,153,0.10)",
                  padding: "0.4rem 0.75rem",
                }}
              >
                <BadgeCheck size={14} />
                Active
              </div>
            </div>
          </div>

          {/* Map area */}
          <div className="relative" style={{ height: "clamp(200px,30vw,360px)", overflow: "hidden" }}>
            <Image
              src="/assets/partner-network-map.png"
              alt="Queens OS route intelligence map"
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
              style={{ opacity: 0.8 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            {[
              ["top-[24%] left-[22%]", "Lagos"],
              ["top-[47%] left-[54%]", "Accra"],
              ["top-[30%] left-[72%]", "London"],
            ].map(([pos, label]) => (
              <div key={label} className={`absolute ${pos}`}>
                <div className="relative">
                  <div className="absolute -inset-2 rounded-full bg-primary/20" />
                  <div className="relative h-3 w-3 rounded-full bg-primary shadow-[0_0_18px_rgba(255,184,0,0.95)]" />
                  <p
                    className="mt-2 text-[11px] font-bold"
                    style={{
                      borderRadius: "6px",
                      background: "rgba(0,0,0,0.78)",
                      padding: "0.2rem 0.5rem",
                    }}
                  >
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="responsive-grid-3" style={{ padding: "1rem" }}>
            {[
              ["Trips", "18,204", Plane],
              ["Shipments", "7,918", Package],
              ["Payouts", "$1.2M", WalletCards],
            ].map(([label, value, Icon]) => {
              const IconComponent = Icon as React.ComponentType<{ size?: number }>;
              return (
                <div key={label as string} className="dashboard-card">
                  <div className="mb-2 flex items-center gap-2 text-primary">
                    <IconComponent size={14} />
                    <span className="text-[11px] font-bold uppercase">{label as string}</span>
                  </div>
                  <p className="font-outfit text-2xl font-bold">{value as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -- Marketplace ------------------------------------------- */
function MarketplaceSection() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const items = [
    ["Airport Transfer Partner", "Lagos, Abuja, Accra", "Verified fleet + chauffeur inventory", Car, "Fleet"],
    ["Regional Tour Operator", "Accra, Cape Coast, Nairobi", "Guided travel products and bundled transport", Bus, "Travel"],
    ["Enterprise Freight Carrier", "Nigeria, Ghana, Benin", "Line-haul, parcel, and proof of delivery lanes", Truck, "Freight"],
  ];

  const filteredItems = selectedCategory
    ? items.filter((item) => item[4] === selectedCategory)
    : items;

  return (
    <section className="section-wrapper bg-black">
      <div className="section-inner">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">

          {/* Left column — headline */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-primary">
              <Compass size={16} />
              Partner marketplace
            </div>
            <h2 className="font-outfit fluid-h2 font-bold">
              Publish mobility inventory across the Queens ecosystem.
            </h2>
            <p className="mt-5 text-lg leading-8 text-foreground-muted">
              Partners can surface routes, vehicles, guided tours, freight capacity,
              airport transfer products, and regulated public transport programs.
            </p>
          </div>

          {/* Right column — marketplace panel */}
          <div
            style={{
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#080808",
              padding: "1.25rem",
            }}
          >
            {/* Search + filters */}
            <div
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem", marginBottom: "1rem" }}
            >
              <div
                className="flex items-center gap-3"
                style={{
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(0,0,0,0.5)",
                  padding: "0.7rem 1rem",
                  flex: 1,
                }}
              >
                <Search size={16} className="text-primary shrink-0" />
                <span className="text-sm text-foreground-muted">Search routes, operators, markets</span>
              </div>

              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2">
                {[null, "Travel", "Fleet", "Freight"].map((cat) => (
                  <button
                    key={cat ?? "all"}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      borderRadius: "8px",
                      border: `1px solid ${selectedCategory === cat ? "#FFB800" : "rgba(255,255,255,0.10)"}`,
                      background: selectedCategory === cat ? "#FFB800" : "rgba(255,255,255,0.05)",
                      color: selectedCategory === cat ? "#000" : "#fff",
                      padding: "0.45rem 0.85rem",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 160ms ease",
                    }}
                  >
                    {cat ?? "All"}
                  </button>
                ))}
              </div>
            </div>

            {/* Partner listing items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filteredItems.map(([title, region, desc, Icon]) => {
                const IconComponent = Icon as React.ComponentType<{ size?: number }>;
                return (
                  <div
                    key={title as string}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      gap: "1rem",
                      alignItems: "center",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(0,0,0,0.35)",
                      padding: "1rem 1.25rem",
                    }}
                  >
                    {/* Icon box */}
                    <div
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: "2.75rem",
                        height: "2.75rem",
                        borderRadius: "8px",
                        background: "rgba(255,184,0,0.10)",
                        color: "#FFB800",
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent size={20} />
                    </div>

                    {/* Text */}
                    <div style={{ minWidth: 0 }}>
                      <h3 className="font-outfit text-base font-bold truncate">{title as string}</h3>
                      <p className="text-xs text-foreground-muted mt-0.5">{region as string}</p>
                      <p className="text-xs text-white/70 mt-1 leading-5">{desc as string}</p>
                    </div>

                    {/* CTA */}
                    <a
                      href="#apply"
                      style={{
                        borderRadius: "8px",
                        background: "#fff",
                        color: "#000",
                        padding: "0.5rem 1rem",
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        transition: "background 160ms ease",
                      }}
                    >
                      Apply
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -- Onboarding -------------------------------------------- */
function OnboardingSection() {
  return (
    <section id="onboarding" className="section-wrapper bg-surface">
      <div className="section-inner">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-[8px] border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
            <FileCheck2 size={16} />
            Onboarding flow
          </div>
          <h2 className="font-outfit fluid-h2 font-bold">
            From first application to live route in four governed steps.
          </h2>
        </div>

        <div className="responsive-grid-4 mt-12">
          {onboardingSteps.map(([step, title, body], index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              style={{
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(0,0,0,0.45)",
                padding: "1.75rem 1.5rem",
              }}
            >
              <p className="font-outfit text-4xl font-bold text-primary">{step}</p>
              <h3 className="mt-6 font-outfit text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-foreground-muted">{body}</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-bold text-primary">
                <Check size={16} />
                Required milestone
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -- Application Form -------------------------------------- */
function ApplicationForm() {
  return (
    <section id="apply" className="section-wrapper bg-black">
      <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,184,0,0.10),transparent_38%,rgba(14,165,233,0.07))]" />
      <div className="section-inner relative z-10 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">

        {/* Left — copy */}
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-primary">
            <Handshake size={16} />
            Partner portal
          </div>
          <h2 className="font-outfit fluid-h2 font-bold">
            Start the guided partner signup flow or log into your portal.
          </h2>
          <p className="mt-5 text-lg leading-8 text-foreground-muted">
            The dedicated wizard creates the SaaS user, partner profile, KYC
            record, logo profile data, settlement preferences, and bank account
            setup needed for partner onboarding.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {markets.map((market) => (
              <span
                key={market}
                style={{
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  padding: "0.4rem 0.85rem",
                  fontSize: "0.8125rem",
                  color: "#A1A1AA",
                }}
              >
                {market}
              </span>
            ))}
          </div>
        </div>

        {/* Right — quick-apply card */}
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "#080808",
            padding: "1.75rem",
            boxShadow: "0 28px 90px rgba(0,0,0,0.45)",
          }}
        >
          {/* Feature icon strip */}
          <div className="responsive-grid-3" style={{ marginBottom: "1.5rem" }}>
            {[
              [MapPin, "Routes"],
              [Building2, "KYC"],
              [WalletCards, "Settlement"],
            ].map(([Icon, label]) => {
              const IconComponent = Icon as React.ComponentType<{ size?: number; className?: string }>;
              return (
                <div
                  key={label as string}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(0,0,0,0.4)",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: "0.6rem",
                  }}
                >
                  <IconComponent size={20} className="text-primary" />
                  <p style={{ fontWeight: 700, fontSize: "0.8125rem" }}>{label as string}</p>
                </div>
              );
            })}
          </div>

          {/* Quick-apply form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const email = fd.get("email") as string;
              const track = fd.get("track") as string;
              window.location.href = `/become-partner?email=${encodeURIComponent(email)}&track=${encodeURIComponent(track)}`;
            }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label
                htmlFor="quick-email"
                style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#A1A1AA", marginBottom: "0.4rem" }}
              >
                Work Email
              </label>
              <input
                id="quick-email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="field"
              />
            </div>

            <div>
              <label
                htmlFor="quick-track"
                style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#A1A1AA", marginBottom: "0.4rem" }}
              >
                Partnership Track
              </label>
              <select
                id="quick-track"
                name="track"
                required
                className="field select-field"
                style={{ background: "#000" }}
              >
                <option value="fleet">Fleet Operators</option>
                <option value="travel">Travel &amp; Tours</option>
                <option value="logistics">Logistics Providers</option>
                <option value="mobility">Public Mobility</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem", padding: "1rem 1.5rem", fontSize: "1rem", width: "100%", justifyContent: "center" }}>
              Get Started
              <ArrowRight size={18} />
            </button>

            <p style={{ textAlign: "center", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <a href="/login" style={{ fontSize: "0.875rem", fontWeight: 600, color: "#A1A1AA", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#A1A1AA")}
              >
                Already a partner? Log in to your portal
              </a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

/* -- Footer ------------------------------------------------ */
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#000", paddingTop: "2.5rem", paddingBottom: "2.5rem" }}>
      <div className="section-inner flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Queens OS" width={36} height={36} />
          <div>
            <p className="font-outfit text-base font-bold">Queens OS Partners</p>
            <p className="text-sm text-foreground-muted">Global mobility partnership network</p>
          </div>
        </div>

        <p className="text-sm text-foreground-muted">© 2026 Queens Inc. Built for connected movement.</p>

        <div className="flex gap-5 text-sm font-semibold text-foreground-muted">
          <a href="#programs" className="hover:text-primary transition-colors">Programs</a>
          <a href="#infrastructure" className="hover:text-primary transition-colors">Infrastructure</a>
          <a href="/become-partner" className="hover:text-primary transition-colors">Apply</a>
        </div>
      </div>
    </footer>
  );
}

/* -- App Shell --------------------------------------------- */
export default function PartnerApp() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <ProgramSection />
      <InfrastructureSection />
      <MarketplaceSection />
      <OnboardingSection />
      <ApplicationForm />
      <Footer />
    </main>
  );
}
