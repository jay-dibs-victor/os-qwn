import React from 'react';
import { motion } from 'framer-motion';
import { useAssignedCars } from '../../../../core/hooks/useBookingHooks';
import { useUIStore } from '../../../../core/store/useUIStore';

const AssignedVehicleHistory = () => {
  const { data: cars, isLoading, isError } = useAssignedCars();
  const { addToast } = useUIStore();

  if (isError) {
    addToast('Failed to load vehicle history', 'danger');
  }

  return (
    <div className="content-page p-t-80">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <h4 className="page-title font-bold text-dark m-b-0">Vehicle Fleet History</h4>
            <ol className="breadcrumb">
              <li><a href="/dashboard">Portal</a></li>
              <li className="active">Assigned Vehicles</li>
            </ol>
          </div>
        </div>

        <div className="row m-t-20">
          <div className="col-lg-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-30"
              style={{
                background: 'var(--color-surface)',
                borderRadius: '24px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <div className="flex-row items-center justify-between m-b-30">
                <div>
                  <h4 className="m-0 font-bold text-dark">Assigned Vehicles</h4>
                  <p className="text-muted font-13 m-t-5">Historical list of vehicles assigned to your account.</p>
                </div>
                <div className="search-box relative hidden-xs">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search vehicle..."
                    style={{ borderRadius: '12px', paddingLeft: '40px', background: 'var(--color-bg)', border: 'none', width: '250px' }}
                  />
                  <i className="md md-search absolute" style={{ left: '15px', top: '10px', fontSize: '18px', color: '#aaa' }}></i>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center p-50">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              ) : cars?.length === 0 ? (
                <div className="text-center p-50">
                  <div className="m-b-20">
                    <i className="md md-directions-car font-48 text-muted opacity-20"></i>
                  </div>
                  <h5 className="text-muted">No vehicles assigned yet</h5>
                  <p className="text-muted font-13">Contact your fleet manager for vehicle assignment.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover m-0">
                    <thead>
                      <tr style={{ background: 'var(--color-bg)' }}>
                        <th className="p-15 border-0 font-12 text-uppercase font-bold text-muted">Vehicle Detail</th>
                        <th className="p-15 border-0 font-12 text-uppercase font-bold text-muted">Identification</th>
                        <th className="p-15 border-0 font-12 text-uppercase font-bold text-muted">Year/Color</th>
                        <th className="p-15 border-0 font-12 text-uppercase font-bold text-muted">Assignment Status</th>
                        <th className="p-15 border-0 font-12 text-uppercase font-bold text-muted text-right">Preview</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cars.map((car, idx) => (
                        <tr key={idx} className="transition-fast hover-bg-light">
                          <td className="p-15">
                            <div className="flex-row items-center">
                              <div className="m-r-15 bg-primary-subtle flex-row items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,184,0,0.1)' }}>
                                <i className="md md-directions-car text-primary font-20" style={{ color: '#FFB800' }}></i>
                              </div>
                              <div>
                                <h6 className="m-0 font-bold text-dark">{car.brand || 'Generic'}</h6>
                                <p className="m-0 text-muted font-12">{car.model_name || 'Vehicle'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-15 vertical-middle">
                            <span className="badge bg-dark bg-opacity-75 text-white" style={{ padding: '6px 12px', borderRadius: '8px', letterSpacing: '1px' }}>
                              {car.license_plate || 'N/A'}
                            </span>
                          </td>
                          <td className="p-15 vertical-middle">
                            <div className="font-13 font-bold text-dark">{car.car_year || '2023'}</div>
                            <div className="font-11 text-muted text-uppercase">{car.color || 'Unknown'}</div>
                          </td>
                          <td className="p-15 vertical-middle">
                            <span className={`status-pill ${car.is_active ? 'active' : 'inactive'}`} style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 12px',
                                borderRadius: '50px',
                                fontSize: '11px',
                                fontWeight: '700',
                                background: car.is_active ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)',
                                color: car.is_active ? '#2e7d32' : '#757575'
                            }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                              {car.is_active ? 'Currently Assigned' : 'Previously Assigned'}
                            </span>
                          </td>
                          <td className="p-15 vertical-middle text-right">
                             <img 
                               src={car.car_image || "/assets/images/placeholder-car.png"} 
                               alt="car" 
                               className="round-4 shadow-sm"
                               style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '8px' }}
                             />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedVehicleHistory;
