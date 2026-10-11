export enum PaymentRail {
  INTERNAL = 'INTERNAL',
  NIBSS = 'NIBSS',
  RTGS = 'RTGS',
  SWIFT = 'SWIFT',
  PAYSTACK = 'PAYSTACK',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED',
}
