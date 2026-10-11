import Utils from './common';
import { Response } from 'express';

/**
 * A class for generating API responses
 */
class ResponseGenerator {
  status: number | null;
  type: string | null;
  data: any | null;
  message: string | null;

  constructor() {
    this.status = null;
    this.type = null;
    this.data = null;
    this.message = null;
  }

  /**
   * @description API response for 200 & 201
   * @param {Response} res
   * @param {number} statusCode
   * @param {any} data
   * @param {string} message
   */
  sendSuccess(res: Response, statusCode: number, data: any, message: string) {
    this.status = statusCode;
    this.data = data;
    this.message = message;
    this.type = 'success';

    return this.send(res);
  }

  /**
   * @description API response for 400, 401, 403, 404, 503
   * @param {Response} res
   * @param {number} statusCode
   * @param {string} message
   */
  sendError(res: Response, statusCode: number, message: string) {
    this.status = statusCode;
    this.message = message;
    this.type = 'error';

    return this.send(res);
  }

  /**
   * Sends response
   * @param {Response} res
   * @returns {Response} response
   */
  send(res: Response) {
    const filteredResponse = Utils.stripNull({
      status: this.status,
      message: this.message,
      data: this.data,
    });

    if (this.type === 'success') {
      return res.status(this.status as number).json(filteredResponse);
    }
    // Here this.type === 'error'
    return res.status(this.status as number).json({
      status: this.status,
      error: this.message,
    });
  }
}

export default ResponseGenerator;
