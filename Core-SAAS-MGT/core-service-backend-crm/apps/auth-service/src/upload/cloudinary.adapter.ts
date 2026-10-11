import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUploadAdapter, UploadResult } from './upload.interface';
import axios from 'axios';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FormData = require('form-data') as typeof import('form-data');

/**
 * Cloudinary upload adapter.
 * Uses the unsigned upload API — no SDK dependency, just HTTP.
 *
 * Required env vars:
 *   CLOUDINARY_CLOUD_NAME   — your cloud name
 *   CLOUDINARY_API_KEY      — API key
 *   CLOUDINARY_API_SECRET   — API secret
 */
@Injectable()
export class CloudinaryAdapter implements IUploadAdapter {
  private readonly logger = new Logger(CloudinaryAdapter.name);
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private readonly config: ConfigService) {
    this.cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME') ?? '';
    this.apiKey     = this.config.get<string>('CLOUDINARY_API_KEY')    ?? '';
    this.apiSecret  = this.config.get<string>('CLOUDINARY_API_SECRET') ?? '';
  }

  async upload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder = 'queens-os/uploads',
  ): Promise<UploadResult> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const publicId  = `${folder}/${Date.now()}-${safeFilename}`;

    // Build signature: SHA-1(public_id=...&timestamp=...{secret})
    const sigStr = `public_id=${publicId}&timestamp=${timestamp}${this.apiSecret}`;
    const signature = crypto.createHash('sha1').update(sigStr).digest('hex');

    const form = new FormData();
    form.append('file', buffer, { filename, contentType: mimeType });
    form.append('api_key', this.apiKey);
    form.append('timestamp', timestamp);
    form.append('signature', signature);
    form.append('public_id', publicId);

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`;

    const res = await axios.post<{
      secure_url: string;
      public_id: string;
      bytes: number;
    }>(url, form, { headers: form.getHeaders() });

    this.logger.log(`Cloudinary upload OK: ${res.data.secure_url}`);

    return {
      url:          res.data.secure_url,
      publicId:     res.data.public_id,
      originalName: filename,
      mimeType,
      size:         res.data.bytes,
      provider:     'cloudinary',
    };
  }

  async delete(publicId: string): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const sigStr    = `public_id=${publicId}&timestamp=${timestamp}${this.apiSecret}`;
    const signature = crypto.createHash('sha1').update(sigStr).digest('hex');

    await axios.post(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
      { public_id: publicId, api_key: this.apiKey, timestamp, signature },
    );
  }
}
