import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUIStore } from '../../../core/store/useUIStore';

const CarRepairRequest = () => {
  const addToast = useUIStore((state) => state.addToast);
  const [formData, setFormData] = useState({
    location: '',
    carBrand: '',
    issue: '',
    image: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.location || !formData.carBrand || !formData.issue) {
      addToast('Please fill all required fields.', 'warning');
      return;
    }
    // TODO: Connect to mechanic request API
    addToast('Mechanic request submitted successfully! Help is on the way.', 'success');
  };

  return (
    <div className="mechanic-request-page py-5 mt-5">
      <div className="container">

        <div className="row mb-4 align-items-end">
          <div className="col-md-8">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Mechanic Request</li>
              </ol>
            </nav>
            <h2 className="fw-bold mb-0">Request Car Repair</h2>
            <p className="text-muted mt-2">Stranded? Request emergency mechanic services to your location instantly.</p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <Link to="/mechanic-history" className="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold shadow-sm">
               View Request History
            </Link>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '24px' }}>
              <form onSubmit={handleSubmit}>
                
                <div className="mb-4">
                  <label className="form-label fw-bold text-muted small text-uppercase">Current Location</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0"><i className="bi bi-geo-alt-fill text-muted"></i></span>
                    <input
                      type="text"
                      className="form-control form-control-lg bg-light border-0 ps-2"
                      placeholder="e.g. Third Mainland Bridge"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-muted small text-uppercase">Car Brand & Model</label>
                  <select 
                    className="form-select form-select-lg bg-light border-0 px-4"
                    value={formData.carBrand}
                    onChange={(e) => setFormData({ ...formData, carBrand: e.target.value })}
                  >
                    <option value="">--Select Car--</option>
                    <option value="toyota">Toyota</option>
                    <option value="honda">Honda</option>
                    <option value="mercedes">Mercedes-Benz</option>
                    <option value="ford">Ford</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-muted small text-uppercase">Issue Noticed</label>
                  <textarea
                    className="form-control bg-light border-0 p-4"
                    rows="4"
                    maxLength="255"
                    placeholder="Describe the issue... (e.g. Engine overhead, flat tire, won't start)"
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  ></textarea>
                  <div className="form-text text-end">{formData.issue.length}/255</div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-muted small text-uppercase">Upload Image (Optional)</label>
                  <input
                    type="file"
                    className="form-control form-control-lg bg-light border-0"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  />
                  <div className="form-text">Show us the damage or dashboard warning light.</div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 fw-bold rounded-pill text-dark mt-2 shadow"
                  style={{ background: '#FFB800', border: 'none' }}
                >
                  <i className="bi bi-tools me-2"></i> Submit Request
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-6 d-none d-lg-block">
            <div className="card border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '24px', background: 'var(--color-bg)', position: 'relative' }}>
               <div className="p-5 d-flex flex-column justify-content-center align-items-center text-center h-100 h-100 z-1 position-relative">
                   <div className="rounded-circle d-flex justify-content-center align-items-center mb-4 shadow" style={{ width: '80px', height: '80px', background: '#FFB800' }}>
                       <i className="bi bi-wrench-adjustable-circle text-dark fs-1"></i>
                   </div>
                   <h3 className="fw-bold">Fast & Reliable Service</h3>
                   <p className="text-muted">
                        Our trusted mechanics are stationed across the city to provide you with emergency repair and towing services. We will get you back on the road in no time.
                   </p>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CarRepairRequest;
