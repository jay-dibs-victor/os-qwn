import { Router } from 'express';
import { ShipmentController } from '../controllers/shipment.controller';

const router = Router();

router.post('/', (req, res, next) => {
  // #swagger.tags = ['Shipping']
  // #swagger.summary = 'Create a new shipment'
  /* #swagger.parameters['body'] = {
    in: 'body',
    description: 'Shipment details including origin, destination, weight, and receiver info',
    schema: { $ref: '#/definitions/CreateShipment' }
  } */
  next();
}, ShipmentController.createShipment);
router.get('/:trackingNumber', (req, res, next) => {
  // #swagger.tags = ['Shipping']
  // #swagger.summary = 'Get shipment details by tracking number'
  /* #swagger.parameters['trackingNumber'] = { description: 'Unique shipment tracking number' } */
  next();
}, ShipmentController.getShipment);
router.put('/:trackingNumber/status', (req, res, next) => {
  // #swagger.tags = ['Shipping']
  // #swagger.summary = 'Update shipment status (e.g. in_transit, delivered)'
  /* #swagger.parameters['trackingNumber'] = { description: 'Shipment tracking number' } */
  /* #swagger.parameters['body'] = {
    in: 'body',
    description: 'Status update with optional location',
    schema: { $ref: '#/definitions/UpdateShipmentStatus' }
  } */
  next();
}, ShipmentController.updateStatus);
router.get('/owner/:ownerId', (req, res, next) => {
  // #swagger.tags = ['Shipping']
  // #swagger.summary = 'List all shipments for a specific owner'
  /* #swagger.parameters['ownerId'] = { description: 'Owner/user ID' } */
  next();
}, ShipmentController.listByOwner);

export default router;
