import { Response } from 'express';

export default class ResponseHandler {
  static sendResponse(response: Response, status: number = 201, data: any = [{}]) {
    return response.status(status).json({
      status: status,
      data: data,
    });
  }

  static sendError(response: Response, status: number = 400, message: string) {
    return response.status(status).send({
      status: status,
      error: message,
    });
  }
}
