import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const createToken = function(auth: any): string {
  return jwt.sign(
    {
      id: auth.id,
    },
    process.env.SECRET as string,
    {
      expiresIn: '30d',
    },
  );
};

export default {
  generateToken: function(req: any, res: Response, next: NextFunction) {
    req.token = createToken(req.auth);
    return next();
  },
  sendToken: function(req: any, res: Response) {
    res.setHeader('x-auth-token', req.token);
    return res.status(200).send(JSON.stringify(req.user));
  },
};
