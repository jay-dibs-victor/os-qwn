import React, { useState } from 'react';
import { useBookingsAdmin } from '../../../core/hooks/adminHooks';
import { useUsersAdmin } from '../../../core/hooks/adminHooks';
import { useDriversAdmin } from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';
import apiClient from '../../../core/api/apiClient';

/**
 * ManualBookings — taxi-admin
 * Ops-team manual trip dispatch interface.
 */
const ManualBookings = () => {
  const [form, setForm] = useState({
    user_email: '', pickup_address: '', destination_address: '',
    package_category: 'On-Demand', scheduled_time: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { data: users } = useUsersAdmin();
  const { data: drivers } = useDriversAdmin();
  const addToast = useUIStore((s) => s.addToast);

  const handlechange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleDispatch = async () => {
    if (!form.user_email || !form.pickup_address || !form.destination_address) {
      addToast('Please fill all required fields', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/admin-manual-booking', form);
      addToast('Manual booking dispatched successfully', 'success');
      setForm({ user_email: '', pickup_address: '', destination_address: '', package_category: 'On-Demand', scheduled_time: '' });
    } catch {
      addToast('Failed to create manual booking. Please check details.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="manual-bookings animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Operations Desk</span>
          <h2 className="fw-800 m-0">Manual Dispatch</h2>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <Card className="glass shadow-md border-0 p-4">
            <h5 className="fw-800 mb-4 border-bottom pb-3">Trip Dispatch Form</h5>
            <div className="row g-4">
              <div className="col-md-12">
                <label className="form-label text-overline text-muted font-11 mb-2">Client Email *</label>
                <input type="email" className="form-control bg-light border-0 py-3 font-13"
                  placeholder="rider@example.com"
                  value={form.user_email}
                  onChange={(e) => handlechange('user_email', e.target.value)}
                  list="user-emails-list"
                />
                <datalist id="user-emails-list">
                  {(users || []).map((u) => <option key={u._id || u.id} value={u.email} />)}
                </datalist>
              </div>
              <div className="col-md-6">
                <label className="form-label text-overline text-muted font-11 mb-2">Pickup Location *</label>
                <input type="text" className="form-control bg-light border-0 py-3 font-13"
                  placeholder="123 Victoria Island, Lagos"
                  value={form.pickup_address}
                  onChange={(e) => handlechange('pickup_address', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-overline text-muted font-11 mb-2">Destination *</label>
                <input type="text" className="form-control bg-light border-0 py-3 font-13"
                  placeholder="Murtala Muhammed Airport, Lagos"
                  value={form.destination_address}
                  onChange={(e) => handlechange('destination_address', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-overline text-muted font-11 mb-2">Package / Ride Type</label>
                <select className="form-select font-13 bg-light border-0 py-3"
                  value={form.package_category}
                  onChange={(e) => handlechange('package_category', e.target.value)}>
                  <option value="On-Demand">On-Demand</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Intercity">Intercity</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label text-overline text-muted font-11 mb-2">Scheduled Time (optional)</label>
                <input type="datetime-local" className="form-control bg-light border-0 py-3 font-13"
                  value={form.scheduled_time}
                  onChange={(e) => handlechange('scheduled_time', e.target.value)}
                />
              </div>
            </div>
            <div className="mt-5 pt-3 border-top d-flex gap-2">
              <Button variant="primary" onClick={handleDispatch} disabled={submitting}>
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Dispatching…</>
                  : <><i className="bi bi-send-fill"></i> Dispatch Trip</>
                }
              </Button>
              <Button variant="ghost" onClick={() => setForm({ user_email: '', pickup_address: '', destination_address: '', package_category: 'On-Demand', scheduled_time: '' })}>
                Clear Form
              </Button>
            </div>
          </Card>
        </div>
        <div className="col-lg-4">
          <Card className="bg-dark text-white border-0 shadow-lg p-4">
            <h5 className="fw-800 text-white mb-3">Dispatch Protocol</h5>
            <p className="font-13 mb-3" style={{ opacity: 0.7 }}>Manual bookings bypass the app and are assigned to the nearest available driver. The client will receive a push notification once a driver is assigned.</p>
            <div className="d-flex flex-column gap-2 font-12" style={{ opacity: 0.8 }}>
              <div><i className="bi bi-1-circle me-2 text-warning"></i>Fill client & route details</div>
              <div><i className="bi bi-2-circle me-2 text-warning"></i>Select ride type</div>
              <div><i className="bi bi-3-circle me-2 text-warning"></i>Dispatch — system auto-assigns driver</div>
            </div>
          </Card>
          <Card className="glass shadow-sm border-0 p-3 mt-3">
            <div className="font-12 text-overline text-muted mb-2">Available Drivers</div>
            <div className="fw-800 font-24 text-dark">{(drivers || []).filter((d) => d.is_online || d.available).length}</div>
            <div className="font-11 text-muted">of {(drivers || []).length} total registered drivers</div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default ManualBookings;
