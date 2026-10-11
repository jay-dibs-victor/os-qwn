import React, { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, FileCheck2, RefreshCcw, XCircle } from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import * as approvalApi from '../../../api/approval'
import Pagination from '../../Pagination'

type Props = {
  triggerToast: (msg: string) => void
}

const cardStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '1rem',
  padding: '1.5rem',
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

export default function ApprovalManagementHub({ triggerToast }: Props) {
  const queryClient = useQueryClient()
  const tenantId = useAuthStore((s) => s.tenantId)
  const userId = useAuthStore((s) => s.userId)
  const authStatus = useAuthStore((s) => s.status)

  const [selected, setSelected] = useState<approvalApi.ApprovalRequest | null>(null)
  const [action, setAction] = useState<'approve' | 'reject'>('approve')
  const [comment, setComment] = useState('')
  const [reason, setReason] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const requestsQuery = useQuery({
    queryKey: ['approval', 'requests', tenantId],
    queryFn: () => approvalApi.listApprovalRequests(tenantId as string),
    enabled: authStatus === 'authenticated' && !!tenantId,
  })

  const requests = useMemo(() => requestsQuery.data?.data ?? [], [requestsQuery.data])

  const approveMutation = useMutation({
    mutationFn: (p: { id: string; comment?: string }) =>
      approvalApi.approveApprovalRequest(p.id, { approverId: userId as string, comment: p.comment }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['approval', 'requests', tenantId] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (p: { id: string; reason?: string }) =>
      approvalApi.rejectApprovalRequest(p.id, { approverId: userId as string, reason: p.reason }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['approval', 'requests', tenantId] })
    },
  })

  const isBusy = requestsQuery.isFetching || approveMutation.isPending || rejectMutation.isPending

  const closeModal = () => {
    setSelected(null)
    setAction('approve')
    setComment('')
    setReason('')
  }

  const submitAction = async () => {
    if (!selected) return
    if (!userId) {
      triggerToast('User is not resolved.')
      return
    }

    try {
      if (action === 'approve') {
        await approveMutation.mutateAsync({ id: selected.id, comment: comment.trim() || undefined })
        triggerToast('Approval recorded.')
      } else {
        await rejectMutation.mutateAsync({ id: selected.id, reason: reason.trim() || undefined })
        triggerToast('Rejection recorded.')
      }
      closeModal()
    } catch (e) {
      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to process request.')
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
            <FileCheck2 size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>
              Approval Requests
            </h3>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--foreground-muted)',
                fontWeight: '800',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {requestsQuery.data?.total ?? 0} total
            </div>
          </div>

          <button
            onClick={() => void requestsQuery.refetch()}
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
              fontWeight: '800',
            }}
          >
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>

        {requestsQuery.isError && (
          <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: '700' }}>
            {(requestsQuery.error as { message?: string } | undefined)?.message ?? 'Failed to load requests.'}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '860px' }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Method</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Path</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Initiator</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Level</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Created</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}></th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const paginated = requests.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                return (
                  <>
                    {paginated.map((r) => {
                      const nextLevel = (r.steps?.length ?? 0) + 1
                      const isPending = r.status === 'PENDING'
                      return (
                        <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <td style={{ padding: '0.85rem 0.5rem', fontWeight: 900 }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.3rem 0.6rem',
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                border: '1px solid rgba(255,255,255,0.08)',
                                background:
                                  r.status === 'APPROVED'
                                    ? 'rgba(16,185,129,0.08)'
                                    : r.status === 'REJECTED'
                                      ? 'rgba(239,68,68,0.08)'
                                      : 'rgba(255,184,0,0.08)',
                                color:
                                  r.status === 'APPROVED'
                                    ? '#10b981'
                                    : r.status === 'REJECTED'
                                      ? '#ef4444'
                                      : 'var(--primary)',
                              }}
                            >
                              {r.status === 'APPROVED' ? (
                                <CheckCircle2 size={14} />
                              ) : r.status === 'REJECTED' ? (
                                <XCircle size={14} />
                              ) : (
                                <span
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    boxShadow: '0 0 10px var(--primary-glow)',
                                  }}
                                />
                              )}
                              {r.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>
                            {r.method}
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>{r.path}</td>
                          <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>
                            {r.initiatorId}
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>
                            {isPending ? nextLevel : '-'}
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', fontWeight: 800 }}>
                            {new Date(r.createdAt).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            <button
                              disabled={!isPending || isBusy}
                              onClick={() => {
                                setSelected(r)
                                setAction('approve')
                                setComment('')
                                setReason('')
                              }}
                              style={{
                                background: isPending ? 'rgba(255,184,0,0.1)' : 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '0.6rem',
                                color: isPending ? 'var(--primary)' : 'var(--foreground-muted)',
                                padding: '0.55rem 0.85rem',
                                cursor: isPending ? 'pointer' : 'not-allowed',
                                fontSize: '0.75rem',
                                fontWeight: 900,
                                letterSpacing: '0.05em',
                              }}
                            >
                              Process
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {!requestsQuery.isFetching && paginated.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: '1rem 0.5rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                          No approval requests found.
                        </td>
                      </tr>
                    )}
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={requests.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      </div>

      {selected && (
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
          onClick={closeModal}
        >
          <div
            style={{
              width: 'min(760px, 95vw)',
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
                <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff' }}>Process Request</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                  {selected.method} {selected.path}
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                }}
              >
                <XCircle size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                onClick={() => setAction('approve')}
                style={{
                  background: action === 'approve' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.8rem',
                  color: action === 'approve' ? '#10b981' : '#fff',
                  padding: '0.85rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                }}
              >
                Approve
              </button>
              <button
                onClick={() => setAction('reject')}
                style={{
                  background: action === 'reject' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.8rem',
                  color: action === 'reject' ? '#ef4444' : '#fff',
                  padding: '0.85rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                }}
              >
                Reject
              </button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              {action === 'approve' ? (
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Optional comment"
                  style={inputStyle}
                />
              ) : (
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Optional reason"
                  style={inputStyle}
                />
              )}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.08em', color: 'var(--foreground-muted)' }}>
                Payload
              </div>
              <pre
                style={{
                  marginTop: '0.5rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '0.8rem',
                  padding: '0.85rem',
                  maxHeight: '260px',
                  overflow: 'auto',
                  fontSize: '0.75rem',
                  color: '#fff',
                }}
              >
                {JSON.stringify(selected.payload ?? {}, null, 2)}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                onClick={closeModal}
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
                onClick={() => void submitAction()}
                style={{
                  background: action === 'approve' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.7rem',
                  color: '#fff',
                  padding: '0.65rem 1rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                }}
              >
                {action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

