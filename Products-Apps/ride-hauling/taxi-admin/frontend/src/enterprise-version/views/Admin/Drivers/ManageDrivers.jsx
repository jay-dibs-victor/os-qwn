import React, { useState } from 'react';
import { 
  useDriversAdmin, 
  useApproveDriver,
} from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';
import moment from 'moment';

import './ManageDrivers.css';

/**
 * ManageDrivers — GoomTaxi
 * High-fidelity refactor for driver management and fleet onboarding.
 * Features premium glassmorphism cards and professional credential auditing.
 */
const ManageDrivers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'onboarding'
  const [selectedDriver, setSelectedDriver] = useState(null);

  const { data: drivers, isLoading } = useDriversAdmin();
  const { mutate: approveDriver } = useApproveDriver();
  const addToast = useUIStore((state) => state.addToast);

  const filteredDrivers = drivers?.filter((driver) =>
    `${driver.firstname} ${driver.lastname} ${driver.email} ${driver.phone_number} ${driver.license_number}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) || [];

  const handleApprove = (id) => {
    if (window.confirm('Approve this driver for active platform duty?')) {
      approveDriver(id, {
        onSuccess: () => addToast('Driver approved for operations', 'success')
      });
    }
  };

  if (viewMode === 'detail' && selectedDriver) {
    return (
      <div className="animate-fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="text-overline">Driver Portfolio</span>
            <h2 className="fw-800 m-0">{selectedDriver.firstname} {selectedDriver.lastname}</h2>
          </div>
          <Button variant="secondary" onClick={() => setViewMode('list')}>
            <i className="bi bi-arrow-left"></i> Back to Fleet
          </Button>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <Card className="glass mb-4 text-center">
              <div className="avatar-lg mx-auto mb-3" style={{
                width: 100, height: 100, borderRadius: '24px', 
                background: 'var(--color-primary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', fontWeight: 800, color: '#1a1a1a'
              }}>
                {(selectedDriver.firstname?.[0] || 'D').toUpperCase()}
              </div>
              <h4 className="fw-800 mb-1">{selectedDriver.firstname} {selectedDriver.lastname}</h4>
              <p className="text-muted font-12 mb-3">ID: {selectedDriver._id}</p>
              <span className={`badge ${selectedDriver.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                {selectedDriver.status?.toUpperCase() || 'PENDING VERIFICATION'}
              </span>
            </Card>

            <Card className="bg-dark text-white">
               <h5 className="fw-800 text-white mb-3">Vehicle Link</h5>
               {selectedDriver.assigned_car ? (
                 <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-car-front-fill text-primary" style={{ fontSize: 24 }}></i>
                    <div>
                      <p className="m-0 fw-700 font-13">{selectedDriver.assigned_car.brand} {selectedDriver.assigned_car.model}</p>
                      <p className="m-0 text-muted-light font-11">{selectedDriver.assigned_car.plate_number}</p>
                    </div>
                 </div>
               ) : (
                 <div className="text-center p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-muted-light font-12 mb-0">No vehicle currently assigned</p>
                 </div>
               )}
            </Card>
          </div>

          <div className="col-lg-8">
             <Card className="h-100">
                <h5 className="fw-800 mb-4 border-bottom pb-3">Professional Credentials</h5>
                <div className="row g-4">
                   <div className="col-md-6">
                      <span className="text-overline">License Number</span>
                      <p className="fw-700 text-dark">{selectedDriver.license_number || 'DOC-PENDING'}</p>
                   </div>
                   <div className="col-md-6">
                      <span className="text-overline">Emergency Contact</span>
                      <p className="fw-700 text-dark">{selectedDriver.emergency_contact || 'None Provided'}</p>
                   </div>
                   <div className="col-md-12">
                      <span className="text-overline">Residential Address</span>
                      <p className="fw-700 text-dark">{selectedDriver.address || 'Not specified'}</p>
                   </div>
                </div>

                <div className="mt-5 pt-3 border-top d-flex gap-2">
                   {selectedDriver.status !== 'active' && (
                     <Button variant="primary" onClick={() => handleApprove(selectedDriver._id)}>
                        Approve Credentials
                     </Button>
                   )}
                   <Button variant="secondary" onClick={() => setViewMode('list')}>Cancel Review</Button>
                </div>
             </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="drivers-view animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline">Fleet Operations</span>
          <h2 className="fw-800 m-0">Driver Management</h2>
        </div>
        <div className="d-flex gap-2">
           <Button variant="secondary">
             <i className="bi bi-file-earmark-spreadsheet"></i> Export List
           </Button>
           <Button variant="primary">
             <i className="bi bi-plus-lg"></i> Register Partner
           </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-md">
        <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
          <div className="search-wrap" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="search-box glass" style={{
              width: '100%',
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <i className="bi bi-search text-muted"></i>
              <input 
                type="text" 
                placeholder="Search by name, license or phone..." 
                className="bg-transparent border-0 w-100 outline-none font-13"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="font-12 fw-700 text-muted">
            TOTAL DRIVERS: <span className="text-dark bg-warning px-2 py-1 rounded-2 ms-1">{filteredDrivers.length}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead>
              <tr>
                <th>DRIVER IDENTITY</th>
                <th>CREDENTIALS</th>
                <th>ASSIGNED CAR</th>
                <th className="text-center">STATUS</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner"></div></td></tr>
              ) : filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver) => (
                  <tr key={driver._id} className="cursor-pointer">
                    <td onClick={() => { setSelectedDriver(driver); setViewMode('detail'); }}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-sm flex-center" style={{
                          width: '40px', height: '40px', borderRadius: '12px',
                          background: 'rgba(255,184,0,0.1)', color: 'var(--color-primary)',
                          fontWeight: 800
                        }}>
                          {(driver.firstname?.[0] || 'D').toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-700 text-dark">{driver.firstname} {driver.lastname}</div>
                          <div className="font-11 text-muted text-uppercase">{driver.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-13 fw-600 text-dark">{driver.license_number || 'N/A'}</div>
                      <div className="font-11 text-muted">{driver.phone_number}</div>
                    </td>
                    <td>
                       {driver.assigned_car ? (
                         <span className="badge badge-info" style={{ color: '#444' }}>
                           {driver.assigned_car.brand} - {driver.assigned_car.plate_number}
                         </span>
                       ) : (
                         <span className="text-muted font-11 italic">No vehicle</span>
                       )}
                    </td>
                    <td className="text-center">
                      <span className={`badge ${driver.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {driver.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2 px-3">
                        <button 
                          className="btn-action bg-light" 
                          onClick={() => { setSelectedDriver(driver); setViewMode('detail'); }}
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}
                        >
                          <i className="bi bi-eye-fill text-primary"></i>
                        </button>
                        <button 
                          className="btn-action bg-light" 
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}
                        >
                          <i className="bi bi-pencil-square text-dark"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic">No driver records found in fleet registry</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ManageDrivers;
