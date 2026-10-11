import React, { useState } from 'react';
import { 
  useCarsAdmin, 
  useDeleteCar,
} from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';

/**
 * CarMgt — taxi-admin
 * High-fidelity refactor for fleet asset management.
 */
const CarMgt = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedCar, setSelectedCar] = useState(null);

  const { data: cars, isLoading } = useCarsAdmin();
  const { mutate: deleteCar } = useDeleteCar();
  const addToast = useUIStore((state) => state.addToast);

  const filteredCars = cars?.filter((car) =>
    `${car.brand} ${car.model} ${car.plate_number} ${car.color} ${car.car_year}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently remove this vehicle from the fleet?')) {
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
            <span className="text-overline">Asset Detail</span>
            <h2 className="fw-800 m-0">{selectedCar.brand} {selectedCar.model}</h2>
          </div>
          <Button variant="secondary" onClick={() => setViewMode('list')}>
            <i className="bi bi-arrow-left"></i> Back to Fleet
          </Button>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <Card className="glass mb-4 text-center">
              <div className="avatar-lg mx-auto mb-3" style={{
                width: 120, height: 120, borderRadius: '24px', 
                background: 'var(--color-primary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '48px', fontWeight: 800, color: '#1a1a1a'
              }}>
                <i className="bi bi-car-front-fill text-dark"></i>
              </div>
              <h4 className="fw-800 mb-1">{selectedCar.brand} {selectedCar.model}</h4>
              <p className="text-muted font-12 mb-3">ID: {selectedCar._id || selectedCar.id}</p>
              <span className="badge badge-success">
                {selectedCar.status?.toUpperCase() || 'ACTIVE FLEET'}
              </span>
            </Card>
          </div>

          <div className="col-lg-8">
             <Card className="h-100">
                <h5 className="fw-800 mb-4 border-bottom pb-3">Vehicle Specifications</h5>
                <div className="row g-4">
                   <div className="col-md-6">
                      <span className="text-overline">License Plate</span>
                      <p className="fw-700 text-dark mb-0">{selectedCar.plate_number || 'N/A'}</p>
                   </div>
                   <div className="col-md-6">
                      <span className="text-overline">Manufacture Year</span>
                      <p className="fw-700 text-dark mb-0">{selectedCar.car_year || 'Unknown'}</p>
                   </div>
                   <div className="col-md-6">
                      <span className="text-overline">Color</span>
                      <p className="fw-700 text-dark mb-0">{selectedCar.color || 'Not specified'}</p>
                   </div>
                   <div className="col-md-6">
                      <span className="text-overline">Health Check</span>
                      <p className={`fw-700 mb-0 ${selectedCar.health_status === 'passed' ? 'text-success' : 'text-warning'}`}>
                        {selectedCar.health_status === 'passed' ? 'PASSED LAST INSPECTION' : 'INSPECTION PENDING'}
                      </p>
                   </div>
                </div>
             </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="carmgt-view animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline">Fleet Logistics</span>
          <h2 className="fw-800 m-0">Cars Management</h2>
        </div>
        <div className="d-flex gap-2">
           <Button variant="primary">
             <i className="bi bi-plus-lg"></i> Add New Vehicle
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
                placeholder="Search by brand, model or plate..." 
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
                <th>VEHICLE DETAILS</th>
                <th>PLATE NUMBER</th>
                <th>SPECS</th>
                <th className="text-center">STATUS</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner"></div></td></tr>
              ) : filteredCars.length > 0 ? (
                filteredCars.map((car) => (
                  <tr key={car._id || car.id} className="cursor-pointer">
                    <td onClick={() => { setSelectedCar(car); setViewMode('detail'); }}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-sm flex-center" style={{
                          width: '40px', height: '40px', borderRadius: '12px',
                          background: 'rgba(255,184,0,0.1)', color: 'var(--color-primary)',
                          fontWeight: 800
                        }}>
                          <i className="bi bi-car-front-fill"></i>
                        </div>
                        <div>
                          <div className="fw-700 text-dark">{car.brand} {car.model}</div>
                          <div className="font-11 text-muted">ID: {String(car._id || car.id).substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-13 fw-800 text-dark" style={{ letterSpacing: '1px' }}>{car.plate_number || 'N/A'}</div>
                    </td>
                    <td>
                      <div className="font-13">{car.color || 'No Color'} • {car.car_year || 'Year?'}</div>
                    </td>
                    <td className="text-center">
                      <span className="badge badge-success px-3">Active</span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2 px-3">
                        <button 
                          className="btn-action bg-light" 
                          onClick={() => { setSelectedCar(car); setViewMode('detail'); }}
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}
                        >
                          <i className="bi bi-eye-fill text-primary"></i>
                        </button>
                        <button 
                          className="btn-action bg-light" 
                          onClick={() => handleDelete(car._id || car.id)}
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}
                        >
                          <i className="bi bi-trash3-fill text-danger"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic">No vehicles found in fleet registry</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CarMgt;
