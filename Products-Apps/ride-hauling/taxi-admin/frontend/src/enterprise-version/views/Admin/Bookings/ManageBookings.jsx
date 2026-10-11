import React, { useState } from 'react';
import { 
  useBookingsAdmin
} from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import moment from 'moment';
import { Link } from 'react-router-dom';

import './ManageOperations.css';

/**
 * ManageBookings — GoomTaxi
 * High-fidelity refactor for operations schedule mapping.
 * Features premium itinerary timelines and real-time dispatch tracking.
 */
const ManageBookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { data: bookings, isLoading } = useBookingsAdmin();

  const filteredBookings = bookings?.filter((booking) =>
    `${booking.user_email} ${booking.pickup_address} ${booking.destination_address} ${booking.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) || [];

  if (viewMode === 'detail' && selectedBooking) {
    return (
      <div className="animate-fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="text-overline">Itinerary Detail</span>
            <h2 className="fw-800 m-0">Booking #{String(selectedBooking._id || selectedBooking.id).substring(0, 8)}</h2>
          </div>
          <Button variant="secondary" onClick={() => setViewMode('list')}>
            <i className="bi bi-arrow-left"></i> Back to Operations
          </Button>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
             <Card className="h-100">
                <h5 className="fw-800 mb-4 border-bottom pb-3">Route & Schedule</h5>
                <div className="d-flex flex-column gap-4 position-relative">
                   <div className="d-flex gap-3 align-items-start">
                     <i className="bi bi-record-circle text-primary mt-1"></i>
                     <div>
                       <span className="text-overline d-block">Pickup Location</span>
                       <p className="fw-700 text-dark m-0">{selectedBooking.pickup_address || 'Unspecified'}</p>
                     </div>
                   </div>
                   <div className="position-absolute" style={{ left: '6px', top: '24px', bottom: '60px', width: '2px', background: '#eee' }}></div>
                   <div className="d-flex gap-3 align-items-start">
                     <i className="bi bi-geo-alt-fill text-danger mt-1"></i>
                     <div>
                       <span className="text-overline d-block">Destination Location</span>
                       <p className="fw-700 text-dark m-0">{selectedBooking.destination_address || 'Unspecified'}</p>
                     </div>
                   </div>
                </div>

                <div className="row g-4 mt-2 pt-4 border-top">
                   <div className="col-md-4">
                      <span className="text-overline d-block">Trip Status</span>
                      <span className={`badge ${
                        selectedBooking.status === 'completed' ? 'badge-success' : 
                        selectedBooking.status === 'cancelled' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {selectedBooking.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                   </div>
                   <div className="col-md-4">
                      <span className="text-overline d-block">Package Type</span>
                      <p className="fw-700 text-dark m-0">{selectedBooking.package_category || 'On-Demand'}</p>
                   </div>
                   <div className="col-md-4">
                      <span className="text-overline d-block">Total Distance</span>
                      <p className="fw-700 text-dark m-0">{selectedBooking.distance || '0 km'}</p>
                   </div>
                </div>
             </Card>
          </div>

          <div className="col-lg-4">
             <Card className="bg-dark text-white mb-4">
                <h5 className="fw-800 text-white mb-3">Client Information</h5>
                <div className="d-flex align-items-center gap-3 mb-3">
                   <div className="avatar px-3 py-2 bg-light text-dark rounded-3 fw-bold">
                     {(selectedBooking.user_email?.[0] || 'C').toUpperCase()}
                   </div>
                   <div>
                     <p className="m-0 fw-700 font-13">{selectedBooking.user_email}</p>
                     <p className="m-0 text-muted-light font-11">Passenger</p>
                   </div>
                </div>
             </Card>
             <Card className="glass">
                <h5 className="fw-800 mb-3 border-bottom pb-2">Financials</h5>
                <div className="d-flex justify-content-between mb-2">
                   <span className="text-muted font-13">Trip Fare</span>
                   <span className="fw-700">₦{selectedBooking.amount?.toLocaleString() || '0'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                   <span className="text-muted font-13">Payment Status</span>
                   <span className="badge badge-success">Paid via Card</span>
                </div>
             </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-view animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline">Operations Management</span>
          <h2 className="fw-800 m-0">Live Bookings</h2>
        </div>
        <div className="d-flex gap-2">
           <Button variant="primary">
             <i className="bi bi-plus-lg"></i> Manual Dispatch
           </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-md">
        <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
          <div className="search-wrap" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="search-box glass" style={{
              width: '100%',
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <i className="bi bi-search text-muted"></i>
              <input 
                type="text" 
                placeholder="Search by client, location..." 
                className="bg-transparent border-0 w-100 outline-none font-13"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="font-12 fw-700 text-muted">
            TOTAL BOOKINGS: <span className="text-dark bg-warning px-2 py-1 rounded-2 ms-1">{filteredBookings.length}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead>
              <tr>
                <th>CLIENT / DATE</th>
                <th style={{ minWidth: '250px' }}>ITINERARY</th>
                <th>PACKAGE</th>
                <th>FARE</th>
                <th className="text-center">STATUS</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-5"><div className="spinner"></div></td></tr>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking._id || booking.id} className="cursor-pointer">
                    <td onClick={() => { setSelectedBooking(booking); setViewMode('detail'); }}>
                      <div className="fw-700 text-dark font-13">{booking.user_email || 'Guest User'}</div>
                      <div className="font-11 text-muted">{moment(booking.createdAt).format('DD MMM YYYY, HH:mm')}</div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center font-12 text-muted">
                        <span className="truncate" style={{ maxWidth: '120px' }} title={booking.pickup_address}>
                          {booking.pickup_address || 'Pickup'}
                        </span>
                        <i className="bi bi-chevron-right mx-2 opacity-50"></i>
                        <span className="truncate fw-bold text-dark" style={{ maxWidth: '120px' }} title={booking.destination_address}>
                          {booking.destination_address || 'Destination'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info text-dark" style={{ background: '#f0f4f8' }}>
                        {booking.package_category || 'On-Demand'}
                      </span>
                    </td>
                    <td className="fw-800">
                      ₦{booking.amount?.toLocaleString() || '0'}
                    </td>
                    <td className="text-center">
                      <span className={`badge ${
                        booking.status === 'completed' ? 'badge-success' : 
                        booking.status === 'cancelled' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {booking.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2 px-3">
                        <button 
                          className="btn-action bg-light" 
                          onClick={() => { setSelectedBooking(booking); setViewMode('detail'); }}
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}
                        >
                          <i className="bi bi-eye-fill text-primary"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-5 text-muted font-13 italic">No booking records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ManageBookings;
