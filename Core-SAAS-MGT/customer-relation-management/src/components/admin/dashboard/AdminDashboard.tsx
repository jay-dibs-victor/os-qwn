import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Zap, Coins, DollarSign, Percent,
  TrendingUp, ShieldAlert, Layers, Activity,
  ArrowUpRight, ArrowDownRight, ChevronUp, ChevronDown,
  Calendar, X, RefreshCw, Globe,
} from 'lucide-react';
import {
  getDashboardMetrics,
  getRevenueChart,
  getLoansChart,
  getCustomersChart,
  getDriversChart,
  getPartnersChart,
  getRecentTransactions,
  type DashboardMetrics,
  type ChartData,
  type Transaction,
} from '../../../api/analytics';
import { useCurrency, QUICK_CURRENCIES, ALL_CURRENCIES } from '../../../hooks/useCurrency';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LedgerTransaction {
  id: string;
  timestamp: string;
  type: 'chama' | 'swap' | 'fuel' | 'vetting' | 'system';
  message: string;
  amount?: string;
  status: 'SUCCESS' | 'PENDING' | 'ALERT';
}

interface AdminDashboardProps {
  settings: {
    commissionRate: number;
    chamaGroupSize: number;
    solarDiscount: number;
  };
  triggerToast: (msg: string) => void;
}

type ChartKey = 'revenue' | 'loans' | 'customers' | 'drivers' | 'partners';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtInt(n: number): string {
  return n.toLocaleString('en-US');
}

/** Convert API ChartData into SVG-ready points */
function toSvgPoints(data: number[]): { x: number; y: number; value: number }[] {
  const max = Math.max(...data, 1);
  return data.map((value, idx) => ({
    value,
    x: 50 + idx * 65,
    y: Math.max(30, Math.min(170, 180 - (value / (max * 1.2)) * 130)),
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard({ settings, triggerToast }: AdminDashboardProps) {

  // ── API state ──────────────────────────────────────────────────────────────
  const [metrics, setMetrics]       = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const [chartData, setChartData]   = useState<Record<ChartKey, ChartData | null>>({
    revenue: null, loans: null, customers: null, drivers: null, partners: null,
  });
  const [chartLoading, setChartLoading] = useState<Record<ChartKey, boolean>>({
    revenue: true, loans: true, customers: true, drivers: true, partners: true,
  });

  const [ledgerTxs, setLedgerTxs] = useState<LedgerTransaction[]>([
    { id: 'seed_1', timestamp: 'Just now',    type: 'chama',   message: 'P2P Chama Pool: Group 4 rotated weekly $1,250 lump sum to Marcus Vance.',          amount: '+$1,250.00', status: 'SUCCESS' },
    { id: 'seed_2', timestamp: '2 mins ago',  type: 'swap',    message: 'Solar Swap Hub (Accra East): Depleted battery pack replaced for Camry Hybrid.',    amount: '+$0.20',     status: 'SUCCESS' },
    { id: 'seed_3', timestamp: '1 hour ago',  type: 'fuel',    message: 'Chama micro-loan origination fee: Driver James Smith (principal $1,200.00).',      amount: '+$24.00',    status: 'SUCCESS' },
    { id: 'seed_4', timestamp: '2 hours ago', type: 'vetting', message: 'Driver monthly subscription: Robert Johnson — GL 4500 Driver Subscription.',       amount: '+$29.00',    status: 'SUCCESS' },
    { id: 'seed_5', timestamp: '3 hours ago', type: 'chama',   message: 'Trip commission 10%: TRIP-ROOT-000012 — GL 4200 Commission Income.',               amount: '+$8.50',     status: 'SUCCESS' },
  ]);
  const [txLoading, setTxLoading]   = useState(true);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [currentSlide, setCurrentSlide]   = useState(0);
  const [revenueChartType, setRevenueChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [hoveredPoint, setHoveredPoint]   = useState<number | null>(null);

  const [chartYears, setChartYears] = useState<Record<ChartKey, string>>({
    revenue: '2026', loans: '2026', customers: '2026', drivers: '2026', partners: '2026',
  });
  const [chartDateRanges, setChartDateRanges] = useState<Record<ChartKey, { start: string; end: string }>>({
    revenue:   { start: '2026-01-01', end: '2026-12-31' },
    loans:     { start: '2026-01-01', end: '2026-12-31' },
    customers: { start: '2026-01-01', end: '2026-12-31' },
    drivers:   { start: '2026-01-01', end: '2026-12-31' },
    partners:  { start: '2026-01-01', end: '2026-12-31' },
  });
  const [collapsedCharts, setCollapsedCharts] = useState<Record<ChartKey, boolean>>({
    revenue: false, loans: false, customers: false, drivers: false, partners: false,
  });
  const [activeDateModalChart, setActiveDateModalChart] = useState<ChartKey | null>(null);
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate]     = useState('');

  // debounce ref so rapid filter changes don't fire 10 requests
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Data fetchers ──────────────────────────────────────────────────────────

  const fetchMetrics = useCallback(async (start?: string, end?: string) => {
    setMetricsLoading(true);
    try {
      const data = await getDashboardMetrics({ startDate: start, endDate: end });
      setMetrics(data);
    } catch (e) {
      console.error('metrics fetch failed', e);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const fetchChart = useCallback(async (key: ChartKey) => {
    setChartLoading(prev => ({ ...prev, [key]: true }));
    const { start, end } = chartDateRanges[key];
    const year = chartYears[key];
    try {
      let data: ChartData | null = null;
      const filters = { year, startDate: start, endDate: end };
      if (key === 'revenue')   data = await getRevenueChart(filters);
      if (key === 'loans')     data = await getLoansChart(filters);
      if (key === 'customers') data = await getCustomersChart(filters);
      if (key === 'drivers')   data = await getDriversChart(filters);
      if (key === 'partners')  data = await getPartnersChart(filters);
      setChartData(prev => ({ ...prev, [key]: data }));
    } catch (e) {
      console.error(`${key} chart fetch failed`, e);
    } finally {
      setChartLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [chartDateRanges, chartYears]);

  const fetchTransactions = useCallback(async (start?: string, end?: string) => {
    setTxLoading(true);
    try {
      const raw = await getRecentTransactions(10, { startDate: start, endDate: end });
      const mapped: LedgerTransaction[] = raw.map((tx: Transaction) => ({
        id:        tx.id,
        timestamp: new Date(tx.timestamp).toLocaleString(),
        type:      tx.type,
        message:   tx.message,
        amount:    tx.amount,
        status:    tx.status,
      }));
      // Only replace state if API returned rows; keep existing (simulated) entries otherwise
      if (mapped.length > 0) {
        setLedgerTxs(mapped);
      }
    } catch (e) {
      console.error('transactions fetch failed', e);
      // leave whatever is already in ledgerTxs (could be simulated entries)
    } finally {
      setTxLoading(false);
    }
  }, []);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetchMetrics();
    fetchTransactions();
    (['revenue', 'loans', 'customers', 'drivers', 'partners'] as ChartKey[]).forEach(k => fetchChart(k));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-fetch chart when year or date range changes (debounced 400ms) ───────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      (['revenue', 'loans', 'customers', 'drivers', 'partners'] as ChartKey[]).forEach(k => fetchChart(k));
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [chartYears, chartDateRanges]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Ledger simulation (adds a fake row on top of real data) ───────────────
  const simulateActivity = () => {
    const activities = [
      { type: 'chama' as const, message: 'Dynamic peer savings rotation completed for group 9.', amount: '+$850.00' },
      { type: 'swap'  as const, message: 'Solar battery swap completed at Accra Central Hub.',   amount: '-$10.20' },
      { type: 'fuel'  as const, message: '12% fuel cashback parsed automatically inside driver wallet.', amount: '+$5.40' },
      { type: 'system'as const, message: 'Real-time telemetry verified green carbon compliance.', amount: '+120 QC' },
    ];
    const rand = activities[Math.floor(Math.random() * activities.length)];
    const newTx: LedgerTransaction = {
      id: `sim_${Date.now()}`,
      timestamp: 'Just now',
      type: rand.type,
      message: rand.message,
      amount: rand.amount,
      status: 'SUCCESS',
    };
    setLedgerTxs(prev => [newTx, ...prev.slice(0, 9)]);
    triggerToast('Live NATS CRM event captured!');
  };

  // ── Chart card renderer ────────────────────────────────────────────────────

  const renderChartCard = (key: ChartKey, title: string, icon: React.ReactNode) => {
    const isCollapsed = collapsedCharts[key];
    const loading     = chartLoading[key];
    const apiData     = chartData[key];
    const labels      = apiData?.labels ?? [];
    const values      = apiData?.data   ?? [];
    const pts         = toSvgPoints(values);
    const color       = key === 'loans' ? '#10b981' : key === 'customers' ? '#3b82f6' : key === 'drivers' ? '#a855f7' : key === 'partners' ? '#f97316' : 'var(--primary)';

    return (
      <div className="chart-box" key={key} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.3s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {icon}<span>{title}</span>
            {loading && <RefreshCw size={12} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            {key === 'revenue' && (
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.35rem', overflow: 'hidden' }}>
                {(['line', 'bar', 'pie'] as const).map(t => (
                  <button key={t} onClick={() => setRevenueChartType(t)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', background: revenueChartType === t ? 'var(--primary)' : 'transparent', color: revenueChartType === t ? '#000' : '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            <select value={chartYears[key]}
              onChange={e => { setChartYears(prev => ({ ...prev, [key]: e.target.value })); triggerToast(`${title} → Year ${e.target.value}`); }}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.35rem', color: '#fff', outline: 'none', cursor: 'pointer' }}>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
            <button onClick={() => { setActiveDateModalChart(key); setTempStartDate(chartDateRanges[key].start); setTempEndDate(chartDateRanges[key].end); }}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: '0.35rem', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold' }}>
              <Calendar size={10} />Range
            </button>
            <button onClick={() => setCollapsedCharts(prev => ({ ...prev, [key]: !prev[key] }))}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
              {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>
            <span>Year: <strong style={{ color: 'var(--primary)' }}>{chartYears[key]}</strong></span>
            <span>{chartDateRanges[key].start} → {chartDateRanges[key].end}</span>
            {apiData?.glAccount && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>GL {apiData.glAccount}</span>}
          </div>
        )}

        {!isCollapsed && !loading && pts.length > 0 && (
          <>
            {key === 'revenue' && revenueChartType === 'pie' ? (
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px' }}>
                <svg viewBox="0 0 200 200" style={{ width: '130px', height: '130px' }}>
                  <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="12" />
                  <circle cx="100" cy="100" r="70" fill="none" stroke="var(--primary)" strokeWidth="12" strokeDasharray="300 440" strokeLinecap="round" />
                  <circle cx="100" cy="100" r="50" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="200 314" strokeLinecap="round" />
                  <circle cx="100" cy="100" r="30" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="100 188" strokeLinecap="round" />
                </svg>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.65rem', color: '#fff' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} /> Commission</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> Solar EV</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} /> Chama Escrow</span>
                </div>
              </div>
            ) : (
              <svg className="svg-chart" viewBox="0 0 500 200">
                <defs>
                  <linearGradient id={`cg-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="1" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                {[30, 70, 110, 150].map(y => <line key={y} x1="40" y1={y} x2="480" y2={y} className="chart-grid-line" />)}

                {(key !== 'drivers' && !(key === 'revenue' && revenueChartType === 'bar')) && pts.length > 1 && (
                  <>
                    <path d={`M${pts.map(p => `${p.x},${p.y}`).join(' L')}`} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 0px 8px rgba(255,184,0,0.3))' }} />
                    <path d={`M${pts[0].x},180 L${pts.map(p => `${p.x},${p.y}`).join(' L')} L${pts[pts.length - 1].x},180 Z`} fill={`url(#cg-${key})`} opacity="0.15" />
                  </>
                )}

                {(key === 'drivers' || (key === 'revenue' && revenueChartType === 'bar')) && pts.map((p, i) => (
                  <rect key={i} x={p.x - 15} y={p.y} width="30" height={180 - p.y} fill={`url(#cg-${key})`} rx="4"
                    opacity={hoveredPoint === i ? 1 : 0.8} style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)} />
                ))}

                {pts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={hoveredPoint === i ? 7 : 4} fill="#000" stroke={color} strokeWidth="2.5"
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)} />
                ))}

                {hoveredPoint !== null && pts[hoveredPoint] && (
                  <g transform={`translate(${pts[hoveredPoint].x - 45},${pts[hoveredPoint].y - 35})`}>
                    <rect width="90" height="22" rx="4" fill="rgba(0,0,0,0.9)" stroke="var(--primary)" strokeWidth="1" />
                    <text x="45" y="14" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">
                      {labels[hoveredPoint]}: {key === 'customers' || key === 'drivers' ? '' : '$'}{pts[hoveredPoint].value.toLocaleString()}
                    </text>
                  </g>
                )}
              </svg>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem', fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>
              {labels.map((l, i) => <span key={i}>{l}</span>)}
            </div>
          </>
        )}

        {!isCollapsed && loading && (
          <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>
            Loading ledger data…
          </div>
        )}
      </div>
    );
  };

  // ── Hero slides — auto-advancing every 5s ─────────────────────────────────
  const heroSlides = [
    {
      title: 'Chama Peer-to-Peer Savings Live',
      highlight: 'Zero corporate treasury liability, 98% driver compliance.',
      desc: 'Rotational pool algorithms verified. Driver micro-loans collateralized by peer circles and active platform yields.',
      bgClass: 'slide-bg-chama',
      svg: (
        <svg viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          {/* Ground shadow */}
          <ellipse cx="110" cy="165" rx="80" ry="12" fill="rgba(255,184,0,0.08)" />
          {/* Coin stack — bottom */}
          <ellipse cx="110" cy="150" rx="50" ry="14" fill="rgba(255,184,0,0.12)" />
          <ellipse cx="110" cy="140" rx="50" ry="14" fill="#b45309" />
          <rect x="60" y="106" width="100" height="34" rx="3" fill="#d97706" />
          <ellipse cx="110" cy="106" rx="50" ry="14" fill="#fbbf24" />
          {/* Coin stack — middle */}
          <ellipse cx="110" cy="98" rx="50" ry="14" fill="#b45309" />
          <rect x="60" y="64" width="100" height="34" rx="3" fill="#d97706" />
          <ellipse cx="110" cy="64" rx="50" ry="14" fill="#fbbf24" />
          {/* Coin stack — top */}
          <ellipse cx="110" cy="56" rx="50" ry="14" fill="#b45309" />
          <rect x="60" y="22" width="100" height="34" rx="3" fill="#d97706" />
          <ellipse cx="110" cy="22" rx="50" ry="14" fill="#fbbf24" />
          {/* Shine highlight */}
          <ellipse cx="92" cy="18" rx="16" ry="5" fill="rgba(255,255,255,0.3)" transform="rotate(-18 92 18)" />
          {/* Floating coins */}
          <circle cx="180" cy="40" r="18" fill="#fbbf24" opacity="0.75" />
          <circle cx="180" cy="40" r="12" fill="#d97706" opacity="0.75" />
          <text x="174" y="45" fontSize="12" fill="#fff" fontWeight="bold">₦</text>
          <circle cx="30" cy="75" r="14" fill="#fbbf24" opacity="0.55" />
          <circle cx="30" cy="75" r="9" fill="#d97706" opacity="0.55" />
          <text x="25" y="79" fontSize="10" fill="#fff" fontWeight="bold">$</text>
          {/* Small sparkle dots */}
          <circle cx="50" cy="20" r="2" fill="#fbbf24" opacity="0.4" />
          <circle cx="170" cy="80" r="2.5" fill="#fbbf24" opacity="0.3" />
          <circle cx="195" cy="100" r="1.5" fill="#fbbf24" opacity="0.25" />
        </svg>
      ),
    },
    {
      title: 'Solar Swap Hub Telemetry Active',
      highlight: '100% renewable efficiency across hybrid swap grids.',
      desc: 'Grid synchronization active. Sub-saharan clean energy carbon offset credits parsing with instant ledger verification.',
      bgClass: 'slide-bg-energy',
      svg: (
        <svg viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          {/* Solar panel background glow */}
          <circle cx="110" cy="90" r="80" fill="rgba(16,185,129,0.06)" />
          {/* Wallet body */}
          <rect x="25" y="50" width="150" height="95" rx="14" fill="#1e3a5f" stroke="rgba(59,130,246,0.4)" strokeWidth="2" />
          <rect x="25" y="50" width="150" height="28" rx="14" fill="#1d4ed8" />
          <rect x="25" y="64" width="150" height="14" fill="#1d4ed8" />
          {/* Wallet clasp */}
          <rect x="130" y="78" width="55" height="38" rx="10" fill="#1e40af" stroke="rgba(96,165,250,0.3)" strokeWidth="1.5" />
          <circle cx="157" cy="97" r="12" fill="#3b82f6" />
          <circle cx="157" cy="97" r="6" fill="#93c5fd" />
          {/* Chips inside wallet */}
          <rect x="38" y="94" width="72" height="10" rx="4" fill="rgba(255,255,255,0.08)" />
          <rect x="38" y="112" width="54" height="8" rx="4" fill="rgba(255,255,255,0.05)" />
          {/* Solar energy lines radiating */}
          <line x1="110" y1="10" x2="110" y2="40" stroke="#10b981" strokeWidth="2" opacity="0.6" />
          <line x1="50" y1="18" x2="70" y2="42" stroke="#10b981" strokeWidth="1.5" opacity="0.4" />
          <line x1="170" y1="18" x2="150" y2="42" stroke="#10b981" strokeWidth="1.5" opacity="0.4" />
          <line x1="30" y1="35" x2="55" y2="50" stroke="#10b981" strokeWidth="1" opacity="0.3" />
          <line x1="190" y1="35" x2="165" y2="50" stroke="#10b981" strokeWidth="1" opacity="0.3" />
          {/* Glowing nodes at line tips */}
          <circle cx="110" cy="10" r="3" fill="#10b981" opacity="0.8" />
          <circle cx="50" cy="18" r="2.5" fill="#10b981" opacity="0.6" />
          <circle cx="170" cy="18" r="2.5" fill="#10b981" opacity="0.6" />
          {/* Floating currency symbols */}
          <text x="186" y="45" fontSize="22" fill="#3b82f6" opacity="0.6" fontWeight="bold">$</text>
          <text x="12" y="38" fontSize="16" fill="#60a5fa" opacity="0.5" fontWeight="bold">€</text>
          <text x="192" y="140" fontSize="14" fill="#93c5fd" opacity="0.4" fontWeight="bold">₦</text>
          {/* Sun glow */}
          <circle cx="157" cy="97" r="24" fill="rgba(59,130,246,0.06)" />
        </svg>
      ),
    },
    {
      title: 'Dynamic Commission Spread & Clearing',
      highlight: '10% commission active on all trip fares.',
      desc: 'EOD commission clearing with instant QCoins/cash settlement for premium card members.',
      bgClass: 'slide-bg-dynamic',
      svg: (
        <svg viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          {/* Background grid dots */}
          <circle cx="30" cy="30" r="1.5" fill="rgba(16,185,129,0.1)" />
          <circle cx="80" cy="30" r="1.5" fill="rgba(16,185,129,0.1)" />
          <circle cx="130" cy="30" r="1.5" fill="rgba(16,185,129,0.1)" />
          <circle cx="180" cy="30" r="1.5" fill="rgba(16,185,129,0.1)" />
          {/* Rising bar chart */}
          <rect x="20" y="116" width="28" height="48" rx="5" fill="rgba(16,185,129,0.25)" stroke="#10b981" strokeWidth="1.5" />
          <rect x="58" y="90" width="28" height="74" rx="5" fill="rgba(16,185,129,0.4)" stroke="#10b981" strokeWidth="1.5" />
          <rect x="96" y="62" width="28" height="102" rx="5" fill="rgba(16,185,129,0.55)" stroke="#10b981" strokeWidth="1.5" />
          <rect x="134" y="32" width="28" height="132" rx="5" fill="#10b981" stroke="#34d399" strokeWidth="1.5" />
          {/* Bar top glow highlights */}
          <rect x="20" y="116" width="28" height="6" rx="3" fill="rgba(16,185,129,0.4)" />
          <rect x="58" y="90" width="28" height="6" rx="3" fill="rgba(16,185,129,0.5)" />
          <rect x="96" y="62" width="28" height="6" rx="3" fill="rgba(16,185,129,0.6)" />
          <rect x="134" y="32" width="28" height="6" rx="3" fill="rgba(52,211,153,0.7)" />
          {/* Trend line */}
          <polyline points="34,112 72,86 110,58 148,28" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Arrow up */}
          <polygon points="148,12 158,30 138,30" fill="#34d399" />
          {/* Axes */}
          <line x1="14" y1="164" x2="190" y2="164" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="14" y1="20" x2="14" y2="164" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          {/* Percent badge */}
          <rect x="142" y="2" width="48" height="24" rx="12" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="1.5" />
          <text x="150" y="18" fontSize="12" fill="#34d399" fontWeight="bold">+10%</text>
        </svg>
      ),
    },
  ];

  // Auto-advance hero every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // ── Currency hook — live exchange rates + geo-detection ───────────────────
  const currency = useCurrency();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  // ── KPI values (live from ledger or loading placeholder) ──────────────────
  const grossVolume   = metrics ? currency.format(metrics.grossVolume)  : '—';
  const commission    = metrics ? currency.format(metrics.commission)   : '—';
  const chamaEscrow   = metrics ? currency.format(metrics.chamaEscrow)  : '—';
  const greenSwapQC   = metrics ? `${(metrics.greenSwapCredits).toLocaleString()} QC` : '—';
  const chamaGroupSz  = settings.chamaGroupSize;
  const solarDiscount = settings.solarDiscount;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Page heading */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'var(--font-outfit)', background: 'linear-gradient(90deg,#fff 0%,rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '0.75rem' }}>
            Welcome back, Admin
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--foreground-dim)', marginTop: '0.5rem' }}>
            CRM analytics clearance active — figures sourced from GL ledger.
          </p>
        </div>

        {/* Currency switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {currency.loading ? (
            <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} /> Loading rates…
            </span>
          ) : (
            <>
              <Globe size={13} style={{ color: 'var(--foreground-muted)' }} />
              <span style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>Display:</span>

              {/* Quick-access pills — most common currencies */}
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {QUICK_CURRENCIES.map(code => {
                  const cur = ALL_CURRENCIES.find(c => c.code === code);
                  if (!cur) return null;
                  const isActive = currency.displayCurrency === code;
                  return (
                    <button key={code} onClick={() => currency.setDisplayCurrency(code)}
                      style={{
                        padding: '0.2rem 0.55rem', fontSize: '0.65rem', fontWeight: '700',
                        background: isActive ? 'rgba(255,184,0,0.15)' : 'rgba(255,255,255,0.03)',
                        border: isActive ? '1px solid rgba(255,184,0,0.4)' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '0.35rem',
                        color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      {cur.flag} {cur.code}
                    </button>
                  );
                })}

                {/* "More" button — opens full country search modal */}
                <button
                  onClick={() => { setShowCurrencyModal(true); setCurrencySearch(''); }}
                  style={{
                    padding: '0.2rem 0.6rem', fontSize: '0.65rem', fontWeight: '700',
                    background: !QUICK_CURRENCIES.includes(currency.displayCurrency) ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                    border: !QUICK_CURRENCIES.includes(currency.displayCurrency) ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.35rem',
                    color: !QUICK_CURRENCIES.includes(currency.displayCurrency) ? '#3b82f6' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                  }}>
                  <Globe size={10} />
                  {!QUICK_CURRENCIES.includes(currency.displayCurrency)
                    ? `${ALL_CURRENCIES.find(c => c.code === currency.displayCurrency)?.flag ?? '🌐'} ${currency.displayCurrency}`
                    : 'More'}
                </button>
              </div>

              {/* Rate source badge */}
              {currency.ratesSource && currency.ratesSource !== 'fallback' && (
                <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.18)', marginLeft: '0.25rem' }}>
                  live rates
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Hero Banner + Customer Analytics ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.25rem', alignItems: 'stretch' }}>

        {/* Hero slide — auto-advancing, text left, SVG illustration right */}
        <div className={`slide-hero-container ${heroSlides[currentSlide].bgClass}`} style={{ position: 'relative', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', padding: '2.5rem 2.5rem 1.5rem', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem', minHeight: '280px', transition: 'background 0.6s ease-in-out' }}>

          {/* Ambient glow */}
          <div style={{ position: 'absolute', top: '-40%', right: '-5%', width: '450px', height: '450px', background: 'radial-gradient(circle,rgba(255,184,0,0.1) 0%,transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

          {/* Content row: text left, SVG right */}
          <div style={{ zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>

            {/* Left — text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', padding: '0.35rem 0.9rem', borderRadius: '2rem', marginBottom: '1rem' }}>
                <span style={{ width: '7px', height: '7px', background: 'var(--primary)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>System Status Highlight</span>
              </div>
              <h3 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff', fontFamily: 'var(--font-outfit)', letterSpacing: '0.01em', lineHeight: 1.15, marginBottom: '0.85rem' }}>
                {heroSlides[currentSlide].title}
              </h3>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.65)', lineHeight: '1.65', marginBottom: '0.75rem', maxWidth: '520px' }}>
                {heroSlides[currentSlide].desc}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '700' }}>
                {heroSlides[currentSlide].highlight}
              </p>
            </div>

            {/* Right — SVG illustration */}
            <div style={{ flexShrink: 0, width: '240px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.95 }}>
              {heroSlides[currentSlide].svg}
            </div>
          </div>

          {/* Slide indicators */}
          <div style={{ display: 'flex', gap: '0.6rem', zIndex: 1 }}>
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} style={{ width: '80px', height: '5px', background: '#ffffff', border: 'none', borderRadius: '3px', cursor: 'pointer', opacity: currentSlide === i ? 1 : 0.25, transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)', boxShadow: currentSlide === i ? '0 0 8px rgba(255,184,0,0.5)' : 'none', outline: 'none' }} />
            ))}
          </div>
        </div>

        {/* Customer analytics mini-cards stacked on the right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '180px' }}>

          {/* Total Customers */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>Total Customers</span>
              <div style={{ background: 'rgba(255,184,0,0.1)', borderRadius: '0.5rem', padding: '0.3rem' }}>
                <Users size={13} style={{ color: 'var(--primary)' }} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', fontFamily: 'var(--font-outfit)', lineHeight: 1 }}>
              {metricsLoading ? '—' : fmtInt(metrics?.totalCustomers ?? 0)}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>across all segments</div>
          </div>

          {/* Drivers */}
          <div style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '1rem', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.65rem', color: 'rgba(168,85,247,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>Drivers</span>
              <div style={{ background: 'rgba(168,85,247,0.12)', borderRadius: '0.5rem', padding: '0.3rem' }}>
                <ShieldAlert size={13} style={{ color: '#a855f7' }} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#a855f7', fontFamily: 'var(--font-outfit)', lineHeight: 1 }}>
              {metricsLoading ? '—' : fmtInt(metrics?.driverCount ?? 0)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ArrowUpRight size={10} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>active & verified</span>
            </div>
          </div>

          {/* Riders */}
          <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '1rem', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.65rem', color: 'rgba(59,130,246,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>Riders</span>
              <div style={{ background: 'rgba(59,130,246,0.12)', borderRadius: '0.5rem', padding: '0.3rem' }}>
                <Users size={13} style={{ color: '#3b82f6' }} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#3b82f6', fontFamily: 'var(--font-outfit)', lineHeight: 1 }}>
              {metricsLoading ? '—' : fmtInt(metrics?.riderCount ?? 0)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ArrowUpRight size={10} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>registered riders</span>
            </div>
          </div>

          {/* Partners */}
          <div style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: '1rem', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.65rem', color: 'rgba(249,115,22,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>Partners</span>
              <div style={{ background: 'rgba(249,115,22,0.12)', borderRadius: '0.5rem', padding: '0.3rem' }}>
                <Layers size={13} style={{ color: '#f97316' }} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#f97316', fontFamily: 'var(--font-outfit)', lineHeight: 1 }}>
              {metricsLoading ? '—' : fmtInt(metrics?.partnerCount ?? 0)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ArrowUpRight size={10} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>fleet partners</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── KPI Cards — values from GL ledger ── */}
      <div className="analytics-grid">

        {/* Gross Platform Volume — GL 4100 Platform Revenue CREDIT sum */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Gross Platform Volume</span>
            <DollarSign size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="kpi-value" style={{ opacity: metricsLoading ? 0.4 : 1 }}>{grossVolume}</div>
          <div>
            <span className="trend-badge trend-up"><ArrowUpRight size={10} /> GL 4100</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', marginLeft: '0.5rem' }}>Platform Revenue credits</span>
          </div>
        </div>

        {/* Commission Income — GL 4200 Commission Income CREDIT sum */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span>10% Commission Spread</span>
            <Percent size={16} style={{ color: '#10b981' }} />
          </div>
          <div className="kpi-value" style={{ opacity: metricsLoading ? 0.4 : 1 }}>{commission}</div>
          <div>
            <span className="trend-badge trend-up"><ArrowUpRight size={10} /> GL 4200</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', marginLeft: '0.5rem' }}>Commission Income credits</span>
          </div>
        </div>

        {/* Active Chama Escrows — GL 2300 Chama Escrow Liability CREDIT sum (outstanding) */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Active Chama Escrows</span>
            <Users size={16} style={{ color: '#3b82f6' }} />
          </div>
          <div className="kpi-value" style={{ opacity: metricsLoading ? 0.4 : 1 }}>{chamaEscrow}</div>
          <div>
            <span className="trend-badge trend-up"><ArrowUpRight size={10} /> GL 2300</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', marginLeft: '0.5rem' }}>Group of {chamaGroupSz} matched</span>
          </div>
        </div>

        {/* Green Swap Credits — GL 4400 Green Swap Credits CREDIT sum ÷ $0.50 */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Green Swap Credits</span>
            <Zap size={16} style={{ color: '#8b5cf6' }} />
          </div>
          <div className="kpi-value" style={{ opacity: metricsLoading ? 0.4 : 1 }}>{greenSwapQC}</div>
          <div>
            <span className="trend-badge trend-down"><ArrowDownRight size={10} /> GL 4400</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', marginLeft: '0.5rem' }}>{solarDiscount}% discount active</span>
          </div>
        </div>

      </div>

      {/* ── Charts + Ledger Row ── */}
      <div className="charts-row">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1 }}>

          {/* Revenue chart — GL 4100 daily */}
          {renderChartCard('revenue', 'Financial Revenue & Spread', <TrendingUp size={18} style={{ color: 'var(--primary)' }} />)}

          {/* Loans + Customers side-by-side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: '1.5rem', width: '100%' }}>
            {renderChartCard('loans',     'Chama Escrow Loans & Compliance',  <Coins    size={18} style={{ color: '#10b981' }} />)}
            {renderChartCard('customers', 'Customer Acquisition Trends',       <Users    size={18} style={{ color: '#3b82f6' }} />)}
          </div>

          {/* Drivers + Partners side-by-side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: '1.5rem', width: '100%' }}>
            {renderChartCard('drivers',  'Driver Acquisition & Vetting',      <ShieldAlert size={18} style={{ color: '#a855f7' }} />)}
            {renderChartCard('partners', 'Fleet Partners Cleared Yield',       <Layers      size={18} style={{ color: '#f97316' }} />)}
          </div>

        </div>

        {/* ── Real-time Ledger Box ── */}
        <div className="ledger-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} style={{ color: '#10b981' }} />
              <span>GL Journal Ledger</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
              <button onClick={() => fetchTransactions()} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', textTransform: 'none' }}>
                <RefreshCw size={10} /> Refresh
              </button>
              <button onClick={simulateActivity} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', textTransform: 'none' }}>
                Simulate
              </button>
            </div>
          </div>

          <div className="ledger-list">
            {txLoading && ledgerTxs.length === 0 && (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>Loading journal entries…</div>
            )}
            {ledgerTxs.map(tx => (
              <div className="ledger-item" key={tx.id}>
                <div className={`ledger-icon ${tx.type}`}>
                  {tx.type === 'chama'   && <Users       size={14} />}
                  {tx.type === 'swap'    && <Zap         size={14} />}
                  {tx.type === 'fuel'    && <Coins       size={14} />}
                  {tx.type === 'vetting' && <ShieldAlert size={14} />}
                  {tx.type === 'system'  && <Activity    size={14} />}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.75rem' }}>{tx.message}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>{tx.timestamp}</div>
                </div>
                {tx.amount && (
                  <div style={{ fontWeight: '800', fontSize: '0.8rem', color: tx.amount.startsWith('+') ? '#10b981' : '#ef4444', whiteSpace: 'nowrap' }}>
                    {tx.amount}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Date Range Modal ── */}
      {activeDateModalChart && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setActiveDateModalChart(null)}>
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
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.7rem' }}>Start Date</label>
                <input type="date" value={tempStartDate} onChange={e => setTempStartDate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.35rem', color: '#fff', outline: 'none' }} />
              </div>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.7rem' }}>End Date</label>
                <input type="date" value={tempEndDate} onChange={e => setTempEndDate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.35rem', color: '#fff', outline: 'none' }} />
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: '1rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }} onClick={() => setActiveDateModalChart(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.7rem', color: '#000' }}
                onClick={() => {
                  if (!tempStartDate || !tempEndDate) return;
                  const key = activeDateModalChart;
                  setChartDateRanges(prev => ({ ...prev, [key]: { start: tempStartDate, end: tempEndDate } }));
                  // also refresh metrics with same range
                  fetchMetrics(tempStartDate, tempEndDate);
                  fetchTransactions(tempStartDate, tempEndDate);
                  triggerToast(`${key} range updated — re-querying GL ledger`);
                  setActiveDateModalChart(null);
                }}>
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Currency Picker Modal ── */}
      {showCurrencyModal && (
        <div
          onClick={() => setShowCurrencyModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface, #0f0f0f)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '1.25rem',
              width: '100%', maxWidth: '560px',
              maxHeight: '80vh',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
            }}>

            {/* Modal header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Globe size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: '800', fontSize: '1rem', fontFamily: 'var(--font-outfit)' }}>Select Display Currency</span>
              </div>
              <button onClick={() => setShowCurrencyModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <input
                autoFocus
                type="text"
                placeholder="Search currency or country…"
                value={currencySearch}
                onChange={e => setCurrencySearch(e.target.value)}
                style={{
                  width: '100%', padding: '0.6rem 0.85rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.5rem', color: '#fff',
                  fontSize: '0.85rem', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Currency grid */}
            <div style={{ overflowY: 'auto', padding: '0.75rem 1rem', flex: 1 }}>
              {(() => {
                const q = currencySearch.toLowerCase().trim();
                const filtered = ALL_CURRENCIES.filter(c =>
                  !q ||
                  c.code.toLowerCase().includes(q) ||
                  c.name.toLowerCase().includes(q) ||
                  c.symbol.toLowerCase().includes(q)
                );
                if (filtered.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--foreground-muted)', fontSize: '0.8rem' }}>
                      No currencies found for "{currencySearch}"
                    </div>
                  );
                }
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.4rem' }}>
                    {filtered.map(cur => {
                      const isActive = currency.displayCurrency === cur.code;
                      const rate = currency.rates[cur.code];
                      return (
                        <button
                          key={cur.code}
                          onClick={() => {
                            currency.setDisplayCurrency(cur.code);
                            setShowCurrencyModal(false);
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 0.75rem',
                            background: isActive ? 'rgba(255,184,0,0.1)' : 'rgba(255,255,255,0.02)',
                            border: isActive ? '1px solid rgba(255,184,0,0.35)' : '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '0.6rem', cursor: 'pointer',
                            transition: 'all 0.15s', textAlign: 'left',
                          }}>
                          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{cur.flag}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: isActive ? 'var(--primary)' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {cur.symbol} {cur.code}
                            </div>
                            <div style={{ fontSize: '0.58rem', color: 'var(--foreground-muted)', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {cur.name}
                            </div>
                            {rate && (
                              <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.05rem' }}>
                                1 USD = {rate >= 1 ? rate.toFixed(2) : rate.toFixed(4)} {cur.code}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
                {ALL_CURRENCIES.length} currencies · Rates from {currency.ratesSource || 'open.er-api.com'} · Saved to preferences
              </span>
              <button onClick={() => setShowCurrencyModal(false)}
                className="btn btn-secondary"
                style={{ padding: '0.3rem 0.85rem', fontSize: '0.7rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
