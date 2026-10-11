/**
 * File upload API — adapter-aware.
 *
 * The active provider (cloudinary | s3) is determined by the backend
 * via UPLOAD_PROVIDER env var. The frontend just calls POST /upload
 * with a multipart form and gets back a URL.
 *
 * Frontend env var (Vite):
 *   VITE_UPLOAD_PROVIDER  — mirrors the backend setting (for UI hints only)
 *   VITE_API_BASE_URL     — API gateway base URL
 */

import { useAuthStore } from '../stores/authStore'

export type UploadProvider = 'cloudinary' | 's3' | 'local'

export interface UploadResult {
  url: string
  publicId: string
  originalName: string
  mimeType: string
  size: number
  provider: UploadProvider
}

function getBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!base) throw new Error('VITE_API_BASE_URL is not set')
  return base.replace(/\/+$/, '')
}

/** Which provider is active — read from env so the UI can show the right badge */
export const ACTIVE_PROVIDER: UploadProvider =
  (import.meta.env.VITE_UPLOAD_PROVIDER as UploadProvider) ?? 'cloudinary'

/** Human-readable provider label for UI display */
export const PROVIDER_LABELS: Record<UploadProvider, string> = {
  cloudinary: 'Cloudinary CDN',
  s3:         'AWS S3',
  local:      'Local Storage',
}

/**
 * Upload a single file to the active storage provider.
 *
 * @param file   The File object from an <input type="file">
 * @param folder Logical folder prefix, e.g. 'drivers/docs'
 */
export async function uploadFile(
  file: File,
  folder = 'queens-os/uploads',
): Promise<UploadResult> {
  // Get token directly from the Zustand store (works outside React components too)
  const token = useAuthStore.getState().accessToken
  if (!token) throw new Error('Not authenticated')

  const form = new FormData()
  form.append('file', file)

  const url = `${getBaseUrl()}/upload?folder=${encodeURIComponent(folder)}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Upload failed' }))
    throw new Error((err as { message?: string }).message ?? 'Upload failed')
  }

  return res.json() as Promise<UploadResult>
}

/**
 * Delete a previously uploaded file by its publicId.
 */
export async function deleteUploadedFile(publicId: string): Promise<void> {
  const token = useAuthStore.getState().accessToken
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(
    `${getBaseUrl()}/upload/${encodeURIComponent(publicId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete file')
  }
}
