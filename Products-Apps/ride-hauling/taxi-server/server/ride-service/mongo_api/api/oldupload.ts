import { Router, Request, Response } from 'express';
import multer from 'multer';

// Assuming aws_uploads.js might be in services/aws_uploads.js or similar
// The original code had: const aws_upload = require('./services/aws_uploads');
// Looking at earlier find_by_name, there was no services/aws_uploads.js. 
// It might be a local path or external. Given it says './services', it should be relative to this file.
// I'll try to find it first.
const aws_upload = require('./services/aws_uploads');
const singleUpload = aws_upload.single('image');

class ApiUploads {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes() {
    // MULTER CONFIG: to get file photos to temp server storage
    const multerConfig = {
      storage: multer.diskStorage({
        destination: function(req: Request, file: Express.Multer.File, next: any) {
          next(null, './public/photo-storage');
        },
        filename: function(req: Request, file: Express.Multer.File, next: any) {
          const ext = file.mimetype.split('/')[1];
          next(null, file.fieldname + '-' + Date.now() + '.' + ext);
        },
      }),
      fileFilter: function(req: Request, file: Express.Multer.File, next: any) {
        if (!file) {
          next(null, true);
        }
        const isImage = file.mimetype.startsWith('image/');
        if (isImage) {
          next(null, true);
        } else {
          next(null, false);
        }
      },
    };

    this.router.post('/image/profile/avater', multer(multerConfig as any).single('image-upload'), function(
      req: Request,
      res: Response,
    ) {
      res.send(
        'Complete! Check out your public/photo-storage folder. Please note that files not encoded with an image mimetype are rejected. <a href="index.html">try again</a>',
      );
    });

    this.router.post('/image-upload', function(req: Request, res: Response) {
      singleUpload(req, res, function(err: any) {
        if (err) {
          return res
            .status(422)
            .send({ errors: [{ title: 'Image Upload Error', detail: err.message }] });
        }
        return res.json({ imageUrl: (req as any).file });
      });
    });
  }
}

export default ApiUploads;
