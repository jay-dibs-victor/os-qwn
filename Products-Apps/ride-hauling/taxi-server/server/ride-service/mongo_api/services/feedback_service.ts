import { Request, Response } from 'express';
import { ErrorHandler } from '../helpers/error_handler';
// @ts-ignore
import InterventionsModel from '../models/Feedback.model';
import AutoincrementId from '../helpers/autoincrement_mongo';

export class InterventonService {
  static createIntervention(request: Request, res: Response) {
    const {
      comment,
      reportType,
      images,
      subject,
      location,
      status,
      user_id,
      ticket_id,
      username,
      email,
      phone_number,
      response: userResponse,
    } = request.body;

    const NewIntervention = new InterventionsModel({
      id: AutoincrementId(InterventionsModel).counter(),
      user_id,
      location,
      images,
      subject,
      comment,
      status,
      category: reportType,
      email,
      response: userResponse,
      phone_number,
      ticket_id,
      username,
    });

    NewIntervention.save()
      .then((data: any) => {
        const intervention = data;
        return res.status(201).json({
          status: 201,
          data: [{ id: intervention.id, message: 'Created intervention record' }],
        });
      })
      .catch((err: any) =>
        res.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static allInterventions(request: Request, response: Response) {
    InterventionsModel.find()
      .then((data: any) => {
        const intervention = data;
        if (intervention.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [{ message: 'No records yet' }],
          });
        }
        return response.status(200).json({
          status: 200,
          data: [{ intervention, message: 'All interventions was retrieved successfully' }],
        });
      })
      .catch((err: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static interventionId(request: Request, response: Response) {
    InterventionsModel.find({ id: Number(request.params.id) })
      .then((data: any) => {
        const intervention = data;
        if (intervention.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The intervention with the given id does not exists',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [{ intervention, message: 'Get a specific intervention was successful' }],
        });
      })
      .catch((err: any) => {
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static deleteIntervention(request: Request, response: Response) {
    InterventionsModel.find({ id: Number(request.params.id) })
      .then((data: any) => {
        const interventions = data;
        if (interventions.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The intervention with the given id does not exists',
          });
        }
        InterventionsModel.deleteOne({ id: Number(request.params.id) })
          .then((data: any) => {
            const deletedIntervention = data;
            response.status(202).json({
              status: 202,
              data: [{ id: deletedIntervention.id, message: 'intervention record has been deleted' }],
            });
          })
          .catch((error: any) => {
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch((error: any) => {
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static interventionLocation(request: Request, response: Response) {
    InterventionsModel.find({ id: Number(request.params.id) })
      .then((interventionId: any) => {
        if (interventionId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The intervention with the given id does not exists',
          });
        }
        const { location } = request.body;
        const reqUser = (request as any).user;
        if (reqUser.isAdmin || Number(reqUser.id) === Number(interventionId[0].user_id)) {
          InterventionsModel.updateOne({ id: Number(request.params.id) }, { location })
            .then((data: any) => {
              return response.status(200).json({
                status: 200,
                data: [{ id: data._id, message: "Updated intervention record's location" }],
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

  static editInterventionComment(request: Request, response: Response) {
    InterventionsModel.find({ id: Number(request.params.id) })
      .then((interventionId: any) => {
        if (interventionId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The comment with the given intervention id does not exists',
          });
        }
        const { comment } = request.body;
        const reqUser = (request as any).user;
        if (reqUser.isAdmin || Number(reqUser.id) === Number(interventionId[0].user_id)) {
          InterventionsModel.updateOne({ id: Number(request.params.id) }, { comment })
            .then((data: any) => {
              return response.status(200).json({
                status: 200,
                data: [{ id: data._id, message: "Updated intervention record's comment" }],
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

  static updateInterventionStatus(request: Request, response: Response) {
    InterventionsModel.find({ id: Number(request.params.id) })
      .then((interventionId: any) => {
        if (interventionId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The status with the given intervention id was not found',
          });
        }
        const { status } = request.body;
        const reqUser = (request as any).user;
        if (Number(reqUser.id)) {
          InterventionsModel.updateOne({ id: Number(request.params.id) }, { status })
            .then((data: any) => {
              return response.status(200).json({
                status: 200,
                data: [{ id: data._id, message: "Updated intervention record's status" }],
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

  static activateSearch(request: Request, response: Response) {
    const searchTerm = request.body.searchTerm;
    const query = {
      comment: { $regex: searchTerm, $options: 'i' },
    };

    InterventionsModel.find(query)
      .limit(6)
      .then((interventions: any) => {
        if (interventions.length === 0) {
          return response.status(404).json({ status: 404, error: 'was not found' });
        }
        return response.status(200).json({
          status: 200,
          data: [{ data: interventions, message: 'success in search' }],
        });
      })
      .catch((err: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static usersInterventions(request: Request, response: Response) {
    InterventionsModel.find({ user_id: Number(request.params.id) })
      .then((data: any) => {
        const intervention = data;
        if (intervention.length <= 0) {
          return response.status(404).json({ status: 404, error: 'User has no interventions record' });
        }
        return response.status(200).json({
          status: 200,
          data: [{ intervention, type: 'Intervention', message: 'Successful' }],
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
