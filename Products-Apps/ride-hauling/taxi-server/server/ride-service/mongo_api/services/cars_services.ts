import { Request, Response } from 'express';
import ResponseHandler from '../helpers/response_handler';
import { ErrorHandler } from '../helpers/error_handler';
import CarsModel from '../models/Cars.model';
import AutoincrementId from '../helpers/autoincrement_mongo';

export class CarsService {
  static createCarProfile(request: Request, response: Response) {
    const {
      car_type,
      car_year,
      color,
      model,
      partner_id,
      status,
      images,
      plate_number,
      isOwnedByCompany,
      user_id,
    } = request.body;

    let uid = Number(user_id) || Number(request.body.user_id);
    console.log('you user id : ' + uid);

    // @ts-ignore
    const NewCars = new CarsModel({
      id: AutoincrementId(CarsModel).counter(),
      car_type,
      car_year,
      color,
      model,
      partner_id,
      status,
      images,
      plate_number,
      isOwnedByCompany,
    });

    NewCars.save()
      .then(data => {
        const Cars = data;
        return response.status(201).json({
          status: 201,
          data: [
            {
              id: Cars.id,
              message: 'Created car record',
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

  static getAllCars(request: Request, response: Response) {
    CarsModel.find({ car_status: 'Active', health_status: 'Completed' })
      .then(data => {
        let carsAvailable = data;
        console.log(carsAvailable + 'all cars here');
        if (carsAvailable.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                carsAvailable: [],
                message: 'All Cars was retrieved successfully',
              },
            ],
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              carsAvailable,
              message: 'All Carss was retrieved successfully',
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

  static carsId(request: Request, response: Response) {
    // @ts-ignore
    CarsModel.find({ id: Number(request.params.id) })
      .then(data => {
        const Cars = data;
        if (Cars.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The id of the given car was not found',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              Cars,
              message: 'Get a specific car was successful',
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

  static deleteCars(request: Request, response: Response) {
    // @ts-ignore
    CarsModel.find({ id: Number(request.params.id) })
      .then(data => {
        const Carss = data;

        if (Carss.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The car with the given id does not exists',
          });
        }
        // @ts-ignore
        CarsModel.deleteOne({ id: Number(request.params.id) })
          .then(data => {
            const deletedCars = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: (deletedCars as any)._id,
                  message: 'car record has been deleted',
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
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static editCars(request: Request, response: Response) {
    // @ts-ignore
    CarsModel.find({ id: Number(request.params.id) })
      .then(CarsId => {
        if (CarsId.length < 1) {
          return response.status(404).json({
            status: 404,
            error: 'The   given car id does not exists',
          });
        }
        const {
          car_type,
          car_year,
          color,
          model,
          partner_id,
          status,
          images,
          plate_number,
          isOwnedByCompany,
        } = request.body;

        if (Number((request as any).user.id) === Number((CarsId[0] as any).user_id)) {
          CarsModel.updateOne(
            { id: Number(request.params.id) },
            {
              car_type,
              car_year,
              color,
              model,
              partner_id,
              status,
              images,
              plate_number,
              isOwnedByCompany,
            },
          )
            .then(data => {
              const editCarss = data;
              return response.status(200).json({
                status: 200,
                data: [
                  {
                    id: (editCarss as any)._id,
                    editCarss,
                    message: 'Updated cars record’s detail',
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
          return response.status(403).json({
            status: 403,
            error: 'You must signup or login to access this route',
          });
        }
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static usersSelectedCars(request: Request, response: Response) {
    // @ts-ignore
    CarsModel.find({ user_id: Number(request.params.id) })
      .then(data => {
        const Carss = data;
        if (Carss.length === 0) {
          return response.status(404).json({
            status: 404,
            error: 'User has no cars selected record',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              Carss,
              type: 'Red-flag',
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
