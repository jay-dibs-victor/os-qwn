import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function MfaSetupPage() {
  const setupMfa = useAuthStore((s) => s.setupMfa)
  const enableMfa = useAuthStore((s) => s.enableMfa)
  const isBusy = useAuthStore((s) => s.isBusy)
  const error = useAuthStore((s) => s.error)

  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [done, setDone] = useState(false)

  const handleSetup = async () => {
    const res = await setupMfa()
    setQrCode(res.qrCode)
    setSecret(res.secret)
    setDone(false)
  }

  const handleEnable = async () => {
    await enableMfa(code)
    setDone(true)
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.25rem' }}>
      <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.3rem', color: '#fff', marginBottom: '0.35rem' }}>
          Multi-Factor Authentication
        </h2>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Generate a QR code, scan it with your authenticator app, then verify to enable MFA.
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1.25rem', color: '#EF4444', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={handleSetup} disabled={isBusy} style={{ width: 'fit-content' }}>
            Generate QR Code
          </button>

          {qrCode && (
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.25rem', alignItems: 'start' }}>
              <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1rem' }}>
                <img src={qrCode} alt="MFA QR" style={{ width: '100%', borderRadius: '0.75rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {secret && (
                  <div style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Secret</div>
                    <div style={{ color: '#fff', fontWeight: 700, wordBreak: 'break-all' }}>{secret}</div>
                  </div>
                )}

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ marginBottom: '0.5rem' }}>Verification Code</label>
                  <input
                    className="form-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>

                <button className="btn btn-primary" onClick={handleEnable} disabled={isBusy || !code} style={{ width: 'fit-content' }}>
                  Enable MFA
                </button>

                {done && (
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.75rem', padding: '0.85rem 1rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 700 }}>
                    MFA enabled successfully.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

