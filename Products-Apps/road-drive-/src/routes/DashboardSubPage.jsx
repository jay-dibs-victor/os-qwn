import { useState } from 'react';

const Card = ({ title, children }) => (
  <div style={{ background: '#1E1E1E', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #D4AF37' }}>
    {title && <h3 style={{ color: '#D4AF37', marginTop: 0 }}>{title}</h3>}
    {children}
  </div>
);

export default function DashboardSubPage({ title }) {
  const renderContent = () => {
    switch (title) {
      case 'Activity':
        return (
          <Card title="Recent Trips">
            <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}><th>Date</th><th>Employee</th><th>Service</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr><td>2026-06-05</td><td>John Doe</td><td>Ride</td><td>₦5,000</td><td>Completed</td></tr>
              </tbody>
            </table>
          </Card>
        );
      case 'Reports & Insights':
        return (
          <>
            <Card title="Metrics">
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ background: '#333', padding: '15px', borderRadius: '8px' }}>Total Spend: ₦250,000</div>
                <div style={{ background: '#333', padding: '15px', borderRadius: '8px' }}>Active Employees: 45</div>
              </div>
            </Card>
          </>
        );
      case 'Billing':
        return (
          <Card title="Billing & Invoices">
            <p>Current Balance: ₦50,000</p>
            <button style={{ background: '#D4AF37', border: 'none', padding: '10px 20px', borderRadius: '5px' }}>Pay Now</button>
          </Card>
        );
      case 'Central':
        return (
          <Card title="Ride Central">
            <p>Interactive Booking Portal (Under Development)</p>
          </Card>
        );
      default:
        return <p>Under construction.</p>;
    }
  };

  return (
    <div style={{ padding: '20px', background: '#121212', color: '#fff', minHeight: '100vh' }}>
      <h1>{title}</h1>
      {renderContent()}
    </div>
  );
}
