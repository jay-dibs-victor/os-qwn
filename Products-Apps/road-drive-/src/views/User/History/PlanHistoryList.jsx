import React from 'react';

const PlanHistoryList = ({ items = [{}, {}] }) => {
  if (!items || items.length === 0) {
    return <div className="text-center py-5 text-muted">No plans found.</div>;
  }

  return (
    <div className="row g-4">
      {items.map((item, i) => (
        <div key={i} className="col-sm-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '20px', transition: 'transform 0.3s' }}>
            <div className="card-body p-0 text-center position-relative overflow-hidden">
              <div className="pricing-header p-4" style={{ background: '#FFB800', color: 'var(--color-text)' }}>
                <h2 className="fw-bold mb-0">₦20,000</h2>
                <span className="small text-uppercase fw-bold opacity-75">Goom Logistics Saver</span>
              </div>
              <div className="p-4">
                <p className="text-muted small mb-4">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </p>
                <button
                  className="btn btn-dark w-100 py-3 rounded-pill fw-bold hover-lift"
                  onClick={() => alert('Plan selected')}
                >
                  Choose Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlanHistoryList;
