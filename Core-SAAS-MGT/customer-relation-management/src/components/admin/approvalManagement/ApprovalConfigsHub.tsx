import React, { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileSliders, Plus, RefreshCcw, X } from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import * as approvalApi from '../../../api/approval'

type Props = {
  triggerToast: (msg: string) => void
}

type LevelDraft = {
  level: number
  allowedUserIdsText: string
  allowedRoleIdsText: string
}

const cardStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '1rem',
  padding: '1.5rem',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.65rem',
  color: 'var(--foreground-muted)',
  fontWeight: 800,
  letterSpacing: '0.06em',
  marginBottom: '0.35rem',
  textTransform: 'uppercase',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.9rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,184,0,0.2)',
  borderRadius: '0.5rem',
  color: '#fff',
  fontSize: '0.83rem',
  outline: 'none',
  boxSizing: 'border-box',
}

function parseCsv(value: string) {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function ApprovalConfigsHub({ triggerToast }: Props) {
  const queryClient = useQueryClient()
  const tenantId = useAuthStore((s) => s.tenantId)
  const userId = useAuthStore((s) => s.userId)
  const authStatus = useAuthStore((s) => s.status)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [method, setMethod] = useState('POST')
  const [path, setPath] = useState('/rbac/roles')
  const [requiredPermission, setRequiredPermission] = useState('')
  const [levels, setLevels] = useState<LevelDraft[]>([
    { level: 1, allowedUserIdsText: '', allowedRoleIdsText: '' },
  ])

  const configsQuery = useQuery({
    queryKey: ['approval', 'configs', tenantId],
    queryFn: () => approvalApi.listApprovalConfigs(tenantId as string),
    enabled: authStatus === 'authenticated' && !!tenantId,
  })

  const configs = useMemo(() => configsQuery.data?.data ?? [], [configsQuery.data])

  const createMutation = useMutation({
    mutationFn: (payload: approvalApi.CreateApprovalConfigRequest) => approvalApi.createApprovalConfig(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['approval', 'configs', tenantId] })
    },
  })

  const isBusy = configsQuery.isFetching || createMutation.isPending

  const resetDraft = () => {
    setMethod('POST')
    setPath('/rbac/roles')
    setRequiredPermission('')
    setLevels([{ level: 1, allowedUserIdsText: '', allowedRoleIdsText: '' }])
  }

  const closeCreate = () => {
    setIsCreateOpen(false)
    resetDraft()
  }

  const openCreate = () => {
    setIsCreateOpen(true)
  }

  const setPreset = (presetPath: string) => {
    setPath(presetPath)
    setMethod('POST')
  }

  const addLevel = () => {
    setLevels((prev) => [
      ...prev,
      { level: prev.length + 1, allowedUserIdsText: '', allowedRoleIdsText: '' },
    ])
  }

  const removeLastLevel = () => {
    setLevels((prev) => (prev.length <= 1 ? prev : prev.slice(0, -1)))
  }

  const setUseMe = () => {
    if (!userId) return
    setLevels((prev) =>
      prev.map((l) => ({
        ...l,
        allowedUserIdsText: l.allowedUserIdsText.trim()
          ? l.allowedUserIdsText
          : userId,
      })),
    )
  }

  const submitCreate = async () => {
    if (!tenantId) return triggerToast('Tenant is not resolved for this domain.')
    if (!method.trim()) return triggerToast('Please provide a method.')
    if (!path.trim().startsWith('/')) return triggerToast('Path must start with /.')

    const payload: approvalApi.CreateApprovalConfigRequest = {
      method: method.trim().toUpperCase(),
      path: path.trim(),
      tenantId,
      requiredPermission: requiredPermission.trim() ? requiredPermission.trim() : undefined,
      levels: levels.map((l) => ({
        level: l.level,
        allowedUserIds: parseCsv(l.allowedUserIdsText),
        allowedRoleIds: parseCsv(l.allowedRoleIdsText),
      })),
    }

    try {
      await createMutation.mutateAsync(payload)
      triggerToast('Approval config created.')
      closeCreate()
    } catch (e) {
      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to create config.')
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ ...cardStyle, paddingBottom: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            paddingBottom: '0.9rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileSliders size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>
              Approval Policies
            </h3>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--foreground-muted)',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {configsQuery.data?.total ?? 0} total
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => void configsQuery.refetch()}
              disabled={!tenantId || isBusy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.6rem',
                color: '#fff',
                padding: '0.55rem 0.9rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              <RefreshCcw size={14} /> Refresh
            </button>
            <button
              onClick={openCreate}
              disabled={isBusy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,184,0,0.12)',
                border: '1px solid rgba(255,184,0,0.25)',
                borderRadius: '0.6rem',
                color: 'var(--primary)',
                padding: '0.55rem 0.9rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 900,
              }}
            >
              <Plus size={14} /> New Policy
            </button>
          </div>
        </div>

        {configsQuery.isError && (
          <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 700 }}>
            {(configsQuery.error as { message?: string } | undefined)?.message ?? 'Failed to load configs.'}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Method</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Path</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Permission</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Levels</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((c) => (
                <tr key={c.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', fontWeight: 900 }}>{c.method}</td>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', fontWeight: 900 }}>{c.path}</td>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>
                    {c.requiredPermission ?? '-'}
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', fontWeight: 900 }}>
                    {c.levels?.length ?? 0}
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>
                    {(c as any).createdAt ? new Date((c as any).createdAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}

              {!configsQuery.isFetching && configs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '1rem 0.5rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                    No approval policies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
          }}
          onClick={closeCreate}
        >
          <div
            style={{
              width: 'min(900px, 96vw)',
              background: 'rgba(15,15,15,0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '1rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              padding: '1.25rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff' }}>Create Policy</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                  {tenantId}
                </div>
              </div>
              <button
                onClick={closeCreate}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Path</label>
                <input value={path} onChange={(e) => setPath(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Required Permission (optional)</label>
                <input
                  value={requiredPermission}
                  onChange={(e) => setRequiredPermission(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={() => setPreset('/rbac/roles')}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.7rem',
                    color: '#fff',
                    padding: '0.65rem 1rem',
                    cursor: 'pointer',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                  }}
                >
                  RBAC Roles
                </button>
                <button
                  onClick={() => setPreset('/rbac/permissions')}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.7rem',
                    color: '#fff',
                    padding: '0.65rem 1rem',
                    cursor: 'pointer',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                  }}
                >
                  RBAC Perms
                </button>
                <button
                  onClick={() => setPreset('/auth/users')}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.7rem',
                    color: '#fff',
                    padding: '0.65rem 1rem',
                    cursor: 'pointer',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                  }}
                >
                  Users
                </button>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.08em', color: 'var(--foreground-muted)' }}>
                Levels
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={setUseMe}
                  style={{
                    background: 'rgba(255,184,0,0.08)',
                    border: '1px solid rgba(255,184,0,0.2)',
                    borderRadius: '0.7rem',
                    color: 'var(--primary)',
                    padding: '0.6rem 0.9rem',
                    cursor: 'pointer',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                  }}
                >
                  Use Me As Approver
                </button>
                <button
                  onClick={addLevel}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.7rem',
                    color: '#fff',
                    padding: '0.6rem 0.9rem',
                    cursor: 'pointer',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                  }}
                >
                  Add Level
                </button>
                <button
                  onClick={removeLastLevel}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.7rem',
                    color: '#fff',
                    padding: '0.6rem 0.9rem',
                    cursor: 'pointer',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                  }}
                >
                  Remove Level
                </button>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {levels.map((l, idx) => (
                <div
                  key={l.level}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr 1fr',
                    gap: '1rem',
                    padding: '0.85rem',
                    borderRadius: '0.9rem',
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: 900, letterSpacing: '0.08em' }}>
                      LEVEL
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>{idx + 1}</div>
                  </div>
                  <div>
                    <label style={labelStyle}>Allowed User IDs (comma separated)</label>
                    <input
                      value={l.allowedUserIdsText}
                      onChange={(e) => {
                        const v = e.target.value
                        setLevels((prev) => prev.map((p) => (p.level === l.level ? { ...p, allowedUserIdsText: v } : p)))
                      }}
                      style={inputStyle}
                      placeholder="user-123, user-456"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Allowed Role IDs (comma separated)</label>
                    <input
                      value={l.allowedRoleIdsText}
                      onChange={(e) => {
                        const v = e.target.value
                        setLevels((prev) => prev.map((p) => (p.level === l.level ? { ...p, allowedRoleIdsText: v } : p)))
                      }}
                      style={inputStyle}
                      placeholder="role-123, role-456"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={closeCreate}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.7rem',
                  color: '#fff',
                  padding: '0.65rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                }}
              >
                Cancel
              </button>
              <button
                disabled={isBusy}
                onClick={() => void submitCreate()}
                style={{
                  background: 'rgba(255,184,0,0.2)',
                  border: '1px solid rgba(255,184,0,0.3)',
                  borderRadius: '0.7rem',
                  color: '#fff',
                  padding: '0.65rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

