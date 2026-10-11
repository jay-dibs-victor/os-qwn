import React, { useState, useEffect } from 'react';
import './ScopeChecklistModal.css';
import type {
  Scope,
  UserScope,
} from '../../api/scopes';
import {
  getAvailableScopesForTenant,
  getUserScopes,
  manageStaffMemberScopes,
} from '../../api/scopes';

interface ScopeChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  tenantId: string;
  userName: string;
  onScopesUpdated?: () => void;
}

interface ScopeGroup {
  category: string;
  scopes: Scope[];
}

export const ScopeChecklistModal: React.FC<ScopeChecklistModalProps> = ({
  isOpen,
  onClose,
  userId,
  tenantId,
  userName,
  onScopesUpdated,
}) => {
  const [availableScopes, setAvailableScopes] = useState<Scope[]>([]);
  const [userScopes, setUserScopes] = useState<UserScope[]>([]);
  const [scopeGroups, setScopeGroups] = useState<ScopeGroup[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load scopes on modal open
  useEffect(() => {
    if (isOpen) {
      loadScopes();
    }
  }, [isOpen, userId, tenantId]);

  const loadScopes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get available scopes for tenant
      const available = await getAvailableScopesForTenant(tenantId);
      setAvailableScopes(available);

      // Get user's current scopes
      const userCurrentScopes = await getUserScopes(userId);
      setUserScopes(userCurrentScopes);

      // Initialize selected scopes
      const selected = new Set(userCurrentScopes.map((s) => s.scopeId));
      setSelectedScopes(selected);

      // Group scopes by category
      const grouped = groupScopesByCategory(available);
      setScopeGroups(grouped);
    } catch (err) {
      setError('Failed to load scopes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupScopesByCategory = (scopes: Scope[]): ScopeGroup[] => {
    const groups: { [key: string]: Scope[] } = {};

    scopes.forEach((scope) => {
      const category = scope.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(scope);
    });

    return Object.entries(groups)
      .map(([category, scopes]) => ({
        category,
        scopes: scopes.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  };

  const handleScopeToggle = (scopeId: string) => {
    const newSelected = new Set(selectedScopes);
    if (newSelected.has(scopeId)) {
      newSelected.delete(scopeId);
    } else {
      newSelected.add(scopeId);
    }
    setSelectedScopes(newSelected);
  };

  const handleSelectAll = () => {
    const allScopeIds = new Set(availableScopes.map((s) => s.scopeId));
    setSelectedScopes(allScopeIds);
  };

  const handleDeselectAll = () => {
    setSelectedScopes(new Set());
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Determine which scopes to add and remove
      const currentScopeIds = new Set(userScopes.map((s) => s.scopeId));
      const toAdd = Array.from(selectedScopes).filter((id) => !currentScopeIds.has(id));
      const toRemove = Array.from(currentScopeIds).filter((id) => !selectedScopes.has(id));

      // Update scopes
      if (toAdd.length > 0 || toRemove.length > 0) {
        await manageStaffMemberScopes(userId, {
          add: toAdd.length > 0 ? toAdd : undefined,
          remove: toRemove.length > 0 ? toRemove : undefined,
        });
      }

      // Reload scopes
      await loadScopes();
      onScopesUpdated?.();
    } catch (err) {
      setError('Failed to update scopes');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredGroups = scopeGroups
    .map((group) => ({
      ...group,
      scopes: group.scopes.filter(
        (scope) =>
          scope.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scope.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((group) => group.scopes.length > 0);

  if (!isOpen) return null;

  return (
    <div className="scope-modal-overlay">
      <div className="scope-modal">
        <div className="scope-modal-header">
          <h2>Manage Scopes for {userName}</h2>
          <button className="scope-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="scope-modal-error">{error}</div>}

        <div className="scope-modal-search">
          <input
            type="text"
            placeholder="Search scopes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="scope-search-input"
          />
        </div>

        <div className="scope-modal-actions">
          <button onClick={handleSelectAll} className="scope-action-btn">
            Select All
          </button>
          <button onClick={handleDeselectAll} className="scope-action-btn">
            Deselect All
          </button>
          <span className="scope-count">
            {selectedScopes.size} of {availableScopes.length} selected
          </span>
        </div>

        <div className="scope-modal-content">
          {loading ? (
            <div className="scope-loading">Loading scopes...</div>
          ) : filteredGroups.length === 0 ? (
            <div className="scope-empty">No scopes found</div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.category} className="scope-group">
                <h3 className="scope-group-title">{group.category}</h3>
                <div className="scope-group-items">
                  {group.scopes.map((scope) => (
                    <label key={scope.scopeId} className="scope-item">
                      <input
                        type="checkbox"
                        checked={selectedScopes.has(scope.scopeId)}
                        onChange={() => handleScopeToggle(scope.scopeId)}
                        className="scope-checkbox"
                      />
                      <div className="scope-item-content">
                        <div className="scope-item-name">{scope.name}</div>
                        <div className="scope-item-description">{scope.description}</div>
                        {scope.requiresApproval && (
                          <span className="scope-badge scope-badge-approval">Requires Approval</span>
                        )}
                        {scope.isRootOnly && (
                          <span className="scope-badge scope-badge-root">Root Only</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="scope-modal-footer">
          <button onClick={onClose} className="scope-btn scope-btn-cancel">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="scope-btn scope-btn-save"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
