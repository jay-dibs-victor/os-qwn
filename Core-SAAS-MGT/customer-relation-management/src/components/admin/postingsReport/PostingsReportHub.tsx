import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import {
  listTripFinancialRecords, getRevenueSummary,
  listAllDriverEarnings, listDriverEarningsByDriver,
  listPartnerSettlements,
  listAllRemittances, getRemittanceSummary,
  getAuditTrail, getGlImpact,
  getTrialBalance, getProfitAndLoss, getBalanceSheet,
  listGlAccountsFull,
} from '../../../api/financialTestGround'
import { listTransactions } from '../../../api/ledger'
import { listWalletTransactions } from '../../../api/wallet'
import { listPaymentHistory } from '../../../api/payments'

interface Props { triggerToast: (msg: string) => void }

type TabId = 'all-transactions' | 'trip-revenue' | 'earnings' | 'settlements' | 'remittances' | 'wallet' | 'payment-history' | 'audit-reports' | 'gl-snapshot'

const tabs: { id: TabId; label: string }[] = [
  { id: 'all-transactions', label: 'All Transactions' },
  { id: 'trip-revenue', label: 'Trip Revenue' },
  { id: 'earnings', label: 'Driver Earnings' },
  { id: 'settlements', label: 'Partner Settlements' },
  { id: 'remittances', label: 'Remittances' },
  { id: 'wallet', label: 'Wallet Txns' },
  { id: 'payment-history', label: 'Payment History' },
  { id: 'audit-reports', label: 'Audit & Reports' },
  { id: 'gl-snapshot', label: 'GL Snapshot' },
]

export default function PostingsReportHub({ triggerToast }: Props) {
  const tenantId = useAuthStore((s) => s.tenantId) || 'default'
  const [activeTab, setActiveTab] = useState<TabId>('all-transactions')
  const [loading, setLoading] = useState(false)

  // Data state
  const [revRecords, setRevRecords] = useState<any[]>([])
  const [revSummary, setRevSummary] = useState<any>(null)
  const [earnings, setEarnings] = useState<any[]>([])
  const [settlements, setSettlements] = useState<any[]>([])
  const [rmSchedules, setRmSchedules] = useState<any[]>([])
  const [rmSummary1, setRmSummary1] = useState<any>(null)
  const [walletTxns, setWalletTxns] = useState<any[]>([])
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])
  const [auditTrail, setAuditTrail] = useState<any[]>([])
  const [glImpact, setGlImpact] = useState<any>(null)
  const [trialBalance, setTrialBalance] = useState<any>(null)
  const [pnl, setPnl] = useState<any>(null)
  const [bs, setBs] = useState<any>(null)
  const [glAccounts, setGlAccounts] = useState<any[]>([])
  const [ledgerTxns, setLedgerTxns] = useState<any[]>([])

  // Filters
  const [earnDriverFilter, setEarnDriverFilter] = useState('')
  const [auditJournalId, setAuditJournalId] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [revData, revSum, earnData, stlData, rmData, rmSum, glAcc] = await Promise.allSettled([
        listTripFinancialRecords(tenantId, 0, 50),
        getRevenueSummary(tenantId),
        listAllDriverEarnings(tenantId, 0, 50),
        listPartnerSettlements(tenantId),
        listAllRemittances(tenantId),
        getRemittanceSummary(tenantId),
        listGlAccountsFull(tenantId),
      ])
      if (revData.status === 'fulfilled') setRevRecords(revData.value.data.data || revData.value.data)
      if (revSum.status === 'fulfilled') setRevSummary(revSum.value.data)
      if (earnData.status === 'fulfilled') setEarnings(Array.isArray(earnData.value.data) ? earnData.value.data : (earnData.value.data as any)?.data || [])
      if (stlData.status === 'fulfilled') setSettlements(stlData.value.data)
      if (rmData.status === 'fulfilled') setRmSchedules(rmData.value.data)
      if (rmSum.status === 'fulfilled') setRmSummary1(rmSum.value.data)
      if (glAcc.status === 'fulfilled') setGlAccounts(glAcc.value.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [tenantId])

  const s = (title: string, children: React.ReactNode, summary?: React.ReactNode) => (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem' }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>{title}</h3>
      {summary && <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>{summary}</div>}
      {children}
    </div>
  )

  const tbl = (headers: string[], rows: any[] = [], render: (row: any, i: number) => React.ReactNode) => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
        <thead><tr>{headers.map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--foreground-muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={r.id || i}>{render(r, i)}</tr>)}</tbody>
      </table>
    </div>
  )

  const bdg = (v: string) => <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.6rem', fontWeight: 700, background: 'rgba(255,184,0,0.1)', color: 'var(--primary)' }}>{v}</span>
  const btnS = { background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 700, border: 'none', padding: '0.4rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.7rem', cursor: 'pointer' }
  const inp = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', padding: '0.4rem 0.75rem', color: '#fff', fontSize: '0.7rem', outline: 'none', minWidth: '160px' }
  const row = { display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '0.75rem' }

  const SummaryCard = ({ label, value }: { label: string; value: string | number }) => (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
      <div style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff' }}>{Number(value).toLocaleString()}</div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '0.4rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 700, border: activeTab === t.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)', background: activeTab === t.id ? 'rgba(255,184,0,0.1)' : 'transparent', color: activeTab === t.id ? 'var(--primary)' : 'var(--foreground-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>Loading transaction data...</div>}

      {/* ═══ ALL TRANSACTIONS ═══ */}
      {activeTab === 'all-transactions' && (
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <button style={btnS} onClick={fetchAll}>Refresh All Data</button>
          </div>
          {revSummary && s('Revenue Overview', <></>, <>
            <SummaryCard label="Total Revenue" value={revSummary.totalRevenue} />
            <SummaryCard label="Total Commission" value={revSummary.totalCommission} />
            <SummaryCard label="Total Payouts" value={revSummary.totalPayouts} />
            <SummaryCard label="Total Trips" value={revSummary.totalTrips} />
          </>)}
          {s('Recent Trip Financial Records', tbl(
            ['Trip ID', 'Fare', 'Commission', 'Driver Net', 'Partner Amt', 'Driver', 'Status'],
            revRecords.slice(0, 10),
            (r) => <>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}><span style={{ fontFamily: 'monospace', fontSize: '0.6rem' }}>{r.tripId?.slice(0, 14)}...</span></td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{Number(r.totalFare).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{Number(r.commissionAmount).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{Number(r.driverNetAmount).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{Number(r.partnerAmount).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{r.driverCustomerId?.slice(0, 8)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{bdg(r.status)}</td>
            </>
          ))}
        </div>
      )}

      {/* ═══ TRIP REVENUE ═══ */}
      {activeTab === 'trip-revenue' && (
        <div>
          {revSummary && s('Revenue Summary', <></>, <>
            <SummaryCard label="Total Revenue" value={revSummary.totalRevenue} />
            <SummaryCard label="Total Commission" value={revSummary.totalCommission} />
            <SummaryCard label="Total Payouts" value={revSummary.totalPayouts} />
            <SummaryCard label="Total Trips" value={revSummary.totalTrips} />
            <SummaryCard label="Period Start" value={revSummary.periodStart ? new Date(revSummary.periodStart).toLocaleDateString() : '-'} />
            <SummaryCard label="Period End" value={revSummary.periodEnd ? new Date(revSummary.periodEnd).toLocaleDateString() : '-'} />
          </>)}
          {s('All Trip Financial Records', tbl(
            ['Trip ID', 'Fare', 'Commission', 'Driver Gross', 'Driver Net', 'Partner', 'Platform Fee', 'Driver', 'Corporate', 'Status', 'Created'],
            revRecords,
            (r) => <>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}><span style={{ fontFamily: 'monospace', fontSize: '0.6rem' }}>{r.tripId?.slice(0, 14)}</span></td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{Number(r.totalFare).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{Number(r.commissionAmount).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{Number(r.driverGrossAmount).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{Number(r.driverNetAmount).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{Number(r.partnerAmount).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{Number(r.platformFee).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{r.driverCustomerId?.slice(0, 8)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{r.isCorporateDriver ? bdg('Corporate') : bdg('Stand-alone')}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{bdg(r.status)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-muted)', fontSize: '0.6rem' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
            </>
          ))}
        </div>
      )}

      {/* ═══ DRIVER EARNINGS ═══ */}
      {activeTab === 'earnings' && (
        <div>
          <div style={row}>
            <input placeholder="Filter by Driver ID" value={earnDriverFilter} onChange={e => setEarnDriverFilter(e.target.value)} style={inp} />
            <button style={btnS} onClick={async () => {
              const r = earnDriverFilter ? await listDriverEarningsByDriver(tenantId, earnDriverFilter).catch(() => null) : await listAllDriverEarnings(tenantId, 0, 100).catch(() => null)
              if (r) setEarnings(Array.isArray(r.data) ? r.data : (r.data as any)?.data || [])
            }}>Load</button>
          </div>
          {s('Driver Earnings', tbl(
            ['Driver ID', 'Fare', 'Net Earnings', 'Final Payout', 'Commission', 'Status', 'Trip ID', 'Date'],
            earnings,
            (r) => <>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace', fontSize: '0.6rem' }}>{r.driverCustomerId?.slice(0, 12)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>₦{Number(r.tripFare).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#10b981', fontWeight: 700 }}>₦{Number(r.netEarnings).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff', fontWeight: 700 }}>₦{Number(r.finalPayout).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-muted)' }}>₦{Number(r.platformCommission) + Number(r.partnerCommission)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{bdg(r.status)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace', fontSize: '0.6rem' }}>{r.tripId?.slice(0, 10) || '-'}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-muted)', fontSize: '0.6rem' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
            </>
          ))}
        </div>
      )}

      {/* ═══ PARTNER SETTLEMENTS ═══ */}
      {activeTab === 'settlements' && s('Partner Settlements', tbl(
        ['Partner ID', 'Total Accrued', 'Total Paid', 'Outstanding', 'Status', 'Last Settlement', 'Created'],
        settlements,
        (r) => <>
          <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{r.partnerId?.slice(0, 12)}</td>
          <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>₦{Number(r.totalAccrued).toLocaleString()}</td>
          <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>₦{Number(r.totalPaid).toLocaleString()}</td>
          <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>₦{Number(r.outstandingBalance).toLocaleString()}</td>
          <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{bdg(r.status)}</td>
          <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-muted)' }}>{r.lastSettlementDate ? new Date(r.lastSettlementDate).toLocaleDateString() : '-'}</td>
          <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-muted)', fontSize: '0.6rem' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
        </>
      ))}

      {/* ═══ REMITTANCES ═══ */}
      {activeTab === 'remittances' && (
        <div>
          {rmSummary1 && s('Remittance Summary', <></>, <>
            <SummaryCard label="Total Schedules" value={rmSummary1.totalSchedules} />
            <SummaryCard label="Pending" value={rmSummary1.pendingCount} />
            <SummaryCard label="Completed" value={rmSummary1.completedCount} />
            <SummaryCard label="Total Amount" value={rmSummary1.totalAmount} />
            <SummaryCard label="Total Processed" value={rmSummary1.totalProcessed} />
            <SummaryCard label="Overdue" value={rmSummary1.overdueCount} />
          </>)}
          {s('All Remittance Schedules', tbl(
            ['Partner', 'Cycle', 'Amount', 'Processed', 'Due Date', 'Processed At', 'Admin Override', 'Status'],
            rmSchedules,
            (r) => <>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{r.partnerId?.slice(0, 12)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{bdg(r.cycle)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>₦{Number(r.amount).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>₦{Number(r.processedAmount).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-muted)', fontSize: '0.6rem' }}>{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-'}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-muted)', fontSize: '0.6rem' }}>{r.processedAt ? new Date(r.processedAt).toLocaleDateString() : '-'}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{r.isAdminOverride ? bdg('Override') : '-'}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{bdg(r.status)}</td>
            </>
          ))}
        </div>
      )}

      {/* ═══ WALLET TXNS ═══ */}
      {activeTab === 'wallet' && (
        <div>
          <button style={btnS} onClick={async () => {
            const r = await listWalletTransactions({ tenantId, page: 0, pageSize: 50 }).catch(() => null)
            if (r) setWalletTxns(r.data?.data || r.data || [])
          }}>Load Wallet Transactions</button>
          {s('Wallet Transactions', tbl(
            ['Reference', 'Type', 'Status', 'Amount', 'Currency', 'Description', 'Date'],
            walletTxns,
            (r) => <>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace', fontSize: '0.6rem' }}>{r.reference}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{bdg(r.type)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{bdg(r.status)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>₦{Number(r.amount).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{r.currency}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-muted)' }}>{r.description || '-'}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-muted)', fontSize: '0.6rem' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
            </>
          ))}
        </div>
      )}

      {/* ═══ PAYMENT HISTORY ═══ */}
      {activeTab === 'payment-history' && (
        <div>
          <button style={btnS} onClick={async () => {
            const r = await listPaymentHistory({ tenantId, page: 0, pageSize: 50 }).catch(() => null)
            if (r) setPaymentHistory((r as any)?.data || [])
          }}>Load Payment History</button>
          {s('Payment Instructions', tbl(
            ['Reference', 'Rail', 'Status', 'Amount', 'Currency', 'Source', 'Target', 'Created'],
            paymentHistory,
            (r) => <>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace', fontSize: '0.6rem' }}>{r.reference || r.id?.slice(0, 12)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{bdg(r.rail)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{bdg(r.status)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>₦{Number(r.amount).toLocaleString()}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{r.currency}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace', fontSize: '0.6rem' }}>{r.sourceAccountId?.slice(0, 10)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace', fontSize: '0.6rem' }}>{r.targetAccountId?.slice(0, 10)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-muted)', fontSize: '0.6rem' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
            </>
          ))}
        </div>
      )}

      {/* ═══ AUDIT & REPORTS ═══ */}
      {activeTab === 'audit-reports' && (
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button style={btnS} onClick={async () => { const r = await getAuditTrail(tenantId, 0, 50).catch(() => null); if (r) setAuditTrail((r.data as any)?.data || r.data || []) }}>Load Audit Trail</button>
            <button style={btnS} onClick={async () => { const r = await getTrialBalance(tenantId).catch(() => null); if (r) setTrialBalance(r.data) }}>Load Trial Balance</button>
            <button style={btnS} onClick={async () => { const r = await getProfitAndLoss(tenantId).catch(() => null); if (r) setPnl(r.data) }}>Load P&L</button>
            <button style={btnS} onClick={async () => { const r = await getBalanceSheet(tenantId).catch(() => null); if (r) setBs(r.data) }}>Load Balance Sheet</button>
          </div>
          <div style={row}>
            <input placeholder="Journal ID for GL Impact" value={auditJournalId} onChange={e => setAuditJournalId(e.target.value)} style={inp} />
            <button style={btnS} onClick={async () => { const r = await getGlImpact(tenantId, auditJournalId).catch(() => null); if (r) setGlImpact(r.data) }}>Check GL Impact</button>
          </div>

          {glImpact && s('GL Impact', <pre style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.65rem', color: '#10b981', overflow: 'auto', maxHeight: '300px', whiteSpace: 'pre-wrap' }}>{JSON.stringify(glImpact, null, 2)}</pre>)}
          {trialBalance && s('Trial Balance', <pre style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.65rem', color: '#10b981', overflow: 'auto', maxHeight: '300px', whiteSpace: 'pre-wrap' }}>{JSON.stringify(trialBalance, null, 2)}</pre>)}
          {pnl && s('Profit & Loss', <pre style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.65rem', color: '#10b981', overflow: 'auto', maxHeight: '300px', whiteSpace: 'pre-wrap' }}>{JSON.stringify(pnl, null, 2)}</pre>)}
          {bs && s('Balance Sheet', <pre style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.65rem', color: '#10b981', overflow: 'auto', maxHeight: '300px', whiteSpace: 'pre-wrap' }}>{JSON.stringify(bs, null, 2)}</pre>)}

          {s('Audit Trail Entries', tbl(
            ['Event', 'Entity', 'Actor', 'Description', 'Timestamp'],
            auditTrail,
            (a) => <>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{bdg(a.event)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{a.entityType}:{a.entityId?.slice(0, 10)}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{a.actor}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--foreground-muted)' }}>{a.description}</td>
              <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--foreground-muted)', fontSize: '0.6rem' }}>{a.timestamp ? new Date(a.timestamp).toLocaleString() : '-'}</td>
            </>
          ))}
        </div>
      )}

      {/* ═══ GL SNAPSHOT ═══ */}
      {activeTab === 'gl-snapshot' && s('General Ledger Accounts', tbl(
        ['Code', 'Name', 'Type', 'Balance', 'Currency'],
        glAccounts,
        (a) => <>
          <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'monospace', fontWeight: 700 }}>{a.code}</td>
          <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>{a.name}</td>
          <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{bdg(a.type)}</td>
          <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }}>₦{Number(a.balance || 0).toLocaleString()}</td>
          <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{a.currency || 'NGN'}</td>
        </>
      ))}
    </div>
  )
}
