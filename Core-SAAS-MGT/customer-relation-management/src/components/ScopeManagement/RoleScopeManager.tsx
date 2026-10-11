import React, { useState, useEffect } from 'react';
import './RoleScopeManager.css';
import type {
  Role,
  Scope,
} from '../../api/scopes';
import {
  getTenantRoles,
  getAvailableScopesForTenant,
  createCustomRole,
  updateCustomRole,
  deleteCustomRole,
} from '../../api/scopes';

interface RoleScopeManagerProps {
  tenantId: string;
  onRoleUpdated?: () => void;
}

interface RoleFormData {
  name: string;
  description: string;
  scopeIds: string[];
}

export const RoleScopeManager: React.FC<RoleScopeManagerProps> = ({
  tenantId,
  onRoleUpdated,
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [availableScopes, setAvailableScopes] = useState<Scope[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    scopeIds: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rolesData, scopesData] = await Promise.all([
        getTenantRoles(tenantId),
        getAvailableScopesForTenant(tenantId),
      ]);

      setRoles(rolesData);
      setAvailableScopes(scopesData);
    } catch (err) {
      setError('Failed to load roles and scopes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setIsCreating(false);
    setFormData({
      name: role.name,
      description: role.description,
      scopeIds: role.scopeIds,
    });
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedRole(null);
    setFormData({
      name: '',
      description: '',
      scopeIds: [],
    });
  };

  const handleScopeToggle = (scopeId: string) => {
    setFormData((prev) => ({
      ...prev,
      scopeIds: prev.scopeIds.includes(scopeId)
        ? prev.scopeIds.filter((id) => id !== scopeId)
        : [...prev.scopeIds, scopeId],
    }));
  };

  const handleSelectAllScopes = () => {
    setFormData((prev) => ({
      ...prev,
      scopeIds: availableScopes.map((s) => s.scopeId),
    }));
  };

  const handleDeselectAllScopes = () => {
    setFormData((prev) => ({
      ...prev,
      scopeIds: [],
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isCreating) {
        await createCustomRole({
          tenantId,
          name: formData.name,
          description: formData.description,
          scopeIds: formData.scopeIds,
        });
      } else if (selectedRole && !selectedRole.isSystem) {
        await updateCustomRole(selectedRole.roleId, {
          name: formData.name,
          description: formData.description,
          scopeIds: formData.scopeIds,
        } as any);
      }

      await loadData();
      setSelectedRole(null);
      setIsCreating(false);
      onRoleUpdated?.();
    } catch (err) {
      setError('Failed to save role');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole || selectedRole.isSystem) return;

    if (!window.confirm(`Delete role "${selectedRole.name}"?`)) return;

    try {
      setSaving(true);
      setError(null);

      await deleteCustomRole(selectedRole.roleId);
      await loadData();
      setSelectedRole(null);
      setIsCreating(false);
      onRoleUpdated?.();
    } catch (err) {
      setError('Failed to delete role');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="role-manager-loading">Loading roles...</div>;
  }

  return (
    <div className="role-manager-container">
      <div className="role-manager-header">
        <h2>Role & Permission Management</h2>
        <button onClick={handleCreateNew} className="role-create-btn">
          + Create New Role
        </button>
      </div>

      {error && <div className="role-manager-error">{error}</div>}

      <div className="role-manager-content">
        <div className="role-list-panel">
          <h3>Roles</h3>
          <div className="role-list">
            {roles.map((role) => (
              <button
                key={role.roleId}
                className={`role-list-item ${selectedRole?.roleId === role.roleId ? 'active' : ''}`}
                onClick={() => handleRoleSelect(role)}
              >
                <div className="role-list-item-name">{role.name}</div>
                <div className="role-list-item-meta">
                  {role.isSystem && <span className="role-badge-system">System</span>}
                  {role.isCustom && <span className="role-badge-custom">Custom</span>}
                  <span className="role-scope-count">{role.scopeIds.length} scopes</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="role-detail-panel">
          {isCreating || selectedRole ? (
            <>
              <div className="role-form-header">
                <h3>{isCreating ? 'Create New Role' : `Edit ${selectedRole?.name}`}</h3>
                {selectedRole?.isSystem && (
                  <span className="role-system-notice">System roles cannot be edited</span>
                )}
              </div>

              <div className="role-form">
                <div className="form-group">
                  <label>Role Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={selectedRole?.isSystem}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    disabled={selectedRole?.isSystem}
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <div className="form-group-header">
                    <label>Scopes ({formData.scopeIds.length} selected)</label>
                    {!selectedRole?.isSystem && (
                      <div className="scope-actions">
                        <button
                          onClick={handleSelectAllScopes}
                          className="scope-action-link"
                        >
                          Select All
                        </button>
                        <button
                          onClick={handleDeselectAllScopes}
                          className="scope-action-link"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="scope-checklist">
                    {availableScopes.map((scope) => (
                      <label
                        key={scope.scopeId}
                        className="scope-checkbox-item"
                      >
                        <input
                          type="checkbox"
                          checked={formData.scopeIds.includes(scope.scopeId)}
                          onChange={() => handleScopeToggle(scope.scopeId)}
                          disabled={selectedRole?.isSystem}
                        />
                        <div className="scope-checkbox-content">
                          <div className="scope-checkbox-name">{scope.name}</div>
                          <div className="scope-checkbox-desc">{scope.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {!selectedRole?.isSystem && (
                  <div className="role-form-actions">
                    <button
                      onClick={() => {
                        setSelectedRole(null);
                        setIsCreating(false);
                      }}
                      className="role-btn role-btn-cancel"
                    >
                      Cancel
                    </button>
                    {selectedRole && !selectedRole.isSystem && (
                      <button
                        onClick={handleDelete}
                        disabled={saving}
                        className="role-btn role-btn-delete"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="role-btn role-btn-save"
                    >
                      {saving ? 'Saving...' : 'Save Role'}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="role-empty-state">
              <p>Select a role to view or edit its scopes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
