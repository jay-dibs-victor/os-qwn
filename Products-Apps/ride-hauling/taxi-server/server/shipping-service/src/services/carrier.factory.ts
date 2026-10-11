import { ICarrierService } from './carrier.service';
import { CarrierType } from '../models/shipment.model';
import { FedExClient } from './fedex.client';
import { DHLClient } from './dhl.client';

export class CarrierFactory {
  static getCarrier(type: CarrierType): ICarrierService | null {
    switch (type) {
      case CarrierType.FEDEX:
        return new FedExClient();
      case CarrierType.DHL:
        return new DHLClient();
      case CarrierType.INTERNAL:
        return null; // Internal handled by our own driver logic
      default:
        throw new Error(`Carrier type ${type} not supported`);
    }
  }
}
