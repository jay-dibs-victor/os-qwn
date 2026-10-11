export interface InitializeTransactionParams {
  email: string;
  amount: number;
  reference?: string;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface InitializeTransactionResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface VerifyTransactionResult {
  id: number | string;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at: string;
  channel: string;
  fees: number;
  customer: { id: number | string; email: string; customer_code?: string };
}

export interface CreateSubaccountParams {
  businessName: string;
  bankCode: string;
  accountNumber: string;
  percentageCharge: number;
  settlementBank?: string;
}

export interface CreateSubaccountResult {
  subaccountCode: string;
}

export interface CreateTransferRecipientParams {
  type: string;
  name: string;
  accountNumber: string;
  bankCode: string;
  currency?: string;
}

export interface CreateTransferRecipientResult {
  recipientCode: string;
}

export interface InitiateTransferParams {
  amount: number;
  recipient: string;
  reference: string;
  reason?: string;
  currency?: string;
}

export interface InitiateTransferResult {
  reference: string;
  status: string;
  transferCode?: string;
}

export interface GatewayBalanceResult {
  balance: number;
  currency: string;
}

export interface WebhookParseResult {
  event: string;
  reference: string;
  status: string;
  rawData: any;
}

export interface PaymentGatewayProvider {
  readonly name: string;

  initializeTransaction(
    params: InitializeTransactionParams,
  ): Promise<InitializeTransactionResult>;

  verifyTransaction(
    reference: string,
  ): Promise<VerifyTransactionResult>;

  createSubaccount(
    params: CreateSubaccountParams,
  ): Promise<CreateSubaccountResult>;

  createTransferRecipient(
    params: CreateTransferRecipientParams,
  ): Promise<CreateTransferRecipientResult>;

  initiateTransfer(
    params: InitiateTransferParams,
  ): Promise<InitiateTransferResult>;

  getBalance(): Promise<GatewayBalanceResult | null>;

  parseWebhook(
    payload: any,
    headers: Record<string, string>,
  ): Promise<WebhookParseResult>;

  isActive(): boolean;

  verifyWebhookSignature?(signature: string, rawBody: string): boolean;
}
