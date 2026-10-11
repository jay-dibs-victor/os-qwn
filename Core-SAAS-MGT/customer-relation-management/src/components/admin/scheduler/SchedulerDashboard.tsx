import { useState } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import {
  processOverdueRemittances, disburseMatureSavings,
  disburseWeeklySavings, disburseMonthlySavings,
  getRemittanceSummary, getSavingsSummary,
} from '../../../api/financialTestGround'

interface Props { triggerToast: (msg: string) => void }

export default function SchedulerDashboard({ triggerToast }: Props) {
  const { user } = useAuthStore()
  const tenantId = user?.tenantId || ''
  const [running, setRunning] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [showOverview, setShowOverview] = useState(false)
  const [overviewData, setOverviewData] = useState<any>(null)

  const runAction = async (action: string, fn: () => Promise<any>) => {
    setRunning(action)
    setResult(null)
    try {
      const res = await fn()
      setResult({ action, success: true, data: res.data })
      triggerToast(`${action}: success`)
    } catch (err: any) {
      setResult({ action, success: false, error: err.message || String(err) })
      triggerToast(`${action}: failed`)
    }
    setRunning(null)
  }

  const loadOverview = async () => {
    if (!tenantId) return
    try {
      const [remRes, savRes] = await Promise.all([
        getRemittanceSummary(tenantId).catch(() => ({ data: null })),
        getSavingsSummary(tenantId).catch(() => ({ data: null })),
      ])
      setOverviewData({ remittance: remRes.data, savings: savRes.data })
      setShowOverview(true)
    } catch {
      triggerToast('Error loading overview')
    }
  }

  return (
    <div className="hub-container">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={loadOverview}>
          {showOverview ? 'Refresh Overview' : 'Load Overview'}
        </button>
      </div>

      {overviewData && (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div className="card" style={{ flex: '1 1 300px' }}>
            <h3>Remittance Summary</h3>
            {overviewData.remittance ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><strong>Total:</strong> {overviewData.remittance.totalSchedules}</div>
                <div><strong>Pending:</strong> {overviewData.remittance.pendingCount}</div>
                <div><strong>Completed:</strong> {overviewData.remittance.completedCount}</div>
                <div><strong>Overdue:</strong> {overviewData.remittance.overdueCount}</div>
                <div><strong>Amount:</strong> ₦{Number(overviewData.remittance.totalAmount).toLocaleString()}</div>
                <div><strong>Processed:</strong> ₦{Number(overviewData.remittance.totalProcessed).toLocaleString()}</div>
              </div>
            ) : <p style={{ color: 'var(--foreground-dim)' }}>No data</p>}
          </div>
          <div className="card" style={{ flex: '1 1 300px' }}>
            <h3>Savings Summary</h3>
            {overviewData.savings ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><strong>Total:</strong> {overviewData.savings.totalPlans}</div>
                <div><strong>Active:</strong> {overviewData.savings.activePlans}</div>
                <div><strong>Target:</strong> ₦{Number(overviewData.savings.totalTarget).toLocaleString()}</div>
                <div><strong>Total Saved:</strong> ₦{Number(overviewData.savings.totalSaved).toLocaleString()}</div>
                <div><strong>Penalties:</strong> ₦{Number(overviewData.savings.totalPenalties).toLocaleString()}</div>
              </div>
            ) : <p style={{ color: 'var(--foreground-dim)' }}>No data</p>}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        <ActionCard
          title="Process Overdue Remittances"
          description="Find all overdue remittance schedules and process them"
          loading={running === 'Process Overdue Remittances'}
          onClick={() => runAction('Process Overdue Remittances', () => processOverdueRemittances(tenantId))}
        />
        <ActionCard
          title="Disburse Mature Savings"
          description="Disburse all savings plans that have met their target"
          loading={running === 'Disburse Mature Savings'}
          onClick={() => runAction('Disburse Mature Savings', () => disburseMatureSavings(tenantId))}
        />
        <ActionCard
          title="Disburse Weekly Savings"
          description="Process weekly savings disbursements"
          loading={running === 'Disburse Weekly Savings'}
          onClick={() => runAction('Disburse Weekly Savings', () => disburseWeeklySavings(tenantId))}
        />
        <ActionCard
          title="Disburse Monthly Savings"
          description="Process monthly savings disbursements to drivers"
          loading={running === 'Disburse Monthly Savings'}
          onClick={() => runAction('Disburse Monthly Savings', () => disburseMonthlySavings(tenantId))}
        />
      </div>

      {result && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ color: result.success ? 'var(--success)' : 'var(--danger)' }}>
            {result.action} — {result.success ? 'Success' : 'Failed'}
          </h3>
          <pre style={{ fontSize: '0.75rem', maxHeight: '400px', overflow: 'auto' }}>
            {JSON.stringify(result.data || result.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

function ActionCard({ title, description, loading, onClick }: {
  title: string; description: string; loading: boolean; onClick: () => void
}) {
  return (
    <div className="card" style={{ cursor: loading ? 'wait' : 'pointer' }} onClick={loading ? undefined : onClick}>
      <h3>{title}</h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--foreground-dim)' }}>{description}</p>
      <button className="btn btn-primary" disabled={loading} style={{ marginTop: '0.75rem' }}>
        {loading ? 'Processing...' : 'Execute'}
      </button>
    </div>
  )
}
