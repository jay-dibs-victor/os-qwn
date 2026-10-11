import { Request, Response } from 'express';
import { ErrorHandler } from '../helpers/error_handler';
// @ts-ignore
import RedFlagModel from '../models/SOS.model';
import NotificationModel from '../models/Notification.model';
import AutoincrementId from '../helpers/autoincrement_mongo';

export class RedFlagService {
  static createRedFlag(request: Request, response: Response) {
    const {
      user_id,
      location,
      filename,
      address,
      status,
      media,
      email,
      phone_number,
      plate_number,
      username,
    } = request.body;

    const NewRedflag = new RedFlagModel({
      id: AutoincrementId(RedFlagModel).counter(),
      user_id,
      location,
      address,
      status,
      email,
      phone_number,
      plate_number,
      username,
      media: filename ? [filename] : ['cant find it'],
    });

    NewRedflag.save()
      .then((data: any) => {
        const redFlag = data;
        return response.status(201).json({
          status: 201,
          data: [{ id: redFlag.id, message: 'Created sos record' }],
        });
      })
      .catch((err: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static allRedFlags(request: Request, response: Response) {
    RedFlagModel.find()
      .then((data: any) => {
        const redFlag = data;
        return response.status(200).json({
          status: 200,
          data: [{ redFlag, message: 'All redflags was retrieved successfully' }],
        });
      })
      .catch((err: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static redFlagId(request: Request, response: Response) {
    RedFlagModel.find({ id: Number(request.params.id) })
      .then((data: any) => {
        const redFlag = data;
        if (redFlag.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The id of the given red-flag was not found',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [{ redFlag, message: 'Get a specific red-flag was successful' }],
        });
      })
      .catch((err: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static deleteRedFlag(request: Request, response: Response) {
    RedFlagModel.find({ id: Number(request.params.id) })
      .then((data: any) => {
        const redflags = data;
        if (redflags.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The red-flag with the given id does not exists',
          });
        }
        RedFlagModel.deleteOne({ id: Number(request.params.id) })
          .then((data: any) => {
            const deletedRedFlag = data;
            response.status(202).json({
              status: 202,
              data: [{ id: deletedRedFlag._id, message: 'red-flag record has been deleted' }],
            });
          })
          .catch((error: any) =>
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            }),
          );
      })
      .catch((error: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static editRedFlag(request: Request, response: Response) {
    RedFlagModel.find({ id: Number(request.params.id) })
      .then((redflagId: any) => {
        if (redflagId.length < 1) {
          return response.status(404).json({
            status: 404,
            error: 'The location with the given red-flag id does not exists',
          });
        }
        const { location } = request.body;
        const reqUser = (request as any).user;
        if (Number(reqUser.id) === Number(redflagId[0].user_id)) {
          RedFlagModel.updateOne({ id: Number(request.params.id) }, { location })
            .then((data: any) => {
              return response.status(200).json({
                status: 200,
                data: [{ id: data._id, message: "Updated red-flag record's location" }],
              });
            })
            .catch((error: any) =>
              response.status(400).json({
                status: 400,
                error: ErrorHandler.errors().validationError,
              }),
            );
        } else {
          return response.status(403).json({
            status: 403,
            error: 'You must signup or login to access this route',
          });
        }
      })
      .catch((error: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static editRedFlagComment(request: Request, response: Response) {
    RedFlagModel.find({ id: request.params.id })
      .then((redflagId: any) => {
        if (redflagId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The comment with the given red-flag id does not exists',
          });
        }
        const { comment } = request.body;
        const reqUser = (request as any).user;
        if (Number(reqUser.id) === Number(redflagId[0].user_id)) {
          RedFlagModel.updateOne({ id: Number(request.params.id) }, { comment })
            .then((data: any) => {
              return response.status(200).json({
                status: 200,
                data: [{ id: data._id, message: "Updated red-flag record's comment" }],
              });
            })
            .catch((error: any) =>
              response.status(400).json({
                status: 400,
                error: ErrorHandler.errors().validationError,
              }),
            );
        } else {
          return response.status(401).json({
            status: 401,
            error: 'You must signup or login to access this route',
          });
        }
      })
      .catch((error: any) =>
        response.status(400).send({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static updateRedFlagStatus(request: Request, response: Response) {
    RedFlagModel.find({ id: Number(request.params.id) })
      .then((redId: any) => {
        if (redId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The status with the given red-flag id does not exists',
          });
        }
        const { status } = request.body;
        const reqUser = (request as any).user;
        if (Number(reqUser.id)) {
          RedFlagModel.updateOne({ id: Number(request.params.id) }, { status })
            .then((data: any) => {
              return response.status(200).json({
                status: 200,
                data: [{ id: data._id, message: "Updated red-flag record's status" }],
              });
            })
            .catch((err: any) =>
              response.status(400).json({
                status: 400,
                error: ErrorHandler.errors().validationError,
              }),
            );
        } else {
          return response.status(401).json({
            status: 401,
            error: 'You must signup or login to access this route',
          });
        }
      })
      .catch((error: any) =>
        response.status(400).send({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static usersRedflags(request: Request, response: Response) {
    RedFlagModel.find({ user_id: Number(request.params.id) })
      .then((data: any) => {
        const redFlags = data;
        if (redFlags.length === 0) {
          return response.status(404).json({
            status: 404,
            error: 'User has no red-flag record',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [{ redFlags, type: 'Red-flag', message: 'Successful' }],
        });
      })
      .catch((error: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static sendNotifications(request: Request, response: Response) {
    const { user_id, message, type, description, title } = request.body;
    const desc = description || title || message;
    const NewNotification = new NotificationModel({
      id: AutoincrementId(NotificationModel).counter(),
      user_id,
      message,
      type,
      description: desc,
    });

    NewNotification.save()
      .then((data: any) => {
        const notification = data;
        return response.status(201).json({
          status: 201,
          data: [{ id: notification.id, message: 'Created notification record' }],
        });
      })
      .catch((err: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static getNotifications(request: Request, response: Response) {
    NotificationModel.find({ user_id: Number(request.params.id) })
      .then((data: any) => {
        const notifications = data;
        if (notifications.length === 0) {
          return response.status(404).json({
            status: 404,
            error: 'User has no notifications record',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [{ notifications, type: 'notifications', message: 'Successful' }],
        });
      })
      .catch((error: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }
}
