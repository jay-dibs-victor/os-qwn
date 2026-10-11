import { useState, useCallback } from 'react'
import { uploadFile, deleteUploadedFile, ACTIVE_PROVIDER, PROVIDER_LABELS } from '../api/upload'
import type { UploadResult } from '../api/upload'

export type UploadState = {
  uploading: boolean
  progress: number   // 0-100 (simulated — fetch doesn't expose XHR progress)
  error: string | null
  result: UploadResult | null
}

const INITIAL: UploadState = {
  uploading: false,
  progress: 0,
  error: null,
  result: null,
}

/**
 * useFileUpload — React hook for uploading a single file.
 *
 * Usage:
 *   const { upload, state, reset } = useFileUpload('drivers/docs')
 *   const url = state.result?.url
 */
export function useFileUpload(folder = 'queens-os/uploads') {
  const [state, setState] = useState<UploadState>(INITIAL)

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setState({ uploading: true, progress: 10, error: null, result: null })

      // Simulate progress ticks while the real upload runs
      const tick = setInterval(() => {
        setState(prev =>
          prev.uploading && prev.progress < 85
            ? { ...prev, progress: prev.progress + 15 }
            : prev,
        )
      }, 300)

      try {
        const result = await uploadFile(file, folder)
        clearInterval(tick)
        setState({ uploading: false, progress: 100, error: null, result })
        return result
      } catch (e) {
        clearInterval(tick)
        const msg = (e as { message?: string })?.message ?? 'Upload failed'
        setState({ uploading: false, progress: 0, error: msg, result: null })
        return null
      }
    },
    [folder],
  )

  const remove = useCallback(async (publicId: string): Promise<void> => {
    try {
      await deleteUploadedFile(publicId)
    } catch {
      // best-effort — don't block UI
    }
  }, [])

  const reset = useCallback(() => setState(INITIAL), [])

  return {
    upload,
    remove,
    reset,
    state,
    /** Active provider name for display */
    providerLabel: PROVIDER_LABELS[ACTIVE_PROVIDER],
    provider: ACTIVE_PROVIDER,
  }
}
