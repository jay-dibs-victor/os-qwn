import React from 'react';
import { Check, Shield } from 'lucide-react';

export default function PricingCard({ plan, onSelect, isSelected, activePlan }) {
  const isCurrent = activePlan === plan.id;

  return (
    <div
      className={`glass-card relative flex flex-col p-8 ${isSelected ? 'ring-2 ring-violet-500' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        padding: '32px',
        height: '100%',
        position: 'relative',
        border: isSelected
          ? '2px solid var(--accent-purple)'
          : '1px solid var(--border-color)',
        animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {isCurrent && (
        <span
          className="absolute top-4 right-4 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-violet-400"
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '9999px',
            position: 'absolute',
            top: '16px',
            right: '16px',
          }}
        >
          <Shield size={12} />
          Active Plan
        </span>
      )}

      <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'white' }}>{plan.name}</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        {plan.id === 'STARTER' && 'Perfect to get started with hauling services.'}
        {plan.id === 'PRO' && 'Best value for frequent riders and businesses.'}
        {plan.id === 'ENTERPRISE' && 'Customized features for corporate dispatch.'}
      </p>

      {/* Pricing display */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '24px' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'white' }}>
          ₦{plan.amount.toLocaleString()}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>/ month</span>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Equivalent: <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>${plan.usdAmount} USD</span>
      </div>

      <div style={{ flex: '1', marginBottom: '32px' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: '600' }}>
          What's included:
        </h4>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {plan.features.map((feature, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)' }}>
                <Check size={12} style={{ color: 'var(--accent-green)' }} />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => onSelect(plan)}
        disabled={isCurrent}
        className="btn"
        style={{
          width: '100%',
          background: isCurrent
            ? 'rgba(255,255,255,0.05)'
            : isSelected
              ? 'var(--gradient-primary)'
              : 'rgba(255,255,255,0.08)',
          color: isCurrent ? 'var(--text-muted)' : 'white',
          border: isCurrent ? '1px solid rgba(255,255,255,0.05)' : 'none',
          cursor: isCurrent ? 'not-allowed' : 'pointer',
        }}
      >
        {isCurrent ? 'Current Plan' : isSelected ? 'Selected for Checkout' : 'Select Plan'}
      </button>
    </div>
  );
}
