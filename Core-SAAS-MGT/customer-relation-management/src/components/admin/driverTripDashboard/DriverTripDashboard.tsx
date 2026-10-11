import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import {
  listDriverEarningsByDriver, getDriverEarningsSummary,
  getTripFinancialRecordByTripId,
  listTripFinancialRecords,
} from '../../../api/financialTestGround'
import { useCurrency, QUICK_CURRENCIES, ALL_CURRENCIES } from '../../../hooks/useCurrency'

interface Props {
  driverId: string
  driverName?: string
  triggerToast: (msg: string) => void
  onBack: () => void
  onViewCustomerInfo?: (driverId: string) => void
}

export default function DriverTripDashboard({ driverId, driverName, triggerToast, onBack, onViewCustomerInfo }: Props) {
  const tenantId = useAuthStore((s) => s.tenantId) || 'default'
  const currency = useCurrency()
  const [loading, setLoading] = useState(false)
  const [earnings, setEarnings] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const [showCurrencyModal, setShowCurrencyModal] = useState(false)
  const [currencySearch, setCurrencySearch] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [earnRes, sumRes, tripRes] = await Promise.allSettled([
        listDriverEarningsByDriver(tenantId, driverId),
        getDriverEarningsSummary(tenantId, driverId),
        listTripFinancialRecords(tenantId, 0, 100, driverId),
      ])
      if (earnRes.status === 'fulfilled') setEarnings(earnRes.value.data)
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data)
      if (tripRes.status === 'fulfilled') {
        const records = Array.isArray(tripRes.value.data) ? tripRes.value.data : (tripRes.value.data as any)?.data || []
        setTrips(records)
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [driverId, tenantId])

  const eArr = earnings || []
  const tArr = trips || []
  const totalEarnings = eArr.reduce((s, e) => s + Number(e.finalPayout), 0)
  const totalCommission = eArr.reduce((s, e) => s + Number(e.platformCommission) + Number(e.partnerCommission), 0)
  const totalBonus = eArr.reduce((s, e) => s + Number(e.bonusAmount), 0)
  const totalPenalty = eArr.reduce((s, e) => s + Number(e.penaltyAmount), 0)
  const totalDeductions = eArr.reduce((s, e) => s + Number(e.subscriptionDeduction) + Number(e.leaseDeduction), 0)

  const ngnRate = currency.rates['NGN'] || 1
  const fmt = (amount: number) => currency.format(amount / ngnRate)

  const section: React.CSSProperties = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem' }
  const card: React.CSSProperties = { background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '0.5rem', minWidth: '120px' }
  const badge = (v: string) => <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.6rem', fontWeight: 700, background: 'rgba(255,184,0,0.1)', color: 'var(--primary)' }}>{v}</span>

  const tbl = (headers: string[], rows: any[], renderRow: (r: any, i: number) => React.ReactNode) => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
        <thead><tr>{headers.map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--foreground-muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
        <tbody>{rows.length > 0 ? rows.map((r, i) => <tr key={r.id || i}>{renderRow(r, i)}</tr>) : <tr><td colSpan={headers.length} style={{ textAlign: 'center', padding: '2rem', color: 'var(--foreground-dim)' }}>No records found</td></tr>}</tbody>
      </table>
    </div>
  )

  const currencyPills = (
    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {QUICK_CURRENCIES.map(code => {
        const cur = ALL_CURRENCIES.find(c => c.code === code);
        if (!cur) return null;
        const isActive = currency.displayCurrency === code;
        return (
          <button key={code} onClick={() => currency.setDisplayCurrency(code)}
            style={{
              padding: '0.2rem 0.55rem', fontSize: '0.65rem', fontWeight: 700,
              background: isActive ? 'rgba(255,184,0,0.15)' : 'rgba(255,255,255,0.03)',
              border: isActive ? '1px solid rgba(255,184,0,0.4)' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '0.35rem',
              color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
            }}>
            {cur.flag} {cur.code}
          </button>
        );
      })}
      <button
        onClick={() => { setShowCurrencyModal(true); setCurrencySearch(''); }}
        style={{
          padding: '0.2rem 0.6rem', fontSize: '0.65rem', fontWeight: 700,
          background: !QUICK_CURRENCIES.includes(currency.displayCurrency) ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
          border: !QUICK_CURRENCIES.includes(currency.displayCurrency) ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.35rem',
          color: !QUICK_CURRENCIES.includes(currency.displayCurrency) ? '#3b82f6' : 'rgba(255,255,255,0.5)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}>
        {!QUICK_CURRENCIES.includes(currency.displayCurrency)
          ? `${ALL_CURRENCIES.find(c => c.code === currency.displayCurrency)?.flag ?? ''} ${currency.displayCurrency}`
          : 'More'}
      </button>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#fff' }}>Driver Transaction Dashboard</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--foreground-dim)', marginTop: '0.25rem' }}>
            Driver: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{driverName || driverId}</span> (ID: {driverId})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {currencyPills}
          <button onClick={loadData} style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 700, border: 'none', padding: '0.4rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.7rem', cursor: 'pointer' }}>Refresh</button>
          {onViewCustomerInfo && (
            <button onClick={() => onViewCustomerInfo(driverId)} style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 700, border: '1px solid rgba(99,102,241,0.3)', padding: '0.4rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.7rem', cursor: 'pointer' }}>
              Customer Information
            </button>
          )}
          <button onClick={onBack} style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #d4af37 100%)', color: '#000', fontWeight: 700, border: 'none', padding: '0.4rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.7rem', cursor: 'pointer' }}>Back to Drivers</button>
        </div>
      </div>

      {loading && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 700 }}>Loading driver data...</div>}

      {currency.loading && (
        <div style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.65rem', color: 'var(--foreground-dim)' }}>
          Loading exchange rates...
        </div>
      )}

      <div style={section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, color: '#fff' }}>Financial Summary</h3>
          <span style={{ fontSize: '0.6rem', color: 'var(--foreground-dim)' }}>
            {currency.symbol()} {currency.displayCurrency} · Rates: {currency.ratesSource || 'live'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={card}><div style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>Total Payout</div><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>{fmt(totalEarnings)}</div></div>
          <div style={card}><div style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>Total Commission</div><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ef4444' }}>{fmt(totalCommission)}</div></div>
          <div style={card}><div style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>Bonus</div><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>{fmt(totalBonus)}</div></div>
          <div style={card}><div style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>Penalty</div><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ef4444' }}>{fmt(totalPenalty)}</div></div>
          <div style={card}><div style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>Deductions</div><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ef4444' }}>{fmt(totalDeductions)}</div></div>
          {summary && (
            <>
              <div style={card}><div style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>Total Paid</div><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>{fmt(Number(summary.totalPaid))}</div></div>
              <div style={card}><div style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>Pending</div><div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>{fmt(Number(summary.totalPending))}</div></div>
            </>
          )}
        </div>
      </div>

      <div style={section}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>Earnings History ({eArr.length} records)</h3>
        {tbl(
          ['Trip ID', 'Fare', 'Net Earnings', 'Final Payout', 'Commission', 'Status', 'Date'],
          eArr,
          (r) => <>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace', fontSize: '0.6rem' }}>{r.tripId?.slice(0, 12) || '-'}</td>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{fmt(Number(r.tripFare))}</td>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#10b981', fontWeight: 700 }}>{fmt(Number(r.netEarnings))}</td>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff', fontWeight: 700 }}>{fmt(Number(r.finalPayout))}</td>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-muted)' }}>Plat: {fmt(Number(r.platformCommission))} / Partner: {fmt(Number(r.partnerCommission))}</td>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{badge(r.status)}</td>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-muted)', fontSize: '0.6rem' }}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
          </>
        )}
      </div>

      <div style={section}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>Trip Revenue Records ({tArr.length} trips)</h3>
        {tbl(
          ['Trip ID', 'Total Fare', 'Commission', 'Driver Gross', 'Driver Net', 'Partner', 'Status', 'Date'],
          tArr,
          (r) => <>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace', fontSize: '0.6rem' }}>
              <span style={{ cursor: 'pointer', color: 'var(--primary)', textDecoration: 'underline' }}
                onClick={() => getTripFinancialRecordByTripId(r.tripId).then(res => { setSelectedTrip(res.data); triggerToast('Trip record loaded') }).catch(() => triggerToast('Trip not found'))}>
                {r.tripId?.slice(0, 14)}...
              </span>
            </td>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{fmt(Number(r.totalFare))}</td>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{fmt(Number(r.commissionAmount))}</td>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{fmt(Number(r.driverGrossAmount))}</td>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{fmt(Number(r.driverNetAmount))}</td>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{fmt(Number(r.partnerAmount))}</td>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{badge(r.status)}</td>
            <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-muted)', fontSize: '0.6rem' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
          </>
        )}
      </div>

      {selectedTrip && (
        <div style={section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, color: '#fff' }}>Trip Details: {selectedTrip.tripId}</h3>
            <button onClick={() => setSelectedTrip(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700 }}>Close</button>
          </div>
          <pre style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.65rem', color: '#10b981', overflow: 'auto', maxHeight: '400px', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(selectedTrip, null, 2)}
          </pre>
        </div>
      )}

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
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>Select Display Currency</span>
              <button onClick={() => setShowCurrencyModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '0.25rem', fontSize: '1.1rem' }}>
                ✕
              </button>
            </div>
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
                            textAlign: 'left',
                          }}>
                          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{cur.flag}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isActive ? 'var(--primary)' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
            <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
                {ALL_CURRENCIES.length} currencies · Rates from {currency.ratesSource || 'open.er-api.com'}
              </span>
              <button onClick={() => setShowCurrencyModal(false)}
                style={{ padding: '0.3rem 0.85rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
