import React, { useState } from 'react';
import { 
  useAdminsAdmin, 
  useDeleteAdmin,
  usePrivilegesAdmin,
  useAssignRole
} from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';

import './ManageAdmins.css';

/**
 * ManageAdmins — GoomTaxi
 * High-fidelity refactor for administrative user management.
 * Features premium security-themed UI and granular RBAC controls.
 */
const ManageAdmins = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  
  const { data: admins, isLoading } = useAdminsAdmin();
  const { data: roles } = usePrivilegesAdmin();
  const { mutate: deleteAdmin } = useDeleteAdmin();
  const { mutate: assignRole } = useAssignRole();
  const addToast = useUIStore((state) => state.addToast);

  const filteredAdmins = admins?.filter((admin) =>
    `${admin.firstname} ${admin.lastname} ${admin.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (id) => {
    if (window.confirm('Revoke administrative privileges for this user?')) {
      deleteAdmin(id, {
        onSuccess: () => addToast('Admin access revoked', 'warning')
      });
    }
  };

  const handleAssignRole = (roleName) => {
    if (!selectedAdmin) return;
    
    assignRole({ user_id: selectedAdmin.id || selectedAdmin._id, role: roleName }, {
      onSuccess: () => {
        addToast(`Role "${roleName}" assigned to ${selectedAdmin.firstname}`, 'success');
        setIsRoleModalOpen(false);
      }
    });
  };

  return (
    <div className="admins-view animate-fade-in relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline">System Security</span>
          <h2 className="fw-800 m-0">Administrator Directory</h2>
        </div>
        <Button variant="primary" onClick={() => addToast('Manual admin creation restricted. Use Role Settings.', 'info')}>
          <i className="bi bi-shield-plus"></i> New Administrator
        </Button>
      </div>

      <Card className="p-0 overflow-hidden shadow-md border-0">
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
                placeholder="Search staff members..." 
                className="bg-transparent border-0 w-100 outline-none font-13"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="font-12 fw-700 text-muted">
            AUTHORIZED STAFF: <span className="text-dark bg-warning px-2 py-1 rounded-2 ms-1">{filteredAdmins.length}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead>
              <tr>
                <th>STAFF IDENTITY</th>
                <th>CONTACT DETAILS</th>
                <th>ACCESS LEVEL</th>
                <th className="text-center">SECURE LOGS</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner"></div></td></tr>
              ) : filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id || admin._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-sm flex-center" style={{
                          width: '40px', height: '40px', borderRadius: '12px',
                          background: 'rgba(26,26,26,0.05)', color: 'var(--color-dark)',
                          fontWeight: 800, border: '1px solid rgba(0,0,0,0.1)'
                        }}>
                          {(admin.firstname?.[0] || 'A').toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-700 text-dark">{admin.firstname} {admin.lastname}</div>
                          <div className="font-11 text-muted text-uppercase">Role: {admin.role || 'Admin'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-13 fw-600 text-dark">{admin.email}</div>
                      <div className="font-11 text-muted">{admin.phone_number || 'No Phone'}</div>
                    </td>
                    <td>
                       <span className={`badge ${admin.role === 'superadmin' ? 'badge-danger' : 'badge-warning'}`} style={{ letterSpacing: '0.5px' }}>
                         {admin.role?.toUpperCase() || 'STANDARD ADMIN'}
                       </span>
                    </td>
                    <td className="text-center font-12 text-muted fw-600 italic">
                      View Audit Log
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2 px-3">
                        <button 
                          className="btn-action bg-light" 
                          onClick={() => { setSelectedAdmin(admin); setIsRoleModalOpen(true); }}
                          title="Manage Privileges"
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}
                        >
                          <i className="bi bi-lock-fill text-dark"></i>
                        </button>
                        <button 
                          className="btn-action bg-light" 
                          onClick={() => handleDelete(admin.id || admin._id)}
                          title="Revoke Access"
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}
                        >
                          <i className="bi bi-shield-x text-danger"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic">No administrative records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Role Assignment Modal Overlay */}
      {isRoleModalOpen && selectedAdmin && (
        <div className="modal-overlay flex-center" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 1000
        }}>
            <Card className="glass shadow-2xl animate-fade-in" style={{ maxWidth: '400px', width: '90%' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-800 m-0">Privilege Assignment</h5>
                    <button className="btn-close" onClick={() => setIsRoleModalOpen(false)}></button>
                </div>
                <div className="mb-4">
                    <span className="text-overline">Selecting authority for:</span>
                    <div className="fw-700 text-dark font-15">{selectedAdmin.firstname} {selectedAdmin.lastname}</div>
                    <div className="text-muted font-12">{selectedAdmin.email}</div>
                </div>
                <div className="d-flex flex-column gap-2 mb-4">
                    {roles?.map((role) => (
                        <button 
                            key={role._id || role.id} 
                            className={`btn text-start ${selectedAdmin.role === role.name ? 'btn--primary' : 'btn--secondary'}`}
                            onClick={() => handleAssignRole(role.name)}
                        >
                            <i className="bi bi-shield-check me-2"></i>
                            {role.name}
                        </button>
                    ))}
                    {!roles?.length && <div className="text-muted italic font-12">No active roles found. Define them in Privileges settings.</div>}
                </div>
                <Button variant="ghost" className="w-100" onClick={() => setIsRoleModalOpen(false)}>Cancel Action</Button>
            </Card>
        </div>
      )}
    </div>
  );
};

export default ManageAdmins;
