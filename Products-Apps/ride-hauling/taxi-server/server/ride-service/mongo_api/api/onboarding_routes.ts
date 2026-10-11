import { Router } from 'express';
import { OnboardingController } from '../controllers/onboarding_controller';
import { StorageService } from '../services/StorageService';
import TokenVerification from '../middlewares/token_validator';

class OnboardingRoutes {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes(): Router {
    const upload = StorageService.getUploadMiddleware('driver-docs');

    this.router.post(
      '/user/preferences',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Onboarding']
        // #swagger.summary = 'Save user preferences (music, temperature, conversation style)'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'User preferences',
          schema: { $ref: '#/definitions/OnboardingPreferences' }
        } */
        next();
      },
      OnboardingController.saveUserPreferences
    );

    this.router.post(
      '/driver/onboarding',
      TokenVerification.userAuthentication,
      upload.fields([
        { name: 'licenseFront', maxCount: 1 },
        { name: 'idProof', maxCount: 1 },
        { name: 'utilityBill', maxCount: 1 },
        { name: 'insurance', maxCount: 1 },
        { name: 'carInteriorVideo', maxCount: 1 },
        { name: 'carExteriorVideo', maxCount: 1 },
      ]),
      (req, res, next) => {
        // #swagger.tags = ['Onboarding']
        // #swagger.summary = 'Submit driver onboarding documents for verification'
        // #swagger.description = 'Multipart form upload with license, ID, utility bill, insurance, and car videos'
        /* #swagger.consumes = ['multipart/form-data'] */
        /* #swagger.parameters['licenseFront'] = { in: 'formData', type: 'file', description: 'Driver license front image' } */
        /* #swagger.parameters['idProof'] = { in: 'formData', type: 'file', description: 'Government ID proof' } */
        /* #swagger.parameters['utilityBill'] = { in: 'formData', type: 'file', description: 'Utility bill for address verification' } */
        /* #swagger.parameters['insurance'] = { in: 'formData', type: 'file', description: 'Insurance document' } */
        next();
      },
      OnboardingController.submitDriverOnboarding
    );

    this.router.get(
      '/driver/onboarding/status',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Onboarding']
        // #swagger.summary = 'Get driver onboarding submission status'
        next();
      },
      OnboardingController.getDriverOnboardingStatus
    );

    this.router.get(
      '/admin/drivers/pending',
      TokenVerification.adminAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Admin']
        // #swagger.summary = 'Admin: Get list of drivers pending onboarding approval'
        next();
      },
      OnboardingController.getPendingDrivers
    );

    this.router.patch(
      '/admin-drivers/:id/approve',
      TokenVerification.adminAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Admin']
        // #swagger.summary = 'Admin: Approve or reject a driver onboarding application'
        /* #swagger.parameters['id'] = { description: 'Driver ID' } */
        next();
      },
      OnboardingController.approveDriver
    );

    return this.router;
  }
}

export default OnboardingRoutes;
