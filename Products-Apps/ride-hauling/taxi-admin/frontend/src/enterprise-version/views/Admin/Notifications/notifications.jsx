import { 
  useNotifications, 
  useSendNotification 
} from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';

/** 
 * Notifications — GoomTaxi
 * Platform-wide broadcast and push notification manager.
 * Features premium audience targeting and FCM integration.
 */
const Notifications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const { data: notifications, isLoading } = useNotifications();
  const addToast = useUIStore((s) => s.addToast);

  const filtered = notifications?.filter((n) =>
    `${n.title || ''} ${n.body || ''} ${n.type || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSend = async () => {
    if (!message.trim()) { addToast('Please enter a notification message', 'warning'); return; }
    try {
      await apiClient.post('/admin-send-notification', { message, target });
      addToast('Notification broadcasted successfully', 'success');
      setMessage('');
    } catch {
      addToast('Failed to send notification', 'error');
    }
  };

  return (
    <div className="notifications-view animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Platform Comms</span>
          <h2 className="fw-800 m-0">Notifications Center</h2>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <Card className="glass shadow-md border-0 p-4">
            <h5 className="fw-800 mb-4 border-bottom pb-3">Broadcast New Notification</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label text-overline text-muted font-11 mb-2">Target Audience</label>
                <select className="form-select font-13 bg-light border-0 py-3" value={target} onChange={(e) => setTarget(e.target.value)}>
                  <option value="all">All Users & Drivers</option>
                  <option value="users">Users Only</option>
                  <option value="drivers">Drivers Only</option>
                </select>
              </div>
              <div className="col-md-12">
                <label className="form-label text-overline text-muted font-11 mb-2">Message</label>
                <textarea className="form-control bg-light border-0 py-3 font-13" rows="3"
                  placeholder="Write your broadcast message here…"
                  value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-top">
              <Button variant="primary" onClick={handleSend}>
                <i className="bi bi-send-fill"></i> Broadcast Notification
              </Button>
            </div>
          </Card>
        </div>
        <div className="col-lg-4">
          <Card className="bg-dark text-white border-0 shadow-lg h-100 p-4">
            <h5 className="fw-800 text-white mb-3">Broadcast Reach</h5>
            <p className="font-13 mb-3" style={{ opacity: 0.7 }}>Messages are sent via Firebase Cloud Messaging (FCM) to all active device tokens matching the selected audience filter.</p>
            <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <i className="bi bi-bell-fill me-2 text-warning font-14"></i>
              <span className="font-12 fw-700">Push + In-App Delivered</span>
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
          <div className="search-box glass" style={{ maxWidth: 420, padding: '0.65rem 1.4rem', borderRadius: 14, display: 'flex', alignItems: 'center', gap: '0.85rem', border: '1px solid rgba(0,0,0,0.08)', width: '100%' }}>
            <i className="bi bi-search text-muted"></i>
            <input type="text" placeholder="Search notification history…" className="bg-transparent border-0 outline-none font-13 w-100"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="font-12 fw-700 text-muted ms-3 text-nowrap">
            SENT: <span className="bg-warning text-dark px-2 py-1 rounded-2 ms-1">{filtered.length}</span>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">TITLE</th>
                <th>MESSAGE</th>
                <th>TARGET</th>
                <th>SENT AT</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((n, idx) => (
                  <tr key={n._id || n.id || idx}>
                    <td className="ps-4"><div className="fw-700 text-dark">{n.title || 'System Notice'}</div></td>
                    <td><p className="m-0 font-12 text-muted" style={{ maxWidth: 300 }}>{(n.body || n.message || '').substring(0, 80)}</p></td>
                    <td><span className="badge bg-dark text-white font-10 px-2 rounded-pill uppercase">{n.target || 'All'}</span></td>
                    <td><div className="font-12 text-muted">{n.sentAt || n.createdAt ? new Date(n.sentAt || n.createdAt).toLocaleDateString() : 'N/A'}</div></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-5 text-muted font-13 italic">No notifications sent yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Notifications;
