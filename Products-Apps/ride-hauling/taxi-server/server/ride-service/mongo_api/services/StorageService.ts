import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const {
  STORAGE_PROVIDER = 'cloudinary',
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
  AWS_REGION,
} = process.env;

// Initialize Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Initialize S3
const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

export class StorageService {
  static getStorage(folder: string = 'onboarding') {
    if (STORAGE_PROVIDER === 's3') {
      return multerS3({
        s3: s3,
        bucket: AWS_S3_BUCKET_NAME || 'queens-onboarding',
        acl: 'public-read',
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          cb(null, `${folder}/${Date.now().toString()}-${file.originalname}`);
        },
      });
    }

    // Default to Cloudinary
    return new CloudinaryStorage({
      cloudinary: cloudinary,
      params: (req, file) => ({
        folder,
        resource_type: 'auto',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'mp4', 'mov', 'm4v', 'webm'],
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      }),
    });
  }

  static getUploadMiddleware(folder: string = 'onboarding') {
    return multer({ storage: this.getStorage(folder) });
  }
}
