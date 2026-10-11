import { Request, Response } from 'express';
import Shipment, { ShipmentStatus, CarrierType } from '../models/shipment.model';
import { CarrierFactory } from '../services/carrier.factory';
import { MQService } from '@shared/rabbitmq';
import { v4 as uuidv4 } from 'uuid';

export class ShipmentController {
  
  static async createShipment(req: Request, res: Response) {
    try {
      const { 
        origin, 
        destination, 
        packages, 
        customerDetails, 
        carrier = CarrierType.INTERNAL,
        ownerId 
      } = req.body;

      // 1. Generate Internal Tracking Number
      const trackingNumber = `TL-${uuidv4().split('-')[0].toUpperCase()}`;

      // 2. Create Initial Shipment Document
      const shipment = new Shipment({
        trackingNumber,
        ownerId,
        carrier,
        origin,
        destination,
        currentLocation: origin,
        packages,
        customerDetails,
        status: ShipmentStatus.PENDING,
        auditLog: [{
          status: ShipmentStatus.PENDING,
          description: 'Shipment created in system',
          updatedBy: ownerId,
          timestamp: new Date()
        }]
      });

      // 3. Handle Third Party Carrier Integration
      if (carrier !== CarrierType.INTERNAL) {
        const carrierClient = CarrierFactory.getCarrier(carrier);
        if (carrierClient) {
          try {
            const result = await carrierClient.createShipment(shipment);
            shipment.externalTrackingNumber = result.trackingNumber;
            shipment.carrierResponse = result.rawResponse;
            shipment.status = ShipmentStatus.IN_TRANSIT;
            shipment.auditLog.push({
              status: ShipmentStatus.IN_TRANSIT,
              description: `Shipment booked with ${carrier}. External Tracking: ${result.trackingNumber}`,
              updatedBy: 'SYSTEM',
              timestamp: new Date()
            });
          } catch (carrierError: any) {
            return res.status(400).json({ 
              success: false, 
              message: 'Carrier Booking Failed', 
              error: carrierError.message 
            });
          }
        }
      }

      await shipment.save();

      // 4. Publish Event to RabbitMQ
      await MQService.publish('shipping_exchange', 'shipment.created', {
        shipmentId: shipment._id,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        ownerId: shipment.ownerId
      });

      return res.status(201).json({ success: true, data: shipment });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { trackingNumber } = req.params;
      const { status, description, updatedBy, driverId, location } = req.body;

      const shipment = await Shipment.findOne({ trackingNumber });
      if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

      // Update basic info
      shipment.status = status;
      if (location) shipment.currentLocation = location;
      if (driverId) shipment.assignedDriverId = driverId;

      // Add to audit log
      shipment.auditLog.push({
        status,
        description: description || `Status updated to ${status}`,
        timestamp: new Date(),
        updatedBy
      });

      await shipment.save();

      // Publish update event
      await MQService.publish('shipping_exchange', 'shipment.updated', {
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        location: shipment.currentLocation
      });

      return res.status(200).json({ success: true, data: shipment });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getShipment(req: Request, res: Response) {
    try {
      const { trackingNumber } = req.params;
      const shipment = await Shipment.findOne({ trackingNumber }).populate('assignedDriverId');
      
      if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

      return res.status(200).json({ success: true, data: shipment });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async listByOwner(req: Request, res: Response) {
    try {
      const { ownerId } = req.params;
      const shipments = await Shipment.find({ ownerId }).sort({ created_at: -1 });
      return res.status(200).json({ success: true, data: shipments });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
