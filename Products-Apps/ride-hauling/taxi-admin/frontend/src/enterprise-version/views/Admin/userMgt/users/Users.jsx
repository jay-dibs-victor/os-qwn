import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  useUsersAdmin, 
  useDeleteUser, 
  useUpdateUser,
  useAddUser 
} from '../../../../core/hooks/adminHooks';
import { Button, Card } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';
import './Users.css';

/**
 * Users Management — GoomTaxi
 * High-fidelity refactor with premium glassmorphism and centralized hooks.
 */
const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail' or 'add'

  // Centralized hooks
  const { data: users, isLoading } = useUsersAdmin();
  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: updateUser } = useUpdateUser();
  const { mutate: addUser } = useAddUser();
  const addToast = useUIStore((state) => state.addToast);

  const filteredUsers = users?.filter((user) =>
    `${user.firstname} ${user.lastname} ${user.email} ${user.phone_number}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) || [];

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setViewMode('detail');
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to permanently remove this user account?')) {
      deleteUser(id, {
        onSuccess: () => addToast('User account successfully removed', 'warning')
      });
    }
  };

  if ((viewMode === 'detail' || viewMode === 'add')) {
    const isEdit = viewMode === 'detail';
    const [formData, setFormData] = React.useState(
      isEdit ? { ...selectedUser } : { firstname: '', lastname: '', email: '', phone_number: '', user_type: 'user' }
    );

    const handleSave = () => {
      if (isEdit) {
        updateUser({ id: selectedUser.id || selectedUser._id, userData: formData }, {
          onSuccess: () => {
            addToast('User profile updated successfully', 'success');
            setViewMode('list');
          }
        });
      } else {
        addUser(formData, {
          onSuccess: () => {
            addToast('New user account created', 'success');
            setViewMode('list');
          }
        });
      }
    };

    return (
      <div className="animate-fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span className="text-overline">User Management</span>
            <h2 className="fw-800 m-0">{isEdit ? 'Update Profile' : 'Create New Account'}</h2>
          </div>
          <Button variant="secondary" onClick={() => setViewMode('list')}>
            <i className="bi bi-arrow-left"></i> Back to Fleet
          </Button>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <Card className="glass shadow-md">
              <h5 className="fw-800 mb-4 border-bottom pb-3">Account Information</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="text-overline">First Name</label>
                  <input 
                    className="form-control" 
                    placeholder="John"
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
                    placeholder="john@example.com"
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
                  <label className="text-overline">Account Role</label>
                  <select 
                    className="form-control"
                    value={formData.user_type} 
                    onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                    <option value="partner">Fleet Partner</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 pt-3 border-top d-flex gap-2">
                <Button variant="primary" onClick={handleSave}>
                  <i className="bi bi-check2-circle"></i> {isEdit ? 'Save Changes' : 'Create Account'}
                </Button>
                <Button variant="ghost" onClick={() => setViewMode('list')}>Cancel</Button>
              </div>
            </Card>
          </div>
          
          <div className="col-lg-4">
             <Card className="bg-dark text-white border-0 shadow-lg h-100">
                <h5 className="fw-800 text-white mb-3">Privilege Level</h5>
                <p className="font-13 text-muted-light mb-4" style={{ opacity: 0.7 }}>
                  Administrators have full access to internal logistics, financial records, and system settings. Standard users are restricted to the booking app interface.
                </p>
                <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-shield-check text-success"></i>
                    <span className="font-12 fw-700">Security Verified</span>
                  </div>
                  <p className="m-0 font-11 text-muted-light">All changes logged for audit trail.</p>
                </div>
             </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="users-view animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline">Global Fleet</span>
          <h2 className="fw-800 m-0">User Directory</h2>
        </div>
        <Button variant="primary" onClick={() => setViewMode('add')}>
          <i className="bi bi-person-plus-fill"></i> Add New User
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
            TOTAL: <span className="text-dark bg-warning px-2 py-1 rounded-2 ms-1">{filteredUsers.length}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead>
              <tr>
                <th>IDENTIFIER</th>
                <th>CONTACT INFO</th>
                <th>ROLE / TYPE</th>
                <th className="text-center">STATUS</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner"></div></td></tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id || user._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="user-avatar-placeholder" style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          background: 'rgba(255,184,0,0.1)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '14px'
                        }}>
                          {(user.firstname?.[0] || 'U').toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-700 text-dark">{user.firstname} {user.lastname}</div>
                          <div className="font-11 text-muted">ID: {String(user.id || user._id).substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-13 fw-600 text-dark">{user.email}</div>
                      <div className="font-11 text-muted">{user.phone_number || 'No Phone Linked'}</div>
                    </td>
                    <td>
                      <span className={`badge ${user.user_type === 'admin' ? 'badge-danger' : 'badge-info'}`}>
                        {user.user_type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge badge-success px-3">Active</span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2 px-3">
                        <button 
                          className="btn-action bg-light" 
                          onClick={() => handleEditUser(user)}
                          title="Edit Profile"
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <i className="bi bi-pencil-square text-primary"></i>
                        </button>
                        <button 
                          className="btn-action bg-light" 
                          onClick={() => handleDeleteUser(user.id || user._id)}
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
                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic">No matching user records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Users;
