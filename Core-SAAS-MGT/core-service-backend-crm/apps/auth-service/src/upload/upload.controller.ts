import {
  Controller,
  Post,
  Delete,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { ConfigService } from '@nestjs/config';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME  = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
];

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('File Upload')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly config: ConfigService,
  ) {}

  /**
   * GET /upload/config
   * Returns the active upload provider so the frontend knows which SDK to use.
   */
  @Post('config')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get active upload provider',
    description: 'Returns the current upload provider (cloudinary or s3) and non-secret config the frontend needs to display the correct storage badge.',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload provider configuration',
    schema: {
      example: {
        provider: 'cloudinary',
        cloudName: 'questence',
      },
    },
  })
  getConfig() {
    const provider = this.config.get<string>('UPLOAD_PROVIDER') ?? 'cloudinary';
    return {
      provider,
      // Only expose non-secret config the frontend needs
      cloudName: provider === 'cloudinary'
        ? this.config.get<string>('CLOUDINARY_CLOUD_NAME')
        : undefined,
      region: provider === 's3'
        ? this.config.get<string>('AWS_S3_REGION')
        : undefined,
    };
  }

  /**
   * POST /upload
   * Upload a single file. Returns the stored URL and metadata.
   *
   * Query params:
   *   folder — logical folder/prefix (default: 'queens-os/uploads')
   *
   * Body: multipart/form-data with field `file`
   */
  @Post()
  @ApiOperation({
    summary: 'Upload a file to Cloudinary/S3',
    description: `Upload a document or image. Returns the stored CDN URL.

**Active provider:** Cloudinary (cloud name: questence). Switch to S3 via \`UPLOAD_PROVIDER=s3\` env var.

**Allowed types:** JPEG, PNG, WebP, GIF, PDF  
**Max size:** 10 MB

**Typical use cases:**
- \`folder=queens-os/drivers/{id}/docs\` — Driver KYC documents (license, ID proof, utility bill, insurance)
- \`folder=queens-os/drivers/{id}/biometric\` — Biometric selfie
- \`folder=queens-os/partners/{id}/docs\` — Partner verification documents
- \`folder=queens-os/customers/{id}/kyc\` — Customer KYC uploads

After uploading, store the returned \`url\` in the customer's \`metadata.docs\` via **PUT /customers/:id**.
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiQuery({ name: 'folder', required: false, example: 'drivers/docs', description: 'Storage folder/prefix path' })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      example: {
        url:          'https://res.cloudinary.com/demo/image/upload/v1/queens-os/drivers/docs/license.jpg',
        publicId:     'queens-os/drivers/docs/license.jpg',
        originalName: 'license.jpg',
        mimeType:     'image/jpeg',
        size:         204800,
        provider:     'cloudinary',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed: ${ALLOWED_MIME.join(', ')}`,
      );
    }

    return this.uploadService.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder ?? 'queens-os/uploads',
    );
  }

  /**
   * DELETE /upload/:publicId
   * Delete a previously uploaded file by its publicId.
   * publicId should be URL-encoded.
   */
  @Delete('*publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an uploaded file by publicId' })
  @ApiParam({ name: 'publicId', description: 'File public ID to delete' })
  @ApiResponse({ status: 204, description: 'File deleted' })
  async deleteFile(@Param('publicId') publicId: string) {
    await this.uploadService.delete(decodeURIComponent(publicId));
  }
}
