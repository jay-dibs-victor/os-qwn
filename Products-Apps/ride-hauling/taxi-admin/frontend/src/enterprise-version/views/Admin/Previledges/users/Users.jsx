import React, { useState } from 'react';
import { usePrivilegesAdmin, useAddRole, useUpdateRole } from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';

/**
 * ManagePrivileges — taxi-admin / Previledges
 * Manages RBAC roles and permission groups.
 */
const ManagePrivileges = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedRole, setSelectedRole] = useState(null);
  const [newRole, setNewRole] = useState({ role: '', description: '', permissions: '' });

  const { data: privileges, isLoading } = usePrivilegesAdmin();
  const { mutate: addRole } = useAddRole();
  const { mutate: updateRole } = useUpdateRole();
  const addToast = useUIStore((s) => s.addToast);

  const filtered = privileges?.filter((p) =>
    `${p.role || p.name} ${p.description}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (viewMode === 'add' || viewMode === 'detail') {
    const isEdit = viewMode === 'detail';
    return (
      <div className="animate-fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="text-overline uppercase tracking-widest font-10">RBAC</span>
            <h2 className="fw-800 m-0">{isEdit ? 'Update Role' : 'Create New Role'}</h2>
          </div>
          <Button variant="secondary" onClick={() => { setViewMode('list'); setSelectedRole(null); }}>
            <i className="bi bi-arrow-left"></i> Back to Roles
          </Button>
        </div>
        <div className="row g-4">
          <div className="col-lg-8">
            <Card className="glass shadow-md border-0 p-4">
              <h5 className="fw-800 mb-4 border-bottom pb-3">Role Blueprint</h5>
              <div className="row g-4">
                <div className="col-md-12">
                  <label className="form-label text-overline text-muted font-11 mb-2">Role Name</label>
                  <input className="form-control bg-light border-0 py-3 font-13" placeholder="e.g. Support Manager"
                    value={isEdit ? (selectedRole?.role || selectedRole?.name || '') : newRole.role}
                    onChange={(e) => isEdit ? setSelectedRole({ ...selectedRole, role: e.target.value }) : setNewRole({ ...newRole, role: e.target.value })} />
                </div>
                <div className="col-md-12">
                  <label className="form-label text-overline text-muted font-11 mb-2">Description</label>
                  <textarea className="form-control bg-light border-0 py-3 font-13" rows="2"
                    placeholder="What does this role do?"
                    value={isEdit ? (selectedRole?.description || '') : newRole.description}
                    onChange={(e) => isEdit ? setSelectedRole({ ...selectedRole, description: e.target.value }) : setNewRole({ ...newRole, description: e.target.value })} />
                </div>
                <div className="col-md-12">
                  <label className="form-label text-overline text-muted font-11 mb-2">Permissions (comma-separated)</label>
                  <input className="form-control bg-light border-0 py-3 font-13" placeholder="read:users, write:bookings, delete:drivers"
                    value={isEdit ? (selectedRole?.permissions || '') : newRole.permissions}
                    onChange={(e) => isEdit ? setSelectedRole({ ...selectedRole, permissions: e.target.value }) : setNewRole({ ...newRole, permissions: e.target.value })} />
                </div>
              </div>
              <div className="mt-4 pt-3 border-top d-flex gap-2">
                <Button variant="primary" onClick={() => {
                  if (isEdit) {
                    updateRole({ id: selectedRole._id || selectedRole.id, roleData: selectedRole }, {
                      onSuccess: () => { addToast('Role updated', 'success'); setViewMode('list'); }
                    });
                  } else {
                    addRole(newRole, { onSuccess: () => { addToast('Role created', 'success'); setViewMode('list'); } });
                  }
                }}>
                  <i className="bi bi-check2-circle"></i> {isEdit ? 'Update Role' : 'Create Role'}
                </Button>
                <Button variant="ghost" onClick={() => { setViewMode('list'); setSelectedRole(null); }}>Cancel</Button>
              </div>
            </Card>
          </div>
          <div className="col-lg-4">
            <Card className="bg-dark text-white border-0 shadow-lg h-100 p-4">
              <h5 className="fw-800 text-white mb-3">Permission Scope</h5>
              <p className="font-13 mb-3" style={{ opacity: 0.7 }}>Define granular permissions using the format <code className="text-warning">action:resource</code>. These are enforced on every API call from admin staff.</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="privileges-view animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Access Control</span>
          <h2 className="fw-800 m-0">Roles & Permissions</h2>
        </div>
        <Button variant="primary" onClick={() => setViewMode('add')}>
          <i className="bi bi-plus-circle"></i> New Role
        </Button>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <div className="p-4 border-bottom bg-light">
          <div className="search-wrap" style={{ maxWidth: 420 }}>
            <div className="search-box glass" style={{ padding: '0.65rem 1.4rem', borderRadius: 14, display: 'flex', alignItems: 'center', gap: '0.85rem', border: '1px solid rgba(0,0,0,0.08)' }}>
              <i className="bi bi-search text-muted"></i>
              <input type="text" placeholder="Search roles…" className="bg-transparent border-0 outline-none font-13 w-100"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">ROLE NAME</th>
                <th>DESCRIPTION</th>
                <th>PERMISSIONS</th>
                <th className="text-end pe-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((priv, idx) => (
                  <tr key={priv._id || priv.id || idx}>
                    <td className="ps-4">
                      <div className="fw-700 text-dark">{priv.role || priv.name}</div>
                    </td>
                    <td><p className="m-0 font-12 text-muted">{priv.description || 'No description'}</p></td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {(priv.permissions || '').toString().split(',').slice(0, 3).map((p, i) => (
                          <span key={i} className="badge bg-light border text-dark font-10 rounded-pill px-2">{p.trim()}</span>
                        ))}
                        {(priv.permissions || '').toString().split(',').length > 3 && (
                          <span className="badge bg-secondary font-10 rounded-pill px-2">+more</span>
                        )}
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <button className="btn-action bg-light" onClick={() => { setSelectedRole(priv); setViewMode('detail'); }}
                        style={{ width: 34, height: 34, borderRadius: 10, border: 'none' }}>
                        <i className="bi bi-pencil-square text-dark"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-5 text-muted font-13 italic">No roles defined yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ManagePrivileges;
