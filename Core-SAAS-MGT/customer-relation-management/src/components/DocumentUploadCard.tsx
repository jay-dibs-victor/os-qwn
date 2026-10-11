import React, { useRef } from 'react'
import { Upload, X, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import { useFileUpload } from '../hooks/useFileUpload'

interface DocumentUploadCardProps {
  /** Display label for this document slot */
  label: string
  /** Current URL (from API / metadata) */
  currentUrl?: string
  /** Called with the new URL after a successful upload */
  onUploaded: (url: string, publicId: string) => void
  /** Called when the user removes the current document */
  onRemoved?: () => void
  /** Storage folder prefix */
  folder?: string
  /** Whether the form is in edit mode */
  editable?: boolean
  /** Accepted MIME types */
  accept?: string
}

/**
 * DocumentUploadCard — drag-and-drop / click-to-upload card for a single document.
 * Shows the current image/PDF, upload progress, and provider badge.
 */
export default function DocumentUploadCard({
  label,
  currentUrl,
  onUploaded,
  onRemoved,
  folder = 'queens-os/drivers/docs',
  editable = true,
  accept = 'image/jpeg,image/png,image/webp,application/pdf',
}: DocumentUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { upload, remove, reset, state, providerLabel } = useFileUpload(folder)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await upload(file)
    if (result) onUploaded(result.url, result.publicId)
    // reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (!editable) return
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const result = await upload(file)
    if (result) onUploaded(result.url, result.publicId)
  }

  const handleRemove = async () => {
    if (state.result?.publicId) await remove(state.result.publicId)
    reset()
    onRemoved?.()
  }

  const displayUrl = state.result?.url ?? currentUrl

  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: `1px solid ${state.error ? 'rgba(239,68,68,0.4)' : editable ? 'rgba(255,184,0,0.15)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '0.75rem',
        padding: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        transition: 'border-color 0.2s',
      }}
      onDragOver={e => { e.preventDefault() }}
      onDrop={handleDrop}
    >
      {/* Label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        {displayUrl && (
          <a href={displayUrl} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', fontWeight: '700' }}>
            <ExternalLink size={10} /> View
          </a>
        )}
      </div>

      {/* Preview */}
      <div
        style={{
          position: 'relative',
          height: '120px',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: editable ? 'pointer' : 'default',
        }}
        onClick={() => editable && !state.uploading && inputRef.current?.click()}
      >
        {displayUrl ? (
          displayUrl.endsWith('.pdf') ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: 'var(--foreground-muted)' }}>
              <span style={{ fontSize: '2rem' }}>📄</span>
              <span style={{ fontSize: '0.65rem' }}>PDF Document</span>
            </div>
          ) : (
            <img
              src={displayUrl}
              alt={label}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
              onMouseEnter={e => { if (editable) (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }}
              onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=400' }}
            />
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.2)' }}>
            <Upload size={22} />
            <span style={{ fontSize: '0.65rem' }}>{editable ? 'Click or drag to upload' : 'No document'}</span>
          </div>
        )}

        {/* Upload progress overlay */}
        {state.uploading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div style={{ width: '70%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${state.progress}%`, background: 'var(--primary)', borderRadius: '2px', transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '700' }}>Uploading {state.progress}%</span>
          </div>
        )}
      </div>

      {/* Status / actions row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {state.error && (
            <span style={{ fontSize: '0.62rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <AlertTriangle size={10} /> {state.error}
            </span>
          )}
          {state.result && !state.error && (
            <span style={{ fontSize: '0.62rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <CheckCircle size={10} /> Uploaded via {providerLabel}
            </span>
          )}
          {!state.result && !state.error && displayUrl && (
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>Stored</span>
          )}
        </div>

        {editable && (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {displayUrl && (
              <button
                type="button"
                onClick={handleRemove}
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '0.35rem', padding: '0.2rem 0.5rem', fontSize: '0.62rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: '700' }}
              >
                <X size={9} /> Remove
              </button>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={state.uploading}
              style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', color: 'var(--primary)', borderRadius: '0.35rem', padding: '0.2rem 0.5rem', fontSize: '0.62rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: '700', opacity: state.uploading ? 0.5 : 1 }}
            >
              <Upload size={9} /> {displayUrl ? 'Replace' : 'Upload'}
            </button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
}
