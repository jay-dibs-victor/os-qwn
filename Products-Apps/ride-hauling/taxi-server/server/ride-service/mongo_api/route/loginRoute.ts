import { Request, Response, NextFunction, Router } from 'express';

const router = Router();

router.route('/').post((req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const username = localStorage.setItem('user', req.body.username);
});

export default router;
