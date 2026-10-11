import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export class TokenGenerator {
  static generateToken(data: any): string {
    const secret = process.env.SECRET || 'default_secret';
    const token = jwt.sign(data, secret, {
      expiresIn: '30d',
    });
    return token;
  }

  static hashPassword(password: string): string {
    const hashedPassword = bcrypt.hashSync(password, 10);
    return hashedPassword;
  }

  static checkIfPasswordMatch(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }
}
