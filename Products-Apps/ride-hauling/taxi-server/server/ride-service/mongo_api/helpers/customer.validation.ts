import Joi from 'joi';

const walletTransfer = {
  body: Joi.object({
    amount: Joi.number()
      .positive()
      .precision(2)
      .min(10)
      .max(50000)
      .required(),
    destinationAccountNumber: Joi.number().required(),
  }),
};

const walletDeposit = {
  body: Joi.object({
    amount: Joi.number()
      .positive()
      .precision(2)
      .min(10)
      .max(50000)
      .required(),
    card: Joi.string()
      .creditCard()
      .required(),
  }),
};

const listCustomers = {
  query: Joi.object({
    page: Joi.number().min(1),
    perPage: Joi.number()
      .min(1)
      .max(100),
    name: Joi.string(),
    email: Joi.string(),
  }),
};

const createCustomer = {
  body: Joi.object({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(6)
      .max(128)
      .required(),
    name: Joi.string().max(128),
  }),
};

const replaceCustomer = {
  body: Joi.object({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(6)
      .max(128)
      .required(),
    name: Joi.string().max(128),
  }),
  params: Joi.object({
    // customerId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
  }),
};

const updateCustomer = {
  body: Joi.object({
    email: Joi.string().email(),
    password: Joi.string()
      .min(6)
      .max(128),
    name: Joi.string().max(128),
  }),
  params: Joi.object({
    // customerId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
  }),
};

export default {
  walletTransfer,
  walletDeposit,
  listCustomers,
  createCustomer,
  replaceCustomer,
  updateCustomer,
};
