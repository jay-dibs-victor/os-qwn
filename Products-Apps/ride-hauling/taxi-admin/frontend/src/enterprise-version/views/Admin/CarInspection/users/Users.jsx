import React, { useState } from 'react';
import { useInspectionsAdmin } from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import moment from 'moment';

/** CarInspection/users/Users — vehicle inspection log */
const CarInspectionUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: inspections, isLoading } = useInspectionsAdmin();

  const filtered = inspections?.filter((i) =>
    `${i.driver_name || ''} ${i.car_plate || ''} ${i.status || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Vehicle Safety</span>
          <h2 className="fw-800 m-0">Car Inspection Registry</h2>
        </div>
      </div>
      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <div className="p-4 border-bottom bg-light">
          <div className="search-box glass" style={{ maxWidth: 420, padding: '0.65rem 1.4rem', borderRadius: 14, display: 'flex', alignItems: 'center', gap: '0.85rem', border: '1px solid rgba(0,0,0,0.08)' }}>
            <i className="bi bi-search text-muted"></i>
            <input type="text" placeholder="Search by driver or plate…" className="bg-transparent border-0 outline-none font-13 w-100"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">DRIVER</th>
                <th>VEHICLE / PLATE</th>
                <th>INSPECTION DATE</th>
                <th className="text-center">RESULT</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((item, idx) => (
                  <tr key={item._id || item.id || idx}>
                    <td className="ps-4"><div className="fw-700 text-dark">{item.driver_name || 'Unknown Driver'}</div></td>
                    <td>
                      <div className="font-13 fw-600">{item.car_model || item.vehicle || 'N/A'}</div>
                      <div className="font-11 text-muted font-monospace">{item.car_plate || ''}</div>
                    </td>
                    <td><div className="font-12 text-dark">{item.inspection_date ? moment(item.inspection_date).format('DD MMM YYYY') : 'N/A'}</div></td>
                    <td className="text-center">
                      <span className={`badge px-3 rounded-pill font-10 ${item.status === 'passed' ? 'bg-success' : item.status === 'failed' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {(item.status || 'Pending').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-5 text-muted font-13 italic">No inspection records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default CarInspectionUsers;
