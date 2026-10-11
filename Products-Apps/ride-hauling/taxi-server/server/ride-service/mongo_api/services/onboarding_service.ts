import { Request, Response } from 'express';
import UserModel from '../models/User.model';
import DriverModel from '../models/Driver.model';
import { ErrorHandler } from '../helpers/error_handler';
import { GamificationService } from './gamification_service';

export class OnboardingService {
  static async saveUserPreferences(req: Request, res: Response) {
    try {
      const { userId, preferences } = req.body;

      let user: any;
      if (userId && /^[0-9a-fA-F]{24}$/.test(userId)) {
        user = await UserModel.findById(userId);
      } else if (userId) {
        user = await UserModel.findOne({ $or: [{ id: Number(userId) }, { email: userId }] });
      }
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      user.preferences = preferences;
      user.hasCompletedOnboarding = true;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Preferences saved successfully',
        data: user,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async submitDriverOnboarding(req: Request, res: Response) {
    try {
      const { driverId, ssn, licenseNumber, licenseExpiry, address, isPartner, partnerDetails } = req.body;
      const uploadedFiles = (req.files || {}) as { [fieldname: string]: Express.Multer.File[] };
      const files = uploadedFiles;

      const tokenEmail = (req as any)?.user?.email;
      let driver: any = null;
      if (driverId) {
        if (/^[0-9a-fA-F]{24}$/.test(driverId)) {
          driver = await DriverModel.findById(driverId);
        } else if (/^\d+$/.test(driverId)) {
          driver = await DriverModel.findOne({ id: Number(driverId) });
        } else {
          driver = await DriverModel.findOne({ email: driverId });
        }
      }
      if (!driver && tokenEmail) {
        driver = await DriverModel.findOne({ email: tokenEmail });
        if (!driver) {
          const user = await UserModel.findOne({ email: tokenEmail });
          if (user) {
            driver = await DriverModel.create({
              email: user.email,
              firstname: user.firstname,
              lastname: user.lastname,
              username: user.username,
              phone_number: user.phone_number,
              roles: user.roles,
              isVerified: false,
              vettingStatus: 'NOT_SUBMITTED',
            } as any);
          }
        }
      }

      if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
      }

      const documents = {
        licenseFront: files['licenseFront']?.[0]?.path || '',
        idProof: files['idProof']?.[0]?.path || '',
        utilityBill: files['utilityBill']?.[0]?.path || '',
        insurance: files['insurance']?.[0]?.path || '',
        carInteriorVideo: files['carInteriorVideo']?.[0]?.path || '',
        carExteriorVideo: files['carExteriorVideo']?.[0]?.path || '',
      };

      driver.onboardingDetails = {
        ssn,
        licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        address,
        isPartner: isPartner === 'true' || isPartner === true,
        partnerDetails: isPartner === 'true' || isPartner === true ? JSON.parse(partnerDetails) : undefined,
        documents,
      };
      
      driver.vettingStatus = 'PENDING';
      await driver.save();

      return res.status(200).json({
        success: true,
        message: 'Onboarding details submitted successfully. Awaiting vetting.',
        data: driver,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getDriverOnboardingStatus(req: Request, res: Response) {
    try {
      const email = (req as any)?.user?.email;
      if (!email) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const driver = await DriverModel.findOne({ email });
      if (!driver) {
        return res.status(200).json({
          success: true,
          data: { vettingStatus: 'NOT_SUBMITTED', onboardingDetails: null, isVerified: false },
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          vettingStatus: driver.vettingStatus || 'NOT_SUBMITTED',
          onboardingDetails: driver.onboardingDetails || null,
          isVerified: !!driver.isVerified,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getPendingDrivers(req: Request, res: Response) {
    try {
      const drivers = await DriverModel.find({ vettingStatus: 'PENDING' });
      return res.status(200).json({ success: true, data: drivers });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async approveDriver(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body; // APPROVED or REJECTED

      const driver = await DriverModel.findById(id);
      if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
      }

      driver.vettingStatus = status;
      if (status === 'APPROVED') {
        driver.isVerified = true;
        driver.status = 'Active';

        // Referral Milestone
        try {
          const user = await UserModel.findOne({ email: driver.email });
          if (user) {
            if (user.referred_by) {
               await GamificationService.handleReferralMilestone(user.referred_by, 'DRIVER');
            }
          }
        } catch (RewardErr) {
          console.error('Failed to award driver verification rewards:', RewardErr);
        }
      }
      await driver.save();

      return res.status(200).json({
        success: true,
        message: `Driver status updated to ${status}`,
        data: driver,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
