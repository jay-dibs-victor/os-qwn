import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUploadAdapter, UploadResult } from './upload.interface';
import axios from 'axios';
import * as crypto from 'crypto';

/**
 * AWS S3 upload adapter (production).
 * Uses the S3 REST API directly — no AWS SDK dependency.
 *
 * Required env vars:
 *   AWS_S3_BUCKET        — bucket name
 *   AWS_S3_REGION        — e.g. us-east-1
 *   AWS_ACCESS_KEY_ID    — IAM access key
 *   AWS_SECRET_ACCESS_KEY — IAM secret
 *   AWS_S3_PUBLIC_URL    — optional CDN/CloudFront base URL (falls back to S3 URL)
 */
@Injectable()
export class S3Adapter implements IUploadAdapter {
  private readonly logger = new Logger(S3Adapter.name);
  private readonly bucket: string;
  private readonly region: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    this.bucket    = this.config.get<string>('AWS_S3_BUCKET')          ?? '';
    this.region    = this.config.get<string>('AWS_S3_REGION')          ?? 'us-east-1';
    this.accessKey = this.config.get<string>('AWS_ACCESS_KEY_ID')      ?? '';
    this.secretKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY')  ?? '';
    this.publicUrl = this.config.get<string>('AWS_S3_PUBLIC_URL')      ?? '';
  }

  async upload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder = 'queens-os/uploads',
  ): Promise<UploadResult> {
    const key       = `${folder}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const host      = `${this.bucket}.s3.${this.region}.amazonaws.com`;
    const endpoint  = `https://${host}/${key}`;
    const date      = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
    const dateShort = date.slice(0, 8);

    // AWS Signature V4
    const payloadHash = crypto.createHash('sha256').update(buffer).digest('hex');
    const canonicalHeaders = `content-type:${mimeType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${date}\n`;
    const signedHeaders    = 'content-type;host;x-amz-content-sha256;x-amz-date';
    const canonicalRequest = `PUT\n/${key}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const credentialScope = `${dateShort}/${this.region}/s3/aws4_request`;
    const stringToSign    = `AWS4-HMAC-SHA256\n${date}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

    const signingKey = this._signingKey(dateShort);
    const signature  = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    const authHeader = `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    await axios.put(endpoint, buffer, {
      headers: {
        'Content-Type':          mimeType,
        'x-amz-date':            date,
        'x-amz-content-sha256':  payloadHash,
        'Authorization':         authHeader,
      },
    });

    const url = this.publicUrl ? `${this.publicUrl}/${key}` : endpoint;
    this.logger.log(`S3 upload OK: ${url}`);

    return {
      url,
      publicId:     key,
      originalName: filename,
      mimeType,
      size:         buffer.length,
      provider:     's3',
    };
  }

  async delete(publicId: string): Promise<void> {
    const host      = `${this.bucket}.s3.${this.region}.amazonaws.com`;
    const endpoint  = `https://${host}/${publicId}`;
    const date      = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
    const dateShort = date.slice(0, 8);

    const payloadHash      = crypto.createHash('sha256').update('').digest('hex');
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${date}\n`;
    const signedHeaders    = 'host;x-amz-content-sha256;x-amz-date';
    const canonicalRequest = `DELETE\n/${publicId}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const credentialScope = `${dateShort}/${this.region}/s3/aws4_request`;
    const stringToSign    = `AWS4-HMAC-SHA256\n${date}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

    const signingKey = this._signingKey(dateShort);
    const signature  = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    await axios.delete(endpoint, {
      headers: {
        'x-amz-date':           date,
        'x-amz-content-sha256': payloadHash,
        'Authorization':        `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      },
    });
  }

  private _signingKey(dateShort: string): Buffer {
    const kDate    = crypto.createHmac('sha256', `AWS4${this.secretKey}`).update(dateShort).digest();
    const kRegion  = crypto.createHmac('sha256', kDate).update(this.region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update('s3').digest();
    return crypto.createHmac('sha256', kService).update('aws4_request').digest();
  }
}
