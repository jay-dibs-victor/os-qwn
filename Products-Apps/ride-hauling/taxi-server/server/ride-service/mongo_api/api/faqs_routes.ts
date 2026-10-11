import { Router } from 'express';
import FaqsController from '../controllers/faqs_controller';
import TokenVerification from '../middlewares/token_validator';

class FaqsRoutes {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes(): Router {
    this.router.post('/faqs', TokenVerification.userAuthentication, (req, res, next) => {
      // #swagger.tags = ['FAQs']
      // #swagger.summary = 'Create a new FAQ entry'
      /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'FAQ question and answer',
        schema: { question: 'How do I book a ride?', answer: 'Open the app and enter your destination.' }
      } */
      next();
    }, FaqsController.createQnA);

    this.router.get('/faqs', TokenVerification.userAuthentication, (req, res, next) => {
      // #swagger.tags = ['FAQs']
      // #swagger.summary = 'List all FAQs'
      next();
    }, FaqsController.getAllQnA);

    return this.router;
  }
}

export default FaqsRoutes;
