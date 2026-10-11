import { Link } from 'react-router-dom';

export default function AccountHome() {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--color-surface-card)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', border: '1px solid var(--color-border-gold)' }}>👤</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Brian Oshinbolu</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>oshinbolubrian@gmail.com</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <Link to="/account/personal-info" style={{ padding: '24px', backgroundColor: 'var(--color-surface-card)', borderRadius: '12px', border: '1px solid var(--color-border-gold)', display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ marginBottom: '16px', fontSize: '24px' }}>🛡️</div>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Personal info</h3>
        </Link>
        <Link to="/account/security" style={{ padding: '24px', backgroundColor: 'var(--color-surface-card)', borderRadius: '12px', border: '1px solid var(--color-border-gold)', display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ marginBottom: '16px', fontSize: '24px' }}>🛡️</div>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Security</h3>
        </Link>
        <Link to="/account/privacy" style={{ padding: '24px', backgroundColor: 'var(--color-surface-card)', borderRadius: '12px', border: '1px solid var(--color-border-gold)', display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ marginBottom: '16px', fontSize: '24px' }}>🛡️</div>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Privacy & Data</h3>
        </Link>
      </div>
    </div>
  );
}
