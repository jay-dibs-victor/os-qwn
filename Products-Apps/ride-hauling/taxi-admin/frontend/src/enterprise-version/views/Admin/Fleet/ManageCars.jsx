import React, { useState } from 'react';
import { 
  useCarsAdmin, 
  useDeleteCar,
} from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';

import './ManageFleet.css';

/**
 * ManageCars — GoomTaxi
 * High-fidelity refactor for fleet asset management.
 * Features stylized vehicle spec cards and real-time inventory tracking.
 */
const ManageCars = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedCar, setSelectedCar] = useState(null);

  const { data: cars, isLoading } = useCarsAdmin();
  const { mutate: deleteCar } = useDeleteCar();
  const addToast = useUIStore((state) => state.addToast);

  const filteredCars = cars?.filter((car) =>
    `${car.brand} ${car.model} ${car.plate_number} ${car.color}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (id) => {
    if (window.confirm('Permanently decommission this vehicle from the active fleet?')) {
      deleteCar(id, {
        onSuccess: () => addToast('Vehicle removed from fleet registry', 'warning')
      });
    }
  };

  if (viewMode === 'detail' && selectedCar) {
    return (
      <div className="animate-fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="text-overline">Asset Specification</span>
            <h2 className="fw-800 m-0">{selectedCar.brand} {selectedCar.model}</h2>
          </div>
          <Button variant="secondary" onClick={() => setViewMode('list')}>
            <i className="bi bi-arrow-left"></i> Back to Fleet
          </Button>
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <Card className="p-0 overflow-hidden shadow-lg border-0 bg-dark text-white mb-4">
               <div className="car-hero-img flex-center py-5" style={{ background: 'linear-gradient(45deg, #1a1a1a, #333)' }}>
                  <i className="bi bi-car-front" style={{ fontSize: '100px', color: 'var(--color-primary)', opacity: 0.8 }}></i>
               </div>
               <div className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                     <h4 className="fw-800 m-0 text-white">{selectedCar.brand}</h4>
                     <span className="badge badge-warning text-dark px-3">{selectedCar.year || '2023'}</span>
                  </div>
                  <div className="row g-2">
                     <div className="col-6">
                        <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                           <span className="text-overline font-10" style={{ color: 'rgba(255,255,255,0.4)' }}>PLATE</span>
                           <div className="fw-800 font-14">{selectedCar.plate_number}</div>
                        </div>
                     </div>
                     <div className="col-6">
                        <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                           <span className="text-overline font-10" style={{ color: 'rgba(255,255,255,0.4)' }}>COLOR</span>
                           <div className="fw-800 font-14">{selectedCar.color}</div>
                        </div>
                     </div>
                  </div>
               </div>
            </Card>

            <Card className="glass">
               <h5 className="fw-800 mb-3">Health Status</h5>
               <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light">
                  <div className="icon-box-sm bg-success text-white rounded-circle flex-center" style={{ width: 32, height: 32 }}>
                     <i className="bi bi-shield-check"></i>
                  </div>
                  <div>
                    <div className="font-13 fw-700">Excellent</div>
                    <div className="font-11 text-muted">Last inspection: 2 days ago</div>
                  </div>
               </div>
            </Card>
          </div>

          <div className="col-lg-7">
             <Card className="h-100">
                <h5 className="fw-800 mb-4 border-bottom pb-3">Ownership & Logistics</h5>
                <div className="row g-4">
                   <div className="col-md-6">
                      <span className="text-overline">Registry Status</span>
                      <span className="badge badge-success-soft px-3">REGISTERED</span>
                   </div>
                   <div className="col-md-6">
                      <span className="text-overline">Current Driver</span>
                      <p className="fw-700 text-dark">Active User</p>
                   </div>
                   <div className="col-md-12">
                      <span className="text-overline">Operational Regions</span>
                      <p className="fw-700 text-dark">Lagos Island, Lekki, Victoria Island</p>
                   </div>
                </div>

                <div className="mt-5 pt-3 border-top d-flex gap-2">
                   <Button variant="primary">Schedule Maintenance</Button>
                   <Button variant="ghost" onClick={() => setViewMode('list')}>Close Details</Button>
                </div>
             </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fleet-view animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline">Fleet Management</span>
          <h2 className="fw-800 m-0">Asset Registry</h2>
        </div>
        <Button variant="primary" onClick={() => addToast('Registering new asset to system...', 'info')}>
          <i className="bi bi-plus-lg"></i> Register New Vehicle
        </Button>
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
                placeholder="Search by brand, plate or color..." 
                className="bg-transparent border-0 w-100 outline-none font-13"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="font-12 fw-700 text-muted">
            TOTAL ASSETS: <span className="text-dark bg-warning px-2 py-1 rounded-2 ms-1">{filteredCars.length}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead>
              <tr>
                <th>VEHICLE MODEL</th>
                <th>PLATE NUMBER</th>
                <th>YEAR / COLOR</th>
                <th className="text-center">BOOKING STATUS</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner"></div></td></tr>
              ) : filteredCars.length > 0 ? (
                filteredCars.map((car) => (
                  <tr key={car._id} className="cursor-pointer" onClick={() => { setSelectedCar(car); setViewMode('detail'); }}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="icon-box-sm bg-light text-dark rounded-3 flex-center" style={{ width: 40, height: 40 }}>
                          <i className="bi bi-car-front-fill opacity-50"></i>
                        </div>
                        <div>
                          <div className="fw-700 text-dark">{car.brand} {car.model}</div>
                          <div className="font-11 text-muted text-uppercase">VIN: {String(car._id).substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="fw-800 text-dark">{car.plate_number}</td>
                    <td>
                      <div className="font-13 fw-600 text-dark">{car.year || '2023'}</div>
                      <div className="font-11 text-muted">{car.color}</div>
                    </td>
                    <td className="text-center">
                      <span className="badge badge-success">AVAILABLE</span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2 px-3">
                        <button 
                          className="btn-action bg-light" 
                          onClick={(e) => { e.stopPropagation(); setSelectedCar(car); setViewMode('detail'); }}
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}
                        >
                          <i className="bi bi-info-circle text-primary"></i>
                        </button>
                        <button 
                          className="btn-action bg-light" 
                          onClick={(e) => { e.stopPropagation(); handleDelete(car._id); }}
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}
                        >
                          <i className="bi bi-trash3-fill text-danger"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic">No registered assets found in fleet registry</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ManageCars;
