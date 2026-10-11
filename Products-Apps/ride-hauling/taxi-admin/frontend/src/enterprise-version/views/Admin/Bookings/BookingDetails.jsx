import React from 'react';
import { Button, Card } from '../../../core/components';

/** BookingDetails — detailed view of a single booking record */
const BookingDetails = () => (
  <div className="animate-fade-in">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <span className="text-overline uppercase tracking-widest font-10">Operations</span>
        <h2 className="fw-800 m-0">Booking Detail</h2>
      </div>
      <Button variant="secondary" onClick={() => window.history.back()}>
        <i className="bi bi-arrow-left"></i> Back
      </Button>
    </div>
    <Card className="glass shadow-md border-0 p-5 text-center">
      <i className="bi bi-calendar2-check font-48 text-muted d-block mb-3" style={{ opacity: 0.4 }}></i>
      <p className="fw-700 text-dark mb-1">Booking Detail View</p>
      <p className="font-13 text-muted">Navigate from the bookings list to view a specific booking entry.</p>
    </Card>
  </div>
);
export default BookingDetails;
