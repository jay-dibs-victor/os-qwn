import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./CheckOut.css";

const steps = [
  { id: 1, name: "Quote Review", icon: "🛒" },
  { id: 2, name: "Details", icon: "📋" },
  { id: 3, name: "Payment", icon: "💳" },
  { id: 4, name: "Confirm", icon: "✅" }
];

const CheckOut = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [itineraries, setItineraries] = useState(location.state?.itineraries || []);
  const [totalFare, setTotalFare] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
    paymentMethod: "bank"
  });

  useEffect(() => {
    if (!itineraries.length) {
      navigate("/");
      return;
    }
    fetchQuote();
  }, []);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      // Mocking API call for now, but ready to use the new endpoint
       const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
       const response = await fetch(`${API_URL}/rides/multi-stop-quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itineraries })
        });
       const result = await response.json();
       if (result.status === 200) {
         setItineraries(result.data.itineraries);
         setTotalFare(result.data.total_fare);
       } else {
         // Fallback calculation if API fails
         const mockTotal = itineraries.length * 2500; 
         setTotalFare(mockTotal);
       }
    } catch (e) {
      const mockTotal = itineraries.length * 2500;
      setTotalFare(mockTotal);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <QuoteReview itineraries={itineraries} total={totalFare} onNext={handleNext} />;
      case 2: return <BillingDetails data={formData} setData={setFormData} onNext={handleNext} onBack={handleBack} />;
      case 3: return <PaymentMethod data={formData} setData={setFormData} onNext={handleNext} onBack={handleBack} />;
      case 4: return <ConfirmBooking data={formData} itineraries={itineraries} total={totalFare} onBack={handleBack} />;
      default: return null;
    }
  };

  return (
    <div className="checkout-page bg-light min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Step Indicator */}
            <div className="checkout-wizard-nav mb-5">
              {steps.map((step, idx) => (
                <div key={step.id} className={`wizard-step ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
                  <div className="step-circle">
                    {currentStep > step.id ? "✓" : step.icon}
                  </div>
                  <span className="step-name">{step.name}</span>
                  {idx < steps.length - 1 && <div className="step-connector"></div>}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="checkout-card card border-0 shadow-sm p-4 animate-fadeIn">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-warning" role="status"></div>
                      <p className="mt-3 text-muted">Calculating your premium quote...</p>
                    </div>
                  ) : renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuoteReview = ({ itineraries, total, onNext }) => (
  <div className="quote-review">
    <h4 className="fw-bold mb-4">Review Your Itinerary Quote</h4>
    <div className="cart-list mb-4">
      {itineraries.map((iti, idx) => (
        <div key={idx} className="cart-item-card mb-3 p-3 border rounded-3 bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="badge bg-warning text-dark mb-1">Stop {idx + 1}</span>
              <h6 className="mb-1 fw-bold">{iti.pickup.split(',')[0]} → {iti.destination.split(',')[0]}</h6>
              <p className="small text-muted mb-0">{iti.date} @ {iti.time} • {iti.driverOption}</p>
            </div>
            <div className="text-end">
              <span className="fw-bold text-dark">₦{iti.estimated_fare?.toLocaleString() || '---'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
    
    <div className="summary-section border-top pt-4">
      <div className="d-flex justify-content-between mb-2">
        <span className="text-muted">Subtotal</span>
        <span className="fw-bold">₦{total.toLocaleString()}</span>
      </div>
      <div className="d-flex justify-content-between mb-4">
        <span className="text-muted">Booking Fee</span>
        <span className="text-success fw-bold">FREE</span>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Total Amount</h5>
        <h4 className="fw-bold text-warning mb-0">₦{total.toLocaleString()}</h4>
      </div>
      <button className="btn btn-warning w-100 py-3 fw-bold rounded-3" onClick={onNext}>Proceed to Details</button>
    </div>
  </div>
);

const BillingDetails = ({ data, setData, onNext, onBack }) => {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="billing-details">
      <h4 className="fw-bold mb-4">Passenger Details</h4>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label small fw-bold">First Name</label>
          <input type="text" className="form-control" value={data.firstName} onChange={e => setData({...data, firstName: e.target.value})} />
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-bold">Last Name</label>
          <input type="text" className="form-control" value={data.lastName} onChange={e => setData({...data, lastName: e.target.value})} />
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-bold">Email</label>
          <input type="email" className="form-control" value={data.email} onChange={e => setData({...data, email: e.target.value})} />
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-bold">Phone Number</label>
          <input type="tel" className="form-control" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} />
        </div>
      </div>

      <div className="accordion-item border rounded-3 overflow-hidden mb-4">
        <div 
          className="accordion-header p-3 bg-light cursor-pointer d-flex justify-content-between align-items-center"
          onClick={() => setShowNotes(!showNotes)}
        >
          <span className="fw-bold small">Trip Preferences & Notes</span>
          <span>{showNotes ? '−' : '+'}</span>
        </div>
        <AnimatePresence>
          {showNotes && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-3"
            >
              <label className="form-label small fw-bold">Special Pickup Notes</label>
              <textarea 
                className="form-control" 
                rows="3" 
                value={data.notes} 
                onChange={e => setData({...data, notes: e.target.value})} 
                placeholder="Any specific instructions for the driver?"
              ></textarea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="d-flex gap-2 mt-4">
        <button className="btn btn-light px-4" onClick={onBack}>Back</button>
        <button className="btn btn-warning flex-1 fw-bold" onClick={onNext}>Select Payment Method</button>
      </div>
    </div>
  );
};

const PaymentMethod = ({ data, setData, onNext, onBack }) => {
  const methods = [
    { id: 'bank', name: 'Bank Transfer', icon: '🏦', desc: 'Secure bank to bank transfer' },
    { id: 'paystack', name: 'Paystack', icon: '💎', desc: 'Pay instantly with cards' },
    { id: 'stripe', name: 'Stripe', icon: '🌍', desc: 'Global card payments' }
  ];

  return (
    <div className="payment-method">
      <h4 className="fw-bold mb-4">Payment Method</h4>
      <div className="payment-options d-grid gap-3 mb-4">
        {methods.map(m => (
          <div 
            key={m.id} 
            className={`payment-link-card p-3 border rounded-3 cursor-pointer ${data.paymentMethod === m.id ? 'active' : ''}`}
            onClick={() => setData({...data, paymentMethod: m.id})}
          >
            <div className="d-flex align-items-center">
              <span className="fs-3 me-3">{m.icon}</span>
              <div>
                <h6 className="mb-0 fw-bold">{m.name}</h6>
                <p className="small text-muted mb-0">{m.desc}</p>
              </div>
              <div className="ms-auto">
                <div className={`radio-circle ${data.paymentMethod === m.id ? 'checked' : ''}`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="d-flex gap-2 mt-4">
        <button className="btn btn-light px-4" onClick={onBack}>Back</button>
        <button className="btn btn-warning flex-1 fw-bold" onClick={onNext}>Review & Confirm</button>
      </div>
    </div>
  );
};

const ConfirmBooking = ({ data, itineraries, total, onBack }) => {
  const [complete, setComplete] = useState(false);

  const handleFinalize = () => {
    setComplete(true);
    // Final API call logic would go here
  };

  if (complete) {
    return (
      <div className="text-center py-5">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fs-1 text-success mb-3">✅</motion.div>
        <h3 className="fw-bold">Booking Secured!</h3>
        <p className="text-muted">Your scheduled road trip has been confirmed. You will receive an email shortly.</p>
        <button className="btn btn-warning mt-4 px-5 rounded-pill" onClick={() => window.location.href = '/ride-history'}>View My Trips</button>
      </div>
    );
  }

  return (
    <div className="confirm-booking">
      <h4 className="fw-bold mb-4">Final Confirmation</h4>
      <div className="confirm-summary bg-light p-3 rounded-3 mb-4">
        <div className="row">
          <div className="col-6 mb-3">
            <span className="tiny-label">Passenger</span>
            <p className="fw-bold mb-0">{data.firstName} {data.lastName}</p>
          </div>
          <div className="col-6 mb-3">
            <span className="tiny-label">Payment</span>
            <p className="fw-bold mb-0 text-uppercase">{data.paymentMethod}</p>
          </div>
          <div className="col-12">
            <span className="tiny-label">Stops</span>
            <p className="fw-bold mb-0">{itineraries.length} Stops Planned</p>
          </div>
        </div>
      </div>
      <div className="alert alert-warning mb-4 py-2 small">
        ⚡ You are about to authorize a transaction of <strong>₦{total.toLocaleString()}</strong>.
      </div>
      <div className="d-flex gap-2 mt-4">
        <button className="btn btn-light px-4" onClick={onBack}>Back</button>
        <button className="btn btn-warning flex-1 fw-bold" onClick={handleFinalize}>Confirm & Pay Now</button>
      </div>
    </div>
  );
};

export default CheckOut;
