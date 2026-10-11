import axios from 'axios';
import { ICarrierService, CarrierShipmentResponse } from './carrier.service';
import { IShipment, CarrierType } from '../models/shipment.model';

export class DHLClient implements ICarrierService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.DHL_API_KEY || '';
    this.apiSecret = process.env.DHL_API_SECRET || '';
    this.baseUrl = process.env.DHL_BASE_URL || 'https://express.api.dhl.com/mydhlapi/test'; // Default to test
  }

  async createShipment(shipment: IShipment): Promise<CarrierShipmentResponse> {
    const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');

    const payload = {
      plannedShippingDateAndTime: new Date().toISOString(),
      pickup: {
        isRequested: false
      },
      productCode: "P", // Express Worldwide
      accounts: [{
        number: process.env.DHL_ACCOUNT_NUMBER || '',
        type: "shipper"
      }],
      customerDetails: {
        shipperDetails: {
          contactInformation: {
            email: "ops@taxi-hauling.com",
            phone: "+1234567890",
            companyName: "Taxi-Hauling Corp",
            fullName: "Operations Manager"
          },
          addressDetails: {
            postalCode: "10001",
            cityName: "New York",
            countryCode: "US",
            addressLine1: shipment.origin.address
          }
        },
        receiverDetails: {
          contactInformation: {
            email: shipment.customerDetails.email,
            phone: shipment.customerDetails.phone,
            companyName: shipment.customerDetails.name,
            fullName: shipment.customerDetails.name
          },
          addressDetails: {
            postalCode: "20001",
            cityName: "Washington",
            countryCode: "US",
            addressLine1: shipment.destination.address
          }
        }
      },
      content: {
        packages: shipment.packages.map(p => ({
          weight: p.weight,
          dimensions: {
            length: p.dimensions.length,
            width: p.dimensions.width,
            height: p.dimensions.height
          },
          description: p.description
        })),
        isCustomsDeclarable: true,
        description: "Logistics Shipment",
        incoterm: "DAP",
        unitOfMeasurement: "metric"
      }
    };

    try {
      const response = await axios.post(`${this.baseUrl}/shipments`, payload, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        trackingNumber: response.data.shipmentTrackingNumber,
        labelUrl: response.data.documents?.[0]?.content, // Usually base64 or URL
        rawResponse: response.data,
        carrier: CarrierType.DHL
      };
    } catch (error: any) {
      console.error('DHL Shipping Error:', error.response?.data || error.message);
      throw new Error(`DHL Shipment Creation Failed: ${JSON.stringify(error.response?.data || error.message)}`);
    }
  }

  async trackShipment(trackingNumber: string): Promise<any> {
    const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
    
    const response = await axios.get(`${this.baseUrl}/tracking?trackingNumber=${trackingNumber}`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    return response.data;
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    // DHL cancel logic
    return true;
  }
}
