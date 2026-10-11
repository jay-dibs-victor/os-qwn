import { IShipment, CarrierType } from '../models/shipment.model';

export interface CarrierShipmentRequest {
  shipment: IShipment;
}

export interface CarrierShipmentResponse {
  trackingNumber: string;
  labelUrl?: string;
  rawResponse: any;
  carrier: CarrierType;
}

export interface ICarrierService {
  createShipment(shipment: IShipment): Promise<CarrierShipmentResponse>;
  trackShipment(trackingNumber: string): Promise<any>;
  cancelShipment(trackingNumber: string): Promise<boolean>;
}
