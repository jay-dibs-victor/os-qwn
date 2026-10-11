import axios from 'axios';
import { ICarrierService, CarrierShipmentResponse } from './carrier.service';
import { IShipment, CarrierType } from '../models/shipment.model';

export class FedExClient implements ICarrierService {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = process.env.FEDEX_CLIENT_ID || '';
    this.clientSecret = process.env.FEDEX_CLIENT_SECRET || '';
    this.baseUrl = process.env.FEDEX_BASE_URL || 'https://apis-sandbox.fedex.com'; // Default to sandbox
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);

    try {
      const response = await axios.post(`${this.baseUrl}/oauth/token`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Buffer of 1 minute
      return this.accessToken!;
    } catch (error) {
      console.error('FedEx Auth Error:', error);
      throw new Error('Failed to authenticate with FedEx');
    }
  }

  async createShipment(shipment: IShipment): Promise<CarrierShipmentResponse> {
    const token = await this.getAccessToken();

    const payload = {
      labelResponseOptions: "URL_ONLY",
      requestedShipment: {
        shipper: {
          address: {
            streetLines: [shipment.origin.address],
            city: "Memphis", // Example, would need parsing in real world
            stateOrProvinceCode: "TN",
            postalCode: "38101",
            countryCode: "US"
          },
          contact: {
            personName: shipment.customerDetails.name,
            phoneNumber: shipment.customerDetails.phone,
            companyName: "Taxi-Hauling Corp"
          }
        },
        recipients: [{
          address: {
            streetLines: [shipment.destination.address],
            city: "New York",
            stateOrProvinceCode: "NY",
            postalCode: "10001",
            countryCode: "US"
          },
          contact: {
            personName: shipment.customerDetails.name,
            phoneNumber: shipment.customerDetails.phone
          }
        }],
        shipDatestamp: new Date().toISOString().split('T')[0],
        serviceType: "INTERNATIONAL_PRIORITY",
        packagingType: "YOUR_PACKAGING",
        pickupType: "USE_SCHEDULED_PICKUP",
        blockShipment: false,
        requestedPackageLineItems: shipment.packages.map(p => ({
          weight: {
            units: "KG",
            value: p.weight
          },
          dimensions: {
            length: p.dimensions.length,
            width: p.dimensions.width,
            height: p.dimensions.height,
            units: p.dimensions.unit === 'cm' ? 'CM' : 'IN'
          }
        }))
      },
      accountNumber: {
        value: process.env.FEDEX_ACCOUNT_NUMBER || ''
      }
    };

    try {
      const response = await axios.post(`${this.baseUrl}/ship/v1/shipments`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const shipmentData = response.data.output.transactionShipments[0];
      
      return {
        trackingNumber: shipmentData.masterTrackingNumber,
        labelUrl: shipmentData.pieceResponses[0]?.packageDocuments[0]?.url,
        rawResponse: response.data,
        carrier: CarrierType.FEDEX
      };
    } catch (error: any) {
      console.error('FedEx Shipping Error:', error.response?.data || error.message);
      throw new Error(`FedEx Shipment Creation Failed: ${JSON.stringify(error.response?.data || error.message)}`);
    }
  }

  async trackShipment(trackingNumber: string): Promise<any> {
    const token = await this.getAccessToken();
    
    const payload = {
      includeDetailedScans: true,
      trackInfo: [{
        trackingNumberInfo: {
          trackingNumber: trackingNumber
        }
      }]
    };

    const response = await axios.post(`${this.baseUrl}/track/v1/trackingnumbers`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    const token = await this.getAccessToken();
    
    // FedEx cancellation logic (Void Shipment)
    // This is often a different endpoint or DELETE request
    return true; // Simplified for now
  }
}
