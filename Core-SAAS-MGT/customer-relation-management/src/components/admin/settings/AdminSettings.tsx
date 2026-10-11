import React, { useState, useEffect } from 'react';
import { Settings, Globe, RefreshCw, Check, AlertCircle, DollarSign } from 'lucide-react';
import { getTenantSettings, updateTenantSettings, type PlatformSettings, type SupportedCurrency } from '../../../api/settings';
import { DEFAULT_CURRENCIES } from '../../../hooks/useCurrency';

interface AdminSettingsProps {
  settings: PlatformSettings;
  setSettings: React.Dispatch<React.SetStateAction<PlatformSettings>>;
  triggerToast: (msg: string) => void;
}

export default function AdminSettings({ settings, setSettings, triggerToast }: AdminSettingsProps) {
  const [currencies, setCurrencies] = useState<SupportedCurrency[]>(DEFAULT_CURRENCIES);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ratesInfo, setRatesInfo] = useState<{ lastUpdated: string; source: string } | null>(null);
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);

  // Load settings + currencies from API on mount
  useEffect(() => {
    getTenantSettings()
      .then(res => {
        setSettings(res.settings);
        setCurrencies(res.supportedCurrencies ?? DEFAULT_CURRENCIES);
      })
      .catch(() => {/* use props defaults */})
      .finally(() => setLoading(false));

    // Detect viewer's local currency
    fetch('/auth/settings/detect-currency', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}` },
    })
      .then(r => r.json())
      .then((d: { currency: string }) => setDetectedCurrency(d.currency))
      .catch(() => {});
  }, [setSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTenantSettings(settings);
      triggerToast('Platform settings saved successfully!');
    } catch {
      triggerToast('Failed to save settings — please try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedCurrency = currencies.find(c => c.code === settings.currency) ?? currencies[0];

  if (loading) {
    return (
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '0.75rem', color: 'var(--foreground-muted)' }}>
        <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
        <span>Loading platform settings…</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Currency & Localisation ── */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
          <Globe style={{ color: '#3b82f6' }} size={20} />
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-outfit)' }}>Currency & Localisation</h3>
          {detectedCurrency && detectedCurrency !== settings.currency && (
            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--foreground-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.35rem', padding: '0.2rem 0.5rem' }}>
              Your location: {currencies.find(c => c.code === detectedCurrency)?.flag} {detectedCurrency}
            </span>
          )}
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
          Set the operating currency for this tenancy. Revenue figures on the dashboard will be displayed in the selected currency using live exchange rates. Default is Nigerian Naira (₦ NGN).
        </p>

        {/* Currency selector grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {currencies.map(cur => {
            const isSelected = settings.currency === cur.code;
            return (
              <button
                key={cur.code}
                onClick={() => setSettings(s => ({ ...s, currency: cur.code }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.65rem 0.85rem',
                  background: isSelected ? 'rgba(255,184,0,0.08)' : 'rgba(255,255,255,0.02)',
                  border: isSelected ? '1px solid rgba(255,184,0,0.4)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '0.6rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{cur.flag}</span>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isSelected ? 'var(--primary)' : '#fff' }}>
                    {cur.symbol} {cur.code}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', marginTop: '0.1rem' }}>{cur.name}</div>
                </div>
                {isSelected && (
                  <Check size={12} style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', color: 'var(--primary)' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected currency summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: 'rgba(255,184,0,0.04)', border: '1px solid rgba(255,184,0,0.12)', borderRadius: '0.75rem' }}>
          <DollarSign size={16} style={{ color: 'var(--primary)' }} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}>
              Active: {selectedCurrency?.flag} {selectedCurrency?.name} ({selectedCurrency?.symbol} {selectedCurrency?.code})
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)', marginTop: '0.15rem' }}>
              All revenue figures will be converted from NGN base using live exchange rates
            </div>
          </div>
          {ratesInfo && (
            <div style={{ marginLeft: 'auto', fontSize: '0.6rem', color: 'var(--foreground-muted)', textAlign: 'right' }}>
              <div>Rates: {ratesInfo.source}</div>
              <div>{new Date(ratesInfo.lastUpdated).toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Platform Configuration ── */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
          <Settings style={{ color: 'var(--primary)' }} size={20} />
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-outfit)' }}>Dynamic Platform Configuration</h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '2rem' }}>
          Fine-tune economic variables, regional green rules, solar energy thresholds, and peer escrows without pushing a single line of code.
        </p>

        <div className="settings-grid">
          <div className="setting-control">
            <div className="setting-header">
              <span>Dynamic Commission Spread Rate</span>
              <span style={{ color: 'var(--primary)' }}>{settings.commissionRate}%</span>
            </div>
            <input type="range" min="1.0" max="20.0" step="0.5" value={settings.commissionRate}
              onChange={e => setSettings(s => ({ ...s, commissionRate: parseFloat(e.target.value) }))}
              className="setting-slider" />
            <p style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
              Platform percentage commission split collected from completed rides to fund energy programs.
            </p>
          </div>

          <div className="setting-control">
            <div className="setting-header">
              <span>Solar Swap Discount Rate</span>
              <span style={{ color: '#10b981' }}>{settings.solarDiscount}%</span>
            </div>
            <input type="range" min="5" max="50" step="5" value={settings.solarDiscount}
              onChange={e => setSettings(s => ({ ...s, solarDiscount: parseInt(e.target.value) }))}
              className="setting-slider" />
            <p style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
              Discount rate applied strictly for certified Queens OS EV drivers at off-grid solar cabinets.
            </p>
          </div>

          <div className="setting-control">
            <div className="setting-header">
              <span>Chama Savings Group Size</span>
              <span style={{ color: '#3b82f6' }}>{settings.chamaGroupSize} matched drivers</span>
            </div>
            <input type="range" min="5" max="10" step="5" value={settings.chamaGroupSize}
              onChange={e => setSettings(s => ({ ...s, chamaGroupSize: parseInt(e.target.value) }))}
              className="setting-slider" />
            <p style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
              Strict group peering size of 5 or 10 matched cooperative drivers for rotational lump sum payouts.
            </p>
          </div>

          <div className="setting-control">
            <div className="setting-header">
              <span>Max Daily Fuel Allowance Limit</span>
              <span style={{ color: '#8b5cf6' }}>{settings.maxDailyFuelLimit} Gallons</span>
            </div>
            <input type="range" min="20" max="100" step="10" value={settings.maxDailyFuelLimit}
              onChange={e => setSettings(s => ({ ...s, maxDailyFuelLimit: parseInt(e.target.value) }))}
              className="setting-slider" />
            <p style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
              Quantity limit enforced weekly on Cooperative Bulk Fuel Discount program pass.
            </p>
          </div>

          <div className="setting-control" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Snack Vending Allowed-Regions Switch</div>
              <p style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>
                Enable/disable commercial cabin retail dispensers dynamically based on active telemetry geolocation.
              </p>
            </div>
            <button onClick={() => setSettings(s => ({ ...s, snackVendingEnabled: !s.snackVendingEnabled }))}
              className={`btn ${settings.snackVendingEnabled ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', textTransform: 'none', flexShrink: 0 }}>
              {settings.snackVendingEnabled ? 'ACTIVE' : 'LOCKED'}
            </button>
          </div>

          <div className="setting-control" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Green Energy Geo-Lock Enforcement</div>
              <p style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>
                Restrict solar EV swap hubs features strictly to country or geo zones pre-certified by environmental regulators.
              </p>
            </div>
            <button onClick={() => setSettings(s => ({ ...s, greenEnergyGeoLock: !s.greenEnergyGeoLock }))}
              className={`btn ${settings.greenEnergyGeoLock ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', textTransform: 'none', flexShrink: 0 }}>
              {settings.greenEnergyGeoLock ? 'GEO-LOCKED' : 'GLOBAL'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
          {saving && (
            <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Saving…
            </span>
          )}
          <button onClick={handleSave} disabled={saving}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.8rem', background: 'var(--success)', boxShadow: '0 4px 12px var(--success-glow)', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Apply Config Parameters'}
          </button>
        </div>
      </div>

      {/* ── Exchange Rate Info ── */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <AlertCircle size={14} style={{ color: 'var(--foreground-muted)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: '600' }}>Exchange Rate Information</span>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', lineHeight: '1.6' }}>
          Live exchange rates are sourced from <strong style={{ color: '#fff' }}>open.er-api.com</strong> (free tier, updated daily).
          Geo-detection uses <strong style={{ color: '#fff' }}>ip-api.com</strong> to identify your location and suggest the local currency.
          All ledger values are stored in <strong style={{ color: 'var(--primary)' }}>NGN (Nigerian Naira)</strong> as the base currency.
          Dashboard figures are converted in real-time to your selected display currency.
        </p>
      </div>

    </div>
  );
}
