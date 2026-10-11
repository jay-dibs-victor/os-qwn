import React from 'react';
import { Button, Card } from '../../../core/components';

/** CarInspection Retrieval — inspection record retrieval placeholder */
const Retrieval = () => (
  <div className="animate-fade-in">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <span className="text-overline uppercase tracking-widest font-10">Vehicle Safety</span>
        <h2 className="fw-800 m-0">Retrieval Records</h2>
      </div>
      <Button variant="secondary" onClick={() => window.history.back()}>
        <i className="bi bi-arrow-left"></i> Back
      </Button>
    </div>
    <Card className="glass shadow-md border-0 p-5 text-center">
      <i className="bi bi-archive font-48 text-muted d-block mb-3" style={{ opacity: 0.4 }}></i>
      <p className="fw-700 text-dark mb-1">Retrieval Records</p>
      <p className="font-13 text-muted">Historical retrieval and archival records for vehicle inspections.</p>
    </Card>
  </div>
);
export default Retrieval;
