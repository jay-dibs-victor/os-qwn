import { Link, Outlet, useLocation } from 'react-router-dom';

export default function AccountLayout() {
  const location = useLocation();
  const menuItems = [
    { path: '/account', name: 'Home' },
    { path: '/account/personal-info', name: 'Personal info' },
    { path: '/account/security', name: 'Security' },
    { path: '/account/privacy', name: 'Privacy & Data' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '80vh', backgroundColor: 'var(--color-black)', color: 'var(--color-white)' }}>
      <aside style={{ width: '240px', borderRight: '1px solid var(--color-border-gold)', padding: '32px 0' }}>
        <h2 style={{ padding: '0 32px 32px', fontSize: '18px', color: 'var(--color-gold)' }}>Account</h2>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'block',
              padding: '16px 32px',
              backgroundColor: location.pathname === item.path ? 'rgba(255, 184, 0, 0.1)' : 'transparent',
              color: location.pathname === item.path ? 'var(--color-gold)' : 'var(--color-white)',
              fontWeight: location.pathname === item.path ? '600' : '400',
              borderLeft: location.pathname === item.path ? '4px solid var(--color-gold)' : '4px solid transparent'
            }}
          >
            {item.name}
          </Link>
        ))}
      </aside>
      <main style={{ flex: 1, padding: '48px' }}>
        <Outlet />
      </main>
    </div>
  );
}
