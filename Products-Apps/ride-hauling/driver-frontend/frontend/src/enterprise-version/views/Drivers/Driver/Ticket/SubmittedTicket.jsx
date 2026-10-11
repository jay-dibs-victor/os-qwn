import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const SubmittedTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:12000';
        const response = await axios.get(`${baseUrl}/driver/tickets`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTickets(response.data || []);
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(t => 
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ticket-history-page p-t-40 animated fadeIn">
      <div className="container">
        <div className="page-header m-b-40 flex-row justify-between items-center">
            <div>
                <h1 className="font-32 font-bold text-dark tracking-tight">Support History</h1>
                <p className="text-muted font-16">Track the status of your submitted support requests.</p>
            </div>
            <Link to="/support-tickets" className="btn-premium no-decoration">
                <i className="md md-add m-r-8"></i> New Ticket
            </Link>
        </div>

        <div className="card-box shadow-md p-0 overflow-hidden" style={{ background: 'var(--color-surface)', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
          <div className="p-25 border-bottom flex-row justify-between items-center" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <h4 className="m-0 font-bold text-dark">Ticket Archive</h4>
            <div className="search-box relative" style={{ width: '300px' }}>
                <input 
                    type="text" 
                    placeholder="Search tickets..." 
                    className="form-control premium-input p-l-40" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="md md-search absolute" style={{ left: '15px', top: '12px', color: '#94a3b8' }}></i>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover m-0">
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th className="p-20 font-bold text-muted font-12 uppercase tracking-wider">Date Created</th>
                  <th className="p-20 font-bold text-muted font-12 uppercase tracking-wider">Subject</th>
                  <th className="p-20 font-bold text-muted font-12 uppercase tracking-wider">Category</th>
                  <th className="p-20 font-bold text-muted font-12 uppercase tracking-wider">Status</th>
                  <th className="p-20 font-bold text-muted font-12 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center p-40"><div className="spinner-border text-primary"></div></td></tr>
                ) : filteredTickets.length > 0 ? filteredTickets.map((ticket, idx) => (
                  <tr key={idx} className="transition-fast">
                    <td className="p-20 text-dark font-14">{moment(ticket.createdAt).format('MMM DD, YYYY')}</td>
                    <td className="p-20 font-bold text-dark font-14">{ticket.subject}</td>
                    <td className="p-20"><span className="badge bg-secondary-subtle text-muted p-x-12 p-y-6" style={{ borderRadius: '6px' }}>{ticket.category}</span></td>
                    <td className="p-20">
                        <span className={`badge ${ticket.status === 'Resolved' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} p-x-12 p-y-6`} style={{ borderRadius: '6px' }}>
                            {ticket.status || 'Pending'}
                        </span>
                    </td>
                    <td className="p-20 text-right">
                        <button className="btn-icon-only text-muted hover-text-primary transition-fast" style={{ background: 'none', border: 'none' }}>
                            <i className="md md-visibility font-20"></i>
                        </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center p-80">
                        <i className="md md-assignment-late font-48 text-muted opacity-20 m-b-20"></i>
                        <p className="text-muted m-0">No matching tickets found.</p>
                    </td>
                  </tr>
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
