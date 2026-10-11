import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

export default function CarbonFootprint() {
  return (
    <div className="page-wrapper">
      <article style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 24px' }}>
        <Link to="/business" style={{ color: 'var(--color-text-muted)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}>
          <FaArrowLeft /> Back to Queens OS for Business
        </Link>
        <span style={{ color: 'var(--color-gold)', fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}>SUSTAINABILITY</span>
        <h1 style={{ fontSize: '40px', margin: '12px 0 16px', lineHeight: '1.15' }}>How to reduce the carbon footprint of business travel</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginBottom: '48px' }}>Practical strategies for Lagos companies to cut emissions without compromising team mobility.</p>

        <div style={{ height: '240px', backgroundColor: '#0c0c0c', borderRadius: '12px', border: '1px solid var(--color-border-gold)', marginBottom: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="var(--color-gold)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
        </div>

        <div style={{ fontSize: '16px', lineHeight: '1.8', color: 'rgba(255,255,255,0.85)' }}>
          <p style={{ marginBottom: '24px' }}>For Nigerian businesses, managing the environmental impact of corporate travel is becoming a strategic priority. With Lagos being one of the world's most congested cities, every kilometer saved represents both a cost reduction and a carbon win.</p>

          <h2 style={{ fontSize: '24px', margin: '40px 0 16px' }}>1. Consolidate trips with ride sharing</h2>
          <p style={{ marginBottom: '24px' }}>Encourage teams traveling to the same area to share a single vehicle. Queens OS for Business allows you to schedule multi-stop rides, reducing the number of vehicles on the road and cutting per-employee emissions by up to 40%.</p>

          <h2 style={{ fontSize: '24px', margin: '40px 0 16px' }}>2. Choose greener ride options</h2>
          <p style={{ marginBottom: '24px' }}>When available, select fuel-efficient or electric vehicle options. Queens OS prioritizes drivers with cleaner vehicles and provides emissions data for every trip so you can track your company's carbon footprint over time.</p>

          <h2 style={{ fontSize: '24px', margin: '40px 0 16px' }}>3. Set travel policies that minimize distance</h2>
          <p style={{ marginBottom: '24px' }}>Use Queens OS's policy engine to encourage shorter routes and preferred modes. For example, set maximum distance limits for ride bookings, or mandate shared rides for teams attending the same event.</p>

          <h2 style={{ fontSize: '24px', margin: '40px 0 16px' }}>4. Track and report emissions</h2>
          <p style={{ marginBottom: '24px' }}>Our dashboard provides per-trip and per-department carbon estimates. Use this data to set reduction targets, report to stakeholders, and identify where further efficiencies can be gained.</p>

          <h2 style={{ fontSize: '24px', margin: '40px 0 16px' }}>5. Offset what you can't eliminate</h2>
          <p style={{ marginBottom: '48px' }}>For emissions that can't be avoided, Queens OS partners with Nigerian reforestation and clean energy projects to offer verified carbon offsets — allowing your business to reach net-zero travel emissions.</p>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border-gold)', paddingTop: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/business" className="btn-black">Learn about Queens OS for Business</Link>
          <Link to="/resources/sustainability-road" className="btn-outline">Read: The road to sustainability</Link>
        </div>
      </article>
    </div>
  );
}
