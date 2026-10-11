import { useState } from 'react';
import { FaMoneyBillWave, FaArrowLeft, FaStar, FaClock, FaRoad } from 'react-icons/fa';

const WEEKLY_DATA = {
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  earnings: [4500, 6200, 5100, 7800, 9300, 11000, 8200],
};

export default function DriverEarnings({ onBack }) {
  const [period, setPeriod] = useState('week');

  const totalEarnings = WEEKLY_DATA.earnings.reduce((s, v) => s + v, 0);
  const maxEarning = Math.max(...WEEKLY_DATA.earnings);
  const avgEarning = Math.round(totalEarnings / WEEKLY_DATA.earnings.length);

  return (
    <div className="dms-page">
      <div className="dms-header">
        <button className="dms-back-btn" onClick={onBack}><FaArrowLeft /></button>
        <h2 className="dms-title"><FaMoneyBillWave /> Earnings</h2>
      </div>

      <div className="dms-period-tabs">
        {['week', 'month'].map(t => (
          <button key={t} className={`dms-period-tab ${period === t ? 'active' : ''}`} onClick={() => setPeriod(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="dms-balance-card glass-card">
        <div className="dms-balance-label">This {period === 'week' ? 'Week' : 'Month'}</div>
        <div className="dms-balance-amount">₦{totalEarnings.toLocaleString()}</div>
        <div className="dms-balance-change">Average ₦{avgEarning.toLocaleString()}/day</div>
      </div>

      <div className="dms-chart glass-card">
        <div className="dms-chart-title">Daily Earnings</div>
        <div className="dms-chart-bars">
          {WEEKLY_DATA.days.map((day, i) => (
            <div key={day} className="dms-chart-col">
              <div className="dms-chart-value">₦{(WEEKLY_DATA.earnings[i] / 1000).toFixed(1)}k</div>
              <div className="dms-chart-bar-bg">
                <div className="dms-chart-bar-fill" style={{ height: `${(WEEKLY_DATA.earnings[i] / maxEarning) * 100}%` }} />
              </div>
              <div className="dms-chart-label">{day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dms-stats-row">
        <div className="dms-stat-card glass-card">
          <div className="dms-stat-label">Total Trips</div>
          <div className="dms-stat-value">{WEEKLY_DATA.earnings.length * 2}</div>
        </div>
        <div className="dms-stat-card glass-card">
          <div className="dms-stat-label">Avg. Per Trip</div>
          <div className="dms-stat-value gold">₦{Math.round(avgEarning / 2)}</div>
        </div>
        <div className="dms-stat-card glass-card">
          <div className="dms-stat-label">Online Hours</div>
          <div className="dms-stat-value">32h</div>
        </div>
      </div>

      <div className="dms-section-title">Trip Breakdown</div>
      <div className="dms-detail-list glass-card">
        <div className="dms-detail-row"><span>Gross Earnings</span><span>₦{totalEarnings.toLocaleString()}</span></div>
        <div className="dms-detail-row"><span>Tips</span><span>₦{Math.round(totalEarnings * 0.08).toLocaleString()}</span></div>
        <div className="dms-detail-row"><span>Bonuses</span><span>₦{Math.round(totalEarnings * 0.05).toLocaleString()}</span></div>
        <div className="dms-detail-row"><span>Service Fee</span><span className="negative">-₦{Math.round(totalEarnings * 0.15).toLocaleString()}</span></div>
        <div className="dms-detail-row total"><span>Net Payout</span><span>₦{Math.round(totalEarnings * 0.85).toLocaleString()}</span></div>
      </div>
    </div>
  );
}
