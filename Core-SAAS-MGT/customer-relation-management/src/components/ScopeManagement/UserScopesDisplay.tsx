import React, { useState, useEffect } from 'react';
import './UserScopesDisplay.css';
import type { UserScope, ScopeUsageStats } from '../../api/scopes';
import { getUserScopes, getUserScopeUsageStats } from '../../api/scopes';

interface UserScopesDisplayProps {
  userId: string;
  userName: string;
  onEditClick?: () => void;
}

interface ScopesByCategory {
  [category: string]: UserScope[];
}

export const UserScopesDisplay: React.FC<UserScopesDisplayProps> = ({
  userId,
  userName,
  onEditClick,
}) => {
  const [scopes, setScopes] = useState<UserScope[]>([]);
  const [usageStats, setUsageStats] = useState<ScopeUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadScopes();
  }, [userId]);

  const loadScopes = async () => {
    try {
      setLoading(true);
      setError(null);

      const userScopes = await getUserScopes(userId);
      setScopes(userScopes);

      const stats = await getUserScopeUsageStats(userId);
      setUsageStats(stats);

      // Expand first category by default
      if (userScopes.length > 0) {
        const firstCategory = userScopes[0].scopeName.split(':')[0];
        setExpandedCategories(new Set([firstCategory]));
      }
    } catch (err) {
      setError('Failed to load scopes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupScopesByCategory = (scopes: UserScope[]): ScopesByCategory => {
    const grouped: ScopesByCategory = {};

    scopes.forEach((scope) => {
      const category = scope.scopeName.split(':')[0] || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(scope);
    });

    return grouped;
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const scopesByCategory = groupScopesByCategory(scopes);
  const categories = Object.keys(scopesByCategory).sort();

  if (loading) {
    return <div className="user-scopes-loading">Loading scopes...</div>;
  }

  if (error) {
    return <div className="user-scopes-error">{error}</div>;
  }

  return (
    <div className="user-scopes-container">
      <div className="user-scopes-header">
        <div>
          <h3 className="user-scopes-title">Scopes for {userName}</h3>
          {usageStats && (
            <div className="user-scopes-stats">
              <span className="stat">
                <strong>{usageStats.enabledScopes}</strong> enabled
              </span>
              <span className="stat">
                <strong>{usageStats.totalScopes}</strong> total
              </span>
              <span className="stat">
                <strong>{usageStats.totalUsage}</strong> uses
              </span>
            </div>
          )}
        </div>
        {onEditClick && (
          <button onClick={onEditClick} className="user-scopes-edit-btn">
            Edit Scopes
          </button>
        )}
      </div>

      {scopes.length === 0 ? (
        <div className="user-scopes-empty">
          <p>No scopes assigned to this user</p>
          {onEditClick && (
            <button onClick={onEditClick} className="user-scopes-assign-btn">
              Assign Scopes
            </button>
          )}
        </div>
      ) : (
        <div className="user-scopes-list">
          {categories.map((category) => (
            <div key={category} className="scope-category">
              <button
                className="scope-category-header"
                onClick={() => toggleCategory(category)}
              >
                <span className="scope-category-toggle">
                  {expandedCategories.has(category) ? '▼' : '▶'}
                </span>
                <span className="scope-category-name">{category}</span>
                <span className="scope-category-count">
                  {scopesByCategory[category].length}
                </span>
              </button>

              {expandedCategories.has(category) && (
                <div className="scope-category-items">
                  {scopesByCategory[category].map((scope) => (
                    <div key={scope.id} className="scope-item-display">
                      <div className="scope-item-header">
                        <span className="scope-item-status">
                          {scope.isEnabled ? (
                            <span className="status-badge status-enabled">✓ Enabled</span>
                          ) : (
                            <span className="status-badge status-disabled">✗ Disabled</span>
                          )}
                        </span>
                        <span className="scope-item-name">{scope.scopeName}</span>
                      </div>
                      {scope.scopeDescription && (
                        <p className="scope-item-description">{scope.scopeDescription}</p>
                      )}
                      <div className="scope-item-meta">
                        {scope.usageCount !== undefined && (
                          <span className="meta-item">
                            <strong>Uses:</strong> {scope.usageCount}
                          </span>
                        )}
                        {scope.lastUsedAt && (
                          <span className="meta-item">
                            <strong>Last used:</strong> {new Date(scope.lastUsedAt).toLocaleDateString()}
                          </span>
                        )}
                        {scope.expiresAt && (
                          <span className="meta-item">
                            <strong>Expires:</strong> {new Date(scope.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
