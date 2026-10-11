export interface InitializeResponse {
  reference: string;
  checkoutUrl?: string;
  extraData?: Record<string, any>;
}

export interface VerifyResponse {
  reference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  rawResponse: Record<string, any>;
}

export interface PaymentProvider {
  initialize(params: {
    reference: string;
    amount: number;
    email: string;
    planId: string;
    callbackUrl: string;
  }): Promise<InitializeResponse>;

  verify(reference: string): Promise<VerifyResponse>;
}
