import { Router, Request, Response } from 'express';
import { InterventonService as InterventionController } from '../services/feedback_service';
import TokenVerification from '../middlewares/token_validator';
import SubmitEventValidator from '../middlewares/post_sanitizer';

const SUBMIT_INTERVENTION_LINK = '/interventions';
const INTERVENTIONS_GET_SPECIFIC_LINK = '/interventions/:id';
const INTERVENTION_LOCATION_LINK = '/interventions/:id/location';
const INTERVENTION_COMMENT_LINK = '/interventions/:id/comment';
const INTERVENTION_STATUS_LINK = '/interventions/:id/status';

class InterventionRoutes {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes(): Router {
    this.router.post('/test', (request: Request, response: Response) =>
      response.status(200).json({
        message: 'Welcome to iReporter API',
        body: request.body,
      }),
    );
    this.router.post(
      '/interventions',
      TokenVerification.userAuthentication,
      SubmitEventValidator.validateSubmit,
      (req, res, next) => {
        // #swagger.tags = ['Feedback']
        // #swagger.summary = 'Submit a new intervention report'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Intervention report details',
          schema: { $ref: '#/definitions/FeedbackCreate' }
        } */
        next();
      },
      InterventionController.createIntervention,
    );

    this.router.get(
      SUBMIT_INTERVENTION_LINK,
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Feedback']
        // #swagger.summary = 'List all intervention reports'
        next();
      },
      InterventionController.allInterventions,
    );

    this.router.get(
      INTERVENTIONS_GET_SPECIFIC_LINK,
      TokenVerification.userAuthentication,
      SubmitEventValidator.validateId,
      (req, res, next) => {
        // #swagger.tags = ['Feedback']
        // #swagger.summary = 'Get a specific intervention report by ID'
        /* #swagger.parameters['id'] = { description: 'Intervention ID' } */
        next();
      },
      InterventionController.interventionId,
    );

    this.router.patch(
      INTERVENTION_LOCATION_LINK,
      TokenVerification.userAuthentication,
      SubmitEventValidator.validateId,
      SubmitEventValidator.validateLocation,
      (req, res, next) => {
        // #swagger.tags = ['Feedback']
        // #swagger.summary = 'Update location of an intervention report'
        /* #swagger.parameters['id'] = { description: 'Intervention ID' } */
        next();
      },
      InterventionController.interventionLocation,
    );

    this.router.patch(
      INTERVENTION_COMMENT_LINK,
      TokenVerification.userAuthentication,
      SubmitEventValidator.validateId,
      SubmitEventValidator.validateComment,
      (req, res, next) => {
        // #swagger.tags = ['Feedback']
        // #swagger.summary = 'Edit the comment of an intervention report'
        /* #swagger.parameters['id'] = { description: 'Intervention ID' } */
        next();
      },
      InterventionController.editInterventionComment,
    );

    this.router.delete(
      INTERVENTION_STATUS_LINK,
      TokenVerification.userAuthentication,
      SubmitEventValidator.validateId,
      (req, res, next) => {
        // #swagger.tags = ['Feedback']
        // #swagger.summary = 'Delete an intervention report'
        /* #swagger.parameters['id'] = { description: 'Intervention ID' } */
        next();
      },
      InterventionController.deleteIntervention,
    );

    this.router.patch(
      INTERVENTION_STATUS_LINK,
      TokenVerification.userAuthentication,
      TokenVerification.adminAuthentication,
      SubmitEventValidator.validateId,
      SubmitEventValidator.validateStatus,
      (req, res, next) => {
        // #swagger.tags = ['Admin']
        // #swagger.summary = 'Admin: Update intervention report status'
        /* #swagger.parameters['id'] = { description: 'Intervention ID' } */
        next();
      },
      InterventionController.updateInterventionStatus,
    );

    this.router.get(
      '/users/:id/interventions/',
      TokenVerification.userAuthentication,
      SubmitEventValidator.validateId,
      (req, res, next) => {
        // #swagger.tags = ['Feedback']
        // #swagger.summary = 'Get all intervention reports for a specific user'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      InterventionController.usersInterventions,
    );

    return this.router;
  }
}

export default InterventionRoutes;
