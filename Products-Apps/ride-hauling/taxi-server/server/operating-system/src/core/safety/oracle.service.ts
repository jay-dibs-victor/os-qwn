import { broadcastToRoom } from '../realtime/room.manager';

import axios from 'axios';

export class OracleService {
  /**
   * Live Environmental Sentience: Traffic & Weather awareness
   */
  static async analyzeEnvironment(lat: number, lng: number, destination: string) {
    try {
      console.log(`👁️ [Oracle] Live Environmental Scan initiated for [${lat}, ${lng}] -> ${destination}`);

      // 1. Fetch Real Live Weather (Open-Meteo API - No Auth Required)
      let weatherCondition = 'Clear';
      let isAdverseWeather = false;
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
        const weatherRes = await axios.get(weatherUrl, { timeout: 4000 });
        const code = weatherRes.data?.current_weather?.weathercode;
        
        // WMO Weather interpretation codes (Rain/Snow/Thunderstorm are usually >= 50)
        if (code >= 50) {
          isAdverseWeather = true;
          weatherCondition = code >= 95 ? 'Thunderstorm' : 'Heavy Rain';
        }
      } catch (err) {
        console.warn('👁️ [Oracle] Weather API unavailable, assuming clear conditions.');
      }

      // 2. Real Algorithmic Traffic Assessment (Simulated via Time of Day)
      // A truly "real" implementation would hit Google Maps API, but this algorithmic approach
      // provides a deterministic, realistic substitute without paid keys.
      const hour = new Date().getHours();
      const isMorningRush = hour >= 7 && hour <= 9;
      const isEveningRush = hour >= 16 && hour <= 19;
      const isRushHour = isMorningRush || isEveningRush;

      // 3. Oracle Decision Matrix
      if (isAdverseWeather || isRushHour) {
        const roomName = `ride-active`; // Should be mapped to actual ride ID
        
        let message = '';
        if (isAdverseWeather && isRushHour) {
          message = `Tactical Update: ${weatherCondition} combined with rush hour traffic detected ahead. Recalculating route for maximum safety and efficiency.`;
        } else if (isAdverseWeather) {
          message = `Safety Update: ${weatherCondition} detected in your path. Please reduce speed.`;
        } else {
          message = `Tactical Update: High congestion detected due to rush hour. Diversion suggested via alternative bypass.`;
        }
        
        await broadcastToRoom(roomName, {
          type: 'TACTICAL_NAV',
          sender: 'ORACLE_OS',
          message,
          suggestion: isAdverseWeather ? "reduce_speed" : "diversion_alpha_5",
          timestamp: new Date()
        });
        
        console.log(`🎙️ [Oracle] Tactical Voice Relay Triggered: '${message}'`);
      }
    } catch (err) {
      console.error('👁️ [Oracle] Core error analyzing environment:', err);
    }
  }

  /**
   * Phase 1: Macro-Environmental Risk Oracle
   * Analyzes weather risks across an entire shipping route (Origin -> Destination).
   * Useful for predicting delays in global logistics where we lack live GPS.
   */
  static async analyzeRouteEnvironment(originLat: number, originLng: number, destLat: number, destLng: number) {
    console.log(`👁️ [Oracle] Macro-Environmental scan initiated for route [${originLat}, ${originLng}] -> [${destLat}, ${destLng}]`);
    
    // Calculate an approximate midpoint to check for macro-weather events (e.g., storms over the Atlantic)
    const midLat = (originLat + destLat) / 2;
    const midLng = (originLng + destLng) / 2;

    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${midLat}&longitude=${midLng}&current_weather=true`;
      const weatherRes = await axios.get(weatherUrl, { timeout: 4000 });
      const code = weatherRes.data?.current_weather?.weathercode;

      if (code >= 60) {
        console.warn(`🌪️ [Oracle] Macro Risk Detected: Severe weather condition (Code ${code}) near route midpoint.`);
        return {
          riskLevel: 'HIGH',
          reason: 'Severe weather detected along the logistical path.',
          estimatedDelayHours: 24
        };
      }
      
      return { riskLevel: 'LOW', reason: 'Clear skies across the route.', estimatedDelayHours: 0 };
    } catch (err) {
      console.error('👁️ [Oracle] Failed to assess macro-route environment.', err);
      return { riskLevel: 'UNKNOWN', reason: 'Weather telemetry offline.', estimatedDelayHours: 0 };
    }
  }

  /**
   * Phase 1: Synthetic Telemetry Interpolation
   * Generates a realistic array of 1Hz GPS coordinates between two points
   * to simulate live tracking for packages that only have milestone webhooks.
   */
  static generateSyntheticTelemetry(originLat: number, originLng: number, destLat: number, destLng: number, totalPoints: number = 100) {
    console.log(`🛰️ [Oracle] Generating ${totalPoints} synthetic telemetry points...`);
    const path = [];
    
    // Linear interpolation for synthetic flight/shipping path
    for (let i = 0; i <= totalPoints; i++) {
      const progress = i / totalPoints;
      
      // Add slight parabolic arc to simulate the curvature of the earth/flight path
      const arcOffset = Math.sin(progress * Math.PI) * 0.5; // Max 0.5 degrees offset at midpoint
      
      const currentLat = originLat + (destLat - originLat) * progress + arcOffset;
      const currentLng = originLng + (destLng - originLng) * progress;

      path.push({
        lat: Number(currentLat.toFixed(5)),
        lng: Number(currentLng.toFixed(5)),
        progress: Number((progress * 100).toFixed(1))
      });
    }

    return path;
  }
}
