import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

export default function EmployeeBenefits() {
  return (
    <div className="page-wrapper">
      <article style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 24px' }}>
        <Link to="/business" style={{ color: 'var(--color-text-muted)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}>
          <FaArrowLeft /> Back to Queens OS for Business
        </Link>
        <span style={{ color: 'var(--color-gold)', fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}>EMPLOYEE EXPERIENCE</span>
        <h1 style={{ fontSize: '40px', margin: '12px 0 16px', lineHeight: '1.15' }}>The perks and benefits your employees want now</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginBottom: '48px' }}>Modern teams expect more than just a salary. Here's how smart mobility and meal benefits boost retention.</p>

        <div style={{ height: '240px', backgroundColor: '#0c0c0c', borderRadius: '12px', border: '1px solid var(--color-border-gold)', marginBottom: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="var(--color-gold)"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V18h14v-1.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V18h6v-1.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        </div>

        <div style={{ fontSize: '16px', lineHeight: '1.8', color: 'rgba(255,255,255,0.85)' }}>
          <p style={{ marginBottom: '24px' }}>The Nigerian talent market is more competitive than ever. Top candidates are evaluating more than just base salary — they're looking at the full experience: how they get to work, what they eat, and how supported they feel.</p>

          <h2 style={{ fontSize: '24px', margin: '40px 0 16px' }}>1. Mobility as a benefit</h2>
          <p style={{ marginBottom: '24px' }}>Lagos traffic is notorious. Employees who spend 2-3 hours commuting daily are more likely to experience burnout and consider leaving. Offering Queens OS for Business ride credits transforms a daily pain point into a perk. Companies report a 30% improvement in commute satisfaction scores after implementing managed rides.</p>

          <h2 style={{ fontSize: '24px', margin: '40px 0 16px' }}>2. Meal stipends that work everywhere</h2>
          <p style={{ marginBottom: '24px' }}>Generic meal delivery subscriptions don't cover team outings, late-night work sessions, or client lunches. Queens OS meal programs work across restaurants and food vendors across Lagos — giving employees choice while giving finance teams control. Budgets stay predictable and unused credits roll over.</p>

          <h2 style={{ fontSize: '24px', margin: '40px 0 16px' }}>3. Safety as a perk</h2>
          <p style={{ marginBottom: '24px' }}>When employees know their commute and meals are covered by a platform with verified drivers, SOS alerts, and 24/7 support, it removes a significant source of anxiety. Safety features are consistently rated as the #1 most valued benefit by Queens OS for Business users.</p>

          <h2 style={{ fontSize: '24px', margin: '40px 0 16px' }}>4. Flexibility and autonomy</h2>
          <p style={{ marginBottom: '24px' }}>Let employees choose how they use their benefits. With Queens OS, one budget pool can cover rides to the office, meals while working late, or courier deliveries. This flexibility is more valuable than rigid, single-purpose allowances.</p>

          <h2 style={{ fontSize: '24px', margin: '40px 0 16px' }}>5. Measurable ROI</h2>
          <p style={{ marginBottom: '48px' }}>Every Queens OS for Business plan comes with analytics: track utilization, compare department spending, measure employee satisfaction, and calculate the retention impact. Companies using our platform see an average 22% improvement in retention among benefit-eligible employees within the first year.</p>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border-gold)', paddingTop: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/contact-sales" className="btn-black">Talk to our team</Link>
          <Link to="/eat" className="btn-outline">Explore Queens OS Eats</Link>
        </div>
      </article>
    </div>
  );
}
