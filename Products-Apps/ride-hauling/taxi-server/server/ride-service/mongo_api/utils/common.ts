import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const Utils = {
  /**
   * @description - validate password by comparing password with hash password
   * @param {string} password
   * @param {string} userPassword
   * @returns {boolean} boolean to show if password match or not
   */
  validatePassword(password: string, userPassword: string): boolean {
    return bcrypt.compareSync(password, userPassword);
  },
  /**
   * @description - encypt password
   * @param {string} password
   * @returns {string} hashpassword
   */
  hashPassword(password: string): string {
    const salt = bcrypt.genSaltSync(15);
    const pwd = bcrypt.hashSync(password, salt);
    return pwd;
  },
  /**
   * @description - signs token
   * @param {string | object | Buffer} payload
   */
  jwtSigner(payload: string | object | Buffer): string {
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '24h' });
  },
  /**
   * @description - remove null key from ab object
   * @param {any} obj
   * @returns {any}
   */
  stripNull(obj: any): any {
    let cleanObj: any = {};

    Object.keys(obj).forEach(val => {
      const newVal = obj[val];
      cleanObj = newVal ? { ...cleanObj, [val]: newVal } : cleanObj;
    });

    return cleanObj;
  },
};

export default Utils;
