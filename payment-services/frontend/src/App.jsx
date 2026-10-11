import React, { useState, useEffect } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { CreditCard, User, History, CheckCircle, ShieldAlert, Sparkles, RefreshCw, Calendar, ArrowRight } from 'lucide-react';
import PricingCard from './components/PricingCard';
import CheckoutForm from './components/CheckoutForm';
import DeveloperConsole from './components/DeveloperConsole';

export default function App() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeUser, setActiveUser] = useState('john_doe'); // Default test user session
  const [userProfile, setUserProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);

  // Load plans, profile, and history on start or user switch
  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [activeUser]);

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setConsoleLogs((prev) => [{ time, message, type }, ...prev]);
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get('http://localhost:5050/api/payments/plans');
      setPlans(response.data.plans || []);
      addLog('Fetched subscription plans from NestJS.', 'info');
    } catch (err) {
      addLog('Error fetching plans: ' + err.message, 'error');
    }
  };

  const fetchUserData = async () => {
    setLoadingProfile(true);
    addLog(`Loading profile and transactions for ${activeUser}...`, 'info');
    try {
      const profileRes = await axios.get(`http://localhost:5050/api/payments/user/${activeUser}`);
      setUserProfile(profileRes.data);

      const txRes = await axios.get(`http://localhost:5050/api/payments/transactions/${activeUser}`);
      setTransactions(txRes.data || []);
      addLog(`Loaded profile for ${activeUser}. Plan: ${profileRes.data?.activePlan}`, 'success');
    } catch (err) {
      addLog('Error fetching user data: ' + err.message, 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePaymentSuccess = (planId) => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']
    });
    
    addLog(`Success Confetti triggered! Plan ${planId} verified.`, 'success');
    setSelectedPlan(null);
    fetchUserData(); // Reload profile and history
  };

  const handleWebhookTriggered = (reference) => {
    // Webhook triggered successfully on backend, wait 1 second then reload transactions
    setTimeout(() => {
      fetchUserData();
    }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '80px' }}>
      {/* Premium Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 5%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(10, 11, 13, 0.5)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px', background: 'var(--gradient-primary)', color: 'white' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', color: 'white' }}>Taxi Booking Subscription Hub</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment Services Demo</span>
          </div>
        </div>

        {/* User Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <User size={16} className="text-violet-400" />
          <select
            value={activeUser}
            onChange={(e) => {
              setActiveUser(e.target.value);
              setSelectedPlan(null);
            }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'white',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <option value="john_doe">John Doe (john@example.com) - NGN User</option>
            <option value="jane_smith">Jane Smith (jane@example.com) - USD User</option>
          </select>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main style={{ width: '90%', maxWidth: '1200px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '40px' }} className="animate-fade">
        
        {/* User Subscription Status Summary */}
        {userProfile && (
          <div
            className="glass-panel"
            style={{
              padding: '24px 32px',
              borderRadius: '16px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '24px',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                <CheckCircle size={28} className="text-violet-400" />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Active Plan
                </span>
                <h2 style={{ fontSize: '1.8rem', color: 'white', marginTop: '2px', fontWeight: '800', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {userProfile.activePlan} Plan
                  <span className={`badge ${userProfile.subscriptionStatus === 'ACTIVE' ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '0.7rem' }}>
                    {userProfile.subscriptionStatus}
                  </span>
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '32px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Calendar size={12} /> Expiry Date
                </div>
                <div style={{ fontSize: '1rem', color: 'white', fontWeight: '600', marginTop: '4px' }}>
                  {userProfile.planExpiry
                    ? new Date(userProfile.planExpiry).toLocaleDateString(undefined, { dateStyle: 'long' })
                    : 'Lifetime Free'}
                </div>
              </div>
              <button
                onClick={fetchUserData}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Refresh Status"
              >
                <RefreshCw size={18} className={loadingProfile ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        )}

        {/* Plan Cards & Checkout Form Section */}
        <section>
          <div style={{ display: 'grid', gridTemplateColumns: selectedPlan ? '1.2fr 1fr' : '1fr', gap: '32px', alignItems: 'start' }}>
            
            {/* Pricing Options Column */}
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'white' }}>Available Hauling Subscription Plans</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Choose a subscription plan to test the checkout integration flows.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {plans.map((plan) => (
                  <PricingCard
                    key={plan.id}
                    plan={plan}
                    onSelect={(p) => setSelectedPlan(p)}
                    isSelected={selectedPlan?.id === plan.id}
                    activePlan={userProfile?.activePlan}
                  />
                ))}
              </div>
            </div>

            {/* Checkout Form Column */}
            {selectedPlan && (
              <div className="animate-scale">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ color: 'white', fontSize: '1.2rem' }}>Proceeding to Payment</h3>
                  <button
                    onClick={() => setSelectedPlan(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                  >
                    Cancel Checkout
                  </button>
                </div>
                <CheckoutForm
                  plan={selectedPlan}
                  activeUser={activeUser}
                  onPaymentSuccess={handlePaymentSuccess}
                  onAddLog={addLog}
                />
              </div>
            )}
          </div>
        </section>

        {/* Transaction History Section */}
        <section>
          <div
            className="glass-panel"
            style={{
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              padding: '32px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <History className="text-violet-400" size={22} />
                <h3 style={{ fontSize: '1.3rem', color: 'white' }}>Transaction Checkout Log</h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {transactions.length} orders total
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '16px 8px' }}>Reference</th>
                    <th style={{ padding: '16px 8px' }}>Provider</th>
                    <th style={{ padding: '16px 8px' }}>Plan</th>
                    <th style={{ padding: '16px 8px' }}>Amount</th>
                    <th style={{ padding: '16px 8px' }}>Date</th>
                    <th style={{ padding: '16px 8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.9rem' }}>
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No transactions found for user "{activeUser}". Complete a checkout plan.
                      </td>
                    </tr>
                  )}
                  {transactions.map((tx) => (
                    <tr key={tx.reference} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'var(--text-secondary)' }}>
                      <td style={{ padding: '16px 8px', fontFamily: 'monospace', color: 'white' }}>
                        {tx.reference}
                      </td>
                      <td style={{ padding: '16px 8px', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.8rem' }}>
                        {tx.provider}
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        {tx.planId}
                      </td>
                      <td style={{ padding: '16px 8px', color: 'white', fontWeight: 'bold' }}>
                        {tx.currency === 'USD' ? '$' : '₦'}
                        {tx.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 8px', fontSize: '0.8rem' }}>
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <span className={`badge ${tx.status === 'SUCCESS' ? 'badge-success' : tx.status === 'PENDING' ? 'badge-pending' : 'badge-failed'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>

      {/* Developer Sandbox Console Drawer */}
      <DeveloperConsole
        transactions={transactions}
        onWebhookTriggered={handleWebhookTriggered}
        activeUser={activeUser}
      />
    </div>
  );
}
