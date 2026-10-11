import React, { useState } from 'react';
import { usePaymentHistory, useQuotations, usePlans } from '../../../core/hooks/useWalletHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';
import moment from 'moment';

/**
 * WalletHomeAdmin — taxi-admin
 * Central financial hub: overview of payments, quotations, and plans.
 */
const WalletHomeAdmin = () => {
  const [activeTab, setActiveTab] = useState('payments');
  const { data: payments, isLoading: loadingPayments } = usePaymentHistory();
  const { data: quotations, isLoading: loadingQuotations } = useQuotations();
  const { data: plans, isLoading: loadingPlans } = usePlans();
  const addToast = useUIStore((s) => s.addToast);

  const totalRevenue = payments?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0;
  const totalQuotations = quotations?.length || 0;
  const activePlans = plans?.length || 0;

  const tabs = [
    { key: 'payments', label: 'Payments', icon: 'bi-credit-card' },
    { key: 'quotations', label: 'Quotations', icon: 'bi-file-earmark-text' },
    { key: 'plans', label: 'Subscription Plans', icon: 'bi-tag' },
  ];

  const renderPayments = () => (
    <div className="table-responsive">
      <table className="table table-hover align-middle m-0">
        <thead className="bg-light"><tr>
          <th className="ps-4">DATE</th><th>REFERENCE</th><th>AMOUNT</th><th className="text-center">STATUS</th>
        </tr></thead>
        <tbody>
          {loadingPayments ? (
            <tr><td colSpan="4" className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
          ) : (payments || []).slice(0, 10).map((p, idx) => (
            <tr key={p._id || idx}>
              <td className="ps-4"><div className="font-12 fw-700">{p.createdAt ? moment(p.createdAt).format('DD MMM YY') : 'N/A'}</div></td>
              <td><span className="font-monospace font-12 bg-light px-2 py-1 rounded border">{p.reference || p.referenceCode || 'N/A'}</span></td>
              <td><span className="fw-800 text-success">{p.currency || '₦'}{(p.amount || 0).toLocaleString()}</span></td>
              <td className="text-center"><span className={`badge px-2 rounded-pill font-10 ${['success','paid'].includes(p.status?.toLowerCase()) ? 'bg-success' : 'bg-warning text-dark'}`}>{(p.status || 'Paid').toUpperCase()}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderQuotations = () => (
    <div className="table-responsive">
      <table className="table table-hover align-middle m-0">
        <thead className="bg-light"><tr>
          <th className="ps-4">DATE</th><th>PLAN ID</th><th>AMOUNT</th><th className="text-center">STATUS</th>
        </tr></thead>
        <tbody>
          {loadingQuotations ? (
            <tr><td colSpan="4" className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
          ) : (quotations || []).slice(0, 10).map((q, idx) => (
            <tr key={q._id || idx}>
              <td className="ps-4"><div className="font-12 fw-700">{q.createdAt ? moment(q.createdAt).format('DD MMM YY') : 'N/A'}</div></td>
              <td><span className="font-12 fw-600 text-dark">{q.plan_id || q.planId || 'N/A'}</span></td>
              <td><span className="fw-800 text-primary">{q.currency || '₦'}{(q.amount || 0).toLocaleString()}</span></td>
              <td className="text-center"><span className="badge bg-success px-2 rounded-pill font-10">QUOTED</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPlans = () => (
    <div className="row g-3 p-4">
      {loadingPlans ? (
        <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></div>
      ) : (plans || []).map((plan, idx) => (
        <div key={plan._id || idx} className="col-md-4">
          <Card className="glass border-0 shadow-sm p-3">
            <div className="fw-800 text-dark mb-1">{plan.name}</div>
            <div className="text-overline text-muted font-10 mb-2">{plan.category || 'Standard'}</div>
            <div className="fw-900 text-primary font-18">₦{plan.price?.toLocaleString() || '0'}</div>
          </Card>
        </div>
      ))}
      {(!loadingPlans && (!plans || plans.length === 0)) && (
        <div className="col-12 text-center text-muted py-4 font-13 italic">No subscription plans configured.</div>
      )}
    </div>
  );

  return (
    <div className="wallet-home animate-fade-in">
      <div className="mb-4">
        <span className="text-overline uppercase tracking-widest font-10">Financial Hub</span>
        <h2 className="fw-800 m-0">Wallet & Finance Overview</h2>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Revenue', value: `₦${totalRevenue.toLocaleString()}`, icon: 'bi-cash-stack', color: '#22c55e' },
          { label: 'Payment Records', value: payments?.length || 0, icon: 'bi-credit-card-2-front', color: '#3b82f6' },
          { label: 'Quotations', value: totalQuotations, icon: 'bi-file-earmark-text', color: '#f59e0b' },
          { label: 'Subscription Plans', value: activePlans, icon: 'bi-tag-fill', color: '#8b5cf6' },
        ].map(({ label, value, icon, color }) => (
          <div className="col-md-3" key={label}>
            <Card className="border-0 shadow-sm p-3">
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`${icon} font-18`} style={{ color }}></i>
                </div>
                <div>
                  <div className="fw-900 font-20 text-dark lh-1">{value}</div>
                  <div className="font-10 text-muted uppercase tracking-widest">{label}</div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Tabbed Data Panel */}
      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <div className="d-flex border-bottom bg-light">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`btn btn-link text-decoration-none font-12 fw-700 px-4 py-3 border-0 border-bottom border-2 rounded-0 ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted'}`}>
              <i className={`${tab.icon} me-1`}></i> {tab.label}
            </button>
          ))}
        </div>
        {activeTab === 'payments' && renderPayments()}
        {activeTab === 'quotations' && renderQuotations()}
        {activeTab === 'plans' && renderPlans()}
      </Card>
    </div>
  );
};

export default WalletHomeAdmin;
