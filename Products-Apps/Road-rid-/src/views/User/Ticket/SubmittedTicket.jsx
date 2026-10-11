import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SubmittedTicket = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tickets, setTickets] = useState([]); // This would normally come from a custom hook
  const [isLoading, setIsLoading] = useState(false);

  const filteredTickets = tickets.filter(ticket => 
    ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="submitted-ticket-page py-5 mt-5">
      <div className="container">
        
        <div className="row mb-4 align-items-end">
          <div className="col-md-6">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item"><Link to="/create-ticket">Support</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Submitted Tickets</li>
              </ol>
            </nav>
            <h2 className="fw-bold mb-0">Submitted Tickets</h2>
            <p className="text-muted mt-2">Track the status and responses to your support requests.</p>
          </div>
          <div className="col-md-6 text-md-end mt-3 mt-md-0">
            <div className="d-inline-block position-relative" style={{ maxWidth: '300px', width: '100%' }}>
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input 
                type="text" 
                className="form-control form-control-lg bg-white shadow-sm border-0 ps-5" 
                placeholder="Search tickets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to="/create-ticket" className="btn btn-dark rounded-pill px-4 py-2 ms-3 fw-bold shadow-sm d-none d-md-inline-block">
               <i className="bi bi-plus-lg me-2"></i>New Ticket
            </Link>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '24px' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-uppercase fw-bold text-muted">
                  <th className="border-0 px-4 py-3">Date</th>
                  <th className="border-0 py-3">Subject</th>
                  <th className="border-0 py-3">Category</th>
                  <th className="border-0 py-3">Status</th>
                  <th className="border-0 px-4 py-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                      No tickets found.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket, idx) => (
                    <tr key={idx}>
                      <td className="px-4 border-bottom border-light">
                        <span className="d-block fw-bold">{new Date().toLocaleDateString()}</span>
                      </td>
                      <td className="border-bottom border-light">
                        <span className="fw-bold text-dark">{ticket.subject || 'N/A'}</span>
                      </td>
                      <td className="border-bottom border-light text-muted">
                        {ticket.category || 'N/A'}
                      </td>
                      <td className="border-bottom border-light">
                        <span className={`badge rounded-pill px-3 py-2 ${ticket.status === 'resolved' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                          {ticket.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 border-bottom border-light text-end">
                        <button className="btn btn-sm btn-outline-dark rounded-pill px-3">
                          View
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

export default SubmittedTicket;
