import React, { useState, useEffect, useMemo } from 'react';
import { 
  usePrivilegesAdmin, 
  useAddRole,
  useUpdateRole,
  useAvailablePermissions
} from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';

/**
 * ManagePrivileges — GoomTaxi
 * Dynamic RBAC/Role management system. 
 * Derives permissions from API schema and allows granular authority assignment.
 */
const ManagePrivileges = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'edit'
    const [selectedRole, setSelectedRole] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [newRoleName, setNewRoleName] = useState('');

    const { data: privileges, isLoading } = usePrivilegesAdmin();
    const { data: availablePermissionKeys, isLoading: isLoadingKeys } = useAvailablePermissions();
    const { mutate: addRole } = useAddRole();
    const { mutate: updateRole } = useUpdateRole();
    const addToast = useUIStore((state) => state.addToast);

    // Group permissions dynamically into categories based on prefix
    const categorizedPermissions = useMemo(() => {
        if (!availablePermissionKeys) return {};
        
        const groups = {
            'View Access': [],
            'Management Control': [],
            'Miscellaneous': []
        };

        availablePermissionKeys.forEach(key => {
            if (key.startsWith('view_')) {
                groups['View Access'].push(key);
            } else if (key.startsWith('manage_')) {
                groups['Management Control'].push(key);
            } else {
                groups['Miscellaneous'].push(key);
            }
        });

        // Remove empty groups
        return Object.fromEntries(Object.entries(groups).filter(([_, list]) => list.length > 0));
    }, [availablePermissionKeys]);

    // Initialize/Reset permissions when a role is selected
    useEffect(() => {
        if (selectedRole && availablePermissionKeys) {
            const initialPerms = {};
            availablePermissionKeys.forEach(key => {
                const val = selectedRole[key];
                // Convert 'yes'/'no' or boolean to boolean toggle
                initialPerms[key] = val === 'yes' || val === true;
            });
            setPermissions(initialPerms);
        }
    }, [selectedRole, availablePermissionKeys]);

    const handleToggle = (key) => {
        setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveChanges = () => {
        // Convert boolean back to 'yes'/'no' for backend compatibility
        const payload = {};
        Object.keys(permissions).forEach(key => {
            payload[key] = permissions[key] ? 'yes' : 'no';
        });

        updateRole({ id: selectedRole._id || selectedRole.id, roleData: payload }, {
            onSuccess: () => {
                addToast(`Authority profile updated for ${selectedRole.previledges_info || selectedRole.name}`, 'success');
                setViewMode('list');
            },
            onError: () => {
                addToast('Failed to sync permission updates', 'danger');
            }
        });
    };

    const handleCreateRole = (e) => {
        e.preventDefault();
        if (!newRoleName) return;
        addRole({ 
            previledges_info: newRoleName, 
            previledges_description: `Custom functional role defined by admin.`,
            status: 'Active'
        }, {
            onSuccess: () => {
                addToast('New permission profile created', 'success');
                setNewRoleName('');
            }
        });
    };

    const filteredRoles = privileges?.filter((role) =>
        `${role.name || role.previledges_info} ${role.previledges_description}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Helper to format permission keys for display (view_users -> Users)
    const formatLabel = (key) => {
        return key.replace(/^(view_|manage_)/, '').replace(/_/g, ' ').toUpperCase();
    };

    if (viewMode === 'edit' && selectedRole) {
        return (
            <div className="animate-fade-in edit-privileges-screen">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <span className="text-overline">Authority Configuration</span>
                        <h2 className="fw-800 m-0">{selectedRole.previledges_info || selectedRole.name}</h2>
                        <div className="text-muted font-13">{selectedRole.previledges_description}</div>
                    </div>
                    <Button variant="secondary" onClick={() => setViewMode('list')} className="rounded-pill px-4">
                        <i className="bi bi-arrow-left"></i> All Roles
                    </Button>
                </div>

                <div className="row g-4">
                    <div className="col-lg-9">
                        <Card className="p-4 border-0 shadow-sm glass">
                            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                                <h5 className="fw-800 m-0">Feature Access Matrix</h5>
                                <div className="text-muted font-11 italic">Toggles save only on confirmation</div>
                            </div>
                            
                            {Object.entries(categorizedPermissions).map(([category, perms]) => (
                                <div key={category} className="mb-5 last-child-m0">
                                    <h6 className="font-10 fw-900 text-primary uppercase tracking-widest mb-3" style={{ opacity: 0.6 }}>{category}</h6>
                                    <div className="row g-3">
                                        {perms.map(key => (
                                            <div key={key} className="col-md-6 col-xl-4">
                                                <div className={`p-3 rounded-3 d-flex justify-content-between align-items-center transition-smooth ${permissions[key] ? 'bg-primary-soft border-primary-light' : 'bg-light-soft border-light'}`} 
                                                     style={{ border: '1px solid transparent', background: permissions[key] ? 'rgba(30, 64, 175, 0.05)' : '#f8fafc' }}>
                                                    <div className="fw-700 font-12 text-dark">{formatLabel(key)}</div>
                                                    <div className="form-check form-switch m-0">
                                                        <input 
                                                            className="form-check-input" 
                                                            type="checkbox" 
                                                            checked={permissions[key] || false}
                                                            onChange={() => handleToggle(key)}
                                                            style={{ cursor: 'pointer', transform: 'scale(1.15)' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="mt-5 pt-4 border-top d-flex gap-2">
                                <Button variant="primary" onClick={handleSaveChanges} className="px-4 py-2">
                                    <i className="bi bi-check-all"></i> Commit Authority Changes
                                </Button>
                                <Button variant="ghost" onClick={() => setViewMode('list')}>Discard Edits</Button>
                            </div>
                        </Card>
                    </div>
                    <div className="col-lg-3">
                        <Card className="bg-dark text-white p-4 border-0 shadow-lg">
                            <div className="avatar-md bg-primary rounded-3 flex-center mb-4" style={{ width: 48, height: 48 }}>
                                <i className="bi bi-shield-lock font-20"></i>
                            </div>
                            <h5 className="fw-800 mb-3 text-white">Security Protocol</h5>
                            <p className="font-13 " style={{ opacity: 0.7, lineHeight: 1.6 }}>Changing these permissions updates the authorization layer for all users matching this security group.</p>
                            
                            <div className="mt-5 space-y-4">
                                <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <div className="font-10 fw-800 text-uppercase text-muted silver mb-1">Impact Level</div>
                                    <div className="font-14 fw-700 text-warning">HIGH (Direct Access)</div>
                                </div>
                                <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <div className="font-10 fw-800 text-uppercase text-muted silver mb-1">Status</div>
                                    <div className="font-14 fw-700 text-success">Live Sync Enabled</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="privileges-view animate-fade-in pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <span className="text-overline">Identity & Access</span>
                    <h2 className="fw-900 m-0">Privileges & Roles</h2>
                </div>
                <div className="d-flex gap-2">
                    <div className="search-field d-none d-sm-block" style={{ width: '280px' }}>
                        <i className="bi bi-search"></i>
                        <input 
                            type="text" 
                            className="input-premium" 
                            placeholder="Filter permission groups..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <form className="d-flex gap-2" onSubmit={handleCreateRole}>
                        <input 
                            type="text" 
                            placeholder="Role Name (e.g. Moderator)" 
                            className="input-premium" 
                            style={{ width: '220px' }}
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                        />
                        <Button variant="primary" type="submit" className="rounded-pill">
                            <i className="bi bi-plus-lg"></i> <span className="d-none d-md-inline">Create Group</span>
                        </Button>
                    </form>
                </div>
            </div>

            <Card className="p-0 overflow-hidden shadow-sm border-0 glass">
                <div className="table-responsive">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="ps-4">SECURITY ROLE</th>
                                <th>IDENTIFIER</th>
                                <th>DESCRIPTION</th>
                                <th className="text-center">CLEARANCE</th>
                                <th className="text-end pe-4">AUTHORITY</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading || isLoadingKeys ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                            ) : filteredRoles.length > 0 ? (
                                filteredRoles.map((role) => (
                                    <tr key={role._id || role.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="flex-center rounded-3 bg-light" style={{ width: 36, height: 36, fontWeight: 800, color: 'var(--color-primary)' }}>
                                                    {(role.previledges_info || role.name || 'R')[0].toUpperCase()}
                                                </div>
                                                <div className="fw-800 text-dark font-14">{role.previledges_info || role.name}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="font-monospace font-11 text-muted uppercase">{(role._id || role.id).toString().slice(-10)}</span>
                                        </td>
                                        <td>
                                            <div className="font-12 text-muted fw-500" style={{ maxWidth: '300px' }}>{role.previledges_description || 'Custom administrative security group.'}</div>
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge-premium ${role.for_admins ? 'badge-danger' : 'badge-info'}`}>
                                                {role.for_admins ? 'ADMIN' : 'USER'}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button 
                                                className="btn-action" 
                                                onClick={() => { setSelectedRole(role); setViewMode('edit'); }}
                                                title="Grant/Revoke Permissions"
                                            >
                                                <i className="bi bi-gear-wide-connected"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic">No matching authorization groups found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ManagePrivileges;
