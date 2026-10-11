/**
 * Adapter interface for file upload providers.
 * Implement this to add a new storage backend (Cloudinary, S3, GCS, etc.)
 * Switch providers by setting UPLOAD_PROVIDER env var.
 */
export interface UploadResult {
  /** Public URL of the uploaded file */
  url: string;
  /** Provider-specific public ID / key (for deletion/replacement) */
  publicId: string;
  /** Original filename */
  originalName: string;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** Which provider stored this file */
  provider: 'cloudinary' | 's3' | 'local';
}

export interface IUploadAdapter {
  /**
   * Upload a file buffer and return the stored URL + metadata.
   * @param buffer   Raw file bytes
   * @param filename Original filename (used for extension detection)
   * @param mimeType MIME type of the file
   * @param folder   Logical folder/prefix (e.g. 'drivers/docs')
   */
  upload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder?: string,
  ): Promise<UploadResult>;

  /**
   * Delete a previously uploaded file by its publicId.
   */
  delete(publicId: string): Promise<void>;
}

export const UPLOAD_ADAPTER = 'UPLOAD_ADAPTER';
