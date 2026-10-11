import React, { useState, useEffect } from 'react';
import apiClient from '../../../core/api/apiClient';

const BookingMgt = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/bookings/flights/admin/all'); 
      if (data.status === 200) setBookings(data.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'BOOKED': return 'bg-success';
      case 'CANCELLED': return 'bg-danger';
      case 'PENDING': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="admin-page">
      <div className="mb-4">
        <h2>Flight Booking Records</h2>
        <p className="text-muted">Monitor all global flight transactions and fulfillment status.</p>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
           <table className="table table-hover">
              <thead className="table-light">
                 <tr>
                    <th>Booking ID</th>
                    <th>User ID</th>
                    <th>Flight ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {isLoading ? (
                   <tr><td colSpan="7" className="text-center">Loading bookings...</td></tr>
                 ) : bookings.length === 0 ? (
                   <tr><td colSpan="7" className="text-center">No bookings found.</td></tr>
                 ) : bookings.map(b => (
                   <tr key={b.id}>
                      <td className="fw-bold">#FL-{b.id.toString().slice(-6)}</td>
                      <td>{b.user_id}</td>
                      <td>{b.flight_id}</td>
                      <td>₦{parseFloat(b.total_cost).toLocaleString()}</td>
                      <td>
                         <span className={`badge ${getStatusBadge(b.status)}`}>
                            {b.status}
                         </span>
                      </td>
                      <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td>
                         <button className="btn btn-sm btn-outline-primary me-2">View</button>
                         {b.status !== 'CANCELLED' && (
                           <button className="btn btn-sm btn-outline-danger">Cancel</button>
                         )}
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default BookingMgt;
