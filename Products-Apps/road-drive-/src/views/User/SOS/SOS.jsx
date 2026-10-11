import { useUIStore } from '../../../core/store/useUIStore';
import { useSOSHistory } from '../../../core/hooks/useSupportHooks';
import moment from 'moment';

const SOS = () => {
  const { data: sosHistory = [], isLoading: historyLoading } = useSOSHistory();
  const addToast = useUIStore((state) => state.addToast);
  const [isHovered, setIsHovered] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSOS = () => {
    setIsSending(true);
    // Simulate real SOS API call
    setTimeout(() => {
        setIsSending(false);
        addToast('SOS Alert Sent! Emergency response has been dispatched to your location.', 'success');
    }, 1500);
  };

  return (
    <div className="sos-page py-5 mt-5">
      <div className="container">
        
        <div className="row justify-content-center text-center mb-5">
          <div className="col-md-8">
            <h2 className="fw-bold text-danger mb-3"><i className="bi bi-shield-fill-exclamation me-2"></i>Emergency SOS</h2>
            <p className="text-muted">
              If you feel unsafe or are in immediate danger, use this button to instantly broadcast your distress signal and live location to emergency services and your emergency contacts.
            </p>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0 text-center p-5 mb-5" style={{ borderRadius: '32px', background: '#ffebee' }}>
              <div className="card-body">
                <h4 className="fw-bold mb-4">Are you sure you want to trigger an SOS?</h4>
                
                <p className="text-muted small mb-5">
                  This action will share your real-time location. Please only use in genuine emergencies.
                </p>

                <div className="d-flex justify-content-center position-relative mb-4">
                  {/* Pulsing rings effect */}
                  {isHovered && (
                    <div className="position-absolute top-50 start-50 translate-middle" style={{ width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(220, 53, 69, 0.1)', animation: 'pulse 1s infinite' }}></div>
                  )}
                  {isHovered && (
                     <div className="position-absolute top-50 start-50 translate-middle" style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(220, 53, 69, 0.2)', animation: 'pulse 1s infinite', animationDelay: '0.2s' }}></div>
                  )}

                  <button
                    className="btn btn-danger text-white fw-bold shadow-lg d-flex flex-column align-items-center justify-content-center position-relative z-1"
                    style={{ 
                        width: '160px', 
                        height: '160px', 
                        borderRadius: '50%', 
                        fontSize: '32px',
                        transition: 'all 0.3s ease',
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={handleSOS}
                    disabled={isSending}
                  >
                    {isSending ? (
                        <div className="spinner-border text-white" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                    ) : (
                        <>SOS</>
                    )}
                  </button>
                </div>

                <div className="mt-5">
                   <p className="text-danger small fw-bold mb-0"><i className="bi bi-info-circle me-1"></i> Pressing this button dispatches help instantly.</p>
                </div>
              </div>
            </div>

            {/* SOS HISTORY SECTION */}
            <div className="sos-history mt-4">
               <h5 className="fw-bold mb-4 d-flex justify-content-between align-items-center">
                  Recent Alerts
                  <span className="badge bg-danger rounded-pill small" style={{ fontSize: '0.7rem' }}>{sosHistory.length} Total</span>
               </h5>
               
               {historyLoading ? (
                  <div className="text-center py-4"><div className="spinner-border text-danger"></div></div>
               ) : sosHistory.length === 0 ? (
                  <div className="text-center py-5 border rounded-4 bg-light text-muted">No recent alerts recorded.</div>
               ) : (
                  <div className="list-group gap-2 border-0">
                     {sosHistory.map((sos, i) => (
                        <div key={i} className="list-group-item list-group-item-action border rounded-4 p-3 shadow-sm border-0 d-flex justify-content-between align-items-center">
                           <div className="d-flex align-items-center">
                              <div className="p-2 bg-danger bg-opacity-10 rounded-circle me-3">
                                 <i className="bi bi-geo-alt-fill text-danger"></i>
                              </div>
                              <div>
                                 <h6 className="mb-0 fw-bold">Emergency Alert</h6>
                                 <small className="text-muted">{moment(sos.createdAt).fromNow()}</small>
                              </div>
                           </div>
                           <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 fw-bold small">DISPATCHED</span>
                        </div>
                     ))}
                  </div>
               )}
            </div>
            
            <div className="text-center mt-5 mb-4">
               <a href="/dashboard" className="text-muted text-decoration-none small"><i className="bi bi-arrow-left me-1"></i> Back to Dashboard</a>
            </div>
            
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SOS;
