import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import WebPlatformShowcase from "@/components/sections/WebPlatformShowcase";
import Problem from "@/components/sections/Problem";
import Solution from "@/components/sections/Solution";
import Roadmap from "@/components/sections/Roadmap";
import AIInfrastructure from "@/components/sections/AIInfrastructure";
import AppShowcase from "@/components/sections/AppShowcase";
import GlobalScale from "@/components/sections/GlobalScale";
import ProductEcosystem from "@/components/sections/ProductEcosystem";
import Metrics from "@/components/sections/Metrics";
import Investor from "@/components/sections/Investor";
import FooterCTA from "@/components/sections/FooterCTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <WebPlatformShowcase />


      <div id="platform">
        <Problem />
      </div>
      <div id="solution">
        <Solution />
      </div>
      <AppShowcase />
      <Roadmap />
      <AIInfrastructure />

      <GlobalScale />
      <div id="ecosystem">
        <ProductEcosystem />
      </div>
      <div id="metrics">
        <Metrics />
      </div>
      <Investor />
      <FooterCTA />
    </main>
  );
}
