import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useAuthStore } from '../../../core/store/useAuthStore';
import { 
  useUsersAdmin, 
  useDriversAdmin, 
  useBookingsAdmin, 
  useDashboardStats,
  useSalesAnalytics,
  useAdminAnalytics 
} from '../../../core/hooks/adminHooks';
import { LineChart, BarChart, DonutChart } from '../../../core/components/AnalyticsCharts';

import './Dashboard.css';

/**
 * AdminDashboard — GoomTaxi
 * Redesigned with premium Glassmorphism and high-fidelity widgets.
 * Consumes modernized hooks for platform-wide statistics.
 */
const AdminDashboard = () => {
  const { user } = useAuthStore();
  
  // Data fetching via modernized hooks
  const { data: users, isLoading: loadingUsers } = useUsersAdmin();
  const { data: drivers, isLoading: loadingDrivers } = useDriversAdmin();
  const { data: bookings, isLoading: loadingBookings } = useBookingsAdmin();
  const { data: statsData, isLoading: loadingStats } = useDashboardStats();
  const [period, setPeriod] = React.useState('7days');
  const { data: analytics, isLoading: loadingAnalytics } = useAdminAnalytics(period);
  const { data: salesToday } = useSalesAnalytics('today');

  const dashboardStats = statsData?.[0] || {};

  const stats = [
    { 
      label: 'Total Users', 
      value: dashboardStats.users || 0, 
      icon: 'bi-people-fill', 
      color: '#1e90ff', 
      trend: '+12%',
      bg: 'rgba(30, 144, 255, 0.1)' 
    },
    { 
      label: 'Active Drivers', 
      value: dashboardStats.drivers || 0, 
      icon: 'bi-person-badge-fill', 
      color: 'var(--color-primary)', 
      trend: '+5%',
      bg: 'rgba(255, 184, 0, 0.1)' 
    },
    { 
      label: 'Live Bookings', 
      value: dashboardStats.bookings || 0, 
      icon: 'bi-taxi-front-fill', 
      color: '#2ed573', 
      trend: '+18%',
      bg: 'rgba(46, 213, 115, 0.1)' 
    },
    { 
      label: 'Total Revenue', 
      value: dashboardStats.revenue ? `₦${dashboardStats.revenue.toLocaleString()}` : '₦0', 
      icon: 'bi-wallet2', 
      color: '#ff4757', 
      trend: '+8%',
      bg: 'rgba(255, 71, 87, 0.1)' 
    },
  ];

  return (
    <div className="admin-dashboard-view animate-fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-800 m-0">Platform Overview</h2>
          <p className="text-muted"> Monitoring system-wide taxi operations and logistics.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-md-6 col-lg-3">
            <div className="card-box h-100 d-flex flex-column justify-content-between p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="stat-icon-wrap" style={{ 
                  background: stat.bg, 
                  color: stat.color,
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px'
                }}>
                  <i className={`bi ${stat.icon}`}></i>
                </div>
                <span className="badge badge-success" style={{ fontSize: '10px' }}>{stat.trend}</span>
              </div>
              <div>
                <h3 className="fw-800 mb-1" style={{ fontSize: '24px' }}>
                  {loadingStats ? '...' : stat.value}
                </h3>
                <p className="text-muted font-11 fw-bold text-uppercase mb-0 letter-spacing-1">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card-box h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-800 m-0">Revenue & Traction</h4>
                <p className="text-muted font-11 m-0">Performance over time</p>
              </div>
              <div className="btn-group btn-group-sm glass rounded-3 p-1">
                <button 
                  className={`btn ${period === '7days' ? 'btn-primary' : 'btn-ghost'} btn-xs px-3`}
                  onClick={() => setPeriod('7days')}
                >7D</button>
                <button 
                  className={`btn ${period === '30days' ? 'btn-primary' : 'btn-ghost'} btn-xs px-3`}
                  onClick={() => setPeriod('30days')}
                >30D</button>
              </div>
            </div>
            
            <div className="row g-3">
              <div className="col-md-6">
                <h6 className="font-11 fw-800 text-uppercase text-primary letter-spacing-1 mb-3">Income Analysis (₦)</h6>
                {loadingAnalytics ? <div className="placeholder h-200"></div> : (
                   <LineChart data={analytics?.income} color="#FFB800" />
                )}
              </div>
              <div className="col-md-6">
                <h6 className="font-11 fw-800 text-uppercase text-info letter-spacing-1 mb-3">Traction (New Users)</h6>
                {loadingAnalytics ? <div className="placeholder h-200"></div> : (
                   <BarChart data={analytics?.traction} color="#1e90ff" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card-box h-100 flex-center flex-column">
            <h4 className="fw-800 mb-2">Booking Success</h4>
            <p className="text-muted font-11 mb-4">Distribution by status</p>
            {loadingAnalytics ? <div className="placeholder h-200"></div> : (
              <DonutChart data={analytics?.successRate} size={180} />
            )}
            <div className="mt-4 w-100">
               <div className="d-flex justify-content-between font-11 mb-2">
                 <span className="fw-700"><i className="bi bi-circle-fill text-success me-2"></i> Completed</span>
                 <span className="text-dark fw-800">{analytics?.successRate?.find(d => d._id === 'COMPLETED')?.count || 0}</span>
               </div>
               <div className="d-flex justify-content-between font-11">
                 <span className="fw-700"><i className="bi bi-circle-fill text-danger me-2"></i> Cancelled</span>
                 <span className="text-dark fw-800">{analytics?.successRate?.find(d => d._id === 'CANCELLED')?.count || 0}</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Activity Table */}
        <div className="col-lg-8">
          <div className="card-box p-0 overflow-hidden">
            <div className="p-4 d-flex justify-content-between align-items-center border-bottom">
              <h4 className="fw-800 m-0">Recent Activity</h4>
              <Link to="/manage-bookings" className="btn btn-ghost btn-sm fw-bold" style={{ color: 'var(--color-primary)' }}>
                View All <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
            
            <div className="table-responsive">
              <table className="table m-0">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>User / Client</th>
                    <th>Service Type</th>
                    <th>Route Activity</th>
                    <th className="text-end">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingBookings ? (
                    <tr><td colSpan="5" className="text-center py-5"><div className="spinner"></div></td></tr>
                  ) : bookings?.slice(0, 6).map((booking, idx) => (
                    <tr key={booking.id || booking._id || idx} className="align-middle">
                      <td className="fw-600">{moment(booking.createdAt).format('DD MMM, HH:mm')}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-sm" style={{ width: 24, height: 24, borderRadius: '50%', background: '#eee' }}></div>
                          <span className="font-13">{booking.user_email || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ background: '#f0f4f8', color: '#555' }}>
                          {booking.package_category || 'On-Demand'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center font-12 text-muted">
                          <span className="truncate" style={{ maxWidth: '80px' }}>{booking.pickup_address || 'Pickup'}</span>
                          <i className="bi bi-chevron-right mx-2 opacity-50"></i>
                          <span className="truncate fw-bold text-dark" style={{ maxWidth: '80px' }}>{booking.destination_address || 'Dest'}</span>
                        </div>
                      </td>
                      <td className="text-end">
                        <span className={`badge ${
                          booking.status === 'completed' ? 'badge-success' : 
                          booking.status === 'cancelled' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!bookings || bookings.length === 0) && !loadingBookings && (
                    <tr><td colSpan="5" className="text-center py-5 text-muted">No recent booking activity</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Support & Quick Links */}
        <div className="col-lg-4">
          <div className="card-box mb-4">
            <h4 className="fw-800 mb-4">Operational Status</h4>
            <div className="d-flex flex-column gap-3">
              <div className="status-item d-flex justify-content-between align-items-center p-3 glass rounded-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 bg-success text-white rounded-3 flex-center" style={{ width: 36, height: 36 }}>
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                  <div>
                    <p className="m-0 fw-700 font-13">Server Health</p>
                    <p className="m-0 text-muted font-11">All systems operational</p>
                  </div>
                </div>
                <div className="pulse-dot" style={{ width: 8, height: 8, background: '#2ed573', borderRadius: '50%' }}></div>
              </div>

              <div className="status-item d-flex justify-content-between align-items-center p-3 glass rounded-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 bg-warning text-white rounded-3 flex-center" style={{ width: 36, height: 36 }}>
                    <i className="bi bi-exclamation-circle-fill"></i>
                  </div>
                  <div>
                    <p className="m-0 fw-700 font-13">Network Latency</p>
                    <p className="m-0 text-muted font-11">Slight delay in API sync (42ms)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-box bg-dark text-white p-4" style={{ borderRadius: '24px', backgroundImage: 'linear-gradient(135deg, #1A1A1A, #333)' }}>
            <h5 className="fw-800 text-white mb-2">Driver Onboarding</h5>
            <p className="font-13 text-muted-light mb-4" style={{ opacity: 0.7 }}>
              There are <span className="text-primary fw-bold">4 pending</span> document verifications awaiting your approval.
            </p>
            <Link to="/manage-drivers" className="btn btn-primary w-100 fw-800" style={{ borderRadius: '12px' }}>
              Review Applications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
