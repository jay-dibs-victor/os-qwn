import { PaymentInstruction } from '../entities/payment-instruction.entity';

export interface PaymentRailProvider {
  /**
   * Dispatches the payment to the external rail.
   * Throws an error if the request fails completely (e.g. timeout, network error).
   */
  dispatch(instruction: PaymentInstruction): Promise<{
    success: boolean;
    reference: string;
    rawResponse: any;
  }>;

  /**
   * Checks the status of a previously dispatched payment.
   */
  checkStatus(reference: string): Promise<{
    status: 'COMPLETED' | 'FAILED' | 'PENDING';
    rawResponse: any;
  }>;
}
