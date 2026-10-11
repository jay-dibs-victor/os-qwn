import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../../core/store/useUIStore';

const PayAction = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const addToast = useUIStore((state) => state.addToast);
  const walletBalance = useUIStore((state) => state.walletBalance);

  // Example data
  const [paymentDetails, setPaymentDetails] = useState({
    amount: 15000,
    reference: 'TRX-98234-XYZ',
    method: '',
    email: '',
    phone: '',
    planId: 'CMT-PLAN-4343'
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        addToast('Payment processed successfully!', 'success');
        navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="pay-action-page py-5 mt-5">
      <div className="container">
        
        <div className="row mb-5 text-center justify-content-center">
          <div className="col-md-8">
            <h2 className="fw-bold mb-3">Secure Checkout</h2>
            <p className="text-muted">Complete your transaction seamlessly using your preferred payment method.</p>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            
            {/* Wizard Progress */}
            <div className="d-flex justify-content-between mb-5 position-relative">
              <div className="position-absolute top-50 start-0 w-100 bg-light" style={{ height: '4px', zIndex: 0, transform: 'translateY(-50%)' }}></div>
              <div className="position-absolute top-50 start-0 bg-primary" style={{ height: '4px', zIndex: 0, width: step === 1 ? '0%' : step === 2 ? '50%' : '100%', transition: 'width 0.4s', background: '#FFB800' }}></div>
              
              {[
                { num: 1, label: 'Details' },
                { num: 2, label: 'Billing' },
                { num: 3, label: 'Confirm' }
              ].map(s => (
                <div key={s.num} className="d-flex flex-column align-items-center position-relative z-1">
                  <div 
                    className={`d-flex justify-content-center align-items-center rounded-circle fw-bold ${step >= s.num ? 'bg-dark text-white' : 'bg-light text-muted border'}`} 
                    style={{ width: '40px', height: '40px', background: step >= s.num ? '#1A1A1A' : '#f8f9fa' }}
                  >
                    {s.num}
                  </div>
                  <span className={`small mt-2 fw-bold ${step >= s.num ? 'text-dark' : 'text-muted'}`}>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="card shadow-lg border-0 p-4 p-md-5" style={{ borderRadius: '24px' }}>
              
              {/* STEP 1: Details & Method */}
              {step === 1 && (
                <div className="step-content animated fadeIn">
                  <h4 className="fw-bold mb-4">Payment Method</h4>
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <div className="p-4 bg-light rounded" style={{ borderLeft: '4px solid #FFB800' }}>
                        <p className="text-muted small text-uppercase fw-bold mb-1">Total Amount</p>
                        <h3 className="fw-bold mb-0">₦{paymentDetails.amount.toLocaleString()}</h3>
                        <p className="text-muted small mt-2 mb-0">Ref: {paymentDetails.reference}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-muted small text-uppercase">Select Mode</label>
                      <select 
                        className="form-select form-select-lg bg-light border-0 px-4 mb-3"
                        value={paymentDetails.method}
                        onChange={(e) => setPaymentDetails({...paymentDetails, method: e.target.value})}
                      >
                        <option value="">-- Choose Payment Method --</option>
                        <option value="Wallet">In-App Wallet (Bal: ₦{walletBalance})</option>
                        <option value="Paystack">Credit/Debit Card (Paystack)</option>
                      </select>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                    <button 
                      className="btn btn-dark rounded-pill px-5 py-2 fw-bold"
                      onClick={handleNext}
                      disabled={!paymentDetails.method}
                    >
                      Next Step <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Billing Info */}
              {step === 2 && (
                <div className="step-content animated fadeIn">
                  <h4 className="fw-bold mb-4">Billing Information</h4>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase">Email Address</label>
                      <input 
                        type="email" 
                        className="form-control bg-light border-0" 
                        placeholder="your@email.com"
                        value={paymentDetails.email}
                        onChange={(e) => setPaymentDetails({...paymentDetails, email: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold text-uppercase">Phone Number</label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0" 
                        placeholder="080..."
                        value={paymentDetails.phone}
                        onChange={(e) => setPaymentDetails({...paymentDetails, phone: e.target.value})}
                      />
                    </div>
                    <div className="col-md-12 mt-4">
                      <h5 className="fw-bold mb-3">Plan Details</h5>
                      <div className="p-3 border rounded">
                         <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Plan ID:</span>
                            <span className="fw-bold">{paymentDetails.planId}</span>
                         </div>
                         <div className="d-flex justify-content-between">
                            <span className="text-muted">Payment Method:</span>
                            <span className="fw-bold">{paymentDetails.method}</span>
                         </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                    <button className="btn btn-light rounded-pill px-4 py-2 fw-bold" onClick={handlePrev}>
                      <i className="bi bi-arrow-left me-2"></i> Back
                    </button>
                    <button 
                      className="btn btn-dark rounded-pill px-5 py-2 fw-bold"
                      onClick={handleNext}
                    >
                      Review Order <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Confirm */}
              {step === 3 && (
                <div className="step-content animated fadeIn">
                  <h4 className="fw-bold mb-4 text-center">Final Review</h4>
                  
                  <div className="bg-light p-4 rounded mb-4 text-center">
                     <p className="text-muted mb-1">You are about to make a payment of</p>
                     <h2 className="fw-bold text-success mb-3">₦{paymentDetails.amount.toLocaleString()}</h2>
                     <p className="small text-muted mb-0">Will be charged via <strong>{paymentDetails.method}</strong></p>
                  </div>

                  <div className="alert alert-info border-0 rounded text-center small mb-4">
                     <i className="bi bi-shield-lock-fill me-2"></i>Secure, 256-bit encrypted transaction. No strings attached.
                  </div>

                  <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                    <button className="btn btn-light rounded-pill px-4 py-2 fw-bold" onClick={handlePrev} disabled={isProcessing}>
                      <i className="bi bi-arrow-left me-2"></i> Back
                    </button>
                    <button 
                      className="btn btn-success rounded-pill px-5 py-2 fw-bold shadow-sm d-flex align-items-center"
                      onClick={handleProcessPayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <><div className="spinner-border spinner-border-sm me-2" role="status"></div> Processing...</>
                      ) : (
                        <>Pay Now <i className="bi bi-check-circle-fill ms-2"></i></>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PayAction;
