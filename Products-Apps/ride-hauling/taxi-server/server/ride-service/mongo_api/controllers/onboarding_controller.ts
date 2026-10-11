import { Request, Response } from 'express';
import { OnboardingService } from '../services/onboarding_service';

export class OnboardingController {
  static async saveUserPreferences(req: Request, res: Response) {
    return OnboardingService.saveUserPreferences(req, res);
  }

  static async submitDriverOnboarding(req: Request, res: Response) {
    return OnboardingService.submitDriverOnboarding(req, res);
  }

  static async getDriverOnboardingStatus(req: Request, res: Response) {
    return OnboardingService.getDriverOnboardingStatus(req, res);
  }

  static async getPendingDrivers(req: Request, res: Response) {
    return OnboardingService.getPendingDrivers(req, res);
  }

  static async approveDriver(req: Request, res: Response) {
    return OnboardingService.approveDriver(req, res);
  }
}
