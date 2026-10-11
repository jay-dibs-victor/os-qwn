import React, { useState } from 'react';
import { Users, Zap, Coins, DollarSign, Percent, TrendingUp, ShieldAlert, Layers, Activity, ArrowUpRight, ArrowDownRight, ChevronUp, ChevronDown, Calendar, X } from 'lucide-react';
import { useTenantValidation } from '../hooks/useTenantValidation';

interface LedgerTransaction {
  id: string;
  timestamp: string;
  type: 'chama' | 'swap' | 'fuel' | 'vetting' | 'system';
  message: string;
  amount?: string;
  status: 'SUCCESS' | 'PENDING' | 'ALERT';
}

interface AdminDashboardProps {
  settings?: {
    commissionRate: number;
    chamaGroupSize: number;
    solarDiscount: number;
  };
  triggerToast?: (msg: string) => void;
}

export default function AdminDashboard({ settings = { commissionRate: 3, chamaGroupSize: 5, solarDiscount: 12 }, triggerToast = (msg) => console.log(msg) }: AdminDashboardProps) {
  // Tenant validation
  useTenantValidation();

  // Slide Banner State
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    {
      title: "Chama Peer-to-Peer Savings Live",
      highlight: "Zero corporate treasury liability, 98% driver compliance.",
      desc: "Rotational pool algorithms verified. Driver micro-loans collateralized by peer circles and active platform yields.",
      bgClass: "slide-bg-chama"
    },
    {
      title: "Accra Solar Swap Hub Telemetry",
      highlight: "100% renewable efficiency across hybrid swap grids.",
      desc: "Grid synchronization active. Sub-saharan clean energy carbon offset credits parsing with instant ledger verification.",
      bgClass: "slide-bg-energy"
    },
    {
      title: "Dynamic Commission Spread & Clearing",
      highlight: "12% cashbacks active on renewable bulk fuel purchases.",
      desc: "EOD commission clearing with instant QCoins/cash settlement for premium card members.",
      bgClass: "slide-bg-dynamic"
    }
  ];

  // Simulated Real-Time Transaction Ledger State
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([
    {
      id: 'tx_8731_chama',
      timestamp: 'Just now',
      type: 'chama',
      message: 'P2P Chama Pool: Group 4 rotated weekly $1,250 lump sum to Marcus Vance.',
      amount: '+$1,250.00',
      status: 'SUCCESS'
    },
    {
      id: 'tx_4522_swap',
      timestamp: '2 mins ago',
      type: 'swap',
      message: 'Solar Swap Hub (Accra East): Depleted battery pack replaced for Camry Hybrid.',
      amount: '-$12.50',
      status: 'SUCCESS'
    },
    {
      id: 'tx_1209_fuel',
      timestamp: '1 hour ago',
      type: 'fuel',
      message: 'Green Fuel Cashback: Awarded 12% bulk purchase yield to driver Sarah K.',
      amount: '+$4.20',
      status: 'SUCCESS'
    },
    {
      id: 'tx_9811_vetting',
      timestamp: '2 hours ago',
      type: 'vetting',
      message: 'Registry Clean: Auto-verified driver license OCR fields matching national database.',
      amount: '+100 QC',
      status: 'SUCCESS'
    }
  ]);

  const simulateActivity = () => {
    const activities = [
      { type: 'chama', message: 'Dynamic peer savings rotation completed for group 9.', amount: '+$850.00' },
      { type: 'swap', message: 'Solar battery swap completed at Accra Central Hub.', amount: '-$10.20' },
      { type: 'fuel', message: '12% fuel cashback parsed automatically inside driver wallet.', amount: '+$5.40' },
      { type: 'system', message: 'Real-time telemetry verified green carbon compliance.', amount: '+120 QC' }
    ];
    const rand = activities[Math.floor(Math.random() * activities.length)];
    const newTx: LedgerTransaction = {
      id: `tx_${Math.floor(Math.random() * 10000)}_${rand.type}`,
      timestamp: 'Just now',
      type: rand.type as any,
      message: rand.message,
      amount: rand.amount,
      status: 'SUCCESS'
    };
    setTransactions(prev => [newTx, ...prev.slice(0, 5)]);
    triggerToast('Live NATS CRM event captured!');
  };

  // Chart Filters States
  const [revenueChartType, setRevenueChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [chartYears, setChartYears] = useState<Record<string, string>>({
    revenue: '2026',
    loans: '2026',
    customers: '2026',
    drivers: '2026',
    partners: '2026'
  });
  const [chartDateRanges, setChartDateRanges] = useState<Record<string, { start: string; end: string }>>({
    revenue: { start: '2026-01-01', end: '2026-12-31' },
    loans: { start: '2026-01-01', end: '2026-12-31' },
    customers: { start: '2026-01-01', end: '2026-12-31' },
    drivers: { start: '2026-01-01', end: '2026-12-31' },
    partners: { start: '2026-01-01', end: '2026-12-31' }
  });
  const [collapsedCharts, setCollapsedCharts] = useState<Record<string, boolean>>({
    revenue: false,
    loans: false,
    customers: false,
    drivers: false,
    partners: false
  });

  // Date Range Overlay States
  const [activeDateModalChart, setActiveDateModalChart] = useState<string | null>(null);
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  const getChartData = (chartKey: string) => {
    const year = chartYears[chartKey] || '2026';
    const range = chartDateRanges[chartKey] || { start: '2026-01-01', end: '2026-12-31' };
    let baseValues = [4200, 5100, 4800, 6400, 7200, 8500, 9100];
    let labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    if (chartKey === 'loans') {
      baseValues = [12000, 15000, 11000, 18000, 14000, 22000, 19000];
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    } else if (chartKey === 'customers') {
      baseValues = [340, 480, 520, 690, 800, 950, 1200];
      labels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7'];
    } else if (chartKey === 'drivers') {
      baseValues = [45, 60, 55, 78, 90, 110, 130];
      labels = ['Accra', 'Nairobi', 'London', 'Lagos', 'Kigali', 'Cape', 'Dakar'];
    } else if (chartKey === 'partners') {
      baseValues = [8, 12, 11, 16, 15, 22, 25];
      labels = ['Q1', 'Q2', 'Q3', 'Q4', 'Q1_26', 'Q2_26', 'Q3_26'];
    }

    const yearMultiplier = year === '2026' ? 1.0 : year === '2025' ? 0.82 : 0.65;
    const startMs = new Date(range.start).getTime();
    const endMs = new Date(range.end).getTime();
    const durationDays = Math.max(1, (endMs - startMs) / (1000 * 60 * 60 * 24));
    const rangeMultiplier = Math.min(1.5, Math.max(0.3, durationDays / 365));

    return baseValues.map((val, idx) => {
      const scaledVal = Math.round(val * yearMultiplier * rangeMultiplier);
      const x = 50 + idx * 65;
      const maxVal = Math.max(...baseValues) * 1.5;
      const y = Math.max(30, Math.min(170, 180 - (scaledVal / maxVal) * 130));
      return {
        label: labels[idx],
        value: scaledVal,
        x,
        y
      };
    });
  };

  const renderChartCard = (chartKey: string, title: string, icon: React.ReactNode) => {
    const isCollapsed = collapsedCharts[chartKey];
    const data = getChartData(chartKey);
    return (
      <div className="chart-box" key={chartKey} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {icon}
            <span>{title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            {chartKey === 'revenue' && (
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.35rem', overflow: 'hidden' }}>
                {['line', 'bar', 'pie'].map(t => (
                  <button
                    key={t}
                    onClick={() => setRevenueChartType(t as any)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.65rem',
                      background: revenueChartType === t ? 'var(--primary)' : 'transparent',
                      color: revenueChartType === t ? '#000' : '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            <select
              value={chartYears[chartKey]}
              onChange={e => {
                const val = e.target.value;
                setChartYears(prev => ({ ...prev, [chartKey]: val }));
                triggerToast(`Updated ${title} filter to Year ${val}`);
              }}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.65rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.35rem',
                color: '#fff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
            <button
              onClick={() => {
                setActiveDateModalChart(chartKey);
                setTempStartDate(chartDateRanges[chartKey].start);
                setTempEndDate(chartDateRanges[chartKey].end);
              }}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.65rem',
                background: 'rgba(255,184,0,0.08)',
                border: '1px solid rgba(255,184,0,0.2)',
                borderRadius: '0.35rem',
                color: 'var(--primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 'bold'
              }}
            >
              <Calendar size={10} />
              Range
            </button>
            <button
              onClick={() => setCollapsedCharts(prev => ({ ...prev, [chartKey]: !prev[chartKey] }))}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.7
              }}
            >
              {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>
        {!isCollapsed && (
          <>
            <svg className="svg-chart" viewBox="0 0 500 200" style={{ width: '100%', height: '200px' }}>
              <defs>
                <linearGradient id={`chart-grad-${chartKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartKey === 'loans' ? '#10b981' : chartKey === 'customers' ? '#3b82f6' : 'var(--primary)'} stopOpacity="1" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="110" x2="480" y2="110" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="150" x2="480" y2="150" stroke="rgba(255,255,255,0.05)" />
              {data.map((d, i) => (
                <circle
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  r={hoveredPoint === i ? 7 : 4}
                  fill="#000"
                  stroke={chartKey === 'loans' ? '#10b981' : chartKey === 'customers' ? '#3b82f6' : 'var(--primary)'}
                  strokeWidth="2.5"
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem', fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>
              {data.map((d, idx) => (
                <span key={idx}>{d.label}</span>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }
        .kpi-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.2s;
        }
        .kpi-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.12);
        }
        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          font-size: 0.8rem;
          color: var(--foreground-muted);
          text-transform: uppercase;
          font-weight: 700;
        }
        .kpi-value {
          font-size: 1.75rem;
          font-weight: 900;
          color: #fff;
          margin-bottom: 0.75rem;
          font-family: var(--font-outfit);
        }
        .trend-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.35rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .trend-up {
          background: rgba(16,185,129,0.1);
          color: #10b981;
          border: 1px solid rgba(16,185,129,0.2);
        }
        .trend-down {
          background: rgba(239,68,68,0.1);
          color: #ef4444;
          border: 1px solid rgba(239,68,68,0.2);
        }
        .charts-row {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .chart-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 1rem;
          padding: 1.5rem;
        }
        .chart-title {
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
        }
        .ledger-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 1rem;
          padding: 1.5rem;
          min-width: 300px;
        }
        .ledger-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }
        .ledger-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: rgba(255,255,255,0.02);
          border-radius: 0.5rem;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .ledger-icon {
          width: 32px;
          height: 32px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ledger-icon.chama { background: rgba(59,130,246,0.1); color: #3b82f6; }
        .ledger-icon.swap { background: rgba(16,185,129,0.1); color: #10b981; }
        .ledger-icon.fuel { background: rgba(255,184,0,0.1); color: var(--primary); }
        .ledger-icon.vetting { background: rgba(168,85,247,0.1); color: #a855f7; }
        .ledger-icon.system { background: rgba(249,115,22,0.1); color: #f97316; }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }
        .modal-content {
          background: rgba(20,20,20,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.8);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .modal-footer {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-primary {
          background: var(--primary);
          color: #000;
        }
        .btn-secondary {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.2);
        }
      `}</style>

      <div style={{ padding: '2rem', background: 'var(--background)', minHeight: '100vh' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '900', fontFamily: 'var(--font-outfit)', background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome back, Admin
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--foreground-dim)', marginTop: '0.25rem' }}>
            CRM analytics clearance active. System heartbeat: optimal.
          </p>
        </div>

        {/* Sliding Hero Banner */}
        <div style={{
          position: 'relative',
          borderRadius: '1.25rem',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '2rem',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1.5rem',
          minHeight: '180px',
          transition: 'all 0.5s ease-in-out',
          marginTop: '2rem',
          background: 'linear-gradient(135deg, rgba(255,184,0,0.05) 0%, rgba(255,184,0,0.02) 100%)'
        }}>
          <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,184,0,0.08) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ maxWidth: '80%' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', padding: '0.35rem 0.75rem', borderRadius: '2rem', marginBottom: '0.75rem' }}>
                <span style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Status Highlight</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-outfit)', letterSpacing: '0.02em', transition: 'all 0.3s' }}>
                {heroSlides[currentSlide].title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.4rem', lineHeight: '1.4' }}>
                {heroSlides[currentSlide].desc}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 'bold' }}>
                {heroSlides[currentSlide].highlight}
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {currentSlide === 0 ? <Users size={28} style={{ color: 'var(--primary)' }} /> : currentSlide === 1 ? <Zap size={28} style={{ color: '#10b981' }} /> : <Coins size={28} style={{ color: '#3b82f6' }} />}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', zIndex: 1, marginTop: '0.5rem' }}>
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  width: '100px',
                  height: '7px',
                  background: '#ffffff',
                  border: currentSlide === index ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  opacity: currentSlide === index ? 1 : 0.3,
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: currentSlide === index ? '0 0 10px rgba(255,255,255,0.4)' : 'none'
                }}
                title={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* KPI Metrics Grid */}
        <div className="analytics-grid">
          <div className="kpi-card">
            <div className="kpi-header"><span>Gross Platform Volume</span><DollarSign size={16} style={{ color: 'var(--primary)' }} /></div>
            <div className="kpi-value">$248,910.45</div>
            <div><span className="trend-badge trend-up"><ArrowUpRight size={10} /> +12.4%</span><span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', marginLeft: '0.5rem' }}>vs last week</span></div>
          </div>
          <div className="kpi-card">
            <div className="kpi-header"><span>3% Commission Spread</span><Percent size={16} style={{ color: '#10b981' }} /></div>
            <div className="kpi-value">${(248910.45 * (settings.commissionRate / 100)).toFixed(2)}</div>
            <div><span className="trend-badge trend-up"><ArrowUpRight size={10} /> +8.1%</span><span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', marginLeft: '0.5rem' }}>Dynamic fee active</span></div>
          </div>
          <div className="kpi-card">
            <div className="kpi-header"><span>Active Chama Escrows</span><Users size={16} style={{ color: '#3b82f6' }} /></div>
            <div className="kpi-value">$42,850.00</div>
            <div><span className="trend-badge trend-up"><ArrowUpRight size={10} /> +24% circles</span><span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', marginLeft: '0.5rem' }}>Group of {settings.chamaGroupSize} matched</span></div>
          </div>
          <div className="kpi-card">
            <div className="kpi-header"><span>Green Swap Credits</span><Zap size={16} style={{ color: '#8b5cf6' }} /></div>
            <div className="kpi-value">189,450 QC</div>
            <div><span className="trend-badge trend-down"><ArrowDownRight size={10} /> -1.2% swaps</span><span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', marginLeft: '0.5rem' }}>{settings.solarDiscount}% discount</span></div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1 }}>
            {renderChartCard('revenue', 'Financial Revenue & Spread', <TrendingUp size={18} style={{ color: 'var(--primary)' }} />)}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', width: '100%' }}>
              {renderChartCard('loans', 'Chama Escrow Loans & Compliance', <Coins size={18} style={{ color: '#10b981' }} />)}
              {renderChartCard('customers', 'Customer Acquisition Trends', <Users size={18} style={{ color: '#3b82f6' }} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', width: '100%' }}>
              {renderChartCard('drivers', 'Driver Acquisition & Vetting', <ShieldAlert size={18} style={{ color: '#a855f7' }} />)}
              {renderChartCard('partners', 'Fleet Partners Cleared Yield', <Layers size={18} style={{ color: '#f97316' }} />)}
            </div>
          </div>

          {/* Real-time Ledger Box */}
          <div className="ledger-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} style={{ color: '#10b981' }} />
                <span>Real-Time NATS CRM Ledger</span>
              </div>
              <button onClick={simulateActivity} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', textTransform: 'none', marginLeft: 'auto' }}>
                Simulate Live Event
              </button>
            </div>
            <div className="ledger-list">
              {transactions.map(tx => (
                <div className="ledger-item" key={tx.id}>
                  <div className={`ledger-icon ${tx.type}`}>
                    {tx.type === 'chama' && <Users size={14} />}
                    {tx.type === 'swap' && <Zap size={14} />}
                    {tx.type === 'fuel' && <Coins size={14} />}
                    {tx.type === 'vetting' && <ShieldAlert size={14} />}
                    {tx.type === 'system' && <Activity size={14} />}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{tx.message}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>{tx.timestamp}</div>
                  </div>
                  {tx.amount && (
                    <div style={{ fontWeight: '800', color: tx.amount.includes('+') ? '#10b981' : '#ef4444' }}>
                      {tx.amount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Date Range Modal */}
        {activeDateModalChart && (
          <div className="modal-overlay" onClick={() => setActiveDateModalChart(null)}>
            <div className="modal-content" style={{ maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} style={{ color: 'var(--primary)' }} />
                  <span>Configure Range: {activeDateModalChart.toUpperCase()}</span>
                </h3>
                <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setActiveDateModalChart(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.7rem' }}>Filter Start Date</label>
                  <input type="date" value={tempStartDate} onChange={e => setTempStartDate(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.35rem', color: '#fff', outline: 'none' }} />
                </div>
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.7rem' }}>Filter End Date</label>
                  <input type="date" value={tempEndDate} onChange={e => setTempEndDate(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.35rem', color: '#fff', outline: 'none' }} />
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: '1rem' }}>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }} onClick={() => setActiveDateModalChart(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.7rem', color: '#000' }} onClick={() => {
                  setChartDateRanges(prev => ({
                    ...prev,
                    [activeDateModalChart]: { start: tempStartDate, end: tempEndDate }
                  }));
                  triggerToast(`Updated ${activeDateModalChart} chart date range!`);
                  setActiveDateModalChart(null);
                }}>
                  Apply Range
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
