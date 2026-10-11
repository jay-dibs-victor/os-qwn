import { 
  useAuditLogs 
} from '../../../core/hooks/adminHooks';
import { Card } from '../../../core/components';
import moment from 'moment';
import '../AuditLogs/AuditLogs.css';

/**
 * ActivityLogger — GoomTaxi
 * Centralized audit trail and admin action log viewer.
 * High-fidelity refactor for immutable system monitoring.
 */

const SEVERITY_MAP = {
  create: { color: 'bg-success', icon: 'bi-plus-circle-fill' },
  update: { color: 'bg-primary', icon: 'bi-pencil-fill' },
  delete: { color: 'bg-danger', icon: 'bi-trash3-fill' },
  login:  { color: 'bg-info',   icon: 'bi-box-arrow-in-right' },
  logout: { color: 'bg-secondary', icon: 'bi-box-arrow-right' },
};

const Logger = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: logs, isLoading } = useAuditLogs();

  const filtered = (logs || []).filter((l) =>
    `${l.action || ''} ${l.module || ''} ${l.user || l.admin_email || ''} ${l.message || ''}`
      .toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="activity-logger animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Compliance</span>
          <h2 className="fw-800 m-0">Activity Audit Log</h2>
        </div>
        <div className="font-12 text-muted">
          <i className="bi bi-shield-check text-success me-1"></i>
          All admin actions are immutably logged.
        </div>
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
                placeholder="Filter by action, module, or admin…"
                className="bg-transparent border-0 w-100 outline-none font-13"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="font-12 fw-700 text-muted">
            ENTRIES: <span className="bg-warning text-dark px-2 py-1 rounded-2 ms-2">{filtered.length}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">ACTION</th>
                <th>MODULE</th>
                <th>ADMINISTRATOR</th>
                <th>DATE / TIME</th>
                <th className="text-center">TYPE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((log, idx) => {
                  const sev = SEVERITY_MAP[log.action?.toLowerCase()] || { color: 'bg-light border', icon: 'bi-activity' };
                  return (
                    <tr key={log._id || log.id || idx}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }} className={`${sev.color} bg-opacity-10`}>
                            <i className={`${sev.icon} font-13`} style={{ color: 'inherit' }}></i>
                          </div>
                          <div>
                            <div className="fw-700 text-dark font-13 capitalize">{log.action || 'Event'}</div>
                            <div className="font-11 text-muted">{log.message || log.description || 'System action'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge rounded-pill bg-dark text-white font-10 px-3 uppercase tracking-widest">
                          {log.module || 'System'}
                        </span>
                      </td>
                      <td>
                        <div className="font-12 fw-600 text-dark">{log.user || log.admin_email || 'System'}</div>
                        <div className="font-11 text-muted">{log.ip || 'Internal'}</div>
                      </td>
                      <td>
                        <div className="font-12 fw-700 text-dark">{log.createdAt ? moment(log.createdAt).format('DD MMM YYYY') : 'N/A'}</div>
                        <div className="font-11 text-muted">{log.createdAt ? moment(log.createdAt).format('hh:mm A') : ''}</div>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${sev.color} font-10 px-2 rounded-pill uppercase tracking-widest text-white`}>
                          {log.action?.toUpperCase() || 'INFO'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-success font-10 px-2 rounded-pill">
                          RECORDED
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="6" className="text-center py-5 text-muted font-13 italic">No activity entries found within date range.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export { Logger };
export default Logger;
