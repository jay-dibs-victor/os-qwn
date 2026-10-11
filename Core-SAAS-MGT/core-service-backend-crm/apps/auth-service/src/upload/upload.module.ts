import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { CloudinaryAdapter } from './cloudinary.adapter';
import { S3Adapter } from './s3.adapter';
import { UPLOAD_ADAPTER } from './upload.interface';

/**
 * UploadModule — adapter-pattern file upload.
 *
 * Switch providers by setting UPLOAD_PROVIDER env var:
 *   UPLOAD_PROVIDER=cloudinary  (default)
 *   UPLOAD_PROVIDER=s3
 *
 * Files are stored in memory during the request and immediately
 * forwarded to the active provider. No disk writes.
 */
@Module({
  imports: [
    ConfigModule,
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [UploadController],
  providers: [
    UploadService,
    CloudinaryAdapter,
    S3Adapter,
    {
      provide: UPLOAD_ADAPTER,
      useFactory: (config: ConfigService, cloudinary: CloudinaryAdapter, s3: S3Adapter) => {
        const provider = config.get<string>('UPLOAD_PROVIDER') ?? 'cloudinary';
        if (provider === 's3') return s3;
        return cloudinary; // default
      },
      inject: [ConfigService, CloudinaryAdapter, S3Adapter],
    },
  ],
  exports: [UploadService],
})
export class UploadModule {}
