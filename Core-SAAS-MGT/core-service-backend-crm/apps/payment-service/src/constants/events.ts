export const PAYMENT_EVENTS = {
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
} as const;

export const PAYMENT_QUEUES = {
  PAYMENT_COMMANDS: 'payment.commands',
  PAYMENT_EVENTS: 'payment.events',
} as const;
