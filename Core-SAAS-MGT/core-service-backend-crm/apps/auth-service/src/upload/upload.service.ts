import { Inject, Injectable } from '@nestjs/common';
import type { IUploadAdapter, UploadResult } from './upload.interface';
import { UPLOAD_ADAPTER } from './upload.interface';

@Injectable()
export class UploadService {
  constructor(
    @Inject(UPLOAD_ADAPTER)
    private readonly adapter: IUploadAdapter,
  ) {}

  /**
   * Upload a file and return the stored URL + metadata.
   * The active adapter is determined by UPLOAD_PROVIDER env var.
   */
  async upload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder?: string,
  ): Promise<UploadResult> {
    return this.adapter.upload(buffer, filename, mimeType, folder);
  }

  /** Delete a previously uploaded file by its publicId */
  async delete(publicId: string): Promise<void> {
    return this.adapter.delete(publicId);
  }
}
