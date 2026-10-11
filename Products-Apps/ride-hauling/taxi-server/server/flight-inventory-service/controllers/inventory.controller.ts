import { Request, Response } from 'express';
import City from '../models/City.model';
import Airport from '../models/Airport.model';
import Airplane from '../models/Airplane.model';
import Flight from '../models/Flight.model';
import { Op } from 'sequelize';
import AmadeusService from '../services/amadeus_service';
import SyncJob from '../services/sync_job';
import FlightOrchestrator from '../services/providers/FlightOrchestrator';

export default class InventoryController {
  static async searchFlights(req: Request, res: Response) {
    try {
      const { sourceAirportCode, destinationAirportCode, departureDate } = req.query;
      const filter: any = {};
      
      if (sourceAirportCode) filter.departure_airport_id = sourceAirportCode;
      if (destinationAirportCode) filter.arrival_airport_id = destinationAirportCode;
      
      if (departureDate) {
         const start = new Date(departureDate as string);
         const end = new Date(start);
         end.setDate(end.getDate() + 1);
         filter.departure_time = {
           [Op.gte]: start,
           [Op.lt]: end
         };
      }

      const localFlights = await Flight.findAll({
        where: filter,
        include: [{ model: Airplane, as: 'airplane' }]
      });

      // 2. Search Real Flights via Orchestrator (Multi-Provider)
      let externalFlights: any[] = [];
      if (sourceAirportCode && destinationAirportCode && departureDate) {
         externalFlights = await FlightOrchestrator.searchAll({
           originLocationCode: sourceAirportCode as string,
           destinationLocationCode: destinationAirportCode as string,
           departureDate: departureDate as string,
           adults: 1
         });
      }
      
      const allFlights = [...localFlights, ...externalFlights];
      
      return res.status(200).json({ status: 200, data: allFlights });
    } catch (error) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async getFlightById(req: Request, res: Response) {
    try {
      const flight = await Flight.findByPk(req.params.id as any, {
        include: [{ model: Airplane, as: 'airplane' }]
      });
      if (!flight) return res.status(404).json({ status: 404, message: 'Flight not found' });
      return res.status(200).json({ status: 200, data: flight });
    } catch (error) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async createCity(req: Request, res: Response) {
    try {
      const city = await City.create(req.body);
      return res.status(201).json({ status: 201, data: city });
    } catch (error) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async createAirport(req: Request, res: Response) {
    try {
      const airport = await Airport.create(req.body);
      return res.status(201).json({ status: 201, data: airport });
    } catch (error) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async createAirplane(req: Request, res: Response) {
    try {
      const airplane = await Airplane.create(req.body);
      return res.status(201).json({ status: 201, data: airplane });
    } catch (error) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async createFlight(req: Request, res: Response) {
    try {
      const flight = await Flight.create(req.body);
      return res.status(201).json({ status: 201, data: flight });
    } catch (error) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async triggerSync(req: Request, res: Response) {
    // Run in background
    SyncJob.syncGlobalMetadata().catch(err => console.error('Delayed Sync Error:', err));
    return res.status(202).json({ status: 202, message: 'Sync started in background' });
  }
}
