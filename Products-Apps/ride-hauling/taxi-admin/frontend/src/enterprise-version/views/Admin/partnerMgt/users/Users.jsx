import React, { useState } from 'react';
import { usePartnersAdmin } from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import moment from 'moment';

/** partnerMgt/users/Users — fleet partner list */
const PartnerUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: partners, isLoading } = usePartnersAdmin();

  const filtered = partners?.filter((p) =>
    `${p.name || ''} ${p.email || ''} ${p.company_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Fleet Management</span>
          <h2 className="fw-800 m-0">Fleet Partners</h2>
        </div>
      </div>
      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <div className="p-4 border-bottom bg-light">
          <div className="search-box glass" style={{ maxWidth: 420, padding: '0.65rem 1.4rem', borderRadius: 14, display: 'flex', alignItems: 'center', gap: '0.85rem', border: '1px solid rgba(0,0,0,0.08)' }}>
            <i className="bi bi-search text-muted"></i>
            <input type="text" placeholder="Search partners…" className="bg-transparent border-0 outline-none font-13 w-100"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">PARTNER</th>
                <th>CONTACT</th>
                <th>FLEET</th>
                <th className="text-center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((p, idx) => (
                  <tr key={p._id || p.id || idx}>
                    <td className="ps-4">
                      <div className="fw-700 text-dark">{p.name || p.company_name}</div>
                      <div className="font-11 text-muted">{p.company_name ? 'Corporate' : 'Individual'}</div>
                    </td>
                    <td>
                      <div className="font-13 fw-600">{p.email}</div>
                      <div className="font-11 text-muted">{p.phone_number || 'N/A'}</div>
                    </td>
                    <td><span className="fw-700">{p.fleet_count || 0} vehicles</span></td>
                    <td className="text-center"><span className="badge bg-success font-10 px-3 rounded-pill">Active</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-5 text-muted font-13 italic">No partners found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default PartnerUsers;
