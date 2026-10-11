import { Router } from 'express';
import InterventionController from '../controllers/feedback_controller';
import TokenVerification from '../middlewares/token_validator';
// @ts-ignore
import SubmitEventValidator from '../middlewares/post_sanitizer';

const SUBMIT_INTERVENTION_LINK = '/feedback';
const feedback_GET_SPECIFIC_LINK = '/feedback/:id';
const INTERVENTION_LOCATION_LINK = '/feedback/:id/location';
const INTERVENTION_COMMENT_LINK = '/feedback/:id/comment';
const INTERVENTION_STATUS_LINK = '/feedback/:id/status';

class InterventionRoutes {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes(): Router {
    this.router.post(
      '/feedback',
      TokenVerification.userAuthentication,
      SubmitEventValidator.validateSubmit,
      (req, res, next) => {
        // #swagger.tags = ['Feedback']
        // #swagger.summary = 'Submit a new feedback/intervention report'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Feedback report details',
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
        // #swagger.summary = 'List all feedback/intervention reports'
        next();
      },
      InterventionController.allInterventions,
    );

    this.router.get(
      feedback_GET_SPECIFIC_LINK,
      TokenVerification.userAuthentication,
      SubmitEventValidator.validateId,
      (req, res, next) => {
        // #swagger.tags = ['Feedback']
        // #swagger.summary = 'Get a specific feedback report by ID'
        /* #swagger.parameters['id'] = { description: 'Feedback ID' } */
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
        // #swagger.summary = 'Update the location of a feedback report'
        /* #swagger.parameters['id'] = { description: 'Feedback ID' } */
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
        // #swagger.summary = 'Edit the comment of a feedback report'
        /* #swagger.parameters['id'] = { description: 'Feedback ID' } */
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
        // #swagger.summary = 'Delete a feedback report'
        /* #swagger.parameters['id'] = { description: 'Feedback ID' } */
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
        // #swagger.summary = 'Admin: Update the status of a feedback/intervention report'
        /* #swagger.parameters['id'] = { description: 'Feedback ID' } */
        next();
      },
      InterventionController.updateInterventionStatus,
    );

    this.router.get(
      '/users/:id/feedback/',
      TokenVerification.userAuthentication,
      SubmitEventValidator.validateId,
      (req, res, next) => {
        // #swagger.tags = ['Feedback']
        // #swagger.summary = 'Get all feedback reports for a specific user'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      InterventionController.usersInterventions,
    );

    return this.router;
  }
}

export default InterventionRoutes;
