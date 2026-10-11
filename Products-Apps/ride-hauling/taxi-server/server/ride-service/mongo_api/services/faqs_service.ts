import { Request, Response } from 'express';
import ResponseHandler from '../helpers/response_handler';
import { ErrorHandler } from '../helpers/error_handler';
import FAQModel from '../models/FAQ.model';
import AutoincrementId from '../helpers/autoincrement_mongo';

export class FaqsService {
  static createQnA(request: Request, response: Response) {
    const {
      question,
      answer,
      status,
      user_id,
    } = request.body;

    let uid = Number(user_id) || Number(request.body.user_id);
    console.log('you user id : ' + uid);

    // @ts-ignore
    const NewFaq = new FAQModel({
      id: AutoincrementId(FAQModel).counter(),
      question,
      answer,
      status,
    });

    NewFaq.save()
      .then(data => {
        const faq = data;
        return response.status(201).json({
          status: 201,
          data: [
            {
              id: faq.id,
              message: 'Created FAQ record',
            },
          ],
        });
      })
      .catch(err =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static getAllQnA(request: Request, response: Response) {
    FAQModel.find({ status: 'Active' })
      .then(data => {
        let faqs = data;
        console.log(faqs, 'faqs');
        return response.status(200).json({
          status: 200,
          data: [
            {
              faqs,
              message: 'All FAQs were retrieved successfully',
            },
          ],
        });
      })
      .catch(err =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static QnAId(request: Request, response: Response) {
    // @ts-ignore
    FAQModel.find({ id: Number(request.params.id) })
      .then(data => {
        const faq = data;
        if (faq.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The id of the given FAQ was not found',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              faq,
              message: 'Get a specific FAQ was successful',
            },
          ],
        });
      })
      .catch(err =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }
}
