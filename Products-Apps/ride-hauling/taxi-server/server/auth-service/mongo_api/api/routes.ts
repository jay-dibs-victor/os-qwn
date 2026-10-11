import { Router } from 'express';
import AuthRoutes from './auth_routes';

class BridgeRoutes {
  private router: Router;
  private CoreRoutes: any;

  constructor(router: Router) {
    this.router = router;
    this.CoreRoutes = {
      Auth: new (AuthRoutes as any)(this.router),
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
