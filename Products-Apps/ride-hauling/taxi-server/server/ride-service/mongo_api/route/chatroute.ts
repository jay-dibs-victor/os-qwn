import { Request, Response, NextFunction, Router } from 'express';
import connectdb from './../dbconnect';
import Chats from './../models/Chat';

const router = Router();

router.route('/').get((req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Chat']
  // #swagger.summary = 'Retrieve all chat messages'
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;

  (connectdb as any).then(() => {
    Chats.find({}).then(chat => {
      res.json(chat);
    });
  });
});

export default router;
