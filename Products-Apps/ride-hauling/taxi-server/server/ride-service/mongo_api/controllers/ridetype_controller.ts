import { Request, Response } from 'express';
import RideTypeModel from '../models/RideType.model';

export default class RideTypeController {
  static async getAllRideTypes(req: Request, res: Response) {
    try {
      const rideTypes = await (RideTypeModel as any).listRideTypes();
      return res.status(200).json({ status: 200, data: rideTypes });
    } catch (err: any) {
      return res.status(500).json({ status: 500, error: err.message });
    }
  }

  static async getRideType(req: Request, res: Response) {
    try {
      const rideType = await (RideTypeModel as any).get(req.params.id);
      return res.status(200).json({ status: 200, data: rideType });
    } catch (err: any) {
      return res.status(404).json({ status: 404, error: err.message });
    }
  }

  static async createRideType(req: Request, res: Response) {
    try {
      const rideType = await (RideTypeModel as any).addRideType(req.body);
      return res.status(201).json({ status: 201, data: rideType });
    } catch (err: any) {
      return res.status(400).json({ status: 400, error: err.message });
    }
  }

  static async updateRideType(req: Request, res: Response) {
    try {
      const rideType = await (RideTypeModel as any).findOneAndUpdate(
        { id: req.params.id },
        req.body,
        { new: true }
      );
      if (!rideType) {
        return res.status(404).json({ status: 404, error: 'Ride type not found' });
      }
      return res.status(200).json({ status: 200, data: rideType });
    } catch (err: any) {
      return res.status(400).json({ status: 400, error: err.message });
    }
  }

  static async deleteRideType(req: Request, res: Response) {
    try {
      const result = await (RideTypeModel as any).findOneAndDelete({ id: req.params.id });
      if (!result) {
        return res.status(404).json({ status: 404, error: 'Ride type not found' });
      }
      return res.status(200).json({ status: 200, message: 'Ride type deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ status: 500, error: err.message });
    }
  }
}
