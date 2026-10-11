import { Router } from 'express';
import InventoryController from '../controllers/inventory.controller';

export default class InventoryRoutes {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes(): Router {
    this.router.get('/', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Search for available flights'
      /* #swagger.parameters['origin'] = { in: 'query', type: 'string', description: 'Origin airport code (e.g. LOS)' } */
      /* #swagger.parameters['destination'] = { in: 'query', type: 'string', description: 'Destination airport code (e.g. ABV)' } */
      /* #swagger.parameters['departure_date'] = { in: 'query', type: 'string', description: 'Departure date (YYYY-MM-DD)' } */
      /* #swagger.parameters['passengers'] = { in: 'query', type: 'integer', description: 'Number of passengers' } */
      /* #swagger.parameters['cabin_class'] = { in: 'query', type: 'string', description: 'Cabin class (economy, business, first)' } */
      next();
    }, InventoryController.searchFlights);
    this.router.get('/:id', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Get flight details by ID'
      /* #swagger.parameters['id'] = { description: 'Flight ID' } */
      next();
    }, InventoryController.getFlightById);
    
    this.router.post('/sync', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Trigger flight inventory sync from external provider'
      next();
    }, InventoryController.triggerSync);
    this.router.post('/cities', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Create a new city record'
      next();
    }, InventoryController.createCity);
    this.router.post('/airports', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Create a new airport record'
      next();
    }, InventoryController.createAirport);
    this.router.post('/airplanes', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Create a new airplane record'
      next();
    }, InventoryController.createAirplane);
    this.router.post('/', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Create a new flight record'
      next();
    }, InventoryController.createFlight);
    
    return this.router;
  }
}
