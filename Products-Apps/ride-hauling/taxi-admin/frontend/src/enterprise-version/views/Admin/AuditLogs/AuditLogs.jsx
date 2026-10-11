import { 
  useAuditLogs 
} from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import moment from 'moment';
import './AuditLogs.css';

/**
 * AuditLogs — GoomTaxi
 * Immutable admin action trail for compliance and security auditing.
 */

const ACTION_COLORS = {
  login: 'bg-info', logout: 'bg-secondary', create: 'bg-success',
  update: 'bg-primary', delete: 'bg-danger', view: 'bg-light border text-dark',
};

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const { data: logs, isLoading, refetch } = useAuditLogs({
    ...(dateFrom && { from: dateFrom }),
    ...(dateTo && { to: dateTo }),
    ...(actionFilter && { action: actionFilter }),
  });

  const filtered = (logs || []).filter((l) =>
    `${l.action || ''} ${l.module || ''} ${l.user || l.admin_email || ''} ${l.message || ''}`
      .toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="audit-logs animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Compliance & Security</span>
          <h2 className="fw-800 m-0">Audit Logs</h2>
        </div>
        <div className="d-flex gap-2">
          <Button variant="ghost" onClick={() => refetch()}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </Button>
          <Button variant="secondary">
            <i className="bi bi-download"></i> Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-3 mb-4 border-0 shadow-sm">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label text-overline text-muted font-11 mb-1">Search</label>
            <div className="d-flex align-items-center gap-2 bg-light rounded-3 px-3" style={{ height: 44 }}>
              <i className="bi bi-search text-muted"></i>
              <input type="text" className="bg-transparent border-0 outline-none font-13 w-100"
                placeholder="Filter by admin, action, module…"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="col-md-2">
            <label className="form-label text-overline text-muted font-11 mb-1">Action Type</label>
            <select className="form-select font-13 bg-light border-0" style={{ height: 44 }}
              value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="">All Actions</option>
              {['login', 'logout', 'create', 'update', 'delete', 'view'].map((a) => (
                <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label text-overline text-muted font-11 mb-1">From Date</label>
            <input type="date" className="form-control bg-light border-0 font-13" style={{ height: 44 }}
              value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label text-overline text-muted font-11 mb-1">To Date</label>
            <input type="date" className="form-control bg-light border-0 font-13" style={{ height: 44 }}
              value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="col-md-2">
            <Button variant="primary" className="w-100" onClick={() => refetch()} style={{ height: 44 }}>
              <i className="bi bi-funnel"></i> Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Entries', value: filtered.length, icon: 'bi-journal-text', color: '#3b82f6' },
          { label: 'Create Actions', value: filtered.filter(l => l.action?.toLowerCase() === 'create').length, icon: 'bi-plus-circle', color: '#22c55e' },
          { label: 'Update Actions', value: filtered.filter(l => l.action?.toLowerCase() === 'update').length, icon: 'bi-pencil', color: '#f59e0b' },
          { label: 'Delete Actions', value: filtered.filter(l => l.action?.toLowerCase() === 'delete').length, icon: 'bi-trash3', color: '#ef4444' },
        ].map(({ label, value, icon, color }) => (
          <div className="col-md-3" key={label}>
            <Card className="border-0 shadow-sm p-3">
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`${icon} font-16`} style={{ color }}></i>
                </div>
                <div>
                  <div className="fw-900 font-20 text-dark lh-1">{value}</div>
                  <div className="font-11 text-muted uppercase tracking-widest">{label}</div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Log Table */}
      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">ADMINISTRATOR</th>
                <th>ACTION</th>
                <th>MODULE / RESOURCE</th>
                <th>DESCRIPTION</th>
                <th>IP ADDRESS</th>
                <th>DATE / TIME</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((log, idx) => {
                  const actionKey = log.action?.toLowerCase() || 'view';
                  const colorClass = ACTION_COLORS[actionKey] || 'bg-light border text-dark';
                  return (
                    <tr key={log._id || log.id || idx}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(220,38,38,0.1)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>
                            {(log.user || log.admin_email || 'S')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-700 text-dark font-12">{log.user || log.admin_email || 'System'}</div>
                            <div className="font-10 text-muted">{log.admin_role || 'Administrator'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${colorClass} font-10 px-3 rounded-pill uppercase tracking-widest`}>
                          {log.action || 'LOG'}
                        </span>
                      </td>
                      <td>
                        <div className="font-12 fw-700 text-dark">{log.module || 'System'}</div>
                        <div className="font-11 text-muted">{log.resource_id ? `ID: ${String(log.resource_id).substring(0, 10)}` : ''}</div>
                      </td>
                      <td>
                        <p className="m-0 font-12 text-muted" style={{ maxWidth: 250 }} title={log.message || log.description}>
                          {(log.message || log.description || 'No description').substring(0, 60)}{(log.message || '').length > 60 ? '…' : ''}
                        </p>
                      </td>
                      <td>
                        <span className="font-monospace font-11 bg-light px-2 py-1 rounded border">{log.ip || 'Internal'}</span>
                      </td>
                      <td>
                        <div className="font-12 fw-700 text-dark">{log.createdAt ? moment(log.createdAt).format('DD MMM YYYY') : 'N/A'}</div>
                        <div className="font-11 text-muted">{log.createdAt ? moment(log.createdAt).format('hh:mm:ss A') : ''}</div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <i className="bi bi-journal-x font-48 text-muted d-block mb-3"></i>
                    <p className="text-muted font-13 italic">No audit entries found within the specified criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AuditLogs;
