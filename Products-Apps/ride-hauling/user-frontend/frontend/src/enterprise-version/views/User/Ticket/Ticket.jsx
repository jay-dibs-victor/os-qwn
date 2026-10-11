import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../../../core/store/useUIStore';

const TicketRequest = () => {
  const [formData, setFormData] = useState({
    category: 'General Enquiries',
    subject: '',
    description: '',
    file: null,
  });
  const addToast = useUIStore((state) => state.addToast);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
        addToast('Please fill all required fields.', 'warning');
        return;
    }
    // TODO: implement ticket submission
    addToast('Support ticket created successfully!', 'success');
  };

  return (
    <div className="ticket-page py-5 mt-5">
      <div className="container">
        
        <div className="row mb-4 align-items-end">
          <div className="col-md-8">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Support Tickets</li>
              </ol>
            </nav>
            <h2 className="fw-bold mb-0">Create Support Ticket</h2>
            <p className="text-muted mt-2">Send your feedback, issues and messages. We will get back to you within 48 hours.</p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <Link to="/submitted-tickets" className="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold shadow-sm">
               View Submitted Tickets
            </Link>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-7 mb-4">
            <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '24px' }}>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-bold text-muted small text-uppercase">Select Support Category</label>
                  <select 
                    className="form-select form-select-lg bg-light border-0 px-4"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option>General Enquiries</option>
                    <option>Technical Support</option>
                    <option>Feedback</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-muted small text-uppercase">Subject</label>
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light border-0 px-4"
                    placeholder="Enter Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-muted small text-uppercase">Description</label>
                  <textarea
                    className="form-control bg-light border-0 p-4"
                    rows="5"
                    placeholder="Provide details about your issue..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-muted small text-uppercase">Upload File (Optional)</label>
                  <input
                    type="file"
                    className="form-control bg-light border-0"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 fw-bold rounded-pill text-dark"
                  style={{ background: '#FFB800', border: 'none' }}
                >
                  Submit Ticket
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-5 d-none d-lg-block">
            <div className="card border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '24px', background: 'var(--color-bg)' }}>
                <div className="card-body d-flex flex-column justify-content-center align-items-center text-center p-5">
                    <i className="bi bi-headset display-1" style={{ color: '#FFB800' }}></i>
                    <h3 className="fw-bold mt-4">We are here to help</h3>
                    <p className="text-muted mt-2">
                        Our support team is available 24/7 to assist you with any questions or issues you may have. 
                        Don't hesitate to reach out!
                    </p>
                </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TicketRequest;
