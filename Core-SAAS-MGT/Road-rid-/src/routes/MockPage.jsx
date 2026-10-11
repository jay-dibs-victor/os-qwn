import { useLocation, Link } from 'react-router-dom';

export default function MockPage() {
  const location = useLocation();
  const path = location.pathname.substring(1);
  
  // Format title
  const title = path
    .split('/')
    .pop()
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="home-section" style={{ minHeight: '60vh', paddingTop: '100px', paddingBottom: '100px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid rgba(255, 184, 0, 0.18)', borderRadius: '12px', padding: '48px', backgroundColor: '#0c0c0c' }}>
        <span className="eyebrow" style={{ color: '#FFB800' }}>Queens OS Platform</span>
        <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '24px', color: '#ffffff' }}>{title || 'Information'}</h1>
        <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.7', marginBottom: '32px' }}>
          Welcome to the official Queens OS {title} portal. We are updating our interface to give you the most efficient mobility, courier, and business logistics experience. Check back soon for the full release.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/" className="btn-black">Go to Home</Link>
          <Link to="/business" className="btn-underline">Queens OS for Business</Link>
        </div>
      </div>
    </div>
  );
}
