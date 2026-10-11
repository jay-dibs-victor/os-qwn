import dotenv from 'dotenv';
dotenv.config();

const api_url_init = 'https://api.paystack.co/transaction/initialize';
const api_url_verify = 'https://api.paystack.co/transaction/verify/';

const paystack = (request: any) => {
  const MySecretKey = 'Bearer ' + process.env.PAYSTACKSECRET;

  const initializePayment = (form: any, mycallback: (error: any, body: any) => void) => {
    const options = {
      url: api_url_init,
      headers: {
        authorization: MySecretKey,
        'content-type': 'application/json',
        'cache-control': 'no-cache',
      },
      form,
    };
    const callback = (error: any, response: any, body: any) => {
      return mycallback(error, body);
    };
    request.post(options, callback);
  };

  const verifyPayment = (ref: string, mycallback: (error: any, body: any) => void) => {
    const options = {
      url: api_url_verify + encodeURIComponent(ref),
      headers: {
        authorization: MySecretKey,
        'content-type': 'application/json',
        'cache-control': 'no-cache',
      },
    };
    const callback = (error: any, response: any, body: any) => {
      return mycallback(error, body);
    };
    request(options, callback);
  };

  return { initializePayment, verifyPayment };
};

export default paystack;
