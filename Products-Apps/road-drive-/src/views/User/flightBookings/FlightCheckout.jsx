import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFlightStore } from '../../../core/store/useFlightStore';
import { useAuthStore } from '../../../core/store/useAuthStore';
import apiClient from '../../../core/api/apiClient';
import './flight.css';

const FlightCheckout = () => {
   const { cart, searchParams } = useFlightStore();
   const { user } = useAuthStore();
   const [isProcessing, setIsProcessing] = useState(false);
   const [gateway, setGateway] = useState('paystack');

   const baseFare = cart.reduce((acc, item) => acc + parseFloat(item.price.total), 0);
   const discount = 54; // Placeholder for UI matching Pic 1
   const taxes = 20;
   const serviceFee = 24;
   const total = baseFare - discount + taxes + serviceFee;

   const handleCheckout = async () => {
      setIsProcessing(true);
      try {
         const { data } = await apiClient.post('/bookings/flights/checkout', {
            userId: user.id,
            email: user.email,
            gateway,
            currency: 'USD'
         });

         if (data.status === 200) {
            window.location.href = data.data.authorization_url || data.data.links?.[1]?.href;
         }
      } catch (err) {
         alert('Checkout failed: ' + err.message);
      } finally {
         setIsProcessing(false);
      }
   };

   return (
      <div className="flight-booking-container" style={{ background: 'var(--flight-secondary)' }}>
         {/* ── Top Header Image (Matching Pic 1) ──────────── */}
         <div className="checkout-banner shadow-sm">
            <div className="container">
               <h1 className="text-white fw-bold">Complete Your Booking</h1>
               <p className="text-white-50">Please complete booking & fly toward your destination.</p>
            </div>
         </div>

         <div className="container" style={{ marginTop: '-60px', position: 'relative', zIndex: 10 }}>
            <div className="row g-4">
               <div className="col-lg-8">
                  {/* ── Passenger Info Card (Matching Pic 1) ────── */}
                  <div className="checkout-card p-4 shadow-sm mb-4">
                     <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                           <h4 className="fw-bold mb-0">Mr. {user?.firstname} {user?.lastname}</h4>
                           <p className="text-muted">{user?.email}</p>
                        </div>
                        <div className="display-4 fw-bold text-primary">₦{total.toLocaleString()}</div>
                     </div>

                     {cart.map((flight, i) => (
                        <div key={i} className="flight-detail-item border rounded-3 p-4 mb-3">
                           <div className="d-flex justify-content-between align-items-center mb-4">
                              <div className="d-flex align-items-center gap-3">
                                 <img src={`https://logo.clearbit.com/${flight.airline?.toLowerCase().replace(' ', '')}.com`} alt="airline" style={{ width: '50px' }} />
                                 <div>
                                    <h6 className="fw-bold m-0">{flight.airline}</h6>
                                    <small className="text-muted">{flight.flight_number}</small>
                                 </div>
                              </div>
                              <div className="text-center">
                                 <h6 className="fw-bold m-0">15h 22m</h6>
                                 <small className="text-danger">1 Stop via Network</small>
                              </div>
                              <button className="btn btn-outline-primary btn-sm">View Fare Rules</button>
                           </div>

                           <div className="flight-timeline">
                              <div className="timeline-node">
                                 <div className="time">05:55 AM</div>
                                 <div className="dot"></div>
                                 <div className="city">Maine</div>
                              </div>
                              <div className="timeline-line">
                                 <i className="bi bi-airplane"></i>
                              </div>
                              <div className="timeline-node text-end">
                                 <div className="time">08:20 PM</div>
                                 <div className="dot"></div>
                                 <div className="city">Canada</div>
                              </div>
                           </div>

                            <div className="mt-4 p-3 rounded-3 d-flex justify-content-between" style={{ background: 'var(--flight-card-bg)', border: '1px solid var(--flight-glass-border)' }}>
                               <div className="small text-muted"><i className="bi bi-bag me-2"></i> Cabin Baggage: 7 Kgs</div>
                               <div className="small text-muted"><i className="bi bi-suitcase-lg me-2"></i> Check-in Baggage: 20 Kgs</div>
                            </div>
                        </div>
                     ))}

                      <div className="alert alert-warning border-0 small mt-4" style={{ background: 'rgba(255, 184, 0, 0.08)', color: 'var(--flight-primary)' }}>
                         <i className="bi bi-exclamation-triangle-fill me-2"></i>
                         Check-in baggage is not included for PQI-XYZ. You can buy extra baggage from the airline counter.
                      </div>
                  </div>
               </div>

               {/* ── Sidebar (Matching Pic 1) ──────────────────── */}
               <div className="col-lg-4">
                  <div className="checkout-card p-4 shadow-sm mb-4">
                     <h5 className="fw-bold mb-4">Price Details</h5>
                     <div className="price-row">
                        <span>Base Fare</span>
                        <span>₦{baseFare.toLocaleString()}</span>
                     </div>
                      <div className="price-row" style={{ color: 'var(--color-success, #10B981)' }}>
                         <span>Discount</span>
                         <span>- ₦{discount.toLocaleString()}</span>
                      </div>
                     <div className="price-row">
                        <span>Taxes</span>
                        <span>₦{taxes.toLocaleString()}</span>
                     </div>
                     <div className="price-row">
                        <span>Service Fee</span>
                        <span>₦{serviceFee.toLocaleString()}</span>
                     </div>
                      <hr style={{ borderColor: 'var(--flight-glass-border)' }} />
                     <div className="price-row h5 fw-bold text-primary">
                        <span>Total Price</span>
                        <span>₦{total.toLocaleString()}</span>
                     </div>
                  </div>

                  <div className="checkout-card p-4 shadow-sm mb-4">
                     <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold m-0">Promo Code</h5>
                        <button className="btn btn-link btn-sm p-0 text-decoration-none">View all</button>
                     </div>
                      <div className="input-group">
                         <input type="text" className="form-control" placeholder="Enter promo code here" style={{ background: 'var(--color-surface-light, #121212)', border: '1px solid var(--flight-glass-border)', color: 'var(--flight-text-dark)' }} />
                         <button className="btn btn-primary">Apply</button>
                      </div>
                  </div>

                  <div className="promo-banner-checkout rounded-3 p-4 text-white">
                     <h6 className="fw-bold mb-3">Book A Flight & Get</h6>
                     <ul className="small list-unstyled m-0">
                        <li className="mb-2">✓ Exclusive Rates on Select Properties</li>
                        <li>✓ Extra 10% off using code BOOKSTAYS</li>
                     </ul>
                  </div>

                  <button
                     className="btn btn-primary w-100 py-3 rounded-3 mt-4 h5 fw-bold"
                     onClick={handleCheckout}
                     disabled={isProcessing || cart.length === 0}
                  >
                     {isProcessing ? 'Processing Payment...' : 'Confirm & Pay'}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default FlightCheckout;
