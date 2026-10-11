import React from 'react';
import { Button, Card } from '../../../core/components';

/** Partner Earnings — Finance */
const Earnings = () => {
  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Finance</span>
          <h2 className="fw-800 m-0">Partner Earnings</h2>
        </div>
        <Button variant="secondary" onClick={() => window.history.back()}>
          <i className="bi bi-arrow-left"></i> Back
        </Button>
      </div>
      <Card className="glass shadow-md border-0 p-5 text-center">
        <i className="bi bi-file-earmark-text font-48 text-muted d-block mb-3" style={{ opacity: 0.4 }}></i>
        <p className="fw-700 text-dark mb-1">Partner Earnings</p>
        <p className="font-13 text-muted">Navigate from the list view to access this record.</p>
      </Card>
    </div>
  );
};
export default Earnings;
