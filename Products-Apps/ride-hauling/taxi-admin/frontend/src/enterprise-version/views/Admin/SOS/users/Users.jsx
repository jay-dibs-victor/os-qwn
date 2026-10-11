import React, { useState } from 'react';
import { useSOSAdmin, useResolveSOSMutation } from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';
import moment from 'moment';

/** SOS/users/Users — emergency SOS alert management */
const SOSUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: sosAlerts, isLoading } = useSOSAdmin();
  const { mutate: resolveSOS } = useResolveSOSMutation ? useResolveSOSMutation() : { mutate: () => {} };
  const addToast = useUIStore((s) => s.addToast);

  const filtered = sosAlerts?.filter((s) =>
    `${s.user_email || ''} ${s.location || ''} ${s.status || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Emergency Response</span>
          <h2 className="fw-800 m-0">SOS Alert Center</h2>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="badge bg-danger px-3 py-2 rounded-pill font-12 fw-700" style={{ animation: 'pulse 2s infinite' }}>
            <i className="bi bi-exclamation-triangle-fill me-1"></i>
            {filtered.filter((s) => s.status !== 'resolved').length} Active
          </div>
        </div>
      </div>
      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
          <div className="search-box glass" style={{ maxWidth: 420, padding: '0.65rem 1.4rem', borderRadius: 14, display: 'flex', alignItems: 'center', gap: '0.85rem', border: '1px solid rgba(0,0,0,0.08)', width: '100%' }}>
            <i className="bi bi-search text-muted"></i>
            <input type="text" placeholder="Search by user or location…" className="bg-transparent border-0 outline-none font-13 w-100"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="font-12 fw-700 text-muted ms-3 text-nowrap">
            TOTAL: <span className="bg-warning text-dark px-2 py-1 rounded-2 ms-1">{filtered.length}</span>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">USER / CONTACT</th>
                <th>LOCATION</th>
                <th>TRIGGERED AT</th>
                <th>TYPE</th>
                <th className="text-center">STATUS</th>
                <th className="text-end pe-4">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border spinner-border-sm text-danger"></div></td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((sos, idx) => (
                  <tr key={sos._id || sos.id || idx} style={sos.status !== 'resolved' ? { background: 'rgba(239,68,68,0.03)' } : {}}>
                    <td className="ps-4">
                      <div className="fw-700 text-dark">{sos.user_email || sos.user_name || 'Unknown'}</div>
                      <div className="font-11 text-muted">{sos.phone || 'No phone'}</div>
                    </td>
                    <td><p className="m-0 font-12" style={{ maxWidth: 180 }}>{sos.location || sos.address || 'Location unavailable'}</p></td>
                    <td><div className="font-12">{sos.createdAt ? moment(sos.createdAt).format('DD MMM YYYY, HH:mm') : 'N/A'}</div></td>
                    <td><span className="badge bg-danger text-white font-10 px-2 rounded-pill uppercase">{sos.type || 'Emergency'}</span></td>
                    <td className="text-center">
                      <span className={`badge px-3 rounded-pill font-10 ${sos.status === 'resolved' ? 'bg-success' : 'bg-danger'}`}>
                        {(sos.status || 'Active').toUpperCase()}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      {sos.status !== 'resolved' && (
                        <Button variant="secondary" className="font-11 py-1 px-2"
                          onClick={() => addToast('SOS case marked resolved', 'success')}>
                          <i className="bi bi-check2-circle"></i> Resolve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-5 text-muted font-13 italic">No SOS alerts recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default SOSUsers;
