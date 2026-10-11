import type { LatLng } from 'react-native-maps';
import { RideRequestDTO, DriverPhase } from '../api/dto';
import { generateRandomRide } from './mock-data';
import { interpolatePath } from './map-utils';
import { getRoute } from './routing';

export type SimulationCallbacks = {
  onRideOffer: (ride: RideRequestDTO, expiresInSec: number) => void;
  onPhaseTransition: (phase: DriverPhase) => void;
  onTripComplete: (ride: RideRequestDTO) => void;
  onLocationUpdate: (loc: { latitude: number; longitude: number }) => void;
  onRouteUpdate: (path: LatLng[], durationMin: number, distanceKm: number) => void;
};

export class MockSimulationService {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private animationFrame: number | null = null;
  private isRunning = false;
  private callbacks: SimulationCallbacks;

  constructor(callbacks: SimulationCallbacks) {
    this.callbacks = callbacks;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.scheduleNextRide();
  }

  stop(): void {
    this.isRunning = false;
    this.clearAllTimers();
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }

  private clearAllTimers(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  public scheduleNextRide(): void {
    if (!this.isRunning) return;

    const delay = 5000 + Math.random() * 10000;
    const timer = setTimeout(() => {
      if (!this.isRunning) return;
      const ride = generateRandomRide();
      this.callbacks.onRideOffer(ride, 15);
    }, delay);
    this.timers.push(timer);
  }

  async simulateAcceptedRide(
    ride: RideRequestDTO,
    startLoc: { latitude: number; longitude: number },
    pickup: { latitude: number; longitude: number }
  ): Promise<void> {
    if (!this.isRunning) return;

    // Fetch route: driver → pickup
    const routeToPickup = await getRoute(startLoc, pickup);
    if (!this.isRunning) return;
    this.callbacks.onRouteUpdate(routeToPickup.points, routeToPickup.durationMin, routeToPickup.distanceKm);

    this.animateMovement(routeToPickup.points, 25000, () => {
      if (!this.isRunning) return;
      this.callbacks.onPhaseTransition('arrived');

      const arrivedTimer = setTimeout(async () => {
        if (!this.isRunning) return;

        // Fetch route: pickup → destination
        const routeToDest = await getRoute(pickup, ride.destination);
        if (!this.isRunning) return;
        this.callbacks.onRouteUpdate(routeToDest.points, routeToDest.durationMin, routeToDest.distanceKm);

        this.callbacks.onPhaseTransition('in_progress');

        this.animateMovement(routeToDest.points, 60000, () => {
          if (!this.isRunning) return;
          this.callbacks.onTripComplete(ride);
        });
      }, 15000);
      this.timers.push(arrivedTimer);
    });
  }

  private animateMovement(path: LatLng[], duration: number, onComplete: () => void): void {
    if (path.length < 2) {
      onComplete();
      return;
    }

    const startTime = performance.now();
    const animate = (now: number) => {
      if (!this.isRunning) return;
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);

      const pos = interpolatePath(path, t);
      this.callbacks.onLocationUpdate(pos);

      if (t < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };
    this.animationFrame = requestAnimationFrame(animate);
  }
}
