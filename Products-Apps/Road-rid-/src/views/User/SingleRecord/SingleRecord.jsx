import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUIStore } from '../../../core/store/useUIStore';

// Mock function representing backend call
const fetchRecordDetails = async (id) => {
  // Simulate network delay
  return new Promise(resolve => setTimeout(() => resolve({
    planId: `PLAN-${id}`,
    status: 'Pending',
    itineraries: [
      { id: 1, date: '2026-05-10T10:00:00Z', pickup: 'Lekki Phase 1', destination: 'Ikeja City Mall', status: 'Upcoming' }
    ],
    quotation: {
      id: 'Q-92834',
      amount: 15000,
      status: 'Unpaid'
    }
  }), 1000));
};

const SingleRecord = () => {
  const { id = '2304758' } = useParams();
  const [activeTab, setActiveTab] = useState('plan');
  const addToast = useUIStore(state => state.addToast);

  // Implementing TanStack Query
  const { data: record, isLoading, isError } = useQuery({
    queryKey: ['singleRecord', id],
    queryFn: () => fetchRecordDetails(id),
  });

  const handleStartTrip = () => {
    addToast('Trip started successfully!', 'success');
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-5 mt-5 text-center">
        <h3 className="text-danger">Failed to load record details.</h3>
      </div>
    );
  }

  return (
    <div className="single-record-page py-5 mt-5">
      <div className="container">
        
        {record.quotation?.status === 'Unpaid' && (
          <div className="alert alert-warning border-0 rounded shadow-sm d-flex align-items-center justify-content-between mb-4">
            <div>
               <i className="bi bi-exclamation-triangle-fill me-2"></i>
               <strong>Action Required:</strong> You cannot start this trip yet. Please complete your payment for quotation {record.quotation.id}.
            </div>
            <Link to="/pay-action" className="btn btn-dark btn-sm rounded-pill px-4">Pay Now</Link>
          </div>
        )}

        <div className="row mb-4 align-items-end">
          <div className="col-md-8">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item"><Link to="/plans">Plans</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{record.planId}</li>
              </ol>
            </nav>
            <h2 className="fw-bold mb-0">Record Detail: {record.planId}</h2>
          </div>
        </div>

        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '24px', overflow: 'hidden' }}>
          <div className="card-header bg-white border-bottom-0 pt-4 px-4">
            <ul className="nav nav-tabs card-header-tabs" style={{ borderBottom: '2px solid #f8f9fa' }}>
              <li className="nav-item">
                <button 
                  className={`nav-link fw-bold border-0 ${activeTab === 'plan' ? 'text-dark border-bottom border-dark border-3' : 'text-muted'}`}
                  onClick={() => setActiveTab('plan')}
                  style={{ background: 'transparent' }}
                >
                  Plan Details
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link fw-bold border-0 ${activeTab === 'itinerary' ? 'text-dark border-bottom border-dark border-3' : 'text-muted'}`}
                  onClick={() => setActiveTab('itinerary')}
                  style={{ background: 'transparent' }}
                >
                  Itineraries
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link fw-bold border-0 ${activeTab === 'quotation' ? 'text-dark border-bottom border-dark border-3' : 'text-muted'}`}
                  onClick={() => setActiveTab('quotation')}
                  style={{ background: 'transparent' }}
                >
                  Quotation
                </button>
              </li>
            </ul>
          </div>
          
          <div className="card-body p-4 p-md-5 bg-white">
            
            {activeTab === 'plan' && (
              <div className="animated fadeIn">
                <h5 className="fw-bold mb-4">Plan Information</h5>
                <div className="row g-4 mb-5">
                   <div className="col-md-4">
                      <div className="p-3 bg-light rounded border border-light">
                         <span className="d-block text-muted small fw-bold text-uppercase">Plan ID</span>
                         <span className="fs-5 fw-bold">{record.planId}</span>
                      </div>
                   </div>
                   <div className="col-md-4">
                      <div className="p-3 bg-light rounded border border-light">
                         <span className="d-block text-muted small fw-bold text-uppercase">Status</span>
                         <span className="badge bg-warning text-dark px-3 py-2 rounded-pill mt-1">{record.status}</span>
                      </div>
                   </div>
                </div>

                <h5 className="fw-bold mb-3">Selected Vehicles</h5>
                <div className="p-4 bg-light rounded text-center text-muted">
                   <i className="bi bi-car-front fs-2 d-block opacity-50 mb-2"></i>
                   Standard SUV category selected for this plan.
                </div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="animated fadeIn">
                <h5 className="fw-bold mb-4">Planned Routes</h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr className="small text-uppercase text-muted fw-bold">
                        <th className="border-0 rounded-start">Date/Time</th>
                        <th className="border-0">Pickup</th>
                        <th className="border-0">Destination</th>
                        <th className="border-0">Status</th>
                        <th className="border-0 rounded-end text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.itineraries.map(it => (
                        <tr key={it.id}>
                           <td className="border-light fw-bold">{new Date(it.date).toLocaleString()}</td>
                           <td className="border-light">{it.pickup}</td>
                           <td className="border-light">{it.destination}</td>
                           <td className="border-light"><span className="badge bg-info-subtle text-info rounded-pill">{it.status}</span></td>
                           <td className="border-light text-end">
                              <button className="btn btn-sm btn-dark rounded-pill px-3" onClick={handleStartTrip}>Start Trip</button>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'quotation' && (
               <div className="animated fadeIn">
                 <div className="row justify-content-center">
                    <div className="col-md-8">
                      <div className="card border shadow-sm p-4 text-center" style={{ borderRadius: '16px' }}>
                         <i className="bi bi-receipt display-4 text-muted mb-3 opacity-50"></i>
                         <h4 className="fw-bold">Quotation {record.quotation.id}</h4>
                         <h2 className="fw-bold text-danger my-3">₦{record.quotation.amount.toLocaleString()}</h2>
                         <div className="mb-4">
                            <span className={`badge rounded-pill px-4 py-2 ${record.quotation.status === 'Unpaid' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                               {record.quotation.status}
                            </span>
                         </div>
                         {record.quotation.status === 'Unpaid' && (
                            <Link to="/pay-action" className="btn btn-lg btn-warning fw-bold rounded-pill w-100 shadow-sm" style={{ background: '#FFB800', border: 'none' }}>
                               Proceed to Payment
                            </Link>
                         )}
                      </div>
                    </div>
                 </div>
               </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default SingleRecord;
