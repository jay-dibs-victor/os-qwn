import React, { useState } from 'react';
import { 
  useDriversAdmin, 
  useDeleteDriver, 
  useUpdateDriver,
  useAddDriver 
} from '../../../../core/hooks/adminHooks';
import { Button, Card } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';

/**
 * Drivers Management — taxi-admin
 * High-fidelity refactor with premium glassmorphism and centralized hooks.
 */
const ManageDrivers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'detail' or 'add'

  const { data: drivers, isLoading } = useDriversAdmin();
  const { mutate: deleteDriver } = useDeleteDriver();
  const { mutate: updateDriver } = useUpdateDriver();
  const { mutate: addDriver } = useAddDriver();
  const addToast = useUIStore((state) => state.addToast);

  const filteredDrivers = drivers?.filter((driver) =>
    `${driver.firstname} ${driver.lastname} ${driver.email} ${driver.phone_number}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) || [];

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setViewMode('detail');
  };

  const handleDeleteDriver = (id) => {
    if (window.confirm('Are you sure you want to permanently remove this driver account?')) {
      deleteDriver(id, {
        onSuccess: () => addToast('Driver account successfully removed', 'warning')
      });
    }
  };

  if ((viewMode === 'detail' || viewMode === 'add')) {
    const isEdit = viewMode === 'detail';
    const [formData, setFormData] = React.useState(
      isEdit ? { ...selectedDriver } : { firstname: '', lastname: '', email: '', phone_number: '', car_assigned: '' }
    );

    const handleSave = () => {
      if (isEdit) {
        updateDriver({ id: selectedDriver.id || selectedDriver._id, driverData: formData }, {
          onSuccess: () => {
            addToast('Driver profile updated successfully', 'success');
            setViewMode('list');
          }
        });
      } else {
        addDriver(formData, {
          onSuccess: () => {
            addToast('New driver account created', 'success');
            setViewMode('list');
          }
        });
      }
    };

    return (
      <div className="animate-fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="text-overline">Driver Management</span>
            <h2 className="fw-800 m-0">{isEdit ? 'Update Driver Profile' : 'Register New Driver'}</h2>
          </div>
          <Button variant="secondary" onClick={() => setViewMode('list')}>
            <i className="bi bi-arrow-left"></i> Back to Fleet Directory
          </Button>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <Card className="glass shadow-md">
              <h5 className="fw-800 mb-4 border-bottom pb-3">Driver Information</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="text-overline">First Name</label>
                  <input 
                    className="form-control" 
                    placeholder="Jane"
                    value={formData.firstname} 
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })} 
                  />
                </div>
                <div className="col-md-6">
                  <label className="text-overline">Last Name</label>
                  <input 
                    className="form-control" 
                    placeholder="Doe"
                    value={formData.lastname} 
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })} 
                  />
                </div>
                <div className="col-md-12">
                  <label className="text-overline">Email Address</label>
                  <input 
                    className="form-control" 
                    placeholder="jane.doe@example.com"
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  />
                </div>
                <div className="col-md-6">
                  <label className="text-overline">Phone Number</label>
                  <input 
                    className="form-control" 
                    placeholder="+234..."
                    value={formData.phone_number} 
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} 
                  />
                </div>
                <div className="col-md-6">
                  <label className="text-overline">Assigned Vehicle</label>
                  <input 
                    className="form-control" 
                    placeholder="Plate Number or Model (Optional)"
                    value={formData.car_assigned || ''} 
                    onChange={(e) => setFormData({ ...formData, car_assigned: e.target.value })} 
                  />
                </div>
              </div>

              <div className="mt-5 pt-3 border-top d-flex gap-2">
                <Button variant="primary" onClick={handleSave}>
                  <i className="bi bi-check2-circle"></i> {isEdit ? 'Save Changes' : 'Register Driver'}
                </Button>
                <Button variant="ghost" onClick={() => setViewMode('list')}>Cancel</Button>
              </div>
            </Card>
          </div>
          
          <div className="col-lg-4">
             <Card className="bg-dark text-white border-0 shadow-lg h-100">
                <h5 className="fw-800 text-white mb-3">Verification Target</h5>
                <p className="font-13 text-muted-light mb-4" style={{ opacity: 0.7 }}>
                  All drivers must undergo a mandatory vetting process before they can access trip requests on the GoomTaxi platform. Document uploads are enforced via the driver portal.
                </p>
                <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                     <i className="bi bi-person-bounding-box text-warning"></i>
                     <span className="font-12 fw-700">Facial Recognition</span>
                  </div>
                  <p className="m-0 font-11 text-muted-light">Biometric validation is active for all drivers during shift startup.</p>
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
          <span className="text-overline">Global Fleet</span>
          <h2 className="fw-800 m-0">Driver Directory</h2>
        </div>
        <Button variant="primary" onClick={() => setViewMode('add')}>
          <i className="bi bi-person-plus-fill"></i> Register Driver
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
                placeholder="Search by name, email or phone..." 
                className="bg-transparent border-0 w-100 outline-none font-13"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="font-12 fw-700 text-muted">
            TOTAL: <span className="text-dark bg-warning px-2 py-1 rounded-2 ms-1">{filteredDrivers.length}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead>
              <tr>
                <th>IDENTIFIER</th>
                <th>CONTACT INFO</th>
                <th>ASSIGNED VEHICLE</th>
                <th className="text-center">STATUS</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner"></div></td></tr>
              ) : filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id || driver._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="user-avatar-placeholder" style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: 'var(--color-info)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '14px'
                        }}>
                          {(driver.firstname?.[0] || 'D').toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-700 text-dark">{driver.firstname} {driver.lastname}</div>
                          <div className="font-11 text-muted">ID: {String(driver.id || driver._id).substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-13 fw-600 text-dark">{driver.email}</div>
                      <div className="font-11 text-muted">{driver.phone_number || 'No Phone Linked'}</div>
                    </td>
                    <td>
                      <span className="font-12 bg-light px-2 py-1 rounded-2 border">
                        {driver.car_assigned || 'Unassigned'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge px-3 ${driver.is_approved ? 'badge-success' : 'badge-warning'}`}>
                          {driver.is_approved ? 'Vetted' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2 px-3">
                        <button 
                          className="btn-action bg-light" 
                          onClick={() => handleEditDriver(driver)}
                          title="Edit Profile"
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <i className="bi bi-pencil-square text-primary"></i>
                        </button>
                        <button 
                          className="btn-action bg-light" 
                          onClick={() => handleDeleteDriver(driver.id || driver._id)}
                          title="Delete Account"
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <i className="bi bi-trash3-fill text-danger"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic">No matching driver records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ManageDrivers;

