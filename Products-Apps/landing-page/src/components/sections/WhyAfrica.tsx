"use client";

import { motion } from "framer-motion";

export default function WhyAfrica() {
  return (
    <section style={{ marginTop: "40px", marginBottom: "30px" }} className="py-24 bg-surface relative overflow-hidden">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-video w-full max-w-xl mx-auto rounded-[32px] overflow-hidden glass border-white/5 shadow-2xl"
          >

            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale contrast-125 opacity-40 hover:grayscale-0 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8">
              <div className="text-primary font-bold text-sm uppercase mb-2 tracking-[0.2em]">Launch Approach</div>
              <h3 className="text-4xl font-bold font-outfit">From Africa to Global Boundaries</h3>
            </div>
          </motion.div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold font-outfit mb-8 leading-tight">
                Built Where Mobility <br />
                <span className="text-primary">Problems Are Real.</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { l: "Urban Growth", v: "4.4%", d: "Highest urban growth rate globally." },
                  { l: "Market Size", v: "$10B+", d: "Addressable mobility market in Lagos alone." },
                  { l: "Payment Adoption", v: "85%", d: "Mobile payment penetration in major hubs." },
                  { l: "Infrastructure Leap", v: "10x", d: "Opportunity for digital infrastructure leapfrogging." }
                ].map((stat) => (
                  <div key={stat.l} className="group">
                    <div className="text-3xl font-bold font-outfit text-white mb-1 group-hover:text-primary transition-colors">{stat.v}</div>
                    <div className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-2">{stat.l}</div>
                    <p className="text-sm text-foreground-muted">{stat.d}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
