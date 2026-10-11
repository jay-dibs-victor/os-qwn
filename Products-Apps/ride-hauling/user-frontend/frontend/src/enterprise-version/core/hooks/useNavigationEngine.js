import { useState, useEffect, useRef } from 'react';
import { VoiceNavService } from '../services/VoiceNavService';
import { MapService } from '../services/MapService';

/**
 * useNavigationEngine — taxibooking-userapp
 * Analyzes driver location against abstracted routing steps to provide turn-by-turn logic.
 */
export const useNavigationEngine = (driverLocation, routeResult) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [nextManeuver, setNextManeuver] = useState(null);
  const announcedRefs = useRef(new Set());

  useEffect(() => {
    if (!driverLocation || !routeResult) return;

    // Handle both Google raw results and our MapService abstracted results
    const steps = routeResult.steps || routeResult.routes?.[0]?.legs?.[0]?.steps;
    if (!steps) return;

    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;

    // Calculate distance to end of current step using universal helper
    const distanceToNextStep = MapService.calculateDistance(
      driverLocation[0], 
      driverLocation[1],
      currentStep.end_location.lat, 
      currentStep.end_location.lng
    );

    setNextManeuver({
      instruction: currentStep.html_instructions || currentStep.instruction,
      distance: distanceToNextStep,
      type: currentStep.maneuver
    });

    // Strategy 1: Traffic Jam/Delay Evaluation (Universal/OSM + Google Fallback)
    const leg = routeResult.routes?.[0]?.legs?.[0]; // Google API map abstraction
    const osmTrafficDelay = routeResult.trafficDelayMinutes; // OSM custom abstraction

    if (!announcedRefs.current.has('traffic-alert')) {
      if (osmTrafficDelay > 2) {
        // OSM detected delay
        VoiceNavService.alertTraffic(osmTrafficDelay);
        announcedRefs.current.add('traffic-alert');
      } else if (leg?.duration_in_traffic?.value && leg?.duration?.value) {
        // Google tracking fallback
        const delayMins = Math.round((leg.duration_in_traffic.value - leg.duration.value) / 60);
        if (delayMins > 2) {
          VoiceNavService.alertTraffic(delayMins);
          announcedRefs.current.add('traffic-alert');
        }
      }
    }

    // Strategy 2: Announce Maneuvers at 1km, 300m, and "Now"
    const stepKey = `${currentStepIndex}`;
    if (distanceToNextStep < 1000 && !announcedRefs.current.has(`${stepKey}-1km`)) {
      VoiceNavService.announceManeuver(currentStep.html_instructions || currentStep.instruction, '1 kilometer');
      announcedRefs.current.add(`${stepKey}-1km`);
    } else if (distanceToNextStep < 300 && !announcedRefs.current.has(`${stepKey}-300m`)) {
      VoiceNavService.announceManeuver(currentStep.html_instructions || currentStep.instruction, '300 meters');
      announcedRefs.current.add(`${stepKey}-300m`);
    } else if (distanceToNextStep < 30 ) {
       // Move to next step
       if (currentStepIndex < steps.length - 1) {
         setCurrentStepIndex(idx => idx + 1);
       }
    }

  }, [driverLocation, routeResult, currentStepIndex]);

  return {
    currentStepIndex,
    nextManeuver,
    totalSteps: (routeResult?.steps || routeResult?.routes?.[0]?.legs?.[0]?.steps)?.length || 0
  };
};
