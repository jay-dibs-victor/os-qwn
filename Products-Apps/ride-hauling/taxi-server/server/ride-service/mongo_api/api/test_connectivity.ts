import { Router, Request, Response } from 'express';

class ConnectivityTest {
  private router: Router;
  constructor(router: Router) { this.router = router; }
  attachRoutes() {
    this.router.get('/test-ping', (req: Request, res: Response) => {
      res.status(200).json({ status: 'ok', message: 'Backend is reachable and responding.' });
    });
  }
}
export default ConnectivityTest;
