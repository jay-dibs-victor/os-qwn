import React, { useState } from 'react';
import { useBookingsAdmin } from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';
import moment from 'moment';

import './ManageOperations.css';

/**
 * Trips — GoomTaxi / Bookings
 * Live trip itinerary management powered by the bookings API.
 * High-fidelity refactor for granular operation logs.
 */
const Trips = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: trips, isLoading } = useBookingsAdmin();
  const addToast = useUIStore((state) => state.addToast);

  const filtered = trips?.filter((t) =>
    `${t.user_email || ''} ${t.pickup_address || ''} ${t.destination_address || ''} ${t.status || ''}`
      .toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const statusColor = (s) =>
    s === 'completed' ? 'bg-success' : s === 'cancelled' ? 'bg-danger' : 'bg-warning text-dark';

  return (
    <div className="trips-view animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Operations</span>
          <h2 className="fw-800 m-0">Trip Itineraries</h2>
        </div>
        <Button variant="secondary" onClick={() => addToast('Exporting trip report…', 'info')}>
          <i className="bi bi-cloud-download"></i> Export
        </Button>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
          <div className="search-wrap" style={{ maxWidth: 420, width: '100%' }}>
            <div className="search-box glass" style={{
              width: '100%', padding: '0.65rem 1.4rem', borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: '0.85rem',
              border: '1px solid rgba(0,0,0,0.08)'
            }}>
              <i className="bi bi-search text-muted"></i>
              <input
                type="text"
                placeholder="Search by email, location or status…"
                className="bg-transparent border-0 w-100 outline-none font-13"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="font-12 fw-700 text-muted">
            TOTAL: <span className="bg-warning text-dark px-2 py-1 rounded-2 ms-2">{filtered.length}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">CLIENT / DATE</th>
                <th>PLAN</th>
                <th style={{ minWidth: 200 }}>PICKUP → DESTINATION</th>
                <th className="text-center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((t, idx) => (
                  <tr key={t._id || t.id || idx}>
                    <td className="ps-4">
                      <div className="fw-700 text-dark font-13">{t.user_email || 'Unknown Client'}</div>
                      <div className="font-11 text-muted">{t.createdAt ? moment(t.createdAt).format('DD MMM YYYY, HH:mm') : 'N/A'}</div>
                    </td>
                    <td>
                      <span className="badge bg-light border text-dark font-10 px-2 rounded-pill uppercase tracking-widest">
                        {t.package_category || 'On-Demand'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 font-12 text-muted">
                        <span className="truncate fw-600 text-dark" style={{ maxWidth: 130 }} title={t.pickup_address}>
                          {t.pickup_address || 'Pickup'}
                        </span>
                        <i className="bi bi-arrow-right opacity-50"></i>
                        <span className="truncate" style={{ maxWidth: 130 }} title={t.destination_address}>
                          {t.destination_address || 'Destination'}
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className={`badge px-3 rounded-pill font-10 ${statusColor(t.status)}`}>
                        {(t.status || 'Pending').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-5 text-muted font-13 italic">No trip records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Trips;
