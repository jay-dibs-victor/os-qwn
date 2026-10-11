import React, { useState } from 'react';
import { 
  useAdminsAdmin, 
  useDeleteAdmin, 
  useUpdateAdmin,
  useAddAdmin 
} from '../../../../core/hooks/adminHooks';
import { Button, Card } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';

/**
 * Admins Management — taxi-admin
 * High-fidelity refactor with premium glassmorphism and centralized hooks.
 */
const ManageAdmins = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'detail' or 'add'

  const { data: admins, isLoading } = useAdminsAdmin();
  const { mutate: deleteAdmin } = useDeleteAdmin();
  const { mutate: updateAdmin } = useUpdateAdmin();
  const { mutate: addAdmin } = useAddAdmin();
  const addToast = useUIStore((state) => state.addToast);

  const filteredAdmins = admins?.filter((admin) =>
    `${admin.firstname || admin.first_name || admin.firstName} ${admin.lastname || admin.last_name || admin.lastName} ${admin.email} ${admin.phone_number || admin.phone}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) || [];

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setViewMode('detail');
  };

  const handleDeleteAdmin = (id) => {
    if (window.confirm('Are you sure you want to permanently remove this admin account?')) {
      deleteAdmin(id, {
        onSuccess: () => addToast('Admin account successfully removed', 'warning')
      });
    }
  };

  if ((viewMode === 'detail' || viewMode === 'add')) {
    const isEdit = viewMode === 'detail';
    const [formData, setFormData] = React.useState(
      isEdit ? { 
        firstname: selectedAdmin.firstname || selectedAdmin.first_name || selectedAdmin.firstName || '', 
        lastname: selectedAdmin.lastname || selectedAdmin.last_name || selectedAdmin.lastName || '', 
        email: selectedAdmin.email || '', 
        phone_number: selectedAdmin.phone_number || selectedAdmin.phone || '', 
        role: selectedAdmin.role || 'Staff' 
      } : { firstname: '', lastname: '', email: '', phone_number: '', role: 'Admin' }
    );

    const handleSave = () => {
      if (isEdit) {
        updateAdmin({ id: selectedAdmin.id || selectedAdmin._id, adminData: formData }, {
          onSuccess: () => {
            addToast('Admin profile updated successfully', 'success');
            setViewMode('list');
          }
        });
      } else {
        addAdmin(formData, {
          onSuccess: () => {
            addToast('New admin account created', 'success');
            setViewMode('list');
          }
        });
      }
    };

    return (
      <div className="animate-fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="text-overline uppercase tracking-widest font-10">Access Control</span>
            <h2 className="fw-800 m-0">{isEdit ? 'Update Administrator Profile' : 'Register New Manager'}</h2>
          </div>
          <Button variant="secondary" onClick={() => setViewMode('list')}>
            <i className="bi bi-arrow-left"></i> Back to Administrators Directory
          </Button>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <Card className="glass shadow-md border-0 h-100 p-4">
              <h5 className="fw-800 mb-4 border-bottom pb-3">Administrator Information</h5>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label text-overline text-muted font-11 mb-2">First Name</label>
                  <input 
                    className="form-control bg-light border-0 py-3 font-13" 
                    placeholder="Jane"
                    value={formData.firstname} 
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })} 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-overline text-muted font-11 mb-2">Last Name</label>
                  <input 
                    className="form-control bg-light border-0 py-3 font-13" 
                    placeholder="Doe"
                    value={formData.lastname} 
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })} 
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label text-overline text-muted font-11 mb-2">Email Address</label>
                  <input 
                    className="form-control bg-light border-0 py-3 font-13" 
                    placeholder="jane.doe@example.com"
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-overline text-muted font-11 mb-2">Phone Number</label>
                  <input 
                    className="form-control bg-light border-0 py-3 font-13" 
                    placeholder="+234..."
                    value={formData.phone_number} 
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-overline text-muted font-11 mb-2">Assigned Role</label>
                  <select 
                    className="form-select font-13 bg-light border-0 py-3"
                    value={formData.role} 
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="Admin">Administrator</option>
                    <option value="Super Admin">Super Administrator</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Support Staff">Support Staff</option>
                    <option value="Partner Manager">Partner Manager</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 pt-3 border-top d-flex gap-2">
                <Button variant="primary" onClick={handleSave}>
                  <i className="bi bi-check2-circle"></i> {isEdit ? 'Commit Changes' : 'Register Administrator'}
                </Button>
                <Button variant="ghost" onClick={() => setViewMode('list')}>Cancel Editing</Button>
              </div>
            </Card>
          </div>
          
          <div className="col-lg-4">
             <Card className="bg-dark text-white border-0 shadow-lg h-100 p-4">
                <h5 className="fw-800 text-white mb-3">Security Clearances</h5>
                <p className="font-13 text-muted-light mb-4" style={{ opacity: 0.7 }}>
                  Administrators are granted extensive permissions. All destructive modifications and role assignments are tracked continuously via secure audit logs. Please treat these credentials carefully.
                </p>
                <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                     <i className="bi bi-shield-lock-fill text-danger font-14"></i>
                     <span className="font-12 fw-700">Root Integrity Active</span>
                  </div>
                  <p className="m-0 font-11 text-muted-light line-height-md">Role modifications will be broadcasted to super administrators instantly.</p>
                </div>
             </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admins-view animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Access Control</span>
          <h2 className="fw-800 m-0">Administrator Directory</h2>
        </div>
        <Button variant="primary" onClick={() => setViewMode('add')}>
          <i className="bi bi-person-fill-lock"></i> Register Manager
        </Button>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
          <div className="search-wrap" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="search-box glass" style={{
              width: '100%',
              padding: '0.65rem 1.4rem',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              border: '1px solid rgba(0,0,0,0.08)'
            }}>
              <i className="bi bi-search text-muted"></i>
              <input 
                type="text" 
                placeholder="Search staff directory..." 
                className="bg-transparent border-0 w-100 outline-none font-13"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="font-12 fw-700 text-muted">
            TOTAL MANAGERS: <span className="text-dark bg-warning px-2 py-1 rounded-2 ms-2">{filteredAdmins.length}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">PERSONNEL</th>
                <th>CONTACT DETAILS</th>
                <th>CLEARANCE LEVEL</th>
                <th className="text-center">STATUS</th>
                <th className="text-end pe-4">MANAGEMENT</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
              ) : filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => {
                  const firstName = admin.firstname || admin.first_name || admin.firstName || '';
                  const lastName = admin.lastname || admin.last_name || admin.lastName || '';
                  
                  return (
                    <tr key={admin.id || admin._id} className="border-bottom-0">
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3" onClick={() => handleEditAdmin(admin)} style={{ cursor: 'pointer' }}>
                          <div className="user-avatar-placeholder" style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'rgba(220, 38, 38, 0.1)',
                            color: 'var(--color-danger)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '14px'
                          }}>
                            {(firstName?.[0] || 'A').toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-700 text-dark">{firstName} {lastName}</div>
                            <div className="font-11 text-muted uppercase tracking-widest">ID: {String(admin.id || admin._id).substring(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td onClick={() => handleEditAdmin(admin)} style={{ cursor: 'pointer' }}>
                        <div className="font-13 fw-600 text-dark">{admin.email}</div>
                        <div className="font-11 text-muted-dark">{admin.phone_number || admin.phone || 'No direct dial'}</div>
                      </td>
                      <td>
                        <span className="badge rounded-pill bg-dark text-white font-10 uppercase tracking-widest px-3 border border-dark">
                          {admin.role || 'Staff'}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`badge px-3 rounded-pill font-10 ${admin.status === 'active' || !admin.status ? 'bg-success' : 'bg-danger text-white'}`}>
                            {(admin.status || 'Active').toUpperCase()}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button 
                            className="btn-action bg-light" 
                            onClick={() => handleEditAdmin(admin)}
                            title="Edit Clearances"
                            style={{ width: 34, height: 34, borderRadius: 10, border: 'none' }}
                          >
                            <i className="bi bi-shield-check text-dark"></i>
                          </button>
                          <button 
                            className="btn-action bg-light" 
                            onClick={() => handleDeleteAdmin(admin.id || admin._id)}
                            title="Revoke Access"
                            style={{ width: 34, height: 34, borderRadius: 10, border: 'none' }}
                          >
                            <i className="bi bi-trash3-fill text-danger"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                )})
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic p-5">No managerial records found within criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ManageAdmins;

