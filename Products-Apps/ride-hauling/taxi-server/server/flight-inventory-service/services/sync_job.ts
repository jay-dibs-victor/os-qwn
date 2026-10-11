import AmadeusService from './amadeus_service';
import Airport from '../models/Airport.model';
import City from '../models/City.model';

export default class SyncJob {
  /**
   * Sync major airports and cities from Amadeus to local Postgres
   */
  static async syncGlobalMetadata() {
    console.log('[SyncJob] Starting Global Flight Metadata Sync...');
    
    // Example: Sync some major hubs to start with
    const keywords = ['London', 'New York', 'Dubai', 'Paris', 'Singapore', 'Tokyo', 'Lagos', 'Nairobi'];
    
    for (const city of keywords) {
      try {
        const locations = await AmadeusService.searchLocations(city);
        
        for (const loc of locations) {
          if (loc.subType === 'CITY') {
             await City.findOrCreate({
               where: { name: loc.name },
               defaults: { name: loc.name }
             });
          } else if (loc.subType === 'AIRPORT') {
             // Find or create city first if cityCode is available
             // For simplicity, we'll just focus on airports
             await Airport.findOrCreate({
               where: { code: loc.iataCode },
               defaults: {
                 name: loc.name,
                 code: loc.iataCode,
                 address: loc.address?.cityName || city,
                 city_id: 1 // Default to a placeholder city id if not fully matched
               }
             });
          }
        }
        console.log(`[SyncJob] Synced locations for ${city}`);
      } catch (err) {
        console.error(`[SyncJob] Failed to sync ${city}:`, err.message);
      }
    }
    console.log('[SyncJob] Global Flight Metadata Sync Completed.');
  }
}
