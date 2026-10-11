import React from 'react';

const CourierWizard = ({ onBack }) => (
  <div className="p-4 text-center">
    <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚢</div>
    <h5 className="fw-bold">Shipping Logistics</h5>
    <p className="text-muted small mb-4">International and sea freight shipping. This feature is coming soon in a future update!</p>
    <button className="btn-ride enabled w-100" onClick={onBack}>Go Back</button>
  </div>
);

export default CourierWizard;
