import { Router, Request, Response } from 'express';
import aws from 'aws-sdk';
import dotenv from 'dotenv';
import uploadFile from './services/aws_uploads';

dotenv.config();

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: 'us-east-1',
});

const S3_BUCKET = 'Queens-bucket';

class ApiUploads {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes() {
    this.router.get('/sign-s3', (req: Request, res: Response) => {
      const s3 = new aws.S3();

      const fileName = req.query['file-name'] as string;
      const fileType = req.query['file-type'] as string;
      const s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        ContentType: fileType,
      };

      s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
          console.log(err);
          return res.end();
        }
        const returnData = {
          signedRequest: data,
          url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`,
        };
        res.write(JSON.stringify(returnData));
        res.end();
      });
    });

    this.router.put('/save-details', (req: Request, res: Response) => {
      // TODO: Read POSTed form data and do something useful
    });

    this.router.post('/image-upload', (req: Request, res: Response) => {
      console.log(req.body.files);
      uploadFile(req.body.files);
    });
  }
}

export default ApiUploads;
