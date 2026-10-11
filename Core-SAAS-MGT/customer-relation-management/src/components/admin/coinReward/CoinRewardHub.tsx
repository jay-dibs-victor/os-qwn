import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import {
  awardTripCoins, getCoinBalance, getCoinWallet,
  listCoinTransactions, listAllCoinWallets,
  type CoinWalletRecord, type CoinTransactionRecord,
} from '../../../api/financialTestGround'

interface Props { triggerToast: (msg: string) => void }

export default function CoinRewardHub({ triggerToast }: Props) {
  const { user } = useAuthStore()
  const tenantId = user?.tenantId || ''

  const [wallets, setWallets] = useState<CoinWalletRecord[]>([])
  const [selectedWallet, setSelectedWallet] = useState<string>('')
  const [transactions, setTransactions] = useState<CoinTransactionRecord[]>([])
  const [loading, setLoading] = useState(false)

  // Award form
  const [awTripId, setAwTripId] = useState('')
  const [awRiderId, setAwRiderId] = useState('')
  const [awDriverId, setAwDriverId] = useState('')
  const [awardResult, setAwardResult] = useState<any>(null)

  // Balance lookup
  const [blEntityType, setBlEntityType] = useState('RIDER')
  const [blEntityId, setBlEntityId] = useState('')
  const [balanceResult, setBalanceResult] = useState<CoinWalletRecord | null>(null)

  useEffect(() => {
    if (tenantId) loadWallets()
  }, [tenantId])

  const loadWallets = async () => {
    setLoading(true)
    try {
      const r = await listAllCoinWallets()
      setWallets(Array.isArray(r.data) ? r.data : [])
    } catch { setWallets([]) }
    setLoading(false)
  }

  const handleAward = async () => {
    if (!awTripId || !awRiderId || !awDriverId) {
      triggerToast('Fill tripId, riderId, and driverId')
      return
    }
    try {
      const r = await awardTripCoins({ tripId: awTripId, tenantId, riderCustomerId: awRiderId, driverCustomerId: awDriverId })
      setAwardResult(r.data)
      triggerToast(`Awarded: rider=₿${r.data.riderCoins}, driver=₿${r.data.driverCoins}, tenant=₿${r.data.tenantCoins}`)
      loadWallets()
    } catch { triggerToast('Award failed') }
  }

  const handleBalanceLookup = async () => {
    if (!blEntityId) return
    try {
      const r = await getCoinWallet(blEntityType, blEntityId)
      setBalanceResult(r.data ?? null)
    } catch { setBalanceResult(null); triggerToast('Lookup failed') }
  }

  const handleViewTransactions = async (walletId: string) => {
    setSelectedWallet(walletId)
    try {
      const r = await listCoinTransactions(walletId)
      setTransactions(r.data?.data ?? [])
    } catch { setTransactions([]) }
  }

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem',
  }
  const row: React.CSSProperties = { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }
  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.4rem', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.7rem',
    minWidth: '120px',
  }
  const btnP: React.CSSProperties = {
    background: 'linear-gradient(135deg, var(--primary) 0%, #d4af37 100%)', color: '#000',
    fontWeight: 700, border: 'none', padding: '0.4rem 0.85rem', borderRadius: '0.5rem',
    fontSize: '0.7rem', cursor: 'pointer',
  }
  const btnS: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 700, border: 'none',
    padding: '0.4rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.7rem', cursor: 'pointer',
  }
  const badge = (v: string) => (
    <span style={{
      display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '1rem',
      fontSize: '0.6rem', fontWeight: 700, background: 'rgba(255,184,0,0.1)', color: 'var(--primary)',
    }}>{v}</span>
  )

  const entityColors: Record<string, string> = { RIDER: '#10b981', DRIVER: '#3b82f6', TENANT: '#f59e0b' }

  return (
    <div className="hub-container">
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Award Coins */}
        <div style={{ ...cardStyle, flex: '1 1 380px' }}>
          <h3>Award Trip Coins</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--foreground-dim)', marginBottom: '0.75rem' }}>
            Credits rider, driver, and tenant wallets per site-wide config
          </p>
          <div style={row}>
            <input placeholder="Trip ID" value={awTripId} onChange={e => setAwTripId(e.target.value)} style={inp} />
            <input placeholder="Rider Customer ID" value={awRiderId} onChange={e => setAwRiderId(e.target.value)} style={inp} />
            <input placeholder="Driver Customer ID" value={awDriverId} onChange={e => setAwDriverId(e.target.value)} style={inp} />
            <button style={btnP} onClick={handleAward}>Award Coins</button>
          </div>
          {awardResult && (
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: '#10b981' }}>Rider: ₿{awardResult.riderCoins}</span>
              <span style={{ color: '#3b82f6' }}>Driver: ₿{awardResult.driverCoins}</span>
              <span style={{ color: '#f59e0b' }}>Tenant: ₿{awardResult.tenantCoins}</span>
            </div>
          )}
        </div>

        {/* Balance Lookup */}
        <div style={{ ...cardStyle, flex: '1 1 380px' }}>
          <h3>Balance Lookup</h3>
          <div style={row}>
            <select value={blEntityType} onChange={e => setBlEntityType(e.target.value)} style={inp}>
              <option value="RIDER">Rider</option><option value="DRIVER">Driver</option><option value="TENANT">Tenant</option>
            </select>
            <input placeholder="Entity ID" value={blEntityId} onChange={e => setBlEntityId(e.target.value)} style={inp} />
            <button style={btnS} onClick={handleBalanceLookup}>Lookup</button>
          </div>
          {balanceResult && (
            <div style={{ marginTop: '0.75rem' }}>
              <strong style={{ color: entityColors[balanceResult.entityType] || '#fff' }}>
                {balanceResult.entityType}
              </strong>
              : ₿{Number(balanceResult.balance).toLocaleString()}
              <span style={{ fontSize: '0.65rem', color: 'var(--foreground-dim)', marginLeft: '0.5rem' }}>
                (Wallet: {balanceResult.id?.slice(0, 12)})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* All Wallets */}
      <div style={cardStyle}>
        <h3>All Coin Wallets ({wallets.length})</h3>
        <button style={btnS} onClick={loadWallets}>Refresh</button>
        {wallets.length === 0 ? (
          <p style={{ color: 'var(--foreground-dim)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
            No wallets yet. Award coins to create them.
          </p>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--foreground-muted)' }}>Entity</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--foreground-muted)' }}>Type</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--foreground-muted)' }}>Balance</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--foreground-muted)' }}>Created</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--foreground-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map(w => (
                  <tr key={w.id}>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace', fontSize: '0.6rem' }}>{w.entityId?.slice(0, 16)}</td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{badge(w.entityType)}</td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', textAlign: 'right', color: entityColors[w.entityType] || '#fff', fontWeight: 700 }}>
                      ₿{Number(w.balance).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-dim)', fontSize: '0.6rem' }}>
                      {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <button style={btnS} onClick={() => handleViewTransactions(w.id)}>Txns</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transactions */}
      {selectedWallet && (
        <div style={cardStyle}>
          <h3>Transactions — {selectedWallet.slice(0, 12)}</h3>
          <button style={btnS} onClick={() => setSelectedWallet('')}>Close</button>
          {transactions.length === 0 ? (
            <p style={{ color: 'var(--foreground-dim)', fontSize: '0.75rem', marginTop: '0.5rem' }}>No transactions</p>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--foreground-muted)' }}>Type</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--foreground-muted)' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--foreground-muted)' }}>Reference</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--foreground-muted)' }}>Trip</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--foreground-muted)' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        {badge(t.type)}
                      </td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', textAlign: 'right', color: t.type === 'CREDIT' ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                        {t.type === 'CREDIT' ? '+' : '-'}₿{Number(t.amount).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace', fontSize: '0.6rem' }}>{t.reference?.slice(0, 20)}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace', fontSize: '0.6rem' }}>{t.tripId?.slice(0, 12) || '-'}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-dim)', fontSize: '0.6rem' }}>{t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
