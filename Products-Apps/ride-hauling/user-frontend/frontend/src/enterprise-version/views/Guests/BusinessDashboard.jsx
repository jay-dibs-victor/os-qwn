import { Link, Outlet } from 'react-router-dom';

export default function BusinessDashboard() {
  return (
    <div className="business-dashboard-portal">
      <nav className="dashboard-sidebar">
        <div className="sidebar-logo">Uber for Business</div>
        <ul className="sidebar-menu">
          <li><Link to="/business/dashboard">Home</Link></li>
          <li><Link to="/business/dashboard/programs">Your Programs</Link></li>
          <li><Link to="/business/dashboard/travel">Travel program</Link></li>
          <li><Link to="/business/dashboard/central">Central</Link></li>
          <hr />
          <li><Link to="/business/dashboard/team">Team</Link></li>
          <li><Link to="/business/dashboard/activity">Activity</Link></li>
          <li><Link to="/business/dashboard/reports">Reports & Insights</Link></li>
          <li><Link to="/business/dashboard/billing">Billing</Link></li>
          <li><Link to="/business/dashboard/support">Support Hub</Link></li>
          <li><Link to="/business/dashboard/settings">Settings</Link></li>
          <li><Link to="/business/dashboard/security">Security</Link></li>
        </ul>
      </nav>

      <main className="dashboard-content" style={{ background: '#121212', color: '#fff', padding: '20px' }}>
        <div className="alert-box">
          Welcome to your new dashboard experience! If you have any questions, please visit the help center <a>here</a>
        </div>

        <h2>Welcome, Brian</h2>
        <h1>Complete your account setup</h1>
        <p>This is your Uber for Business dashboard... complete just a few more quick steps.</p>

        <div className="status-card verified">
          ✔ Account Verified
        </div>

        <div className="action-card">
          <h3>Choose a program</h3>
          <p>Get started by offering rides, meals, or delivery services...</p>
          <Link to="/business/onboarding" className="btn-black">Show recommendations →</Link>
        </div>

        <div className="action-card">
          <h3>Set billing preferences</h3>
        </div>

        <h3>Learn more about Uber for Business</h3>
        <div className="learn-grid">
          <div className="learn-card">Learn the basics <br /> Video · 2:12 min</div>
          <div className="learn-card">Onboarding your team <br /> Video · 1:06 min</div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}