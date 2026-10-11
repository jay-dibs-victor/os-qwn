import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

export default function SustainabilityRoad() {
  return (
    <div className="page-wrapper">
      <article style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 24px' }}>
        <Link to="/business" style={{ color: 'var(--color-text-muted)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}>
          <FaArrowLeft /> Back to Queens OS for Business
        </Link>
        <span style={{ color: 'var(--color-gold)', fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}>SUSTAINABILITY</span>
        <h1 style={{ fontSize: '40px', margin: '12px 0 16px', lineHeight: '1.15' }}>The road to sustainability: executives discuss net zero</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginBottom: '48px' }}>How Nigerian business leaders are approaching net-zero targets in logistics and employee travel.</p>

        <div style={{ height: '240px', backgroundColor: '#0c0c0c', borderRadius: '12px', border: '1px solid var(--color-border-gold)', marginBottom: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="var(--color-gold)"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>

        <div style={{ fontSize: '16px', lineHeight: '1.8', color: 'rgba(255,255,255,0.85)' }}>
          <p style={{ marginBottom: '24px' }}>Last month, Queens OS convened a roundtable of logistics executives, sustainability officers, and city planners in Lagos to discuss one question: How can Nigerian businesses reach net-zero emissions in their mobility and logistics operations? Here's what we learned.</p>

          <h2 style={{ fontSize: '24px', margin: '40px 0 16px' }}>The scale of the challenge</h2>
          <p style={{ marginBottom: '24px' }}>Transport accounts for roughly 20% of Nigeria's total greenhouse gas emissions, with road transport making up the vast majority. For Lagos-based businesses, employee commuting and logistics fleets are typically the largest source of Scope 3 emissions — yet they are also the hardest to measure and manage.</p>

          <h2 style={{ fontSize: '24px', margin: '40px 0 16px' }}>How Queens OS is approaching net zero</h2>
          <p style={{ marginBottom: '24px' }}>Our approach is built on three pillars: measure, reduce, and offset. From day one, every Queens OS ride includes a carbon estimate based on distance, vehicle type, and fuel efficiency data. Business clients see a per-trip carbon breakdown in their dashboard, allowing them to track trends and identify high-impact areas for reduction.</p>

          <h2 style={{ fontSize: '24px', margin: '40px 0 16px' }}>The role of EV infrastructure</h2>
          <p style={{ marginBottom: '24px' }}>While Nigeria's electric vehicle infrastructure is still emerging, several panel participants pointed to the opportunity for leapfrogging. With unreliable grid power being the norm, solar-powered charging stations paired with battery-swapping networks could accelerate EV adoption faster than traditional charging models. Queens OS is exploring partnerships with Lagos-based EV startups to pilot a small electric fleet by 2027.</p>

          <h2 style={{ fontSize: '24px', margin: '40px 0 16px' }}>Immediate steps businesses can take</h2>
          <p style={{ marginBottom: '24px' }}>Not every business can switch to electric vehicles today. But every business can:
          <br />• Consolidate trips using shared ride policies
          <br />• Choose shorter, optimized routes 
          <br />• Track and report emissions monthly
          <br />• Purchase verified carbon offsets for unavoidable emissions
          <br />• Set reduction targets and review progress quarterly</p>

          <p style={{ marginBottom: '48px' }}>The road to net zero is long, but with the right data and tools, Nigerian businesses can lead Africa's transition to sustainable mobility.</p>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border-gold)', paddingTop: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/resources/carbon-footprint" className="btn-black">Read: Reduce travel carbon footprint</Link>
          <Link to="/business" className="btn-outline">Queens OS for Business</Link>
        </div>
      </article>
    </div>
  );
}
