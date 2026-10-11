import React from 'react';

const FlightWizard = ({ onBack }) => (
  <div className="p-4 text-center">
    <div style={{ fontSize: '40px', marginBottom: '16px' }}>✈️</div>
    <h5 className="fw-bold">Flight Scheduler</h5>
    <p className="text-muted small mb-4">Integrate your flight schedule with your luxury transfers.</p>
    <button className="btn-ride enabled" onClick={onBack}>Proceed</button>
  </div>
);

export default FlightWizard;
