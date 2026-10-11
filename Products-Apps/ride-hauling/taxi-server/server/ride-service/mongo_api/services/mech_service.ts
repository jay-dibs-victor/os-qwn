import { Request, Response } from 'express';
import ResponseHandler from '../helpers/response_handler';
import { ErrorHandler } from '../helpers/error_handler';
import MechModel from '../models/Repairs.model';
import NotificationModel from '../models/Notification.model';
import AutoincrementId from '../helpers/autoincrement_mongo';

export class MechService {
  static create(request: Request, response: Response) {
    const {
      user_id,
      location,
      description,
      status,
      firstname,
      lastname,
      email,
      carbrand,
      images,
    } = request.body;

    console.log('you user id : ' + user_id);

    // @ts-ignore
    const NewMech = new MechModel({
      id: AutoincrementId(MechModel).counter(),
      user_id,
      location,
      status,
      email,
      firstname,
      lastname,
      carbrand,
      description,
      images,
    });

    NewMech.save()
      .then(data => {
        const mechRequest = data;
        return response.status(201).json({
          status: 201,
          data: [
            {
              id: mechRequest.id,
              message: 'Created mech request record',
            },
          ],
        });
      })
      .catch(err => {
        console.log(err);
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static all(request: Request, response: Response) {
    MechModel.find({ user_id: Number(request.params.id) })
      .then(data => {
        let mechRequest = data;
        return response.status(200).json({
          status: 200,
          data: [
            {
              mechRequest,
              message: 'All mech-request was retrieved successfully',
            },
          ],
        });
      })
      .catch(err =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static users(request: Request, response: Response) {
    MechModel.find({ user_id: request.params.id })
      .then(data => {
        const mechRequest = data;
        if (mechRequest.length === 0) {
          return response.status(404).json({
            status: 404,
            error: 'User has no mech-request record',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              mechRequest,
              type: 'mechRequest',
              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static update(request: Request, response: Response) {
    // @ts-ignore
    MechModel.find({ id: request.params.id })
      .then(mechId => {
        if (mechId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The id for the given mech-request  does not exists',
          });
        }
        const {
          user_id,
          firstname,
          lastname,
          email,
          description,
          carbrand,
          location,
        } = request.body;

        if (Number((request as any).user.id) === Number(mechId[0].user_id)) {
          MechModel.updateOne(
            { id: Number(request.params.id) },
            {
              user_id,
              firstname,
              lastname,
              email,
              description,
              carbrand,
              location,
              status: 'pending',
            },
          )
            .then(data => {
              const editMechRequest = data;
              return response.status(200).json({
                status: 200,
                data: [
                  {
                    id: (editMechRequest as any)._id,
                    editMechRequest,
                    message: 'Updated mech-request record’s comment',
                  },
                ],
              });
            })
            .catch(error =>
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
      .catch(error =>
        response.status(400).send({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static sendNotifications(request: Request, response: Response) {
    const { user_id, message, type, description } = request.body;

    const NewNotification = new NotificationModel({
      id: AutoincrementId(NotificationModel).counter(),
      user_id,
      message,
      type,
      description,
    });

    NewNotification.save()
      .then(data => {
        const notification = data;
        return response.status(201).json({
          status: 201,
          data: [
            {
              id: (notification as any).id,
              message: 'Created sos record',
            },
          ],
        });
      })
      .catch(err =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static getNotifications(request: Request, response: Response) {
    // @ts-ignore
    NotificationModel.find({ user_id: Number(request.params.id) })
      .then(data => {
        const notifications = data;
        if (notifications.length === 0) {
          return response.status(404).json({
            status: 404,
            error: 'User has no notifications record',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              notifications,
              type: 'notifications',
              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }
}
