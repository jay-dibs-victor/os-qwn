import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import {
  listTenantRemittanceConfigs, upsertTenantRemittanceConfig,
  getDriverRemittanceConfig, getDefaultRemittanceConfig,
  deleteTenantRemittanceConfig, type TenantDriverRemittanceConfig,
} from '../../../api/financialTestGround'

interface Props { triggerToast: (msg: string) => void }

export default function TenantRemittanceConfigHub({ triggerToast }: Props) {
  const { user } = useAuthStore()
  const tenantId = user?.tenantId || ''

  const [configs, setConfigs] = useState<TenantDriverRemittanceConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [driverId, setDriverId] = useState('')
  const [driverConfig, setDriverConfig] = useState<TenantDriverRemittanceConfig | null>(null)
  const [defaultConfig, setDefaultConfig] = useState<TenantDriverRemittanceConfig | null>(null)

  const [form, setForm] = useState({
    driverCustomerId: '', remittanceCycle: 'DAILY',
    remittanceType: 'FIXED_AMOUNT', remittanceValue: 0,
    commissionRate: 10, dayOfWeek: 1, dayOfMonth: 1,
  })

  const load = async () => {
    if (!tenantId) return
    setLoading(true)
    try {
      const res = await listTenantRemittanceConfigs(tenantId)
      setConfigs(res.data ?? [])
    } catch { setConfigs([]) }
    try {
      const res = await getDefaultRemittanceConfig(tenantId)
      setDefaultConfig(res.data ?? null)
    } catch { setDefaultConfig(null) }
    setLoading(false)
  }

  useEffect(() => { load() }, [tenantId])

  const handleFetchDriver = async () => {
    if (!driverId) return
    try {
      const res = await getDriverRemittanceConfig(tenantId, driverId)
      setDriverConfig(res.data ?? null)
      if (res.data) triggerToast('Driver config found')
      else triggerToast('No specific config for this driver')
    } catch { setDriverConfig(null); triggerToast('Error fetching driver config') }
  }

  const handleCreate = async () => {
    try {
      await upsertTenantRemittanceConfig({ tenantId, ...form })
      triggerToast('Config created/updated')
      setForm({ driverCustomerId: '', remittanceCycle: 'DAILY', remittanceType: 'FIXED_AMOUNT', remittanceValue: 0, commissionRate: 10, dayOfWeek: 1, dayOfMonth: 1 })
      load()
    } catch { triggerToast('Error saving config') }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTenantRemittanceConfig(tenantId, id)
      triggerToast('Config deleted')
      load()
    } catch { triggerToast('Error deleting config') }
  }

  return (
    <div className="hub-container">
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 380px' }}>
          <h3>Create / Update Config</h3>
          <div className="form-group">
            <label>Driver Customer ID (leave empty for tenant default)</label>
            <input value={form.driverCustomerId} onChange={e => setForm(p => ({ ...p, driverCustomerId: e.target.value }))} placeholder="Optional: specific driver" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Cycle</label>
              <select value={form.remittanceCycle} onChange={e => setForm(p => ({ ...p, remittanceCycle: e.target.value }))}>
                <option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option><option value="COMMISSION_BASED">Commission Based</option>
              </select>
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.remittanceType} onChange={e => setForm(p => ({ ...p, remittanceType: e.target.value }))}>
                <option value="FIXED_AMOUNT">Fixed Amount</option><option value="PERCENTAGE_OF_FARE">% of Fare</option><option value="PERCENTAGE_OF_EARNINGS">% of Earnings</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Value (amount or %)</label>
              <input type="number" value={form.remittanceValue} onChange={e => setForm(p => ({ ...p, remittanceValue: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label>Commission Rate %</label>
              <input type="number" value={form.commissionRate} onChange={e => setForm(p => ({ ...p, commissionRate: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Day of Week (0=Sun)</label>
              <input type="number" min="0" max="6" value={form.dayOfWeek} onChange={e => setForm(p => ({ ...p, dayOfWeek: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label>Day of Month</label>
              <input type="number" min="1" max="31" value={form.dayOfMonth} onChange={e => setForm(p => ({ ...p, dayOfMonth: Number(e.target.value) }))} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleCreate}>Save Config</button>
        </div>

        <div className="card" style={{ flex: '1 1 380px' }}>
          <h3>Default Config</h3>
          {defaultConfig ? (
            <pre>{JSON.stringify(defaultConfig, null, 2)}</pre>
          ) : <p style={{ color: 'var(--foreground-dim)' }}>No default config set</p>}

          <h3 style={{ marginTop: '1.5rem' }}>Lookup Driver Config</h3>
          <div className="form-group">
            <input value={driverId} onChange={e => setDriverId(e.target.value)} placeholder="Driver Customer ID" />
          </div>
          <button className="btn btn-secondary" onClick={handleFetchDriver}>Fetch</button>
          {driverConfig && <pre style={{ marginTop: '0.5rem' }}>{JSON.stringify(driverConfig, null, 2)}</pre>}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>All Configs ({configs.length})</h3>
        {loading ? <p>Loading...</p> : configs.length === 0 ? <p style={{ color: 'var(--foreground-dim)' }}>No configs yet</p> : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Driver</th><th>Cycle</th><th>Type</th><th>Value</th><th>Commission %</th><th>Active</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {configs.map(c => (
                  <tr key={c.id}>
                    <td>{c.driverCustomerId || '(default)'}</td>
                    <td>{c.remittanceCycle}</td>
                    <td>{c.remittanceType}</td>
                    <td>{c.remittanceValue}</td>
                    <td>{c.commissionRate}%</td>
                    <td>{c.isActive ? '✅' : '❌'}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
