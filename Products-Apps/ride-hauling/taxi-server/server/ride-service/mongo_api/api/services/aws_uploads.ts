import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: 'us-east-1',
});

const s3 = new aws.S3();

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
  }
};

const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: 'public-read',
    s3: s3 as any,
    bucket: 'Queens-bucket',
    metadata: function(req, file, cb) {
      cb(null, { fieldName: 'TESTING_METADATA' });
    },
    key: function(req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

const uploadFile = (fileName: string) => {
  // read content from the file
  const fileContent = fs.readFileSync(fileName);

  // setting up s3 upload parameters
  const params = {
    Bucket: 'Queens-bucket',
    Key: 'avatar-1.jpg',
    ContentType: 'image/jpeg', // file name you want to save as
    Body: fileContent,
  };

  // Uploading files to the bucket
  s3.upload(params, function(err: any, data: any) {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  });
};

export default uploadFile;
export { upload };
