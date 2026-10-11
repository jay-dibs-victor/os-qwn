import { Router } from 'express';
import RedFlagRoutes from './sos_routes';
import InterventionRoutes from './feedback_routes';
import RawInterventionRoutes from './intervention_routes';
import UserRoutes from './user_routes';
import UploadRoutes from './api_uploads';
import CarsRoute from './cars_routes';
import FaqRoute from './faqs_routes';
import MechanicRoute from './mechanic_request';
import DriverRoutes from './driver_routes';
import RideRoutes from './ride_routes';
import OnboardingRoutes from './onboarding_routes';
import ConnectivityTest from './test_connectivity';
import GamificationRoutes from './gamification_routes';
import AuthRoutes from './auth_routes';

class BridgeRoutes {
  private router: Router;
  private CoreRoutes: any;

  constructor(router: Router) {
    this.router = router;
    this.CoreRoutes = {
      Auth: new (AuthRoutes as any)(this.router),
      RedFlags: new (RedFlagRoutes as any)(this.router),
      InterVentions: new (InterventionRoutes as any)(this.router),
      InterventionRoutes: new (RawInterventionRoutes as any)(this.router),
      Users: new (UserRoutes as any)(this.router),
      Uploads: new (UploadRoutes as any)(this.router),
      CarsRoutes: new (CarsRoute as any)(this.router),
      MechanicRoutes: new (MechanicRoute as any)(this.router),
      FaqRoutes: new (FaqRoute as any)(this.router),
      DriverRoute: new (DriverRoutes as any)(this.router),
      RideRoute: new (RideRoutes as any)(this.router),
      OnboardingRoute: new (OnboardingRoutes as any)(this.router),
      Connectivity: new (ConnectivityTest as any)(this.router),
      Gamification: new (GamificationRoutes as any)(this.router),
    };
  }

  attachRoutes(): Router {
    Object.values(this.CoreRoutes).forEach((item: any) => {
      if (item && typeof item.attachRoutes === 'function') {
        item.attachRoutes();
      }
    });
    return this.router;
  }
}

export default BridgeRoutes;
