import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SubmittedSOS = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sosEvents, setSosEvents] = useState([]); // Hook data placeholder
  const [isLoading, setIsLoading] = useState(false);

  const filteredEvents = sosEvents.filter(event => 
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sos-history-page py-5 mt-5">
      <div className="container">
        
        <div className="row mb-4 align-items-end">
          <div className="col-md-6">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item"><Link to="/sos">SOS</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Incident History</li>
              </ol>
            </nav>
            <h2 className="fw-bold mb-0 text-danger">SOS Incident History</h2>
            <p className="text-muted mt-2">Log of your past emergency reports and distress signals.</p>
          </div>
          <div className="col-md-6 text-md-end mt-3 mt-md-0">
            <div className="d-inline-block position-relative" style={{ maxWidth: '300px', width: '100%' }}>
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input 
                type="text" 
                className="form-control form-control-lg bg-white shadow-sm border-0 ps-5" 
                placeholder="Search by location..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to="/sos" className="btn btn-outline-danger rounded-pill px-4 py-2 ms-3 fw-bold shadow-sm d-none d-md-inline-block">
               <i className="bi bi-shield-fill-exclamation me-2"></i>New SOS
            </Link>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4 border-start border-danger border-4" style={{ borderRadius: '24px' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-uppercase fw-bold text-muted">
                  <th className="border-0 px-4 py-3">Date/Time</th>
                  <th className="border-0 py-3">Location reported</th>
                  <th className="border-0 py-3">Status</th>
                  <th className="border-0 px-4 py-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                      <i className="bi bi-shield-check display-4 d-block mb-3 opacity-25"></i>
                      No SOS reports found. You're safe! 
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event, idx) => (
                    <tr key={idx}>
                      <td className="px-4 border-bottom border-light">
                        <span className="d-block fw-bold text-dark">{new Date(event.date).toLocaleString() || 'N/A'}</span>
                      </td>
                      <td className="border-bottom border-light">
                        <span className="fw-bold">{event.location || 'N/A'}</span>
                      </td>
                      <td className="border-bottom border-light">
                        <span className={`badge rounded-pill px-3 py-2 ${event.status === 'resolved' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                          {event.status || 'Active Dispatch'}
                        </span>
                      </td>
                      <td className="px-4 border-bottom border-light text-end">
                        <button className="btn btn-sm btn-outline-dark rounded-pill px-3">
                          Report Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SubmittedSOS;
