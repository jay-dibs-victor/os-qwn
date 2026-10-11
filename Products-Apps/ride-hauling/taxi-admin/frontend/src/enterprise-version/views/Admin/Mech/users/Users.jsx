import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../core/api/apiClient';
import { Button, Card } from '../../../core/components';
import moment from 'moment';

const useMechRecords = () => useQuery({
  queryKey: ['admin', 'mech-records'],
  queryFn: async () => {
    const { data } = await apiClient.get('/admin-mechanic-records');
    return data.records || data || [];
  },
});

/** Mech/users/Users — mechanic clearance records */
const MechUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: records, isLoading } = useMechRecords();

  const filtered = records?.filter((r) =>
    `${r.driver_name || ''} ${r.mechanic || ''} ${r.status || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Mechanical Safety</span>
          <h2 className="fw-800 m-0">Mechanic Clearance Records</h2>
        </div>
      </div>
      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <div className="p-4 border-bottom bg-light">
          <div className="search-box glass" style={{ maxWidth: 420, padding: '0.65rem 1.4rem', borderRadius: 14, display: 'flex', alignItems: 'center', gap: '0.85rem', border: '1px solid rgba(0,0,0,0.08)' }}>
            <i className="bi bi-search text-muted"></i>
            <input type="text" placeholder="Search records…" className="bg-transparent border-0 outline-none font-13 w-100"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">DRIVER / VEHICLE</th>
                <th>MECHANIC</th>
                <th>SERVICE DATE</th>
                <th>ISSUES FOUND</th>
                <th className="text-center">CLEARANCE</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((r, idx) => (
                  <tr key={r._id || r.id || idx}>
                    <td className="ps-4">
                      <div className="fw-700 text-dark">{r.driver_name || 'Unknown'}</div>
                      <div className="font-11 text-muted font-monospace">{r.plate || r.car_model || ''}</div>
                    </td>
                    <td><div className="font-12">{r.mechanic || 'GoomTaxi Garage'}</div></td>
                    <td><div className="font-12">{r.service_date ? moment(r.service_date).format('DD MMM YYYY') : 'N/A'}</div></td>
                    <td><p className="m-0 font-12 text-muted" style={{ maxWidth: 200 }}>{r.issues || 'None reported'}</p></td>
                    <td className="text-center">
                      <span className={`badge px-3 rounded-pill font-10 ${r.status === 'cleared' ? 'bg-success' : r.status === 'failed' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {(r.status || 'Pending').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic">No mechanic records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default MechUsers;
