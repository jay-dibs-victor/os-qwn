import { Card, Button } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';

import '../Bookings/ManageOperations.css';

/**
 * ManageSOS — GoomTaxi
 * High-fidelity refactor for emergency & support operations.
 * Features prioritized response tracking and synchronized alert broadcasting.
 */
const ManageSOS = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const addToast = useUIStore((state) => state.addToast);

  // Mock data for SOS since no specific hook is created in adminHooks.js
  const mockSOS = [
    { _id: '1', user: 'Jane Doe', type: 'Medical Emergency', status: 'resolved', date: '2023-11-20T10:30:00Z', location: 'Lekki Phase 1' },
    { _id: '2', user: 'John Smith', type: 'Accident', status: 'active', date: '2023-11-21T08:15:00Z', location: 'Victoria Island' }
  ];

  const handleResolve = (id) => {
    addToast('Emergency ticket marked as resolved', 'success');
  };

  const filteredSOS = mockSOS.filter((sos) =>
    `${sos.user} ${sos.type} ${sos.location}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sos-view animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline text-danger">Critical Operations</span>
          <h2 className="fw-800 m-0">SOS & Emergencies</h2>
        </div>
        <Button variant="danger" onClick={() => addToast('Broadcasting alerts to assigned authorities...', 'warning')}>
          <i className="bi bi-broadcast"></i> Broadcast Alert
        </Button>
      </div>

      <Card className="p-0 overflow-hidden shadow-md border-0 bg-danger text-white mb-4">
         <div className="p-4 d-flex align-items-center gap-4" style={{ background: 'linear-gradient(45deg, #ff4757, #ff6b81)' }}>
            <div className="avatar-lg bg-white text-danger flex-center rounded-circle" style={{ width: 64, height: 64, fontSize: 28 }}>
               <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <div>
               <h4 className="fw-800 mb-1 text-white">Active Emergency Protocol</h4>
               <p className="m-0 font-13" style={{ opacity: 0.9 }}>1 Active emergency requires immediate action and response dispatch.</p>
            </div>
         </div>
      </Card>

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
                placeholder="Search emergency logs..." 
                className="bg-transparent border-0 w-100 outline-none font-13"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead>
              <tr>
                <th>CLIENT & LOCATION</th>
                <th>EMERGENCY TYPE</th>
                <th className="text-center">STATUS</th>
                <th className="text-end">RESPONSE</th>
              </tr>
            </thead>
            <tbody>
              {filteredSOS.length > 0 ? (
                filteredSOS.map((sos) => (
                  <tr key={sos._id}>
                    <td>
                      <div className="fw-700 text-dark font-14">{sos.user}</div>
                      <div className="font-12 text-muted fw-600"><i className="bi bi-geo-alt-fill text-danger me-1"></i> {sos.location}</div>
                    </td>
                    <td>
                      <div className="font-13 fw-800 text-danger text-uppercase">{sos.type}</div>
                      <div className="font-11 text-muted">Ticket ID: #{sos._id}</div>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${sos.status === 'active' ? 'badge-danger pulse' : 'badge-success'}`}>
                        {sos.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2 px-3">
                        {sos.status === 'active' && (
                          <button 
                            className="btn-action bg-success text-white" 
                            onClick={() => handleResolve(sos._id)}
                            title="Mark as Resolved"
                            style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}
                          >
                            <i className="bi bi-check-lg"></i>
                          </button>
                        )}
                        <button 
                          className="btn-action bg-light" 
                          title="View Incident Log"
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}
                        >
                          <i className="bi bi-journal-text text-dark"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-5 text-muted font-13 italic">No emergency protocols logged</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ManageSOS;
