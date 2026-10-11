import { useState, useEffect } from 'react'
import {
  listSiteWideFareConfigs, upsertSiteWideFareConfig,
  getSiteWideFareConfig, deleteSiteWideFareConfig,
  seedSiteWideFareDefaults, type SiteWideFareConfig,
} from '../../../api/financialTestGround'

interface Props { triggerToast: (msg: string) => void }

export default function SiteWideFareConfigHub({ triggerToast }: Props) {
  const [configs, setConfigs] = useState<SiteWideFareConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [lookupKey, setLookupKey] = useState('')
  const [lookupResult, setLookupResult] = useState<SiteWideFareConfig | null>(null)
  const [form, setForm] = useState({ configKey: '', configValue: '', description: '', dataType: 'string' })

  const load = async () => {
    setLoading(true)
    try {
      const res = await listSiteWideFareConfigs()
      setConfigs(res.data ?? [])
    } catch { setConfigs([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleLookup = async () => {
    if (!lookupKey) return
    try {
      const res = await getSiteWideFareConfig(lookupKey)
      setLookupResult(res.data ?? null)
      if (!res.data) triggerToast('Config key not found')
    } catch { setLookupResult(null); triggerToast('Error looking up key') }
  }

  const handleUpsert = async () => {
    try {
      await upsertSiteWideFareConfig(form)
      triggerToast(`Config "${form.configKey}" saved`)
      setForm({ configKey: '', configValue: '', description: '', dataType: 'string' })
      load()
    } catch { triggerToast('Error saving config') }
  }

  const handleDelete = async (key: string) => {
    try {
      await deleteSiteWideFareConfig(key)
      triggerToast(`Config "${key}" deleted`)
      load()
    } catch { triggerToast('Error deleting config') }
  }

  const handleSeed = async () => {
    try {
      await seedSiteWideFareDefaults()
      triggerToast('Defaults seeded')
      load()
    } catch { triggerToast('Error seeding defaults') }
  }

  return (
    <div className="hub-container">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={handleSeed}>Seed Defaults</button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 380px' }}>
          <h3>Create / Update Config</h3>
          <div className="form-group">
            <label>Config Key</label>
            <input value={form.configKey} onChange={e => setForm(p => ({ ...p, configKey: e.target.value }))} placeholder="e.g. INDIVIDUAL_DRIVER_COMMISSION_RATE" />
          </div>
          <div className="form-group">
            <label>Value</label>
            <input value={form.configValue} onChange={e => setForm(p => ({ ...p, configValue: e.target.value }))} placeholder="e.g. 10" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What this config controls" />
          </div>
          <div className="form-group">
            <label>Data Type</label>
            <select value={form.dataType} onChange={e => setForm(p => ({ ...p, dataType: e.target.value }))}>
              <option value="string">String</option><option value="number">Number</option><option value="boolean">Boolean</option><option value="json">JSON</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleUpsert}>Save</button>
        </div>

        <div className="card" style={{ flex: '1 1 380px' }}>
          <h3>Lookup Config</h3>
          <div className="form-group">
            <input value={lookupKey} onChange={e => setLookupKey(e.target.value)} placeholder="Config key to lookup" />
          </div>
          <button className="btn btn-secondary" onClick={handleLookup}>Lookup</button>
          {lookupResult && <pre style={{ marginTop: '0.5rem' }}>{JSON.stringify(lookupResult, null, 2)}</pre>}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>All Configs ({configs.length})</h3>
        {loading ? <p>Loading...</p> : configs.length === 0 ? <p style={{ color: 'var(--foreground-dim)' }}>No configs yet. Click "Seed Defaults" to populate.</p> : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Key</th><th>Value</th><th>Type</th><th>Description</th><th>Active</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {configs.map(c => (
                  <tr key={c.id}>
                    <td><code>{c.configKey}</code></td>
                    <td><strong>{c.configValue}</strong></td>
                    <td>{c.dataType}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--foreground-dim)' }}>{c.description || '-'}</td>
                    <td>{c.isActive ? '✅' : '❌'}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.configKey)}>Delete</button></td>
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
