import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import * as F from '../../../api/financialTestGround'
import type { CoinWalletRecord, CoinTransactionRecord } from '../../../api/financialTestGround'

const {
  initiateTripPayment, verifyTripPayment, completeTripPayment,
  calculateCommissionPreview, getTripPaymentByReference, listTripPayments,
  createCommissionRule, updateCommissionRule, deleteCommissionRule, calculateCommission,
  getRevenueSummary, getTripFinancialRecordByTripId, recordTripRevenue,
  recordDriverEarning, payoutDriverEarning, listDriverEarnings, getDriverEarningsSummary,
  createPartnerSettlement, settlePartnerPayout, getPartnerBalance, listPartnerSettlements,
  createEscrowWallet, lockEscrowFunds, releaseEscrowFunds, escrowAdminOverride,
  listEscrowWallets, getEscrowSummary,
  createSavingsPlan, contributeToSavings, earlyWithdrawalSavings, cancelSavingsPlan,
  listSavingsPlans, getSavingsSummary,
  createRemittanceSchedule, processRemittanceSchedule, processDueRemittances,
  listPendingRemittances, remittanceAdminOverride, listAllRemittances, getRemittanceSummary,
  listCommissionRules, listTripFinancialRecords,
  getAuditTrail, getAuditTrailByReference, getGlImpact,
  getBalanceSheet, getProfitAndLoss, getTrialBalance,
  listGlAccountsFull, getGlAccountsTreeFull,
  awardTripCoins, getCoinWallet, listCoinTransactions, listAllCoinWallets, qcoinExchange,
} = F

type TabId =
  | 'trip-payment' | 'commission' | 'revenue' | 'earnings'
  | 'settlement' | 'escrow' | 'savings' | 'remittance' | 'audit' | 'gl'
  | 'coin-rewards'

interface Props { triggerToast: (msg: string) => void; addNewTrigger?: number; onViewChange?: (view: 'list' | 'manage') => void }

const tabs: { id: TabId; label: string }[] = [
  { id: 'trip-payment', label: 'Trip Payment' }, { id: 'commission', label: 'Commission' },
  { id: 'revenue', label: 'Revenue' }, { id: 'earnings', label: 'Earnings' },
  { id: 'settlement', label: 'Settlement' }, { id: 'escrow', label: 'Escrow' },
  { id: 'savings', label: 'Savings' }, { id: 'remittance', label: 'Remittance' },
  { id: 'audit', label: 'Audit' }, { id: 'gl', label: 'GL Explorer' },
  { id: 'coin-rewards', label: 'Coin Rewards' },
]

const section: React.CSSProperties = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem' }
const row: React.CSSProperties = { display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '0.75rem' }
const label: React.CSSProperties = { fontSize: '0.7rem', fontWeight: 700, color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }
const inp: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.75rem', outline: 'none', minWidth: '170px' }
const sel: React.CSSProperties = { ...inp, minWidth: '190px' }
const btnP: React.CSSProperties = { background: 'linear-gradient(135deg, var(--primary) 0%, #d4af37 100%)', color: '#000', fontWeight: 700, border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }
const btnD: React.CSSProperties = { ...btnP, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff' }
const btnS: React.CSSProperties = { ...btnP, background: 'rgba(255,255,255,0.06)', color: '#fff' }
const pre: React.CSSProperties = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.5rem', padding: '1rem', fontSize: '0.65rem', color: '#10b981', overflow: 'auto', maxHeight: '350px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }
const th: React.CSSProperties = { textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--foreground-muted)', fontWeight: 700 }
const td: React.CSSProperties = { padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff' }
const bdg: React.CSSProperties = { display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.6rem', fontWeight: 700, background: 'rgba(255,184,0,0.1)', color: 'var(--primary)' }

const Group = ({ title, children, summary }: { title: string; children: React.ReactNode; summary?: React.ReactNode }) => (
  <div style={section}><h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>{title}</h3>{summary && <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>{summary}</div>}{children}</div>
)
const InputField = ({ l, v, onChange, type = 'text' }: { l: string; v: string; onChange: (v: string) => void; type?: string }) => (
  <div><label style={label}>{l}</label><input type={type} value={v} onChange={e => onChange(e.target.value)} style={inp} /></div>
)
const SelectField = ({ l, v, onChange, options }: { l: string; v: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <div><label style={label}>{l}</label><select value={v} onChange={e => onChange(e.target.value)} style={sel}>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
)

export default function FinancialTestGroundHub({ triggerToast }: Props) {
  const tenantId = useAuthStore((s) => s.tenantId) || 'default'
  const [activeTab, setActiveTab] = useState<TabId>('trip-payment')
  const [loading, setLoading] = useState(false)
  const [responseData, setResponseData] = useState<string>('')

  // ─── Shared handlers ─────────────────────────────────
  const handleError = (err: any) => {
    const msg = err?.response?.data?.message || err?.message || 'Request failed'
    triggerToast(`Error: ${msg}`)
    setResponseData(`ERROR: ${msg}`)
  }

  const call = async <T,>(fn: () => Promise<{ data: T }>, label: string) => {
    setLoading(true); setResponseData('')
    try { const res = await fn(); setResponseData(JSON.stringify(res.data, null, 2)); triggerToast(`${label} completed`); return res.data }
    catch (err) { handleError(err); return null }
    finally { setLoading(false) }
  }

  // ─── Trip Payment state ──────────────────────────────
  const [tpTripId, setTpTripId] = useState(''); const [tpAmount, setTpAmount] = useState('')
  const [tpDriverId, setTpDriverId] = useState(''); const [tpPartnerId, setTpPartnerId] = useState('')
  const [tpIsCorporate, setTpIsCorporate] = useState(false); const [tpReference, setTpReference] = useState('')
  const [tpPaystackRef, setTpPaystackRef] = useState('')
  const [tpRiderId, setTpRiderId] = useState('')
  const [tpRiderEmail, setTpRiderEmail] = useState('rider@test.com')

  // ─── Commission state ────────────────────────────────
  const [cmRules, setCmRules] = useState<any[]>([]); const [cmName, setCmName] = useState('')
  const [cmRuleType, setCmRuleType] = useState('PLATFORM'); const [cmMethod, setCmMethod] = useState('PERCENTAGE')
  const [cmRate, setCmRate] = useState(''); const [cmEditId, setCmEditId] = useState('')
  const [cmCalcAmount, setCmCalcAmount] = useState(''); const [cmCalcRuleId, setCmCalcRuleId] = useState('')

  // ─── Revenue state ───────────────────────────────────
  const [revRecords, setRevRecords] = useState<any[]>([]); const [revSummary, setRevSummary] = useState<any>(null)
  const [revLookupTripId, setRevLookupTripId] = useState('')

  // ─── Earnings state ──────────────────────────────────
  const [ernDriverId, setErnDriverId] = useState(''); const [ernTripId, setErnTripId] = useState('')
  const [ernTripFare, setErnTripFare] = useState(''); const [ernPlatformComm, setErnPlatformComm] = useState('')
  const [ernPartnerComm, setErnPartnerComm] = useState(''); const [ernNetEarnings, setErnNetEarnings] = useState('')
  const [ernBonus, setErnBonus] = useState(''); const [ernPenalty, setErnPenalty] = useState('')
  const [ernSubscription, setErnSubscription] = useState(''); const [ernLease, setErnLease] = useState('')
  const [ernList, setErnList] = useState<any[]>([]); const [ernEarningId, setErnEarningId] = useState('')
  const [ernAccNum, setErnAccNum] = useState('')

  // ─── Settlement state ────────────────────────────────
  const [stlPartnerId, setStlPartnerId] = useState(''); const [stlAmount, setStlAmount] = useState('')
  const [stlRef, setStlRef] = useState(''); const [stlSettlementId, setStlSettlementId] = useState('')

  // ─── Escrow state ────────────────────────────────────
  const [escPartnerId, setEscPartnerId] = useState(''); const [escCycleType, setEscCycleType] = useState('DAILY')
  const [escWalletId, setEscWalletId] = useState(''); const [escAmount, setEscAmount] = useState('')
  const [escWallets, setEscWallets] = useState<any[]>([]); const [escSummary, setEscSummary] = useState<any>(null)
  const [escOverrideReason, setEscOverrideReason] = useState('')

  // ─── Savings state ───────────────────────────────────
  const [svDriverId, setSvDriverId] = useState(''); const [svTargetAmount, setSvTargetAmount] = useState('')
  const [svPerTrip, setSvPerTrip] = useState(''); const [svPenaltyPercent, setSvPenaltyPercent] = useState('10')
  const [svMaxPenalty, setSvMaxPenalty] = useState('5000'); const [svPlanId, setSvPlanId] = useState('')
  const [svTripId, setSvTripId] = useState(''); const [svAmount, setSvAmount] = useState('')
  const [svPlans, setSvPlans] = useState<any[]>([]); const [svSummary, setSvSummary] = useState<any>(null)

  // ─── Remittance state ────────────────────────────────
  const [rmPartnerId, setRmPartnerId] = useState(''); const [rmCycle, setRmCycle] = useState('DAILY')
  const [rmAmount, setRmAmount] = useState(''); const [rmDueDate, setRmDueDate] = useState('')
  const [rmScheduleId, setRmScheduleId] = useState(''); const [rmOverrideReason, setRmOverrideReason] = useState('')
  const [rmSchedules, setRmSchedules] = useState<any[]>([]); const [rmSummary, setRmSummary] = useState<any>(null)

  // ─── Audit state ─────────────────────────────────────
  const [auditTrail, setAuditTrail] = useState<any[]>([])
  const [auditRefLookup, setAuditRefLookup] = useState('')
  const [auditJournalId, setAuditJournalId] = useState('')

  // ─── GL state ────────────────────────────────────────
  const [glAccounts, setGlAccounts] = useState<any[]>([])

  // ─── Coin Rewards state ──────────────────────────────
  const [crTripId, setCrTripId] = useState('')
  const [crRiderId, setCrRiderId] = useState('')
  const [crDriverId, setCrDriverId] = useState('')
  const [crAwardResult, setCrAwardResult] = useState<any>(null)
  const [crBalances, setCrBalances] = useState<Record<string, number>>({})
  const [crWallets, setCrWallets] = useState<any[]>([])
  const [crTxWalletId, setCrTxWalletId] = useState('')
  const [crTxns, setCrTxns] = useState<any[]>([])
  const [crQcCustomerId, setCrQcCustomerId] = useState('')
  const [crQcDirection, setCrQcDirection] = useState<'BUY_QCOIN' | 'SELL_QCOIN'>('BUY_QCOIN')
  const [crQcFiat, setCrQcFiat] = useState('')
  const [crQcQcoin, setCrQcQcoin] = useState('')

  // ─── Load data on tab change ─────────────────────────
  useEffect(() => {
    if (activeTab === 'commission') listCommissionRules(tenantId).then(r => setCmRules(r.data)).catch(() => {})
    if (activeTab === 'revenue') {
      listTripFinancialRecords(tenantId).then(r => setRevRecords(r.data.data || r.data)).catch(() => {})
      getRevenueSummary(tenantId).then(r => setRevSummary(r.data)).catch(() => {})
    }
    if (activeTab === 'escrow') {
      listEscrowWallets(tenantId).then(r => setEscWallets(r.data)).catch(() => {})
      getEscrowSummary(tenantId).then(r => setEscSummary(r.data)).catch(() => {})
    }
    if (activeTab === 'savings') {
      listSavingsPlans(tenantId).then(r => setSvPlans(r.data)).catch(() => {})
      getSavingsSummary(tenantId).then(r => setSvSummary(r.data)).catch(() => {})
    }
    if (activeTab === 'remittance') {
      listAllRemittances(tenantId).then(r => setRmSchedules(r.data)).catch(() => {})
      getRemittanceSummary(tenantId).then(r => setRmSummary(r.data)).catch(() => {})
    }
    if (activeTab === 'gl') listGlAccountsFull(tenantId).then(r => setGlAccounts(r.data)).catch(() => {})
  }, [activeTab, tenantId])

  // ─── Styles ──────────────────────────────────────────
  const section: React.CSSProperties = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem' }
  const row: React.CSSProperties = { display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '0.75rem' }
  const label: React.CSSProperties = { fontSize: '0.7rem', fontWeight: 700, color: 'var(--foreground-muted)', display: 'block', marginBottom: '0.25rem' }
  const inp: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.75rem', outline: 'none', minWidth: '170px' }
  const sel: React.CSSProperties = { ...inp, minWidth: '190px' }
  const btnP: React.CSSProperties = { background: 'linear-gradient(135deg, var(--primary) 0%, #d4af37 100%)', color: '#000', fontWeight: 700, border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }
  const btnD: React.CSSProperties = { ...btnP, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff' }
  const btnS: React.CSSProperties = { ...btnP, background: 'rgba(255,255,255,0.06)', color: '#fff' }
  const pre: React.CSSProperties = { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.5rem', padding: '1rem', fontSize: '0.65rem', color: '#10b981', overflow: 'auto', maxHeight: '350px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }
  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '0.4rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 700, border: activeTab === t.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)', background: activeTab === t.id ? 'rgba(255,184,0,0.1)' : 'transparent', color: activeTab === t.id ? 'var(--primary)' : 'var(--foreground-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      {responseData && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--foreground-muted)' }}>RESPONSE</span>
            <button onClick={() => setResponseData('')} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.65rem' }}>Clear</button>
          </div>
          <pre style={pre}>{responseData}</pre>
        </div>
      )}
      {loading && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>Processing...</div>}

      {/* ═══════════ TRIP PAYMENT ═══════════ */}
      {activeTab === 'trip-payment' && (
        <div>
          <Group title="Initiate Trip Payment">
            <div style={row}>
              <InputField l="Trip ID" v={tpTripId} onChange={setTpTripId} />
              <InputField l="Amount (NGN)" v={tpAmount} onChange={setTpAmount} type="number" />
              <InputField l="Driver Customer ID" v={tpDriverId} onChange={setTpDriverId} />
              <InputField l="Rider Customer ID" v={tpRiderId} onChange={setTpRiderId} />
            </div>
            <div style={row}>
              <InputField l="Rider Email" v={tpRiderEmail} onChange={setTpRiderEmail} />
              <InputField l="Partner ID (optional)" v={tpPartnerId} onChange={setTpPartnerId} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#fff' }}>
                <input type="checkbox" checked={tpIsCorporate} onChange={e => setTpIsCorporate(e.target.checked)} /> Corporate Driver
              </label>
              <button style={btnP} onClick={() => call(() => initiateTripPayment({
                tripId: tpTripId, fareAmount: Number(tpAmount), currency: 'NGN',
                driverCustomerId: tpDriverId, partnerTenantId: tpPartnerId || undefined,
                isCorporateDriver: tpIsCorporate, riderCustomerId: tpRiderId, riderEmail: tpRiderEmail,
              }), 'Initiate Trip Payment')}>Initiate Payment</button>
            </div>
          </Group>

          <Group title="Verify Trip Payment">
            <div style={row}>
              <InputField l="Trip ID" v={tpTripId} onChange={setTpTripId} />
              <InputField l="Reference" v={tpReference} onChange={setTpReference} />
              <InputField l="Paystack Ref" v={tpPaystackRef} onChange={setTpPaystackRef} />
            </div>
            <button style={btnP} onClick={() => call(() => verifyTripPayment({ tripId: tpTripId, reference: tpReference, paystackReference: tpPaystackRef || undefined }), 'Verify Trip Payment')}>Verify Payment</button>
          </Group>

          <Group title="Complete Trip Payment">
            <div style={row}>
              <InputField l="Trip ID" v={tpTripId} onChange={setTpTripId} />
              <InputField l="Paystack Ref" v={tpPaystackRef} onChange={setTpPaystackRef} />
              <InputField l="Driver ID" v={tpDriverId} onChange={setTpDriverId} />
              <InputField l="Partner ID" v={tpPartnerId} onChange={setTpPartnerId} />
            </div>
            <button style={btnP} onClick={() => call(() => completeTripPayment(tpTripId, {
              tenantId, paystackReference: tpPaystackRef, driverCustomerId: tpDriverId,
              partnerId: tpPartnerId || undefined,
            }), 'Complete Trip Payment')}>Complete Trip</button>
          </Group>

          <Group title="Preview Commission Split">
            <div style={row}>
              <InputField l="Trip ID" v={tpTripId} onChange={setTpTripId} />
              <InputField l="Amount" v={tpAmount} onChange={setTpAmount} type="number" />
              <InputField l="Driver ID" v={tpDriverId} onChange={setTpDriverId} />
              <InputField l="Partner ID" v={tpPartnerId} onChange={setTpPartnerId} />
            </div>
            <button style={btnS} onClick={() => call(() => calculateCommissionPreview(tenantId, { tripId: tpTripId, amount: Number(tpAmount), driverCustomerId: tpDriverId, partnerId: tpPartnerId || undefined, isCorporateDriver: tpIsCorporate }), 'Preview Commission')}>Preview</button>
          </Group>

          <Group title="Lookup Transactions">
            <div style={row}>
              <InputField l="Reference" v={tpReference} onChange={setTpReference} />
              <button style={btnS} onClick={() => call(() => getTripPaymentByReference(tpReference), 'Get by Reference')}>By Reference</button>
            </div>
            <div style={row}>
              <InputField l="Trip ID" v={tpTripId} onChange={setTpTripId} />
              <button style={btnS} onClick={() => call(() => listTripPayments(tpTripId), 'List by Trip')}>List by Trip</button>
            </div>
          </Group>
        </div>
      )}

      {/* ═══════════ COMMISSION ═══════════ */}
      {activeTab === 'commission' && (
        <div>
          <Group title="Create / Update Commission Rule">
            <div style={row}>
              <InputField l="Rule Name" v={cmName} onChange={setCmName} />
              <SelectField l="Rule Type" v={cmRuleType} onChange={setCmRuleType} options={[{ value: 'PLATFORM', label: 'Platform' }, { value: 'PARTNER', label: 'Partner' }, { value: 'DRIVER', label: 'Driver' }]} />
              <SelectField l="Method" v={cmMethod} onChange={setCmMethod} options={[{ value: 'PERCENTAGE', label: 'Percentage' }, { value: 'FLAT', label: 'Flat' }, { value: 'TIERED', label: 'Tiered' }]} />
              <InputField l="Rate" v={cmRate} onChange={setCmRate} type="number" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={btnP} onClick={() => call(() => createCommissionRule({ tenantId, name: cmName, ruleType: cmRuleType, calculationMethod: cmMethod, rate: Number(cmRate), isActive: true }), 'Create Rule')}>Create Rule</button>
              {cmEditId && <button style={btnS} onClick={() => call(() => updateCommissionRule(cmEditId, { name: cmName, ruleType: cmRuleType, calculationMethod: cmMethod, rate: Number(cmRate) }), 'Update Rule')}>Update</button>}
              {cmEditId && <button style={btnS} onClick={() => { setCmEditId(''); setCmName(''); setCmRate('') }}>Cancel Edit</button>}
            </div>
          </Group>

          <Group title="Calculate Commission">
            <div style={row}>
              <SelectField l="Rule" v={cmCalcRuleId} onChange={setCmCalcRuleId} options={cmRules.map((r: any) => ({ value: r.id, label: r.name }))} />
              <InputField l="Amount" v={cmCalcAmount} onChange={setCmCalcAmount} type="number" />
            </div>
            <button style={btnP} onClick={() => call(() => calculateCommission(tenantId, { ruleId: cmCalcRuleId, amount: Number(cmCalcAmount) }), 'Calculate Commission')}>Calculate</button>
          </Group>

          <Group title="Existing Rules">
            <table style={tbl}>
              <thead><tr><th style={th}>Name</th><th style={th}>Type</th><th style={th}>Method</th><th style={th}>Rate</th><th style={th}>Status</th><th style={th}>Actions</th></tr></thead>
              <tbody>
                {cmRules.map((r: any) => (
                  <tr key={r.id}>
                    <td style={td}>{r.name}</td>
                    <td style={td}><span style={bdg}>{r.ruleType}</span></td>
                    <td style={td}>{r.calculationMethod}</td>
                    <td style={td}>{r.rate}</td>
                    <td style={td}>{r.isActive ? 'Active' : 'Inactive'}</td>
                    <td style={td}>
                      <button style={{ ...btnS, padding: '0.2rem 0.5rem', fontSize: '0.6rem', marginRight: '0.25rem' }} onClick={() => { setCmEditId(r.id); setCmName(r.name); setCmRuleType(r.ruleType); setCmMethod(r.calculationMethod); setCmRate(String(r.rate)) }}>Edit</button>
                      <button style={{ ...btnD, padding: '0.2rem 0.5rem', fontSize: '0.6rem' }} onClick={() => call(() => deleteCommissionRule(r.id), 'Delete Rule')}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Group>
        </div>
      )}

      {/* ═══════════ REVENUE ═══════════ */}
      {activeTab === 'revenue' && (
        <div>
          <Group title="Record Trip Revenue">
            <div style={row}>
              <InputField l="Trip ID" v={tpTripId} onChange={setTpTripId} />
              <InputField l="Total Fare" v={tpAmount} onChange={setTpAmount} type="number" />
              <InputField l="Commission" v={tpPaystackRef} onChange={setTpPaystackRef} type="number" />
              <InputField l="Driver Net" v={tpReference} onChange={setTpReference} type="number" />
              <InputField l="Driver ID" v={tpDriverId} onChange={setTpDriverId} />
            </div>
            <button style={btnP} onClick={() => call(() => recordTripRevenue({
              tripId: tpTripId, tenantId, totalFare: Number(tpAmount),
              commissionAmount: Number(tpPaystackRef || 0), driverNetAmount: Number(tpReference || 0),
              driverCustomerId: tpDriverId, isCorporateDriver: tpIsCorporate,
            }), 'Record Revenue')}>Record Revenue</button>
          </Group>

          <Group title="Lookup Trip Financial Record">
            <div style={row}>
              <InputField l="Trip ID" v={revLookupTripId} onChange={setRevLookupTripId} />
              <button style={btnS} onClick={() => call(() => getTripFinancialRecordByTripId(revLookupTripId), 'Lookup Trip')}>Lookup</button>
            </div>
          </Group>

          {revSummary && (
            <Group title="Revenue Summary" summary={<>{['totalRevenue', 'totalCommission', 'totalPayouts', 'totalTrips'].map(k => (
              <div key={k} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff' }}>{Number(revSummary[k]).toLocaleString()}</div>
              </div>
            ))}</>} />
          )}
          <Group title="Trip Financial Records">
            <table style={tbl}>
              <thead><tr><th style={th}>Trip ID</th><th style={th}>Fare</th><th style={th}>Commission</th><th style={th}>Driver Net</th><th style={th}>Partner</th><th style={th}>Driver</th><th style={th}>Status</th></tr></thead>
              <tbody>
                {revRecords.map((r: any) => (
                  <tr key={r.id}>
                    <td style={td}><span style={{ fontFamily: 'monospace', fontSize: '0.6rem' }}>{r.tripId?.slice(0, 12)}...</span></td>
                    <td style={td}>{Number(r.totalFare).toLocaleString()}</td>
                    <td style={td}>{Number(r.commissionAmount).toLocaleString()}</td>
                    <td style={td}>{Number(r.driverNetAmount).toLocaleString()}</td>
                    <td style={td}>{Number(r.partnerAmount).toLocaleString()}</td>
                    <td style={td}>{r.driverCustomerId?.slice(0, 8)}...</td>
                    <td style={td}><span style={bdg}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Group>
        </div>
      )}

      {/* ═══════════ EARNINGS ═══════════ */}
      {activeTab === 'earnings' && (
        <div>
          <Group title="Record Driver Earning">
            <div style={row}>
              <InputField l="Driver Customer ID" v={ernDriverId} onChange={setErnDriverId} />
              <InputField l="Trip ID" v={ernTripId} onChange={setErnTripId} />
              <InputField l="Trip Fare" v={ernTripFare} onChange={setErnTripFare} type="number" />
              <InputField l="Net Earnings" v={ernNetEarnings} onChange={setErnNetEarnings} type="number" />
            </div>
            <div style={row}>
              <InputField l="Platform Commission" v={ernPlatformComm} onChange={setErnPlatformComm} type="number" />
              <InputField l="Partner Commission" v={ernPartnerComm} onChange={setErnPartnerComm} type="number" />
              <InputField l="Bonus" v={ernBonus} onChange={setErnBonus} type="number" />
              <InputField l="Penalty" v={ernPenalty} onChange={setErnPenalty} type="number" />
            </div>
            <div style={row}>
              <InputField l="Subscription Deduction" v={ernSubscription} onChange={setErnSubscription} type="number" />
              <InputField l="Lease Deduction" v={ernLease} onChange={setErnLease} type="number" />
              <InputField l="Settlement Ref" v={ernEarningId} onChange={setErnEarningId} />
            </div>
            <button style={btnP} onClick={() => call(() => recordDriverEarning({
              tenantId, driverCustomerId: ernDriverId, tripId: ernTripId,
              tripFare: Number(ernTripFare), netEarnings: Number(ernNetEarnings),
              platformCommission: ernPlatformComm ? Number(ernPlatformComm) : undefined,
              partnerCommission: ernPartnerComm ? Number(ernPartnerComm) : undefined,
              bonusAmount: ernBonus ? Number(ernBonus) : undefined,
              penaltyAmount: ernPenalty ? Number(ernPenalty) : undefined,
              subscriptionDeduction: ernSubscription ? Number(ernSubscription) : undefined,
              leaseDeduction: ernLease ? Number(ernLease) : undefined,
            }), 'Record Earning')}>Record Earning</button>
          </Group>

          <Group title="Process Driver Payout">
            <div style={row}>
              <InputField l="Earning ID" v={ernEarningId} onChange={setErnEarningId} />
              <InputField l="Driver Account #" v={ernAccNum} onChange={setErnAccNum} />
              <button style={btnP} onClick={() => call(() => payoutDriverEarning(ernEarningId, { tenantId, driverAccountNumber: ernAccNum }), 'Payout')}>Payout</button>
            </div>
          </Group>

          <Group title="Earnings History">
            <div style={row}>
              <InputField l="Driver ID (filter)" v={ernDriverId} onChange={setErnDriverId} />
              <button style={btnS} onClick={async () => { const r = await call(() => listDriverEarnings(tenantId, 1, 20), 'Load Earnings'); if (r && (r as any).data) setErnList((r as any).data) }}>Load Earnings</button>
              <button style={btnS} onClick={() => call(() => getDriverEarningsSummary(tenantId, ernDriverId), 'Load Summary')}>Summary</button>
            </div>
            <table style={tbl}>
              <thead><tr><th style={th}>Driver</th><th style={th}>Trip ID</th><th style={th}>Fare</th><th style={th}>Net</th><th style={th}>Payout</th><th style={th}>Status</th><th style={th}>Date</th></tr></thead>
              <tbody>
                {ernList.map((r: any) => (
                  <tr key={r.id}>
                    <td style={td}>{r.driverCustomerId?.slice(0, 8)}...</td>
                    <td style={td}>{r.tripId?.slice(0, 8)}...</td>
                    <td style={td}>₦{Number(r.tripFare).toLocaleString()}</td>
                    <td style={td}>₦{Number(r.netEarnings).toLocaleString()}</td>
                    <td style={td}>₦{Number(r.finalPayout).toLocaleString()}</td>
                    <td style={td}><span style={bdg}>{r.status}</span></td>
                    <td style={td}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Group>
        </div>
      )}

      {/* ═══════════ SETTLEMENT ═══════════ */}
      {activeTab === 'settlement' && (
        <div>
          <Group title="Create Partner Settlement Accrual">
            <div style={row}>
              <InputField l="Partner ID" v={stlPartnerId} onChange={setStlPartnerId} />
              <InputField l="Amount" v={stlAmount} onChange={setStlAmount} type="number" />
              <InputField l="Reference" v={stlRef} onChange={setStlRef} />
            </div>
            <button style={btnP} onClick={() => call(() => createPartnerSettlement({ tenantId, partnerId: stlPartnerId, amount: Number(stlAmount), reference: stlRef }), 'Create Settlement')}>Accrue Settlement</button>
          </Group>

          <Group title="Settle / Pay Out Partner">
            <div style={row}>
              <InputField l="Settlement ID" v={stlSettlementId} onChange={setStlSettlementId} />
              <InputField l="Amount" v={stlAmount} onChange={setStlAmount} type="number" />
              <InputField l="Reference" v={stlRef} onChange={setStlRef} />
            </div>
            <button style={btnP} onClick={() => call(() => settlePartnerPayout({ tenantId, settlementId: stlSettlementId, amount: Number(stlAmount), reference: stlRef }), 'Settle Payout')}>Settle Payout</button>
          </Group>

          <Group title="Partner Balances">
            <div style={row}>
              <InputField l="Partner ID" v={stlPartnerId} onChange={setStlPartnerId} />
              <button style={btnS} onClick={() => call(() => getPartnerBalance(tenantId, stlPartnerId), 'Load Balance')}>Check Balance</button>
              <button style={btnS} onClick={() => call(() => listPartnerSettlements(tenantId, stlPartnerId || undefined), 'Load Settlements')}>List Settlements</button>
            </div>
          </Group>
        </div>
      )}

      {/* ═══════════ ESCROW ═══════════ */}
      {activeTab === 'escrow' && (
        <div>
          {escSummary && (
            <Group title="Escrow Summary" summary={<>{[{ key: 'totalCurrent', label: 'Current Bal' }, { key: 'totalLocked', label: 'Total Locked' }, { key: 'totalReleased', label: 'Total Released' }, { key: 'activeWallets', label: 'Active Wallets' }].map(({ key, label }) => (
              <div key={key} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff' }}>{Number((escSummary as any)[key]).toLocaleString()}</div>
              </div>
            ))}</>} />
          )}
          <Group title="Create Escrow Wallet">
            <div style={row}>
              <InputField l="Partner ID" v={escPartnerId} onChange={setEscPartnerId} />
              <SelectField l="Cycle Type" v={escCycleType} onChange={setEscCycleType} options={[{ value: 'DAILY', label: 'Daily' }, { value: 'WEEKLY', label: 'Weekly' }, { value: 'MONTHLY', label: 'Monthly' }]} />
            </div>
            <button style={btnP} onClick={() => call(() => createEscrowWallet({ tenantId, partnerId: escPartnerId, cycleType: escCycleType }), 'Create Wallet')}>Create Wallet</button>
          </Group>
          <Group title="Lock / Release Funds">
            <div style={row}>
              <InputField l="Wallet ID" v={escWalletId} onChange={setEscWalletId} />
              <InputField l="Amount" v={escAmount} onChange={setEscAmount} type="number" />
            </div>
            <div style={row}>
              <button style={btnP} onClick={() => call(() => lockEscrowFunds({ tenantId, walletId: escWalletId, amount: Number(escAmount) }), 'Lock Funds')}>Lock Funds</button>
              <button style={btnP} onClick={() => call(() => releaseEscrowFunds({ tenantId, walletId: escWalletId, amount: Number(escAmount) }), 'Release Funds')}>Release Funds</button>
            </div>
          </Group>
          <Group title="Admin Override">
            <div style={row}>
              <InputField l="Wallet ID" v={escWalletId} onChange={setEscWalletId} />
              <InputField l="Amount" v={escAmount} onChange={setEscAmount} type="number" />
              <InputField l="Reason" v={escOverrideReason} onChange={setEscOverrideReason} />
            </div>
            <button style={btnD} onClick={() => call(() => escrowAdminOverride({ tenantId, walletId: escWalletId, amount: Number(escAmount), reason: escOverrideReason, actor: 'admin' }), 'Admin Override')}>Admin Override</button>
          </Group>
          <Group title="Existing Wallets">
            <table style={tbl}>
              <thead><tr><th style={th}>Partner</th><th style={th}>Cycle</th><th style={th}>Current</th><th style={th}>Locked</th><th style={th}>Released</th><th style={th}>Status</th></tr></thead>
              <tbody>{escWallets.map((w: any) => (
                <tr key={w.id}><td style={td}>{w.partnerId?.slice(0, 8)}...</td><td style={td}>{w.cycleType}</td><td style={td}>{Number(w.currentBalance).toLocaleString()}</td><td style={td}>{Number(w.lockedBalance).toLocaleString()}</td><td style={td}>{Number(w.releasedBalance).toLocaleString()}</td><td style={td}><span style={bdg}>{w.status}</span></td></tr>
              ))}</tbody>
            </table>
          </Group>
        </div>
      )}

      {/* ═══════════ SAVINGS ═══════════ */}
      {activeTab === 'savings' && (
        <div>
          {svSummary && (
            <Group title="Savings Summary" summary={<>{[{ key: 'totalPlans', label: 'Total Plans' }, { key: 'activePlans', label: 'Active' }, { key: 'totalSaved', label: 'Total Saved' }, { key: 'totalPenalties', label: 'Penalties' }].map(({ key, label }) => (
              <div key={key} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff' }}>{Number((svSummary as any)[key]).toLocaleString()}</div>
              </div>
            ))}</>} />
          )}
          <Group title="Create Savings Plan">
            <div style={row}>
              <InputField l="Driver ID" v={svDriverId} onChange={setSvDriverId} />
              <InputField l="Target Amount" v={svTargetAmount} onChange={setSvTargetAmount} type="number" />
              <InputField l="Per Trip Contribution" v={svPerTrip} onChange={setSvPerTrip} type="number" />
              <InputField l="Penalty %" v={svPenaltyPercent} onChange={setSvPenaltyPercent} type="number" />
              <InputField l="Max Penalty" v={svMaxPenalty} onChange={setSvMaxPenalty} type="number" />
            </div>
            <button style={btnP} onClick={() => call(() => createSavingsPlan({ tenantId, driverCustomerId: svDriverId, targetAmount: Number(svTargetAmount), contributionPerTrip: Number(svPerTrip), earlyWithdrawalPenaltyPercent: Number(svPenaltyPercent), maxEarlyWithdrawalPenalty: Number(svMaxPenalty) }), 'Create Plan')}>Create Plan</button>
          </Group>
          <Group title="Contribute / Withdraw">
            <div style={row}>
              <InputField l="Plan ID" v={svPlanId} onChange={setSvPlanId} />
              <InputField l="Trip ID" v={svTripId} onChange={setSvTripId} />
              <InputField l="Amount" v={svAmount} onChange={setSvAmount} type="number" />
            </div>
            <div style={row}>
              <button style={btnP} onClick={() => call(() => contributeToSavings({ tenantId, planId: svPlanId, tripId: svTripId, amount: Number(svAmount) }), 'Contribute')}>Contribute</button>
              <button style={btnD} onClick={() => call(() => earlyWithdrawalSavings({ tenantId, planId: svPlanId, amount: Number(svAmount), actor: 'driver' }), 'Early Withdrawal')}>Early Withdraw</button>
              <button style={btnS} onClick={() => call(() => cancelSavingsPlan(tenantId, svPlanId, 'Cancelled via test ground'), 'Cancel Plan')}>Cancel Plan</button>
            </div>
          </Group>
          <Group title="Savings Plans">
            <table style={tbl}>
              <thead><tr><th style={th}>Driver</th><th style={th}>Target</th><th style={th}>Current</th><th style={th}>Progress</th><th style={th}>Per Trip</th><th style={th}>Status</th></tr></thead>
              <tbody>{svPlans.map((p: any) => (
                <tr key={p.id}><td style={td}>{p.driverCustomerId?.slice(0, 8)}...</td><td style={td}>{Number(p.targetAmount).toLocaleString()}</td><td style={td}>{Number(p.currentAmount).toLocaleString()}</td><td style={td}>{p.targetAmount > 0 ? `${Math.round((Number(p.currentAmount) / Number(p.targetAmount)) * 100)}%` : '-'}</td><td style={td}>{Number(p.contributionPerTrip).toLocaleString()}</td><td style={td}><span style={bdg}>{p.status}</span></td></tr>
              ))}</tbody>
            </table>
          </Group>
        </div>
      )}

      {/* ═══════════ REMITTANCE ═══════════ */}
      {activeTab === 'remittance' && (
        <div>
          {rmSummary && (
            <Group title="Remittance Summary" summary={<>{[{ key: 'totalSchedules', label: 'Total' }, { key: 'pendingCount', label: 'Pending' }, { key: 'completedCount', label: 'Completed' }, { key: 'totalAmount', label: 'Total Amount' }, { key: 'overdueCount', label: 'Overdue' }].map(({ key, label }) => (
              <div key={key} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff' }}>{Number((rmSummary as any)[key]).toLocaleString()}</div>
              </div>
            ))}</>} />
          )}
          <Group title="Create Remittance Schedule">
            <div style={row}>
              <InputField l="Partner ID" v={rmPartnerId} onChange={setRmPartnerId} />
              <SelectField l="Cycle" v={rmCycle} onChange={setRmCycle} options={[{ value: 'DAILY', label: 'Daily' }, { value: 'WEEKLY', label: 'Weekly' }, { value: 'MONTHLY', label: 'Monthly' }]} />
              <InputField l="Amount" v={rmAmount} onChange={setRmAmount} type="number" />
              <InputField l="Due Date" v={rmDueDate} onChange={setRmDueDate} type="date" />
            </div>
            <button style={btnP} onClick={() => call(() => createRemittanceSchedule({ tenantId, partnerId: rmPartnerId, cycle: rmCycle, amount: Number(rmAmount), dueDate: new Date(rmDueDate).toISOString() }), 'Create Schedule')}>Create Schedule</button>
          </Group>
          <Group title="Process Remittances">
            <div style={row}>
              <InputField l="Schedule ID" v={rmScheduleId} onChange={setRmScheduleId} />
            </div>
            <div style={row}>
              <button style={btnP} onClick={() => call(() => processRemittanceSchedule(tenantId, rmScheduleId), 'Process Schedule')}>Process Schedule</button>
              <button style={btnP} onClick={() => call(() => processDueRemittances(tenantId), 'Process Due')}>Process All Due</button>
              <button style={btnS} onClick={() => call(() => listPendingRemittances(tenantId), 'List Pending')}>List Pending</button>
            </div>
          </Group>
          <Group title="Admin Override">
            <div style={row}>
              <InputField l="Schedule ID" v={rmScheduleId} onChange={setRmScheduleId} />
              <InputField l="Release Amount" v={rmAmount} onChange={setRmAmount} type="number" />
              <InputField l="Reason" v={rmOverrideReason} onChange={setRmOverrideReason} />
            </div>
            <button style={btnD} onClick={() => call(() => remittanceAdminOverride({ tenantId, scheduleId: rmScheduleId, reason: rmOverrideReason, actor: 'admin', releaseAmount: Number(rmAmount) || undefined }), 'Admin Override')}>Admin Override</button>
          </Group>
          <Group title="All Schedules">
            <table style={tbl}>
              <thead><tr><th style={th}>Partner</th><th style={th}>Cycle</th><th style={th}>Amount</th><th style={th}>Processed</th><th style={th}>Due</th><th style={th}>Status</th></tr></thead>
              <tbody>{rmSchedules.map((s: any) => (
                <tr key={s.id}><td style={td}>{s.partnerId?.slice(0, 8)}...</td><td style={td}>{s.cycle}</td><td style={td}>{Number(s.amount).toLocaleString()}</td><td style={td}>{Number(s.processedAmount).toLocaleString()}</td><td style={td}>{s.dueDate ? new Date(s.dueDate).toLocaleDateString() : '-'}</td><td style={td}><span style={bdg}>{s.status}</span></td></tr>
              ))}</tbody>
            </table>
          </Group>
        </div>
      )}

      {/* ═══════════ AUDIT ═══════════ */}
      {activeTab === 'audit' && (
        <div>
          <Group title="Audit Trail">
            <div style={row}>
              <button style={btnS} onClick={async () => { const r = await call(() => getAuditTrail(tenantId), 'Load Audit Trail'); if (r) setAuditTrail((r as any).data || []) }}>Load All</button>
              <InputField l="Reference" v={auditRefLookup} onChange={setAuditRefLookup} />
              <button style={btnS} onClick={() => call(() => getAuditTrailByReference(tenantId, auditRefLookup), 'Audit by Reference')}>By Reference</button>
            </div>
            <table style={tbl}>
              <thead><tr><th style={th}>Event</th><th style={th}>Entity</th><th style={th}>Actor</th><th style={th}>Description</th><th style={th}>Timestamp</th></tr></thead>
              <tbody>{auditTrail.map((a: any) => (
                <tr key={a.id}>
                  <td style={td}><span style={bdg}>{a.event}</span></td>
                  <td style={td}>{a.entityType}:{a.entityId?.slice(0, 8)}</td>
                  <td style={td}>{a.actor}</td>
                  <td style={{ ...td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.description}</td>
                  <td style={td}>{a.timestamp ? new Date(a.timestamp).toLocaleString() : '-'}</td>
                </tr>
              ))}</tbody>
            </table>
          </Group>
          <Group title="GL Impact by Journal ID">
            <div style={row}>
              <InputField l="Journal ID" v={auditJournalId} onChange={setAuditJournalId} />
              <button style={btnP} onClick={() => call(() => getGlImpact(tenantId, auditJournalId), 'Load GL Impact')}>Check GL Impact</button>
            </div>
          </Group>
          <Group title="Balance Sheet">
            <button style={btnS} onClick={() => call(() => getBalanceSheet(tenantId), 'Load Balance Sheet')}>Load Balance Sheet</button>
          </Group>
          <Group title="Profit & Loss">
            <button style={btnS} onClick={() => call(() => getProfitAndLoss(tenantId), 'Load P&L')}>Load P&L</button>
          </Group>
          <Group title="Trial Balance">
            <button style={btnS} onClick={() => call(() => getTrialBalance(tenantId), 'Load Trial Balance')}>Load Trial Balance</button>
          </Group>
        </div>
      )}

      {/* ═══════════ GL EXPLORER ═══════════ */}
      {activeTab === 'gl' && (
        <div>
          <Group title="General Ledger Accounts (Total: {glAccounts.length})">
            <table style={tbl}>
              <thead><tr><th style={th}>Code</th><th style={th}>Name</th><th style={th}>Type</th><th style={th}>Balance</th><th style={th}>Currency</th></tr></thead>
              <tbody>{glAccounts.map((a: any) => (
                <tr key={a.id}><td style={td}><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{a.code}</span></td><td style={td}>{a.name}</td><td style={td}><span style={bdg}>{a.type}</span></td><td style={td}>{Number(a.balance || 0).toLocaleString()}</td><td style={td}>{a.currency || 'NGN'}</td></tr>
              ))}</tbody>
            </table>
          </Group>
          <Group title="GL Account Hierarchy (Tree)">
            <button style={btnS} onClick={() => getGlAccountsTreeFull().then(r => setResponseData(JSON.stringify(r.data, null, 2))).catch(handleError)}>Load Tree</button>
            <pre style={{ ...pre, maxHeight: '500px' }}>{responseData || 'Click "Load Tree" to view hierarchy'}</pre>
          </Group>
        </div>
      )}

      {/* ═══════════ COIN REWARDS ═══════════ */}
      {activeTab === 'coin-rewards' && (
        <div>
          <Group title="Award Trip Coins (Reward)">
            <p style={{ fontSize: '0.7rem', color: 'var(--foreground-dim)', marginBottom: '0.5rem' }}>
              Credits rider, driver, and tenant wallets per site-wide config
            </p>
            <div style={row}>
              <InputField l="Trip ID" v={crTripId} onChange={setCrTripId} />
              <InputField l="Rider Customer ID" v={crRiderId} onChange={setCrRiderId} />
              <InputField l="Driver Customer ID" v={crDriverId} onChange={setCrDriverId} />
              <button style={btnP} onClick={async () => {
                const r = await call(() => awardTripCoins({ tripId: crTripId, tenantId, riderCustomerId: crRiderId, driverCustomerId: crDriverId }), 'Award Trip Coins')
                if (r) {
                  setCrAwardResult(r)
                  // Refresh balances
                  const [balR, balD, balT] = await Promise.all([
                    getCoinWallet('RIDER', crRiderId).catch(() => ({ data: null })),
                    getCoinWallet('DRIVER', crDriverId).catch(() => ({ data: null })),
                    getCoinWallet('TENANT', tenantId).catch(() => ({ data: null })),
                  ])
                  setCrBalances({
                    rider: balR.data?.balance ?? 0,
                    driver: balD.data?.balance ?? 0,
                    tenant: balT.data?.balance ?? 0,
                  })
                  listAllCoinWallets().then(r2 => setCrWallets(Array.isArray(r2.data) ? r2.data : [])).catch(() => {})
                }
              }}>Award Coins</button>
            </div>
            {crAwardResult && (
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', padding: '0.5rem', background: 'rgba(16,185,129,0.05)', borderRadius: '0.5rem' }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Rider: +₿{crAwardResult.riderCoins}</span>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>Driver: +₿{crAwardResult.driverCoins}</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>Tenant: +₿{crAwardResult.tenantCoins}</span>
              </div>
            )}
            {Object.keys(crBalances).length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
                <span>Rider Balance: ₿{Number(crBalances.rider).toLocaleString()}</span>
                <span>Driver Balance: ₿{Number(crBalances.driver).toLocaleString()}</span>
                <span>Tenant Balance: ₿{Number(crBalances.tenant).toLocaleString()}</span>
              </div>
            )}
          </Group>

          <Group title="Buy / Sell QCoins (Exchange)">
            <p style={{ fontSize: '0.7rem', color: 'var(--foreground-dim)', marginBottom: '0.5rem' }}>
              Exchange fiat (NGN) for QCoins or sell QCoins back
            </p>
            <div style={row}>
              <InputField l="Customer ID" v={crQcCustomerId} onChange={setCrQcCustomerId} />
              <select value={crQcDirection} onChange={e => setCrQcDirection(e.target.value as any)} style={inp}>
                <option value="BUY_QCOIN">Buy QCoins</option>
                <option value="SELL_QCOIN">Sell QCoins</option>
              </select>
              <InputField l="Fiat Amount (NGN)" v={crQcFiat} onChange={setCrQcFiat} type="number" />
              <InputField l="QCoin Amount" v={crQcQcoin} onChange={setCrQcQcoin} type="number" />
              <button style={btnP} onClick={() => call(() => qcoinExchange({
                tenantId, customerId: crQcCustomerId, direction: crQcDirection,
                fiatAmount: Number(crQcFiat), qcoinAmount: Number(crQcQcoin),
              }), `${crQcDirection === 'BUY_QCOIN' ? 'Buy' : 'Sell'} QCoins`)}>
                {crQcDirection === 'BUY_QCOIN' ? 'Buy' : 'Sell'} QCoins
              </button>
            </div>
          </Group>

          <Group title="All Coin Wallets">
            <div style={row}>
              <button style={btnS} onClick={async () => {
                const r = await listAllCoinWallets().catch(() => ({ data: [] }))
                setCrWallets(Array.isArray(r.data) ? r.data : [])
              }}>Refresh Wallets</button>
              <button style={btnS} onClick={async () => {
                if (crRiderId) {
                  const r = await getCoinWallet('RIDER', crRiderId).catch(() => ({ data: null }))
                  if (r.data) setCrBalances(p => ({ ...p, rider: Number((r.data as any).balance ?? 0) }))
                }
                if (crDriverId) {
                  const r = await getCoinWallet('DRIVER', crDriverId).catch(() => ({ data: null }))
                  if (r.data) setCrBalances(p => ({ ...p, driver: Number((r.data as any).balance ?? 0) }))
                }
                const r = await getCoinWallet('TENANT', tenantId).catch(() => ({ data: null }))
                if (r.data) setCrBalances(p => ({ ...p, tenant: Number((r.data as any).balance ?? 0) }))
              }}>Refresh Balances</button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {['RIDER', 'DRIVER', 'TENANT'].map(type => {
                const value = crBalances[type === 'RIDER' ? 'rider' : type === 'DRIVER' ? 'driver' : 'tenant']
                const color = type === 'RIDER' ? '#10b981' : type === 'DRIVER' ? '#3b82f6' : '#f59e0b'
                return (
                  <div key={type} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', minWidth: '120px' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>{type}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 900, color }}>₿{Number(value || 0).toLocaleString()}</div>
                  </div>
                )
              })}
            </div>
            <table style={tbl}>
              <thead><tr>
                <th style={th}>Entity</th><th style={th}>Type</th><th style={th}>Balance</th><th style={th}>Actions</th>
              </tr></thead>
              <tbody>
                {crWallets.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1rem', color: 'var(--foreground-dim)' }}>No wallets yet. Award coins to create them.</td></tr>
                ) : crWallets.map((w: any) => (
                  <tr key={w.id}>
                    <td style={td}><span style={{ fontFamily: 'monospace', fontSize: '0.65rem' }}>{w.entityId?.slice(0, 16)}</span></td>
                    <td style={td}><span style={bdg}>{w.entityType}</span></td>
                    <td style={{ ...td, color: w.entityType === 'RIDER' ? '#10b981' : w.entityType === 'DRIVER' ? '#3b82f6' : '#f59e0b', fontWeight: 700 }}>
                      ₿{Number(w.balance).toLocaleString()}
                    </td>
                    <td style={td}>
                      <button style={btnS} onClick={async () => {
                        setCrTxWalletId(w.id)
                        const r = await listCoinTransactions(w.id).catch(() => ({ data: { data: [] } }))
                        setCrTxns(r.data?.data ?? [])
                      }}>Txns</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Group>

          {crTxWalletId && (
            <Group title={`Transactions: ${crTxWalletId.slice(0, 12)}`}>
              <button style={btnS} onClick={() => { setCrTxWalletId(''); setCrTxns([]) }}>Close</button>
              <table style={tbl}>
                <thead><tr>
                  <th style={th}>Type</th><th style={th}>Amount</th><th style={th}>Ref</th><th style={th}>Trip</th><th style={th}>Date</th>
                </tr></thead>
                <tbody>
                  {crTxns.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1rem', color: 'var(--foreground-dim)' }}>No transactions</td></tr>
                  ) : crTxns.map((t: any) => (
                    <tr key={t.id}>
                      <td style={td}><span style={bdg}>{t.type}</span></td>
                      <td style={{ ...td, color: t.type === 'CREDIT' ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                        {t.type === 'CREDIT' ? '+' : '-'}₿{Number(t.amount).toLocaleString()}
                      </td>
                      <td style={{ ...td, fontFamily: 'monospace', fontSize: '0.6rem' }}>{t.reference?.slice(0, 20)}</td>
                      <td style={{ ...td, fontFamily: 'monospace', fontSize: '0.6rem' }}>{t.tripId?.slice(0, 12) || '-'}</td>
                      <td style={{ ...td, fontSize: '0.6rem', color: 'var(--foreground-dim)' }}>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Group>
          )}
        </div>
      )}
    </div>
  )
}
